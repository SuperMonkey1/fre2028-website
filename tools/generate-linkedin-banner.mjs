import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve('c:/Users/frede/Documents/GitHub/fre2028-website');

function getImageBase64(fullPath) {
  if (!fs.existsSync(fullPath)) return '';
  const ext = path.extname(fullPath).slice(1);
  const mime = ext === 'svg' ? 'image/svg+xml' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'image/png';
  const data = fs.readFileSync(fullPath).toString('base64');
  return `data:${mime};base64,${data}`;
}

async function generateLinkedInBanners() {
  console.log('Generating LinkedIn Banners (1584x396)...');

  const bgAction = getImageBase64(path.join(rootDir, 'public', 'images', 'web', 'me_innsbruck_banner_web.webp')) || getImageBase64(path.join(rootDir, 'public', 'images', 'web', 'me_winning_innsbruck_web.webp'));

  const htmlBanner = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <title>LinkedIn Banner — Fré Leys FRE2028</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      width: 1584px;
      height: 396px;
      overflow: hidden;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #09090b;
      color: #ffffff;
      position: relative;
    }

    .bg-image {
      position: absolute;
      top: 0;
      right: 0;
      width: 65%;
      height: 100%;
      background-image: url('${bgAction}');
      background-size: cover;
      background-position: center 25%;
      filter: grayscale(100%) contrast(125%) brightness(0.85);
      opacity: 0.60;
      z-index: 1;
    }

    .overlay-gradient-left {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, #09090b 0%, #09090b 38%, rgba(9,9,11,0.92) 55%, rgba(9,9,11,0.3) 80%, rgba(9,9,11,0.7) 100%);
      z-index: 2;
    }

    .overlay-gradient-topbottom {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.85) 100%);
      z-index: 3;
    }

    /* Content container - aligned with LinkedIn safe zone (left avatar padding on desktop: 360px) */
    .content {
      position: relative;
      z-index: 10;
      width: 100%;
      height: 100%;
      padding: 38px 75px 34px 370px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .badges-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .badge-outline {
      border: 1px solid rgba(255, 255, 255, 0.35);
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(8px);
      padding: 6px 14px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: #e4e4e7;
      border-radius: 2px;
    }

    .badge-amber {
      background: #fbbf24;
      color: #09090b;
      padding: 6px 14px;
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      border-radius: 2px;
    }

    .web-tag {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #a1a1aa;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .web-tag span.dot {
      width: 8px;
      height: 8px;
      background: #dc2626;
      border-radius: 50%;
      display: inline-block;
    }

    .hero-text {
      margin-top: 4px;
    }

    .headline {
      font-size: 56px;
      font-weight: 900;
      letter-spacing: -0.04em;
      line-height: 0.95;
      text-transform: uppercase;
      color: #ffffff;
      margin-bottom: 8px;
    }

    .subtitle {
      font-size: 19px;
      font-weight: 700;
      color: #f4f4f5;
      letter-spacing: -0.01em;
      margin-bottom: 6px;
    }

    .bio-line {
      font-size: 13.5px;
      color: #a1a1aa;
      font-weight: 500;
      letter-spacing: 0.01em;
    }

    .bio-line strong {
      color: #ffffff;
      font-weight: 700;
    }

    .bottom-bar {
      display: flex;
      align-items: center;
      gap: 32px;
      padding-top: 10px;
      border-top: 1px solid rgba(255, 255, 255, 0.14);
    }

    .metric-item {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }

    .metric-val {
      font-size: 15px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.02em;
    }

    .metric-lbl {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #71717a;
      font-weight: 600;
    }

    .separator {
      color: rgba(255, 255, 255, 0.2);
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="bg-image"></div>
  <div class="overlay-gradient-left"></div>
  <div class="overlay-gradient-topbottom"></div>

  <div class="content">
    <div class="top-row">
      <div class="badges-group">
        <div class="badge-outline">Road to LA 2028</div>
        <div class="badge-amber">The Engineer-Athlete</div>
      </div>
      <div class="web-tag">
        <span class="dot"></span> fre2028.la
      </div>
    </div>

    <div class="hero-text">
      <div class="headline">DROOM GROOTS.</div>
      <div class="subtitle">&ldquo;Engineering my way to the Paralympics in 2028&rdquo;</div>
      <div class="bio-line">
        <strong>Dr. Ir. Frederik Leys</strong> &bull; 2x Wereldbeker Goud &bull; 1e Leuvense Paralympiër ooit
      </div>
    </div>

    <div class="bottom-bar">
      <div class="metric-item">
        <span class="metric-val">KU Leuven PhD</span>
        <span class="metric-lbl">Mechanica</span>
      </div>
      <span class="separator">/</span>
      <div class="metric-item">
        <span class="metric-val">6x</span>
        <span class="metric-lbl">Int. Medailles</span>
      </div>
      <span class="separator">/</span>
      <div class="metric-item">
        <span class="metric-val">AL-2</span>
        <span class="metric-lbl">Paraklimmer</span>
      </div>
      <span class="separator">/</span>
      <div class="metric-item">
        <span class="metric-val">Leuven 25</span>
        <span class="metric-lbl">Innovatie Partners</span>
      </div>
    </div>
  </div>
</body>
</html>`;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1584, height: 396, deviceScaleFactor: 2 });

  await page.setContent(htmlBanner, { waitUntil: 'networkidle0' });

  const out1 = path.join(rootDir, '_communicatie', 'social-media', 'assets', 'linkedin_banner_fre2028.png');
  const out2 = path.join(rootDir, 'public', 'images', 'linkedin_banner_fre2028.png');
  const out3 = path.join(rootDir, 'public', 'linkedin_banner_fre2028.png');

  await page.screenshot({ path: out1, type: 'png' });
  fs.copyFileSync(out1, out2);
  fs.copyFileSync(out1, out3);

  console.log('✓ LinkedIn Banner succesvol gegenereerd op 1584x396 (@2x 3168x792)!');
  console.log('  -> Opgeslagen in:', out1);
  console.log('  -> Opgeslagen in:', out2);

  await browser.close();
}

generateLinkedInBanners().catch(console.error);
