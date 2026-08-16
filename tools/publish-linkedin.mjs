#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

// Helper to load .env.local or .env variables manually
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
const ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN || env.LINKEDIN_ACCESS_TOKEN;
const PERSON_URN = process.env.LINKEDIN_PERSON_URN || env.LINKEDIN_PERSON_URN;

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    text: '',
    file: '',
    image: '',
    delete: '',
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
    } else if (arg === '--delete' && args[i + 1]) {
      options.delete = args[++i];
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    }
  }

  return options;
}

// Upload image to LinkedIn REST API
async function uploadLinkedInImage(imagePath, authorUrn) {
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image file not found at: ${imagePath}`);
  }

  console.log(`📸 Preparing image upload: ${path.basename(imagePath)}...`);

  // Step 1: Initialize image upload
  const initRes = await fetch('https://api.linkedin.com/rest/images?action=initializeUpload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'LinkedIn-Version': '202601',
      'X-Restli-Protocol-Version': '2.0.0',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      initializeUploadRequest: {
        owner: authorUrn,
      },
    }),
  });

  if (!initRes.ok) {
    const errText = await initRes.text();
    throw new Error(`Image upload initialization failed (${initRes.status}): ${errText}`);
  }

  const initData = await initRes.json();
  const uploadUrl = initData.value?.uploadUrl;
  const imageUrn = initData.value?.image;

  if (!uploadUrl || !imageUrn) {
    throw new Error(`Invalid image initialization response: ${JSON.stringify(initData)}`);
  }

  // Step 2: PUT binary image data
  const imageBuffer = fs.readFileSync(imagePath);
  const ext = path.extname(imagePath).toLowerCase();
  const contentType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'application/octet-stream';

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': contentType,
    },
    body: imageBuffer,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Image upload failed (${uploadRes.status}): ${errText}`);
  }

  console.log(`✓ Image uploaded successfully: ${imageUrn}`);
  return imageUrn;
}

async function main() {
  const options = parseArgs();

  if (!ACCESS_TOKEN) {
    console.error('\n❌ Missing LINKEDIN_ACCESS_TOKEN in environment or .env.local.');
    console.log('Run the authentication wizard first:');
    console.log('  npm run auth:linkedin\n');
    process.exit(1);
  }

  if (options.delete) {
    const postUrn = options.delete.trim();
    console.log(`🗑️  Deleting post from LinkedIn: ${postUrn}...`);
    const deleteRes = await fetch(`https://api.linkedin.com/rest/posts/${encodeURIComponent(postUrn)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'LinkedIn-Version': '202601',
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    if (!deleteRes.ok) {
      const errText = await deleteRes.text();
      console.error(`\n❌ Failed to delete post (${deleteRes.status}): ${errText}`);
      process.exit(1);
    }
    console.log('✓ Post deleted successfully from LinkedIn.\n');
    return;
  }

  let postText = options.text;
  if (options.file) {
    const filePath = path.resolve(ROOT_DIR, options.file);
    if (fs.existsSync(filePath)) {
      postText = fs.readFileSync(filePath, 'utf8');
    } else {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }
  }

  if (!postText || postText.trim() === '') {
    console.log('\nUsage:');
    console.log('  npm run post:linkedin -- --text "Your post content..."');
    console.log('  npm run post:linkedin -- --file "path/to/post.md" [--image "path/to/image.png"] [--dry-run]\n');
    process.exit(1);
  }

  const authorUrn = PERSON_URN;

  if (!authorUrn) {
    console.error('\n❌ Missing author URN (LINKEDIN_PERSON_URN). Run `npm run auth:linkedin` to retrieve it.');
    process.exit(1);
  }

  console.log('\n======================================================');
  console.log('📤 Publishing to Frederik Leys LinkedIn Profile (FRE2028)');
  console.log('======================================================');
  console.log(`👤 Author: ${authorUrn}`);
  console.log(`📝 Content Length: ${postText.length} characters`);
  if (options.image) console.log(`🖼️  Attached Image: ${options.image}`);

  if (options.dryRun) {
    console.log('\n🔍 [DRY RUN] Post Preview:');
    console.log('----------------------------------------------------');
    console.log(postText);
    console.log('----------------------------------------------------');
    console.log('✓ Dry run completed. No post was published.\n');
    return;
  }

  let mediaContent = null;
  if (options.image) {
    const imageUrn = await uploadLinkedInImage(path.resolve(ROOT_DIR, options.image), authorUrn);
    mediaContent = {
      media: {
        id: imageUrn,
      },
    };
  }

  const payload = {
    author: authorUrn,
    commentary: postText.trim(),
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    ...(mediaContent ? { content: mediaContent } : {}),
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  };

  const res = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'LinkedIn-Version': '202601',
      'X-Restli-Protocol-Version': '2.0.0',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`\n❌ Failed to publish post (${res.status}):`);
    console.error(errText);
    process.exit(1);
  }

  const postId = res.headers.get('x-restli-id') || res.headers.get('x-linkedin-id') || '';
  const postUrl = postId ? `https://www.linkedin.com/feed/update/${postId}` : 'https://www.linkedin.com/feed/';

  console.log('\n======================================================');
  console.log('🎉 Post Published Successfully to Personal Profile!');
  if (postId) console.log(`🆔 Post URN: ${postId}`);
  console.log(`🔗 Live Post URL: ${postUrl}`);
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('\n❌ Unexpected error:', err);
  process.exit(1);
});
