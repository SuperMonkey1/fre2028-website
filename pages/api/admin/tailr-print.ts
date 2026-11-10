import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import type { NextApiRequest, NextApiResponse } from 'next';

// Local-only backend for the print button on /admin/tailr-edge: runs tools/tailr-edge-print.cjs for the chosen
// orders, which builds the parts, fills the Bambu Studio template, slices it and opens it in Bambu Studio on this
// PC. The live site is a static export, so this never runs there.
const ROOT = process.cwd();
const SCRIPT = path.join(ROOT, 'tools', 'tailr-edge-print.cjs');
const PRINTED_LOG = path.join(ROOT, 'Tailr Edge', 'print', 'printed.json');

const isLocal = (req: NextApiRequest) => ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress || '');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isLocal(req)) return res.status(403).json({ error: 'Only available on this PC.' });

  // Which orders were already prepared for printing
  if (req.method === 'GET') {
    const printed = fs.existsSync(PRINTED_LOG) ? JSON.parse(fs.readFileSync(PRINTED_LOG, 'utf8')) : {};
    return res.status(200).json({ printed });
  }

  if (req.method !== 'POST') return res.status(405).end();
  const orders: unknown = req.body?.orders;
  if (!Array.isArray(orders) || orders.length < 1 || orders.length > 2 || !orders.every((o) => typeof o === 'string' && /^[A-Za-z0-9]+$/.test(o))) {
    return res.status(400).json({ error: 'Choose one or two orders.' });
  }

  const args = [SCRIPT, ...orders.flatMap((o) => ['--order', o])];
  if (req.body?.single) args.push('--single');
  if (req.body?.dryRun) args.push('--dry-run');
  const child = spawn(process.execPath, args, { cwd: ROOT });
  let log = '';
  child.stdout.on('data', (d) => (log += d));
  child.stderr.on('data', (d) => (log += d));
  const timer = setTimeout(() => child.kill(), 5 * 60 * 1000);
  child.on('close', (code) => {
    clearTimeout(timer);
    res.status(code === 0 ? 200 : 500).json({ ok: code === 0, log: log.trim() });
  });
}
