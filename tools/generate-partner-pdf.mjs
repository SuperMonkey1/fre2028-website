import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to convert local image to base64 Data URI
function getImageBase64(relPath) {
  const fullPath = path.join(rootDir, 'public', relPath);
  if (!fs.existsSync(fullPath)) return '';
  const ext = path.extname(fullPath).slice(1);
  const mime = ext === 'svg' ? 'image/svg+xml' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'image/png';
  const data = fs.readFileSync(fullPath).toString('base64');
  return `data:${mime};base64,${data}`;
}

async function generatePdf() {
  console.log('Generating Partner Dossier PDF...');

  const heroImage = getImageBase64('images/innsbruck_victory_4x5.jpg') || getImageBase64('images/web/me_winning_innsbruck_web.webp');
  const actionImage = getImageBase64('images/web/20240625_innsbruck_Nicholas_web.webp');
  const kulibrieImage = getImageBase64('images/web/me_kulibrie_web.webp');
  const paraclimbingImage = getImageBase64('images/web/paraclimbing_be_web.webp');

  const htmlContent = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <title>Partnerschapsdossier FRÉ2028 — De Leuven 25 Support Circle</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

    @page {
      size: A4;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #18181b;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      height: 297mm;
      padding: 16mm 18mm;
      position: relative;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      background: #ffffff;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    /* Top Brand Bar */
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #000000;
      padding-bottom: 8px;
      margin-bottom: 16px;
    }

    .logo-badge {
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #000000;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .header-tag {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      background: #000000;
      color: #ffffff;
      padding: 3px 8px;
      border-radius: 2px;
    }

    /* Page Footer */
    .footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e4e4e7;
      padding-top: 8px;
      font-size: 8.5px;
      color: #71717a;
      font-weight: 500;
    }

    /* Typography */
    h1 {
      font-size: 26px;
      font-weight: 900;
      line-height: 1.1;
      letter-spacing: -0.03em;
      color: #09090b;
      margin-bottom: 6px;
    }

    h2 {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #09090b;
      margin-bottom: 8px;
    }

    h3 {
      font-size: 13px;
      font-weight: 700;
      color: #09090b;
      margin-bottom: 4px;
    }

    p {
      font-size: 10px;
      line-height: 1.5;
      color: #3f3f46;
      margin-bottom: 8px;
    }

    .lead-text {
      font-size: 11.5px;
      line-height: 1.45;
      color: #27272a;
      font-weight: 500;
      margin-bottom: 12px;
    }

    /* Hero / Cover Layout */
    .hero-grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 16px;
      align-items: stretch;
      margin-bottom: 16px;
    }

    .hero-image-wrap {
      border-radius: 6px;
      overflow: hidden;
      height: 210px;
      background: #f4f4f5;
      border: 1px solid #e4e4e7;
    }

    .hero-image-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* Cards & Grids */
    .highlight-card {
      background: #fafafa;
      border: 1.5px solid #000000;
      border-radius: 6px;
      padding: 12px 14px;
      margin-bottom: 12px;
    }

    .card-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 12px;
    }

    .card-grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      margin-bottom: 12px;
    }

    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 12px;
    }

    .pillar-card {
      background: #ffffff;
      border: 1px solid #e4e4e7;
      border-left: 3px solid #000000;
      border-radius: 4px;
      padding: 10px 12px;
    }

    .badge-price {
      display: inline-block;
      background: #000000;
      color: #ffffff;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 3px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .benefit-list {
      list-style: none;
      margin-top: 6px;
    }

    .benefit-list li {
      font-size: 9.5px;
      line-height: 1.4;
      color: #27272a;
      margin-bottom: 5px;
      padding-left: 14px;
      position: relative;
    }

    .benefit-list li::before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #000000;
      font-weight: 900;
      font-size: 10px;
    }

    .accent-box {
      background: #fffbeb;
      border-left: 3px solid #f59e0b;
      padding: 8px 12px;
      border-radius: 0 4px 4px 0;
      margin-bottom: 10px;
    }

    .accent-box p {
      font-size: 9px;
      color: #92400e;
      margin-bottom: 0;
      line-height: 1.4;
    }

    .contact-box {
      background: #09090b;
      color: #ffffff;
      padding: 14px 18px;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .contact-box h3 {
      color: #ffffff;
      font-size: 13px;
      margin-bottom: 2px;
    }

    .contact-box p {
      color: #a1a1aa;
      font-size: 9px;
      margin-bottom: 0;
    }

    .contact-info {
      font-size: 10px;
      font-weight: 700;
      color: #ffffff;
      text-align: right;
      line-height: 1.4;
    }
  </style>
</head>
<body>

  <!-- ==================== PAGINA 1: OVERZICHT & PROPOSITIE ==================== -->
  <div class="page">
    <div>
      <div class="header-bar">
        <div class="logo-badge">▲ FRÉ2028.LA</div>
        <div class="header-tag">Partnerschapsdossier 2026–2028</div>
      </div>

      <h1>Word Partner van Fré Leys</h1>
      <p class="lead-text">
        Sluit je aan bij <strong>Team Fré2028.LA</strong> en schrijf mee topsportgeschiedenis: de allereerste Leuvense Paralympiër op weg naar goud in Los Angeles 2028.
      </p>

      <div class="hero-grid">
        <div class="hero-image-wrap">
          <img src="${heroImage}" alt="Fré Leys Paraclimbing">
        </div>
        <div style="display: flex; flex-direction: column; justify-content: space-between;">
          <div class="info-card">
            <h3>De "Engineer-Athlete"</h3>
            <p style="margin-bottom: 4px;">
              <strong>Dr. Ir. Frederik Leys</strong> behaalde een doctoraat in de Ingenieurswetenschappen (KU Leuven) en is actief als zelfstandig ingenieur naast zijn topsportcarrière in het Belgisch Paraklimteam.
            </p>
            <p style="margin-bottom: 0; line-height: 1.4;">
              • <strong>2x Wereldbeker Goud</strong> (Los Angeles & Salt Lake City)<br>
              • <strong>6x Internationaal Podium</strong><br>
              • <strong>Oprichter & voorzitter van VZW Paraclimbing.be</strong>, een organisatie die zich actief inzet om paraklimmen toegankelijk te maken en breed te promoten.
            </p>
          </div>

          <div class="accent-box">
            <strong style="font-size: 9.5px; color: #78350f;">Waarom deze steun noodzakelijk is:</strong>
            <p>
              In België zijn subsidies voor paraklimmen minimaal — zo moet Fré in 2026 circa <strong>€3.500 aan wedstrijdreizen uit eigen zak betalen</strong>, terwijl atleten in buurlanden voltijds gefinancierd worden.
            </p>
          </div>
        </div>
      </div>

      <h2>De Leuven 25 Support Circle</h2>
      <div class="highlight-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div>
            <h3 style="font-size: 14px; margin-bottom: 0;">Exclusief Erecollectief van 25 Leuvense Bedrijven</h3>
            <span style="font-size: 9.5px; color: #52525b; font-weight: 500;">Directe financiering voor een voltijds professioneel topsporttraject</span>
          </div>
          <div class="badge-price">€100 / maand • €1.200 / jaar</div>
        </div>

        <p style="font-size: 9.5px; margin-bottom: 6px;">
          Om te kunnen concurreren voor paralympisch goud, is een 100% professionele focus vereist. Het intensieve trainingsregime, medische opvolging en campagnebeheer zijn onmogelijk combineerbaar met een reguliere voltijdse job. Met 25 Leuvense partners creëren we een stabiele werkingsbasis (~€25.000 - €30.000/jaar).
        </p>

        <h4 style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #09090b; margin-top: 6px;">
          Wat krijgt jouw bedrijf concreet terug?
        </h4>
        <ul class="benefit-list">
          <li><strong>Zichtbaarheid op alle dragers:</strong> Jouw bedrijfslogo op de officiële campagneposter, de website (fre2028.la) en de officiële trainingskledij en campagne T-shirt.</li>
          <li><strong>Exclusief Jaarevent:</strong> 1x per jaar exclusief partnerevent inclusief kliminitiatie, filmvertoning en keynote/inspiratietalk door Fré over veerkracht, innovatie en topsport.</li>
          <li><strong>Grote Poster 2028:</strong> Jouw logo op de campagneposter die huis-aan-huis gebust wordt in elk huis in Leuven en op elke Leuvense school.</li>
          <li><strong>Leuvense Kerstmarkt 2027:</strong> Zichtbaarheid en activatiemogelijkheden op de Kerstmarkt in Leuven.</li>
          <li><strong>Maatschappelijke Impact:</strong> Structurele bijdrage aan de promotie van paraklimmen (paraclimbing.be) en de Paralympische Spelen in Leuven.</li>
        </ul>
      </div>
    </div>

    <div class="footer-bar">
      <span>FRÉ2028.LA — Partnerschapsdossier</span>
      <span>Pagina 1 van 2</span>
      <span>frederik.leys@gmail.com • www.fre2028.la</span>
    </div>
  </div>

  <!-- ==================== PAGINA 2: STRATEGIE, DIENSTEN & CONTACT ==================== -->
  <div class="page">
    <div>
      <div class="header-bar">
        <div class="logo-badge">▲ FRÉ2028.LA</div>
        <div class="header-tag">Partnerschapsdossier • Pijlers & Return</div>
      </div>

      <h2>Onze 3 Partnerschaps Pijlers</h2>
      <p style="margin-bottom: 12px;">
        Een doordachte samenwerking waarin sportieve prestaties, lokale Leuvense trots en professionele communicatie elkaar versterken.
      </p>

      <div class="card-grid-3">
        <div class="pillar-card">
          <div style="font-size: 8.5px; font-weight: 800; text-transform: uppercase; color: #71717a; margin-bottom: 2px;">Pijler 1</div>
          <h3 style="font-size: 11.5px;">Financiële Partners</h3>
          <p style="font-size: 9px; margin-bottom: 6px;"><strong>De Leuven 25 Support Circle</strong></p>
          <p style="font-size: 8.5px; color: #52525b; margin-bottom: 0;">
            25 partners aan €100/mnd voor het levensonderhoud, training, materiaal en niet-gesubsidieerde buitenlandse wedstrijdkosten.
          </p>
        </div>

        <div class="pillar-card">
          <div style="font-size: 8.5px; font-weight: 800; text-transform: uppercase; color: #71717a; margin-bottom: 2px;">Pijler 2</div>
          <h3 style="font-size: 11.5px;">Strategische Partners</h3>
          <p style="font-size: 9px; margin-bottom: 6px;"><strong>Pro Bono Expertise (Leuven)</strong></p>
          <p style="font-size: 8.5px; color: #52525b; margin-bottom: 0;">
            PR- en mediabureaus, content creators, videografen en logistieke partners voor de 3-maanden mediapush in Leuven.
          </p>
        </div>

        <div class="pillar-card">
          <div style="font-size: 8.5px; font-weight: 800; text-transform: uppercase; color: #71717a; margin-bottom: 2px;">Pijler 3</div>
          <h3 style="font-size: 11.5px;">Performance Team</h3>
          <p style="font-size: 9px; margin-bottom: 6px;"><strong>Sportwetenschappelijk Kader</strong></p>
          <p style="font-size: 8.5px; color: #52525b; margin-bottom: 0;">
            Klimcoaches, kinesitherapeut, sportpsycholoog, voedingsdeskundige enfederatie voor goud in LA 2028.
          </p>
        </div>
      </div>

      <div class="hero-grid" style="margin-top: 10px; margin-bottom: 12px;">
        <div style="display: flex; flex-direction: column; justify-content: space-between;">
          <div class="info-card">
            <h3>Waarom investeren als Leuvens Bedrijf?</h3>
            <ul class="benefit-list">
              <li><strong>Authentiek Leuvens Verhaal:</strong> Eerste Leuvense Paralympiër ooit in een historisch debuut (paraklimmen debuteert in LA 2028).</li>
              <li><strong>Inspiratie voor jouw medewerkers:</strong> Een krachtig rolmodel over veerkracht, innovatie en het overwinnen van fysieke grenzen.</li>
              <li><strong>Tangible CSR & D&I:</strong> Concreet engagement in diversiteit, inclusie en G-sport in samenwerking met Paraclimbing.be.</li>
            </ul>
          </div>
        </div>
        <div class="hero-image-wrap" style="height: 145px;">
          <img src="${actionImage}" alt="Fré Leys in actie">
        </div>
      </div>

      <h2>Campagne Fasering & 3-Maanden Push</h2>
      <div class="info-card" style="margin-bottom: 16px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <strong style="font-size: 9.5px; color: #000;">Fase 1: Focus Leuven (Dag 1000 - 501)</strong>
            <p style="font-size: 8.5px; margin-bottom: 0; color: #52525b;">
              Intensieve 3-maanden mediapush, lancering van de website, persberichten, werving van de 25 partners en uitbouw van de lokale community.
            </p>
          </div>
          <div>
            <strong style="font-size: 9.5px; color: #000;">Fase 2: Vlaanderen & LA (Dag 500 - 0)</strong>
            <p style="font-size: 8.5px; margin-bottom: 0; color: #52525b;">
              Nationale media-aandacht, huis-aan-huis posters in Leuven, schoolacties en kwalificatiepiek richting de Spelen van Los Angeles 2028.
            </p>
          </div>
        </div>
      </div>

      <div class="contact-box">
        <div>
          <h3>Klaar om in te stappen in de Leuven 25 Support Circle?</h3>
          <p>Neem direct contact op voor een kennismaking of bevestiging van jouw partnerschap.</p>
        </div>
        <div class="contact-info">
          <div>Fré Leys</div>
          <div style="color: #fbbf24;">frederik.leys@gmail.com</div>
          <div style="font-weight: 400; color: #a1a1aa;">www.fre2028.la</div>
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <span>FRÉ2028.LA — Partnerschapsdossier</span>
      <span>Pagina 2 van 2</span>
      <span>frederik.leys@gmail.com • www.fre2028.la</span>
    </div>
  </div>

</body>
</html>`;

  const outputPath = path.join(rootDir, 'public', 'Frederik-Leys-Partnership-Dossier.pdf');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();
  console.log(`PDF successfully generated at: ${outputPath}`);
}

generatePdf().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
