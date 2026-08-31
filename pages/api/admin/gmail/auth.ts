import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const scriptPath = path.join(process.cwd(), 'tools', 'sync-gmail-threads.py');

  // Running auth-check with interactive will trigger browser OAuth if scopes changed
  exec(`python "${scriptPath}" --auth-check --interactive`, (error, stdout, stderr) => {
    if (error) {
      try {
        const parsed = JSON.parse(stdout);
        return res.status(200).json(parsed);
      } catch (e) {
        return res.status(200).json({
          success: false,
          error: stderr || error.message || 'Authenticatie mislukt',
        });
      }
    }

    try {
      const result = JSON.parse(stdout);
      return res.status(200).json(result);
    } catch (parseErr) {
      return res.status(200).json({
        success: false,
        error: stdout || stderr || 'Ongeldige output van auth check',
      });
    }
  });
}
