// Shared helpers for the social media content calendar.
// Used by the CLI (_communicatie/social-media/scripts/content.mjs) and the local
// admin page API (pages/api/admin/content.ts). Everything lives as plain files under
// _communicatie/social-media so it can be read and edited by hand.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const STATUSES = ['idea', 'draft', 'waiting', 'approved', 'posted', 'skipped'];
export const CHANNELS = ['linkedin', 'instagram', 'youtube', 'tiktok'];

// Frontmatter keys in the order they are written back.
const FIELDS = [
  'id', 'channel', 'language', 'date', 'time', 'status', 'series', 'format', 'media', 'link',
  'approved_hash', 'approved_at', 'post_urn', 'post_url', 'posted_at',
];
// Body sections ("## Heading") in the order they are written back.
const SECTIONS = ['Text', 'First comment', 'Notes', 'Results'];

export function paths(root) {
  const base = path.join(root, '_communicatie', 'social-media');
  return {
    root,
    base,
    calendar: path.join(base, 'calendar'),
    diary: path.join(base, 'diary'),
    inbox: path.join(base, 'inbox'),
    ideas: path.join(base, 'ideas.md'),
  };
}

export function ensureDirs(root) {
  const p = paths(root);
  for (const dir of [p.calendar, p.diary, p.inbox]) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(p.ideas)) fs.writeFileSync(p.ideas, '# Ideas\n\n', 'utf8');
  return p;
}

// ---------- posts ----------

export function parsePost(raw, file = '') {
  const text = raw.replace(/\r\n/g, '\n');
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const meta = {};
  let body = text;
  if (m) {
    body = m[2];
    for (const line of m[1].split('\n')) {
      const idx = line.indexOf(':');
      if (idx <= 0) continue;
      let val = line.slice(idx + 1).trim();
      if (/^".*"$/.test(val)) val = val.slice(1, -1);
      meta[line.slice(0, idx).trim()] = val;
    }
  }
  const sections = {};
  let current = null;
  for (const line of body.split('\n')) {
    const h = line.match(/^## (.+)$/);
    if (h) {
      current = h[1].trim();
      sections[current] = [];
    } else if (current) {
      sections[current].push(line);
    }
  }
  const sec = (name) => (sections[name] || []).join('\n').trim();
  return {
    ...Object.fromEntries(FIELDS.map((f) => [f, meta[f] || ''])),
    id: meta.id || path.basename(file, '.md'),
    file,
    text: sec('Text'),
    firstComment: sec('First comment'),
    notes: sec('Notes'),
    results: sec('Results'),
  };
}

export function serializePost(post) {
  const lines = ['---'];
  for (const f of FIELDS) {
    const v = post[f] ?? '';
    lines.push(`${f}: ${f === 'time' && v ? `"${v}"` : v}`.trimEnd());
  }
  lines.push('---', '');
  const values = { Text: post.text, 'First comment': post.firstComment, Notes: post.notes, Results: post.results };
  for (const s of SECTIONS) lines.push(`## ${s}`, '', (values[s] || '').trim(), '');
  return lines.join('\n');
}

export function listPosts(root) {
  const { calendar } = paths(root);
  if (!fs.existsSync(calendar)) return [];
  return fs.readdirSync(calendar)
    .filter((f) => f.endsWith('.md'))
    .map((f) => parsePost(fs.readFileSync(path.join(calendar, f), 'utf8'), f))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

export function findPost(root, idOrFile) {
  const key = path.basename(idOrFile, '.md');
  return listPosts(root).find((p) => p.id === key || path.basename(p.file, '.md') === key) || null;
}

export function savePost(root, post) {
  const { calendar } = paths(root);
  const file = post.file || `${post.id}.md`;
  fs.writeFileSync(path.join(calendar, path.basename(file)), serializePost(post), 'utf8');
  return { ...post, file };
}

// Fingerprint of exactly what would go out. Approval stores it; posting requires a match,
// so any change to text, first comment, media, link or channel after approval blocks the post.
export function approvalHash(post) {
  const norm = (s) => (s || '').replace(/\r\n/g, '\n').trim();
  return crypto.createHash('sha256')
    .update(JSON.stringify([post.channel, norm(post.text), norm(post.firstComment), norm(post.media), norm(post.link)]))
    .digest('hex')
    .slice(0, 16);
}

export function isApprovalValid(post) {
  return post.status === 'approved' && !!post.approved_hash && post.approved_hash === approvalHash(post);
}

// ---------- diary and ideas ----------

const today = () => new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD in local time

export function addDiaryEntry(root, text, { idea = false, date = today() } = {}) {
  const p = ensureDirs(root);
  const entry = text.trim();
  if (!entry) return;
  const file = path.join(p.diary, `${date.slice(0, 7)}.md`);
  let content = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : `# Diary ${date.slice(0, 7)}\n`;
  const heading = `## ${date}`;
  const bullet = entry.split('\n').map((l, i) => (i === 0 ? `- ${l}` : `  ${l}`)).join('\n');
  if (content.includes(`\n${heading}\n`)) {
    // Append to the end of today's section.
    const start = content.indexOf(`\n${heading}\n`) + heading.length + 2;
    const next = content.indexOf('\n## ', start);
    const end = next === -1 ? content.length : next;
    content = `${content.slice(0, end).trimEnd()}\n${bullet}\n${content.slice(end)}`;
  } else {
    content = `${content.trimEnd()}\n\n${heading}\n${bullet}\n`;
  }
  fs.writeFileSync(file, content, 'utf8');
  if (idea || /^idea\s*:|^idee\s*:/i.test(entry)) addIdea(root, entry.replace(/^ide[ae]\s*:\s*/i, ''), date);
}

export function addIdea(root, text, date = today()) {
  const p = ensureDirs(root);
  const content = fs.readFileSync(p.ideas, 'utf8');
  fs.writeFileSync(p.ideas, `${content.trimEnd()}\n- ${date}: ${text.trim().replace(/\n/g, ' ')}\n`, 'utf8');
}

export function readDiary(root, months = 3) {
  const { diary } = paths(root);
  if (!fs.existsSync(diary)) return [];
  return fs.readdirSync(diary)
    .filter((f) => /^\d{4}-\d{2}\.md$/.test(f))
    .sort()
    .reverse()
    .slice(0, months)
    .map((f) => ({ month: f.replace('.md', ''), content: fs.readFileSync(path.join(diary, f), 'utf8') }));
}

export function readIdeas(root) {
  const { ideas } = paths(root);
  return fs.existsSync(ideas) ? fs.readFileSync(ideas, 'utf8') : '';
}

export function listInbox(root) {
  const { inbox } = paths(root);
  if (!fs.existsSync(inbox)) return [];
  return fs.readdirSync(inbox, { withFileTypes: true })
    .filter((d) => d.isFile() && !d.name.startsWith('.'))
    .map((d) => {
      const st = fs.statSync(path.join(inbox, d.name));
      return { name: d.name, size: st.size, modified: st.mtime.toISOString() };
    })
    .sort((a, b) => b.modified.localeCompare(a.modified));
}
