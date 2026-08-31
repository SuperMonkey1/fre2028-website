#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../../..');

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

const env = loadEnv();
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN || env.INSTAGRAM_ACCESS_TOKEN;

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    text: '',
    file: '',
    image: '',
    pageId: '1452528604785597', // Fré Leys
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--text' && args[i + 1]) {
      options.text = args[++i];
    } else if (arg === '--file' && args[i + 1]) {
      options.file = args[++i];
    } else if (arg === '--image' && args[i + 1]) {
      options.image = args[++i];
    } else if (arg === '--page-id' && args[i + 1]) {
      options.pageId = args[++i];
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    }
  }

  return options;
}

function resolveFilePath(filePath) {
  if (!filePath) return '';
  let localPath = path.resolve(ROOT_DIR, filePath);
  if (fs.existsSync(localPath)) return localPath;

  const socialPath = path.resolve(__dirname, '..', filePath);
  if (fs.existsSync(socialPath)) return socialPath;

  return localPath;
}

async function main() {
  const options = parseArgs();

  if (!ACCESS_TOKEN) {
    console.error('\n❌ Missing ACCESS_TOKEN in .env.local.');
    process.exit(1);
  }

  let postText = options.text;
  if (options.file) {
    const filePath = resolveFilePath(options.file);
    if (fs.existsSync(filePath)) {
      postText = fs.readFileSync(filePath, 'utf8');
    } else {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }
  }

  if (!postText && !options.image) {
    console.error('❌ Missing text or image to publish.');
    process.exit(1);
  }

  console.log('\n======================================================');
  console.log('📘 Publishing to Facebook Page (Fré Leys)');
  console.log('======================================================');
  console.log(`📄 Page ID: ${options.pageId}`);
  if (options.image) console.log(`🖼️  Image: ${options.image}`);
  console.log(`📝 Caption Length: ${postText?.length || 0} characters`);

  // First, obtain Page Access Token for options.pageId
  console.log('🔑 Retrieving Page Access Token for Fré Leys...');
  const pageRes = await fetch(`https://graph.facebook.com/v19.0/${options.pageId}?fields=access_token,name&access_token=${encodeURIComponent(ACCESS_TOKEN)}`);
  const pageData = await pageRes.json();
  const pageToken = pageData.access_token || ACCESS_TOKEN;

  if (options.dryRun) {
    console.log('\n🔍 [DRY RUN] Post Preview:');
    console.log('----------------------------------------------------');
    console.log(postText);
    console.log('----------------------------------------------------');
    console.log('✓ Dry run completed. No post was published.\n');
    return;
  }

  if (options.image) {
    const imagePath = resolveFilePath(options.image);
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image not found: ${imagePath}`);
    }

    console.log('📤 Uploading photo to Facebook Page...');
    const formData = new FormData();
    const imageBuffer = fs.readFileSync(imagePath);
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
    formData.append('source', blob, path.basename(imagePath));
    if (postText) {
      formData.append('message', postText.trim());
    }
    formData.append('access_token', pageToken);

    const publishRes = await fetch(`https://graph.facebook.com/v19.0/${options.pageId}/photos`, {
      method: 'POST',
      body: formData,
    });

    const publishData = await publishRes.json();
    if (!publishRes.ok || !publishData.id) {
      console.error(`\n❌ Failed to publish photo to Facebook (${publishRes.status}):`);
      console.error(JSON.stringify(publishData, null, 2));
      process.exit(1);
    }

    const postId = publishData.post_id || publishData.id;
    console.log('\n======================================================');
    console.log('🎉 Post Published Successfully to Facebook Page!');
    console.log(`🆔 Photo/Post ID: ${postId}`);
    console.log(`🔗 Facebook Post URL: https://www.facebook.com/${postId}`);
    console.log('======================================================\n');
  } else {
    // Text only post
    const publishRes = await fetch(`https://graph.facebook.com/v19.0/${options.pageId}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: postText.trim(),
        access_token: pageToken,
      }),
    });

    const publishData = await publishRes.json();
    if (!publishRes.ok || !publishData.id) {
      console.error(`\n❌ Failed to publish post to Facebook (${publishRes.status}):`);
      console.error(JSON.stringify(publishData, null, 2));
      process.exit(1);
    }

    console.log('\n======================================================');
    console.log('🎉 Post Published Successfully to Facebook Page!');
    console.log(`🆔 Post ID: ${publishData.id}`);
    console.log(`🔗 Facebook Post URL: https://www.facebook.com/${publishData.id}`);
    console.log('======================================================\n');
  }
}

main().catch((err) => {
  console.error('\n❌ Unexpected error:', err.message);
  process.exit(1);
});
