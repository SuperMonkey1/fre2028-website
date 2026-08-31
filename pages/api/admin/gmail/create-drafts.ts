import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { target, lead, leads, tier, all, customEmail } = req.body || {};
  const scriptPath = path.join(process.cwd(), 'tools', 'create-gmail-drafts.py');
  const tempLeadFile = path.join(process.cwd(), 'tools', `.draft_lead_${Date.now()}.json`);

  let command = `python "${scriptPath}" --json`;
  let tempFileToClean: string | null = null;

  if (lead && typeof lead === 'object') {
    const leadPayload = { ...lead };
    if (customEmail) {
      leadPayload.contactEmail = customEmail;
    }
    fs.writeFileSync(tempLeadFile, JSON.stringify(leadPayload), 'utf-8');
    tempFileToClean = tempLeadFile;
    command += ` --lead-json "${tempLeadFile}"`;
  } else if (leads && Array.isArray(leads)) {
    fs.writeFileSync(tempLeadFile, JSON.stringify(leads), 'utf-8');
    tempFileToClean = tempLeadFile;
    command += ` --leads-json "${tempLeadFile}"`;
  } else if (target) {
    // Sanitize target
    const cleanTarget = String(target).replace(/[^a-zA-Z0-9_-]/g, '');
    command += ` --target "${cleanTarget}"`;
    if (customEmail) {
      const cleanEmail = String(customEmail).replace(/["`$;|&]/g, '');
      command += ` --custom-email "${cleanEmail}"`;
    }
  } else if (typeof tier === 'number') {
    command += ` --tier ${tier}`;
  } else if (all) {
    command += ` --all`;
  } else {
    command += ` --all`;
  }

  exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    if (tempFileToClean && fs.existsSync(tempFileToClean)) {
      try {
        fs.unlinkSync(tempFileToClean);
      } catch (_) {}
    }
    if (error && !stdout) {
      return res.status(500).json({
        success: false,
        error: stderr || error.message || 'Fout bij aanroepen Gmail script',
      });
    }

    try {
      const parsed = JSON.parse(stdout);
      return res.status(200).json(parsed);
    } catch (parseErr) {
      if (stdout.includes('SUCCES!')) {
        return res.status(200).json({
          success: true,
          output: stdout,
        });
      }
      return res.status(500).json({
        success: false,
        error: stderr || stdout || 'Kon antwoord niet parsen',
      });
    }
  });
}
