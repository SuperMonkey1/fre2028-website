import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const credPath = path.join(process.cwd(), 'credentials.json');
    if (!fs.existsSync(credPath)) {
      return res.status(500).send('credentials.json niet gevonden.');
    }

    const creds = JSON.parse(fs.readFileSync(credPath, 'utf-8'));
    const clientId = creds.installed?.client_id || creds.web?.client_id;

    if (!clientId) {
      return res.status(500).send('Client ID ontbreekt in credentials.json');
    }

    const host = req.headers.host || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || (host.startsWith('localhost') ? 'http' : 'https');
    const redirectUri = `${protocol}://${host}/api/admin/gmail/callback`;

    const scopes = [
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
    ].join(' ');

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${encodeURIComponent(
      scopes
    )}&access_type=offline&prompt=consent`;

    res.redirect(authUrl);
  } catch (e: any) {
    res.status(500).send(`Fout bij genereren auth URL: ${e.message}`);
  }
}
