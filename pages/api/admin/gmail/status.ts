import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(455).json({ error: 'Method not allowed' });
  }

  const scriptPath = path.join(process.cwd(), 'tools', 'create-gmail-drafts.py');

  exec(`python "${scriptPath}" --status-only --json`, (error, stdout, stderr) => {
    if (error) {
      try {
        const parsed = JSON.parse(stdout);
        return res.status(200).json(parsed);
      } catch (e) {
        return res.status(200).json({
          connected: false,
          error: stderr || error.message || 'Kon geen verbinding maken met Gmail API',
        });
      }
    }

    try {
      const result = JSON.parse(stdout);
      return res.status(200).json(result);
    } catch (parseErr) {
      return res.status(200).json({
        connected: false,
        error: stdout || stderr || 'Ongeldige output van status check',
      });
    }
  });
}
