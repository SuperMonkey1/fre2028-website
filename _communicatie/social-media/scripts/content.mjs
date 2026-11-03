#!/usr/bin/env node
// Content calendar CLI.
//   npm run content                     overview of all planned posts
//   npm run content -- due [days]       posts in the next N days (default 7) that need action
//   npm run content -- show <id>        full post, plus whether its approval is still valid
//   npm run content -- approve <id>     lock the current text as approved (only after Fré approves it in chat)
//   npm run content -- unapprove <id>   back to "waiting"
//   npm run content -- post <id> [--dry-run]   publish; refuses unless the approval matches the exact content
//   npm run content -- token            LinkedIn token expiry
//   npm run content -- diary "text" [--idea]   add a diary entry (and idea)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  listPosts, findPost, savePost, approvalHash, isApprovalValid, addDiaryEntry, ensureDirs,
} from '../../../lib/content-calendar.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../../..');
const LI_VERSION = '202601';

function loadEnv() {
  const env = { ...process.env };
  for (const file of ['.env', '.env.local']) {
    const fullPath = path.join(ROOT_DIR, file);
    if (!fs.existsSync(fullPath)) continue;
    for (const line of fs.readFileSync(fullPath, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
    }
  }
  return env;
}

const env = loadEnv();

function requirePost(id) {
  if (!id) fail('Missing post id. Run `npm run content` to see ids.');
  const post = findPost(ROOT_DIR, id);
  if (!post) fail(`No post found for "${id}".`);
  return post;
}

function fail(msg) {
  console.error(`\nError: ${msg}\n`);
  process.exit(1);
}

function printRow(p) {
  const valid = p.status === 'approved' ? (isApprovalValid(p) ? ' (lock ok)' : ' (CHANGED since approval)') : '';
  console.log(`${p.date} ${p.time || '     '}  ${p.channel.padEnd(9)} ${p.language.padEnd(3)} ${(p.status + valid).padEnd(34)} ${p.id}`);
}

// ---------- commands ----------

function cmdList() {
  const posts = listPosts(ROOT_DIR);
  if (!posts.length) return console.log('No posts in the calendar yet.');
  console.log('\nDATE       TIME   CHANNEL   LNG STATUS                             ID');
  posts.forEach(printRow);
  console.log('');
}

function cmdDue(days = 7) {
  const now = new Date();
  const until = new Date(now.getTime() + Number(days) * 86400000).toLocaleDateString('sv-SE');
  const from = new Date(now.getTime() - 3 * 86400000).toLocaleDateString('sv-SE');
  const posts = listPosts(ROOT_DIR).filter((p) => p.date >= from && p.date <= until && p.status !== 'skipped');
  console.log(`\nPosts between ${from} and ${until}:`);
  posts.forEach(printRow);
  const needResults = listPosts(ROOT_DIR).filter((p) => p.status === 'posted' && !/checked_at:\s*\S/.test(p.results));
  if (needResults.length) {
    console.log('\nPosted, results not yet collected:');
    needResults.forEach(printRow);
  }
  console.log('');
}

function cmdShow(id) {
  const p = requirePost(id);
  console.log(`\n${p.id}\n${p.channel} | ${p.language} | ${p.date} ${p.time} | status: ${p.status}`);
  if (p.media) console.log(`media: ${p.media}${fs.existsSync(path.resolve(ROOT_DIR, p.media)) ? '' : '  (FILE NOT FOUND)'}`);
  if (p.link) console.log(`link: ${p.link}`);
  console.log(`\n--- TEXT (${p.text.length} chars) ---\n${p.text || '(empty)'}`);
  console.log(`\n--- FIRST COMMENT ---\n${p.firstComment || '(none)'}`);
  if (p.notes) console.log(`\n--- NOTES ---\n${p.notes}`);
  const placeholders = (p.text + p.firstComment).match(/\[X\]|\[[^\]]*\?\]/g);
  if (placeholders) console.log(`\nWarning: ${placeholders.length} placeholder(s) still in the text.`);
  if (p.status === 'approved') console.log(`\nApproval lock: ${isApprovalValid(p) ? 'valid' : 'INVALID, content changed after approval'}`);
  console.log(`Content hash now: ${approvalHash(p)}\n`);
}

function cmdApprove(id) {
  const p = requirePost(id);
  if (!p.text.trim()) fail('Post has no text.');
  if (/\[X\]/.test(p.text + p.firstComment)) fail('Post still contains [X] placeholders.');
  if (p.media && !fs.existsSync(path.resolve(ROOT_DIR, p.media))) fail(`Media file not found: ${p.media}`);
  if (p.status === 'posted') fail('Post is already posted.');
  savePost(ROOT_DIR, { ...p, status: 'approved', approved_hash: approvalHash(p), approved_at: new Date().toISOString() });
  console.log(`\nApproved and locked: ${p.id} (hash ${approvalHash(p)}). Any edit to text, comment, media or link voids this approval.\n`);
}

function cmdUnapprove(id) {
  const p = requirePost(id);
  savePost(ROOT_DIR, { ...p, status: 'waiting', approved_hash: '', approved_at: '' });
  console.log(`\n${p.id} is back to "waiting".\n`);
}

async function cmdPost(id, dryRun) {
  const p = requirePost(id);
  if (p.status === 'posted') fail(`Already posted: ${p.post_url}`);
  if (!isApprovalValid(p)) {
    fail(p.status !== 'approved'
      ? `Not approved (status: ${p.status}). Nothing was posted.`
      : 'Content changed after approval. Nothing was posted. Re-approve the exact text first.');
  }
  if (p.channel !== 'linkedin') fail(`Posting to ${p.channel} is not wired up yet. Nothing was posted.`);

  console.log(`\nPosting ${p.id} to LinkedIn${dryRun ? ' (DRY RUN)' : ''}`);
  console.log(`Text: ${p.text.length} chars | media: ${p.media || 'none'} | first comment: ${p.firstComment ? 'yes' : 'no'}`);
  if (dryRun) {
    console.log(`\n${p.text}\n\n--- first comment ---\n${p.firstComment || '(none)'}\n\nDry run: nothing was posted.\n`);
    return;
  }

  const li = linkedin();
  let media = null;
  if (p.media) {
    const file = path.resolve(ROOT_DIR, p.media);
    const ext = path.extname(file).toLowerCase();
    if (['.mp4', '.mov'].includes(ext)) media = { id: await li.uploadVideo(file), title: '' };
    else if (['.png', '.jpg', '.jpeg'].includes(ext)) media = { id: await li.uploadImage(file) };
    else fail(`Unsupported media type: ${ext}`);
  }
  const postUrn = await li.createPost(p.text, media);
  const postUrl = `https://www.linkedin.com/feed/update/${postUrn}/`;
  savePost(ROOT_DIR, { ...p, status: 'posted', post_urn: postUrn, post_url: postUrl, posted_at: new Date().toISOString() });
  console.log(`Posted: ${postUrl}`);

  if (p.firstComment) {
    try {
      await li.comment(postUrn, p.firstComment);
      console.log('First comment added.');
    } catch (err) {
      console.error(`Post is live, but the first comment failed: ${err.message}\nAdd it by hand:\n${p.firstComment}`);
    }
  }
  console.log('');
}

async function cmdToken() {
  const { LINKEDIN_ACCESS_TOKEN: token, LINKEDIN_CLIENT_ID: id, LINKEDIN_CLIENT_SECRET: secret } = env;
  if (!token) fail('No LINKEDIN_ACCESS_TOKEN in .env.local. Run `npm run auth:linkedin`.');
  const res = await fetch('https://www.linkedin.com/oauth/v2/introspectToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ token, client_id: id || '', client_secret: secret || '' }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.active) {
    console.log(`\nLinkedIn token: NOT ACTIVE (${res.status}). Run \`npm run auth:linkedin\`.\n`);
    process.exit(2);
  }
  const expires = new Date(data.expires_at * 1000);
  const days = Math.floor((expires - Date.now()) / 86400000);
  console.log(`\nLinkedIn token active, expires ${expires.toLocaleDateString('sv-SE')} (${days} days). Scope: ${data.scope}\n`);
}

// ---------- LinkedIn API ----------

function linkedin() {
  const token = env.LINKEDIN_ACCESS_TOKEN;
  const author = env.LINKEDIN_PERSON_URN;
  if (!token || !author) fail('Missing LINKEDIN_ACCESS_TOKEN or LINKEDIN_PERSON_URN. Run `npm run auth:linkedin`.');
  // Posts always go to Fré's personal profile, never to a company page.
  if (!/^urn:li:person:/.test(author)) fail(`LINKEDIN_PERSON_URN must be a personal profile (urn:li:person:...), got ${author}.`);
  const headers = {
    Authorization: `Bearer ${token}`,
    'LinkedIn-Version': LI_VERSION,
    'X-Restli-Protocol-Version': '2.0.0',
    'Content-Type': 'application/json',
  };
  const api = async (url, body, method = 'POST') => {
    const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    if (!res.ok) throw new Error(`${method} ${url} failed (${res.status}): ${await res.text()}`);
    return res;
  };

  return {
    async uploadImage(file) {
      const init = await (await api('https://api.linkedin.com/rest/images?action=initializeUpload', {
        initializeUploadRequest: { owner: author },
      })).json();
      const { uploadUrl, image } = init.value;
      const up = await fetch(uploadUrl, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: fs.readFileSync(file) });
      if (!up.ok) throw new Error(`Image upload failed (${up.status}): ${await up.text()}`);
      console.log(`Image uploaded: ${image}`);
      return image;
    },

    async uploadVideo(file) {
      const buf = fs.readFileSync(file);
      const init = await (await api('https://api.linkedin.com/rest/videos?action=initializeUpload', {
        initializeUploadRequest: { owner: author, fileSizeBytes: buf.length, uploadCaptions: false, uploadThumbnail: false },
      })).json();
      const { uploadInstructions, video, uploadToken } = init.value;
      const etags = [];
      for (const [i, part] of uploadInstructions.entries()) {
        const res = await fetch(part.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/octet-stream' },
          body: buf.subarray(part.firstByte, part.lastByte + 1),
        });
        if (!res.ok) throw new Error(`Video part ${i + 1} upload failed (${res.status}): ${await res.text()}`);
        etags.push(res.headers.get('etag'));
        console.log(`Video part ${i + 1}/${uploadInstructions.length} uploaded`);
      }
      await api('https://api.linkedin.com/rest/videos?action=finalizeUpload', {
        finalizeUploadRequest: { video, uploadToken: uploadToken || '', uploadedPartIds: etags },
      });
      // LinkedIn processes the video before it can be attached.
      for (let i = 0; i < 60; i++) {
        const status = (await (await api(`https://api.linkedin.com/rest/videos/${encodeURIComponent(video)}`, null, 'GET')).json()).status;
        if (status === 'AVAILABLE') break;
        if (status === 'PROCESSING_FAILED') throw new Error('LinkedIn could not process the video.');
        await new Promise((r) => setTimeout(r, 5000));
      }
      console.log(`Video uploaded: ${video}`);
      return video;
    },

    async createPost(text, media) {
      const res = await api('https://api.linkedin.com/rest/posts', {
        author,
        commentary: text.trim(),
        visibility: 'PUBLIC',
        distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
        ...(media ? { content: { media } } : {}),
        lifecycleState: 'PUBLISHED',
        isReshareDisabledByAuthor: false,
      });
      const urn = res.headers.get('x-restli-id') || res.headers.get('x-linkedin-id');
      if (!urn) throw new Error('Post created but LinkedIn returned no id. Check the profile.');
      return urn;
    },

    async comment(postUrn, text) {
      await api(`https://api.linkedin.com/rest/socialActions/${encodeURIComponent(postUrn)}/comments`, {
        actor: author,
        object: postUrn,
        message: { text: text.trim() },
      });
    },
  };
}

// ---------- main ----------

const [cmd = 'list', ...rest] = process.argv.slice(2);
const args = rest.filter((a) => !a.startsWith('--'));
const flags = new Set(rest.filter((a) => a.startsWith('--')));
ensureDirs(ROOT_DIR);

const commands = {
  list: () => cmdList(),
  due: () => cmdDue(args[0] || 7),
  show: () => cmdShow(args[0]),
  approve: () => cmdApprove(args[0]),
  unapprove: () => cmdUnapprove(args[0]),
  post: () => cmdPost(args[0], flags.has('--dry-run')),
  token: () => cmdToken(),
  diary: () => {
    addDiaryEntry(ROOT_DIR, args.join(' '), { idea: flags.has('--idea') });
    console.log('Saved to the diary.');
  },
};

if (!commands[cmd]) fail(`Unknown command "${cmd}". Commands: ${Object.keys(commands).join(', ')}`);
Promise.resolve(commands[cmd]()).catch((err) => fail(err.message));
