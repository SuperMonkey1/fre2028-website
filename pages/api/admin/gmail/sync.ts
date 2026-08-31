import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { leads, email } = req.body;
  const scriptPath = path.join(process.cwd(), 'tools', 'sync-gmail-threads.py');

  let command = `python "${scriptPath}" --json`;

  if (email) {
    command += ` --email "${email.replace(/"/g, '')}"`;
  } else if (leads && Array.isArray(leads)) {
    const tempFilePath = path.join(process.cwd(), 'tools', '.sync_input.json');
    try {
      fs.writeFileSync(tempFilePath, JSON.stringify(leads), 'utf-8');
      command += ` --leads-json "${tempFilePath}"`;
    } catch (e: any) {
      return res.status(500).json({ success: false, error: `Kon invoerbestand niet wegschrijven: ${e.message}` });
    }
  } else {
    return res.status(400).json({ success: false, error: 'Geen leads of e-mailadres opgegeven om te synchroniseren.' });
  }

  exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    // Clean up temporary file
    const tempFilePath = path.join(process.cwd(), 'tools', '.sync_input.json');
    if (fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (_) {}
    }

    if (error) {
      try {
        const parsed = JSON.parse(stdout);
        return res.status(200).json(parsed);
      } catch (e) {
        return res.status(200).json({
          success: false,
          error: stderr || error.message || 'Fout bij uitvoeren van Gmail sync',
        });
      }
    }

    try {
      const result = JSON.parse(stdout);
      return res.status(200).json(result);
    } catch (parseErr) {
      return res.status(200).json({
        success: false,
        error: stdout || stderr || 'Ongeldige output van Gmail sync script',
      });
    }
  });
}
