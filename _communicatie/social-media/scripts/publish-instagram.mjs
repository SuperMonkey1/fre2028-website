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
const ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID || env.INSTAGRAM_ACCOUNT_ID;
const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_URL || 'https://fre2028.la';
const API_BASE = ACCESS_TOKEN?.startsWith('IG') ? 'https://graph.instagram.com/v19.0' : 'https://graph.facebook.com/v19.0';

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    text: '',
    file: '',
    image: '',
    imageUrl: '',
    carousel: [],
    video: '',
    videoUrl: '',
    story: false,
    reel: false,
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
    } else if (arg === '--image-url' && args[i + 1]) {
      options.imageUrl = args[++i];
    } else if (arg === '--carousel') {
      while (args[i + 1] && !args[i + 1].startsWith('--')) {
        options.carousel.push(args[++i]);
      }
    } else if (arg === '--video' && args[i + 1]) {
      options.video = args[++i];
    } else if (arg === '--video-url' && args[i + 1]) {
      options.videoUrl = args[++i];
    } else if (arg === '--story') {
      options.story = true;
    } else if (arg === '--reel') {
      options.reel = true;
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

async function resolveAssetUrl(filePath, explicitUrl) {
  if (explicitUrl) return explicitUrl;
  if (!filePath) return '';

  const localPath = resolveFilePath(filePath);
  if (!fs.existsSync(localPath)) {
    throw new Error(`File not found: ${localPath}`);
  }

  // Upload directly to Firebase Storage to get instant public URL without website deploy
  console.log(`☁️  Uploading asset to Firebase Storage (${path.basename(localPath)})...`);
  try {
    const { initializeApp, getApps } = await import('firebase/app');
    const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');

    const firebaseConfig = {
      projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'fre-2028-website',
      storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'fre-2028-website.firebasestorage.app',
      apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
      appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const storage = getStorage(app);

    const ext = path.extname(localPath).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : ext === '.mp4' ? 'video/mp4' : 'image/jpeg';
    const filename = `partners/social_media_${Date.now()}_${path.basename(localPath)}`;
    const storageRef = ref(storage, filename);
    const fileBuffer = fs.readFileSync(localPath);

    await uploadBytes(storageRef, fileBuffer, { contentType });
    const downloadUrl = await getDownloadURL(storageRef);
    console.log(`✓ Firebase Storage URL generated: ${downloadUrl}`);
    return downloadUrl;
  } catch (err) {
    console.warn(`⚠️ Firebase Storage upload error (${err.message}). Falling back to website domain.`);
    const publicDir = path.resolve(ROOT_DIR, 'public');
    if (localPath.startsWith(publicDir)) {
      const rel = path.relative(publicDir, localPath).replace(/\\/g, '/');
      return `${BASE_DOMAIN}/${rel}`;
    }
    throw err;
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkContainerStatus(containerId, accessToken) {
  const maxAttempts = 15;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(
      `${API_BASE}/${containerId}?fields=status_code,status&access_token=${encodeURIComponent(accessToken)}`
    );
    const data = await res.json();
    const status = data.status_code;

    if (status === 'FINISHED') return true;
    if (status === 'ERROR' || status === 'EXPIRED') {
      throw new Error(`Media container processing failed with status: ${status} (${data.status || ''})`);
    }

    console.log(`⏳ Processing media container (status: ${status || 'IN_PROGRESS'}, attempt ${attempt}/${maxAttempts})...`);
    await sleep(2500);
  }
  return true;
}

async function main() {
  const options = parseArgs();

  if (!ACCESS_TOKEN || !ACCOUNT_ID) {
    console.error('\n❌ Missing INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_ACCOUNT_ID in environment or .env.local.');
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

  let mode = 'SINGLE_IMAGE';
  if (options.carousel && options.carousel.length > 0) mode = 'CAROUSEL';
  else if (options.reel || options.video || options.videoUrl) mode = 'REEL';
  else if (options.story) mode = 'STORY';

  console.log('\n======================================================');
  console.log(`📸 Instagram API Publisher [Mode: ${mode}]`);
  console.log('======================================================');
  console.log(`👤 Instagram Account ID: ${ACCOUNT_ID}`);
  console.log(`📝 Caption Length: ${postText?.length || 0} characters`);

  if (options.dryRun) {
    console.log('\n🔍 [DRY RUN] Caption Preview:');
    console.log('----------------------------------------------------');
    console.log(postText || '(No caption)');
    console.log('----------------------------------------------------');
    console.log('✓ Dry run completed.\n');
    return;
  }

  let creationId = null;

  if (mode === 'CAROUSEL') {
    console.log(`\n🎠 Creating Carousel post with ${options.carousel.length} items...`);
    const childrenIds = [];

    for (let i = 0; i < options.carousel.length; i++) {
      const itemPath = options.carousel[i];
      const itemUrl = await resolveAssetUrl(itemPath);
      console.log(`  Uploading item ${i + 1}/${options.carousel.length}: ${itemUrl}`);

      const itemRes = await fetch(`${API_BASE}/${ACCOUNT_ID}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: itemUrl,
          is_carousel_item: true,
          access_token: ACCESS_TOKEN,
        }),
      });

      const itemData = await itemRes.json();
      if (!itemRes.ok || !itemData.id) {
        throw new Error(`Failed to create carousel item ${i + 1}: ${JSON.stringify(itemData)}`);
      }
      childrenIds.push(itemData.id);
      await sleep(1000);
    }

    console.log('📦 Creating Carousel container...');
    const carRes = await fetch(`${API_BASE}/${ACCOUNT_ID}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'CAROUSEL',
        children: childrenIds,
        caption: postText ? postText.trim() : undefined,
        access_token: ACCESS_TOKEN,
      }),
    });

    const carData = await carRes.json();
    if (!carRes.ok || !carData.id) {
      throw new Error(`Failed to create carousel container: ${JSON.stringify(carData)}`);
    }
    creationId = carData.id;
  } else if (mode === 'REEL') {
    const videoUrl = await resolveAssetUrl(options.video, options.videoUrl);
    console.log(`\n🎬 Creating Reel from video: ${videoUrl}`);

    const reelRes = await fetch(`${API_BASE}/${ACCOUNT_ID}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'REELS',
        video_url: videoUrl,
        caption: postText ? postText.trim() : undefined,
        share_to_feed: true,
        access_token: ACCESS_TOKEN,
      }),
    });

    const reelData = await reelRes.json();
    if (!reelRes.ok || !reelData.id) {
      throw new Error(`Failed to create Reel container: ${JSON.stringify(reelData)}`);
    }
    creationId = reelData.id;
  } else if (mode === 'STORY') {
    const imageUrl = await resolveAssetUrl(options.image, options.imageUrl);
    console.log(`\n📱 Creating Story from: ${imageUrl}`);

    const storyRes = await fetch(`${API_BASE}/${ACCOUNT_ID}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'STORIES',
        image_url: imageUrl,
        access_token: ACCESS_TOKEN,
      }),
    });

    const storyData = await storyRes.json();
    if (!storyRes.ok || !storyData.id) {
      throw new Error(`Failed to create Story container: ${JSON.stringify(storyData)}`);
    }
    creationId = storyData.id;
  } else {
    // Standard Single Image Feed Post
    const imageUrl = await resolveAssetUrl(options.image, options.imageUrl);
    console.log(`\n🖼️  Creating Image feed post: ${imageUrl}`);

    const imgRes = await fetch(`${API_BASE}/${ACCOUNT_ID}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: postText ? postText.trim() : undefined,
        access_token: ACCESS_TOKEN,
      }),
    });

    const imgData = await imgRes.json();
    if (!imgRes.ok || !imgData.id) {
      throw new Error(`Failed to create media container: ${JSON.stringify(imgData)}`);
    }
    creationId = imgData.id;
  }

  console.log(`✓ Media container created: ${creationId}`);

  // Step 2: Poll container status
  await checkContainerStatus(creationId, ACCESS_TOKEN);

  // Step 3: Publish Media Container
  console.log('🚀 Publishing media container...');
  const publishUrl = `${API_BASE}/${ACCOUNT_ID}/media_publish`;
  const publishRes = await fetch(publishUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: creationId,
      access_token: ACCESS_TOKEN,
    }),
  });

  const publishData = await publishRes.json();
  if (!publishRes.ok || !publishData.id) {
    console.error(`\n❌ Failed to publish post (${publishRes.status}):`);
    console.error(JSON.stringify(publishData, null, 2));
    process.exit(1);
  }

  const publishedMediaId = publishData.id;

  // Step 4: Fetch permalink
  let permalink = `https://www.instagram.com/fre.climbs/`;
  try {
    const infoRes = await fetch(
      `${API_BASE}/${publishedMediaId}?fields=permalink&access_token=${encodeURIComponent(ACCESS_TOKEN)}`
    );
    const infoData = await infoRes.json();
    if (infoData.permalink) permalink = infoData.permalink;
  } catch {}

  console.log('\n======================================================');
  console.log(`🎉 ${mode} Published Successfully to Instagram!`);
  console.log(`🆔 Media ID: ${publishedMediaId}`);
  console.log(`🔗 Live Post URL: ${permalink}`);
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('\n❌ Unexpected error:', err.message);
  process.exit(1);
});
