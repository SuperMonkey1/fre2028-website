#!/usr/bin/env node
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const ENV_LOCAL_PATH = path.join(ROOT_DIR, '.env.local');

// Helper to load .env.local or .env variables
function loadEnv() {
  const env = { ...process.env };
  for (const file of ['.env', '.env.local']) {
    const fullPath = path.join(ROOT_DIR, file);
    if (fs.existsSync(fullPath)) {
      const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          env[key] = val;
        }
      }
    }
  }
  return env;
}

function updateEnvLocal(key, value) {
  let content = '';
  if (fs.existsSync(ENV_LOCAL_PATH)) {
    content = fs.readFileSync(ENV_LOCAL_PATH, 'utf8');
  }

  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    content = content.replace(regex, `${key}=${value}`);
  } else {
    content = content.trimEnd() + `\n${key}=${value}\n`;
  }

  fs.writeFileSync(ENV_LOCAL_PATH, content, 'utf8');
}

const env = loadEnv();
const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || env.LINKEDIN_CLIENT_SECRET;
const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('\n❌ Missing LINKEDIN_CLIENT_ID or LINKEDIN_CLIENT_SECRET in .env.local.');
  console.log('Add them to .env.local:');
  console.log('LINKEDIN_CLIENT_ID=your_client_id');
  console.log('LINKEDIN_CLIENT_SECRET=your_client_secret\n');
  process.exit(1);
}

const SCOPES = ['openid', 'profile', 'email', 'w_member_social'].join(' ');
const AUTH_URL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${encodeURIComponent(
  CLIENT_ID
)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;

console.log('\n======================================================');
console.log('🔑 LinkedIn Personal Profile OAuth Setup (FRE2028)');
console.log('======================================================\n');
console.log('Starting local authentication server on http://localhost:3000 ...');

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/callback') {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h2>❌ Authorization Failed</h2><p>${errorDescription || error}</p>`);
      console.error(`\n❌ LinkedIn OAuth error: ${errorDescription || error}`);
      server.close();
      process.exit(1);
      return;
    }

    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h2>❌ Missing authorization code</h2>');
      server.close();
      process.exit(1);
      return;
    }

    console.log('\n✓ Authorization code received. Exchanging for Access Token...');

    try {
      const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || !tokenData.access_token) {
        throw new Error(tokenData.error_description || JSON.stringify(tokenData));
      }

      const accessToken = tokenData.access_token;
      const expiresInDays = Math.round((tokenData.expires_in || 5184000) / 86400);

      // Fetch user profile info (OpenID)
      console.log('✓ Fetching profile details (OpenID sub)...');
      const userResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userData = await userResponse.json();
      const personUrn = userData.sub ? `urn:li:person:${userData.sub}` : '';

      updateEnvLocal('LINKEDIN_ACCESS_TOKEN', accessToken);
      if (personUrn) {
        updateEnvLocal('LINKEDIN_PERSON_URN', personUrn);
      }

      console.log('\n======================================================');
      console.log('🎉 LinkedIn Authentication Successful!');
      console.log(`👤 Name: ${userData.name || 'Frederik Leys'}`);
      console.log(`🆔 Author URN: ${personUrn}`);
      console.log(`⏳ Token validity: ~${expiresInDays} days`);
      console.log('💾 Saved LINKEDIN_ACCESS_TOKEN and LINKEDIN_PERSON_URN to .env.local');
      console.log('======================================================\n');
      console.log('Laura can now post to your personal LinkedIn profile using:');
      console.log('  npm run post:linkedin -- --text "Road to LA 2028 update!"\n');

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <div style="font-family: sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #057642;">✓ LinkedIn Connected Successfully!</h2>
          <p>Connected personal account: <strong>${userData.name || 'Frederik Leys'}</strong></p>
          <p>Tokens saved to <code>.env.local</code>. You can close this tab.</p>
        </div>
      `);

      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 1000);
    } catch (err) {
      console.error('\n❌ Failed to complete token exchange:', err.message);
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h2>❌ Token Exchange Error</h2><p>${err.message}</p>`);
      server.close();
      process.exit(1);
    }
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`\n👉 Opening browser for authorization:\n   ${AUTH_URL}\n`);
  const startCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`${startCmd} "${AUTH_URL}"`, (err) => {
    if (err) console.log('If browser did not open, click the link above.');
  });
});
