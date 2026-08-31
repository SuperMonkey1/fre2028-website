import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, error } = req.query;

  if (error) {
    return res.status(400).send(`Google authenticatie geweigerd: ${error}`);
  }

  if (!code || typeof code !== 'string') {
    return res.status(400).send('Geen autorisatiecode ontvangen van Google.');
  }

  try {
    const credPath = path.join(process.cwd(), 'credentials.json');
    const tokenPath = path.join(process.cwd(), 'token.json');

    if (!fs.existsSync(credPath)) {
      return res.status(500).send('credentials.json niet gevonden.');
    }

    const creds = JSON.parse(fs.readFileSync(credPath, 'utf-8'));
    const clientId = creds.installed?.client_id || creds.web?.client_id;
    const clientSecret = creds.installed?.client_secret || creds.web?.client_secret;

    const host = req.headers.host || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || (host.startsWith('localhost') ? 'http' : 'https');
    const redirectUri = `${protocol}://${host}/api/admin/gmail/callback`;

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error) {
      return res.status(500).send(`Fout bij ophalen van token: ${tokenData.error_description || tokenData.error || 'Onbekend'}`);
    }

    // Prepare token.json format compatible with google-auth-oauthlib
    const scopesList = tokenData.scope ? tokenData.scope.split(' ') : [
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify'
    ];

    const tokenJsonPayload = {
      token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_uri: 'https://oauth2.googleapis.com/token',
      client_id: clientId,
      client_secret: clientSecret,
      scopes: scopesList,
      universe_domain: 'googleapis.com',
      account: '',
      expiry: new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString(),
    };

    fs.writeFileSync(tokenPath, JSON.stringify(tokenJsonPayload, null, 2), 'utf-8');

    // Redirect user back to the admin outreach page
    res.redirect('/admin/outreach?gmail_auth=success');
  } catch (e: any) {
    res.status(500).send(`Serverfout bij authenticatie: ${e.message}`);
  }
}
