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
const CLIENT_ID = process.env.META_APP_ID || process.env.INSTAGRAM_CLIENT_ID || env.META_APP_ID || env.INSTAGRAM_CLIENT_ID;
const CLIENT_SECRET = process.env.META_APP_SECRET || process.env.INSTAGRAM_CLIENT_SECRET || env.META_APP_SECRET || env.INSTAGRAM_CLIENT_SECRET;
const PORT = process.env.PORT || 3005;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.log('\n======================================================');
  console.log('🔑 Instagram / Meta Graph API Setup (FRE2028)');
  console.log('======================================================\n');
  console.error('❌ Missing META_APP_ID or META_APP_SECRET in .env.local.');
  console.log('\nTo set this up:');
  console.log('1. Go to Meta Developers: https://developers.facebook.com/apps/');
  console.log('2. Create an App (Type: Business / Other)');
  console.log('3. Add "Instagram Graph API" and "Facebook Login for Business"');
  console.log('4. Copy App ID and App Secret into .env.local:');
  console.log('   META_APP_ID=your_meta_app_id');
  console.log('   META_APP_SECRET=your_meta_app_secret\n');
  process.exit(1);
}

const SCOPES = [
  'instagram_basic',
  'instagram_content_publish',
  'pages_show_list',
  'pages_read_engagement',
  'business_management',
].join(',');

const AUTH_URL = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${encodeURIComponent(
  CLIENT_ID
)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}&response_type=code`;

console.log('\n======================================================');
console.log('🔑 Instagram Personal / Business OAuth Setup (FRE2028)');
console.log('======================================================\n');
console.log(`Starting local authentication server on http://localhost:${PORT} ...`);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/callback') {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h2>❌ Authorization Failed</h2><p>${errorDescription || error}</p>`);
      console.error(`\n❌ Meta OAuth error: ${errorDescription || error}`);
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

    console.log('\n✓ Authorization code received. Exchanging for Short-Lived Token...');

    try {
      // Step 1: Exchange code for Short-Lived Access Token
      const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${encodeURIComponent(
        CLIENT_ID
      )}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&client_secret=${encodeURIComponent(
        CLIENT_SECRET
      )}&code=${encodeURIComponent(code)}`;

      const tokenResponse = await fetch(tokenUrl);
      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || !tokenData.access_token) {
        throw new Error(tokenData.error?.message || JSON.stringify(tokenData));
      }

      const shortLivedToken = tokenData.access_token;
      console.log('✓ Short-lived token acquired. Exchanging for 60-day Long-Lived Token...');

      // Step 2: Exchange for Long-Lived Token
      const longLivedUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(
        CLIENT_ID
      )}&client_secret=${encodeURIComponent(CLIENT_SECRET)}&fb_exchange_token=${encodeURIComponent(shortLivedToken)}`;

      const longLivedResponse = await fetch(longLivedUrl);
      const longLivedData = await longLivedResponse.json();

      const accessToken = longLivedData.access_token || shortLivedToken;
      const expiresInDays = Math.round((longLivedData.expires_in || 5184000) / 86400);

      // Step 3: Find Instagram Business Account connected to user's Facebook Pages
      console.log('✓ Discovering linked Instagram Business / Creator accounts...');
      const accountsRes = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?fields=name,id,access_token,instagram_business_account{id,username,name}&access_token=${encodeURIComponent(
          accessToken
        )}`
      );
      const accountsData = await accountsRes.json();

      let targetIgAccount = null;
      let pageAccessToken = accessToken;

      if (accountsData.data && accountsData.data.length > 0) {
        for (const page of accountsData.data) {
          if (page.instagram_business_account) {
            targetIgAccount = page.instagram_business_account;
            if (page.access_token) {
              pageAccessToken = page.access_token;
            }
            break;
          }
        }
      }

      // If not directly on pages, try fetching directly
      if (!targetIgAccount) {
        console.log('⚠️ No linked Instagram account found via pages. Checking user accounts directly...');
      }

      updateEnvLocal('INSTAGRAM_ACCESS_TOKEN', pageAccessToken || accessToken);
      if (targetIgAccount?.id) {
        updateEnvLocal('INSTAGRAM_ACCOUNT_ID', targetIgAccount.id);
      }
      if (targetIgAccount?.username) {
        updateEnvLocal('INSTAGRAM_USERNAME', targetIgAccount.username);
      }

      console.log('\n======================================================');
      console.log('🎉 Instagram Authentication Successful!');
      if (targetIgAccount) {
        console.log(`📸 Instagram Account: @${targetIgAccount.username} (${targetIgAccount.name || ''})`);
        console.log(`🆔 Instagram Account ID: ${targetIgAccount.id}`);
      }
      console.log(`⏳ Token validity: ~${expiresInDays} days`);
      console.log('💾 Saved INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_ACCOUNT_ID to .env.local');
      console.log('======================================================\n');
      console.log('Laura can now post to Instagram using:');
      console.log('  npm run post:instagram -- --image "public/images/web/..." --text "Road to LA 2028 update!"\n');

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <div style="font-family: sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #E1306C;">✓ Instagram Connected Successfully!</h2>
          <p>Connected account: <strong>@${targetIgAccount?.username || 'fre.climbs'}</strong></p>
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
  console.log(`\n👉 Opening browser for Instagram / Facebook authorization:\n   ${AUTH_URL}\n`);
  const startCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`${startCmd} "${AUTH_URL}"`, (err) => {
    if (err) console.log('If browser did not open, click the link above.');
  });
});
