import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  listPosts, findPost, savePost, approvalHash, isApprovalValid, addDiaryEntry, readDiary, readIdeas, listInbox, paths, ensureDirs,
} from '../../../lib/content-calendar.mjs';

// Local-only backend for /admin/content: reads and writes the calendar files in
// _communicatie/social-media. The live site is a static export, so this never runs there.
const ROOT = process.cwd();
// Statuses the page may set. "approved" and "posted" are only set by the content CLI after approval in chat.
const EDITABLE_STATUSES = ['idea', 'draft', 'waiting', 'skipped'];
const MEDIA_TYPES: Record<string, string> = {
  '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif',
};

export const config = { api: { bodyParser: { sizeLimit: '2mb' } } };

function sendMedia(rel: string, req: NextApiRequest, res: NextApiResponse) {
  const file = path.resolve(ROOT, rel);
  const type = MEDIA_TYPES[path.extname(file).toLowerCase()];
  if (!file.startsWith(ROOT + path.sep) || !type || !fs.existsSync(file)) return res.status(404).end();
  const size = fs.statSync(file).size;
  res.setHeader('Content-Type', type);
  res.setHeader('Accept-Ranges', 'bytes');
  // Range support so videos can be scrubbed in the preview.
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
  if (range) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    res.status(206);
    res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
    res.setHeader('Content-Length', end - start + 1);
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.setHeader('Content-Length', size);
  fs.createReadStream(file).pipe(res);
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV === 'production') return res.status(404).json({ error: 'Local only' });
  ensureDirs(ROOT);

  if (req.method === 'GET') {
    if (typeof req.query.media === 'string') return sendMedia(req.query.media, req, res);
    const posts = listPosts(ROOT).map((p: any) => ({ ...p, lockValid: isApprovalValid(p) }));
    return res.status(200).json({
      posts,
      diary: readDiary(ROOT, 3),
      ideas: readIdeas(ROOT),
      inbox: listInbox(ROOT),
      inboxDir: path.relative(ROOT, paths(ROOT).inbox),
    });
  }

  if (req.method === 'POST') {
    const { action } = req.body || {};

    if (action === 'entry') {
      const text = String(req.body.text || '').trim();
      if (!text) return res.status(400).json({ error: 'Empty entry' });
      addDiaryEntry(ROOT, text, { idea: !!req.body.idea });
      return res.status(200).json({ ok: true });
    }

    if (action === 'savePost') {
      const current = findPost(ROOT, String(req.body.id || ''));
      if (!current) return res.status(404).json({ error: 'Post not found' });
      if (current.status === 'posted') return res.status(400).json({ error: 'Already posted, edit the file by hand if needed' });
      const patch = req.body.post || {};
      const next: any = { ...current };
      for (const key of ['text', 'firstComment', 'notes', 'results', 'date', 'time', 'media', 'link', 'format']) {
        if (typeof patch[key] === 'string') next[key] = patch[key];
      }
      if (typeof patch.status === 'string' && patch.status !== current.status) {
        if (!EDITABLE_STATUSES.includes(patch.status)) return res.status(400).json({ error: 'Approval only happens in chat' });
        next.status = patch.status;
        next.approved_hash = '';
        next.approved_at = '';
      }
      // Editing an approved post voids the approval.
      if (current.status === 'approved' && approvalHash(next) !== current.approved_hash) {
        next.status = 'waiting';
        next.approved_hash = '';
        next.approved_at = '';
      }
      savePost(ROOT, next);
      return res.status(200).json({ ok: true, status: next.status });
    }

    return res.status(400).json({ error: 'Unknown action' });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).end();
}
