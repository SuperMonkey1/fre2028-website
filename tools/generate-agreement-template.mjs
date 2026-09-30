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

async function generatePdf() {
  console.log('Generating LRD Partnership & Engagement Agreement PDF...');

  const lrdLogo = getImageBase64(path.join(rootDir, '_sales', 'partners', 'LRD', 'LRD_LOGO_RGB.png'));

  const html = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <title>Partnerschapsovereenkomst — LRD & Fré Leys / Paraclimbing Be VZW</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

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
      font-size: 13px;
      line-height: 1.5;
    }

    .page {
      width: 210mm;
      height: 297mm;
      min-height: 297mm;
      max-height: 297mm;
      padding: 16mm 20mm;
      position: relative;
      background: #ffffff;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 2px solid #18181b;
    }

    .header-left .campaign-name {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #09090b;
    }

    .header-left .sub-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #71717a;
      font-weight: 600;
      margin-top: 2px;
    }

    .header-right img {
      max-height: 38px;
      object-fit: contain;
    }

    /* Document Title */
    .title-section {
      margin-top: 14px;
      margin-bottom: 14px;
    }

    .doc-badge {
      display: inline-block;
      background: #f4f4f5;
      border: 1px solid #e4e4e7;
      color: #27272a;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      padding: 3px 8px;
      border-radius: 4px;
      margin-bottom: 6px;
    }

    .doc-title {
      font-size: 21px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #09090b;
    }

    .doc-subtitle {
      font-size: 12.5px;
      color: #52525b;
      margin-top: 2px;
    }

    /* Grid for Parties */
    .parties-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 14px;
    }

    .party-card {
      background: #fafafa;
      border: 1px solid #e4e4e7;
      border-radius: 6px;
      padding: 10px 14px;
    }

    .party-role {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #71717a;
      margin-bottom: 4px;
    }

    .party-name {
      font-size: 13.5px;
      font-weight: 700;
      color: #09090b;
      margin-bottom: 4px;
    }

    .party-details {
      font-size: 11px;
      color: #52525b;
      line-height: 1.45;
    }

    /* Section styling */
    .section-title {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #09090b;
      border-left: 3px solid #000;
      padding-left: 8px;
      margin-top: 10px;
      margin-bottom: 8px;
    }

    /* Engagement List */
    .engagement-item {
      background: #ffffff;
      border: 1px solid #e4e4e7;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 9px;
    }

    .engagement-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .engagement-num {
      background: #18181b;
      color: #ffffff;
      font-size: 10px;
      font-weight: 800;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }

    .engagement-title {
      font-size: 12.5px;
      font-weight: 700;
      color: #18181b;
    }

    .engagement-text {
      font-size: 11.5px;
      color: #3f3f46;
      line-height: 1.5;
      padding-left: 26px;
    }

    .engagement-list {
      margin-top: 4px;
      padding-left: 42px;
      font-size: 11.5px;
      color: #3f3f46;
      line-height: 1.5;
    }

    .engagement-list li {
      margin-bottom: 2px;
    }

    /* Financial Banner */
    .finance-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #18181b;
      color: #ffffff;
      border-radius: 6px;
      padding: 10px 16px;
      margin-bottom: 12px;
    }

    .finance-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #a1a1aa;
      font-weight: 600;
    }

    .finance-amount {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    /* Invoicing Box */
    .invoice-card {
      background: #fafafa;
      border: 1px solid #e4e4e7;
      border-radius: 6px;
      padding: 12px 16px;
      margin-top: 6px;
      margin-bottom: 12px;
    }

    .invoice-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
      font-size: 11.5px;
    }

    .invoice-item span.label {
      color: #71717a;
      display: block;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }

    .invoice-item span.val {
      color: #18181b;
      font-weight: 600;
    }

    /* Signature Box */
    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 8px;
    }

    .sig-box {
      border: 1px dashed #d4d4d8;
      border-radius: 6px;
      padding: 12px 14px;
      min-height: 85px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .sig-label {
      font-size: 10.5px;
      color: #71717a;
      font-weight: 600;
    }

    .sig-name {
      font-size: 12px;
      font-weight: 700;
      color: #18181b;
      margin-top: 30px;
    }

    /* Footer */
    .footer {
      border-top: 1px solid #e4e4e7;
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      font-size: 9.5px;
      color: #a1a1aa;
    }
  </style>
</head>
<body>

  <!-- PAGE 1: PARTNERSHIP OVERVIEW & ENGAGEMENTS -->
  <div class="page">
    <div>
      <div class="header">
        <div class="header-left">
          <div class="campaign-name">FRÉ LEYS — LA 2028</div>
          <div class="sub-title">Engineering my way to the Paralympics in 2028</div>
        </div>
        <div class="header-right">
          ${lrdLogo ? `<img src="${lrdLogo}" alt="KU Leuven Research & Development" />` : '<span style="font-weight: 800; font-size: 14px;">KU LEUVEN R&D</span>'}
        </div>
      </div>

      <div class="title-section">
        <div class="doc-badge">Officieel Partnerschapsdocument</div>
        <h1 class="doc-title">Partnerschapsovereenkomst &amp; Engagementenoverzicht</h1>
        <p class="doc-subtitle">Ondersteuning van het topsport- en innovatietraject van Dr. Ir. Frederik Leys richting de Paralympische Spelen van Los Angeles 2028.</p>
      </div>

      <!-- Parties -->
      <div class="parties-grid">
        <div class="party-card">
          <div class="party-role">Ondersteunende Partner</div>
          <div class="party-name">KU Leuven Research &amp; Development (LRD)</div>
          <div class="party-details">
            Waaistraat 6 - bus 5105, 3000 Leuven<br>
            Vertegenwoordigd door: <strong>Dhr. Tom Wolfs</strong>
          </div>
        </div>
        <div class="party-card">
          <div class="party-role">Begunstigde / Uitvoerder</div>
          <div class="party-name">Paraclimbing Be VZW</div>
          <div class="party-details">
            Valkerijgang 32, 3000 Leuven | Ond.nr: BE 0781.972.626<br>
            Ten behoeve van: <strong>Dr. Ir. Frederik Leys (Atleet &amp; Alumnus)</strong>
          </div>
        </div>
      </div>

      <!-- Financial Terms -->
      <div class="finance-banner">
        <div>
          <div class="finance-label">Overeengekomen Partnerschapsbijdrage</div>
          <div style="font-size: 12px; opacity: 0.9;">Ondersteuning topsport, uitrusting en kwalificatietraject LA 2028</div>
        </div>
        <div class="finance-amount">&euro; 2.400,00</div>
      </div>

      <!-- Core Deliverables -->
      <div class="section-title">Overeengekomen Engagementen van Frederik Leys / FRE2028</div>

      <!-- 1. Visibility -->
      <div class="engagement-item">
        <div class="engagement-header">
          <div class="engagement-num">1</div>
          <div class="engagement-title">Visibiliteit &amp; Merkaanwezigheid</div>
        </div>
        <div class="engagement-text">
          Het officiële logo van KU Leuven Research &amp; Development wordt prominent geïntegreerd in de communicatie-uitingen van de campagne:
        </div>
        <ul class="engagement-list">
          <li><strong>Website (fre2028.la):</strong> Opname van het LRD-logo in de officiële partnersectie, inclusief actieve doorklik naar de officiële kanalen van LRD.</li>
          <li><strong>Kledij:</strong> Integratie van het LRD-logo op de officiële trainingskledij en het exclusieve campagne T-shirt.</li>
          <li><strong>Campagneposter:</strong> Plaatsing van het LRD-logo op de officiële campagneposter én op de grote campagneposter die huis-aan-huis in Leuven en op scholen verspreid wordt.</li>
          <li><strong>Leuvense Kerstmarkt:</strong> Bij aanwezigheid met een campagnestand op de Leuvense kerstmarkt krijgt het LRD-logo een zichtbare en centrale plaats.</li>
        </ul>
      </div>

      <!-- 2. Social Media -->
      <div class="engagement-item">
        <div class="engagement-header">
          <div class="engagement-num">2</div>
          <div class="engagement-title">Social Media Campagne (LinkedIn &amp; Instagram)</div>
        </div>
        <div class="engagement-text">
          Drie (3) gerichte socialmediaposts op zowel LinkedIn als Instagram waarin het LRD-logo duidelijk zichtbaar is op beeldmateriaal én waarin het officiële account van LRD actief getagd wordt:
        </div>
        <ul class="engagement-list">
          <li><strong>Post 1:</strong> Op of in aanloop naar een eerste belangrijk internationaal kwalificatiemoment (World Cup / Wereldbeker).</li>
          <li><strong>Post 2:</strong> In aanloop naar een tweede cruciaal internationaal toernooi / kwalificatiemijlpaal.</li>
          <li><strong>Post 3:</strong> In de directe aanloop naar de openings- en wedstrijdfase op de Paralympische Spelen van Los Angeles 2028.</li>
          <li><em>Tagging:</em> Actieve vermelding van de officiële LinkedIn showcase page (<code>KU Leuven Research &amp; Development</code>).</li>
        </ul>
      </div>

      <!-- 3. Keynote -->
      <div class="engagement-item">
        <div class="engagement-header">
          <div class="engagement-num">3</div>
          <div class="engagement-title">Inspirerende Keynote / Sprekerssessie</div>
        </div>
        <div class="engagement-text">
          Frederik Leys verzorgt op verzoek één (1) inspirerende keynote/sprekerssessie voor medewerkers of relaties van LRD. Het thema focust op de unieke kruisbestuiving tussen academische spitstechnologie (doctoraat mechanica aan KU Leuven), biomechanica, data-analyse, veerkracht en grensverleggende topsport. Datum en concrete invulling worden in onderling overleg tijdig afgestemd.
        </div>
      </div>
    </div>

    <div class="footer">
      <div>Partnerschapsovereenkomst — KU Leuven Research &amp; Development (LRD) &amp; Paraclimbing Be VZW</div>
      <div>Pagina 1 van 2</div>
    </div>
  </div>

  <!-- PAGE 2: INVOICING DETAILS & FORMAL SIGN-OFF -->
  <div class="page">
    <div>
      <div class="header">
        <div class="header-left">
          <div class="campaign-name">FRÉ LEYS — LA 2028</div>
          <div class="sub-title">Engineering my way to the Paralympics in 2028</div>
        </div>
        <div class="header-right">
          ${lrdLogo ? `<img src="${lrdLogo}" alt="KU Leuven Research & Development" />` : '<span style="font-weight: 800; font-size: 14px;">KU LEUVEN R&D</span>'}
        </div>
      </div>

      <div class="title-section" style="margin-top: 18px; margin-bottom: 16px;">
        <div class="doc-badge">Administratie &amp; Facturatie</div>
        <h2 class="doc-title">Facturatiegegevens &amp; Formele Bevestiging</h2>
        <p class="doc-subtitle">Gegevens ten behoeve van de bestelbon en de definitieve factuurafhandeling.</p>
      </div>

      <!-- Facturatiegegevens Card -->
      <div class="invoice-card">
        <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #18181b; margin-bottom: 12px;">
          Officiële Facturatiegegevens (Begunstigde)
        </div>
        <div class="invoice-grid">
          <div class="invoice-item">
            <span class="label">Organisatie / Rechtsvorm</span>
            <span class="val">Paraclimbing Be VZW</span>
          </div>
          <div class="invoice-item">
            <span class="label">Ondernemings- &amp; BTW-nummer</span>
            <span class="val">BE 0781.972.626</span>
          </div>
          <div class="invoice-item">
            <span class="label">Peppol ID (E-Invoicing)</span>
            <span class="val">0208:0781972626</span>
          </div>
          <div class="invoice-item">
            <span class="label">Adres Maatschappelijke Zetel</span>
            <span class="val">Valkerijgang 32, 3000 Leuven, België</span>
          </div>
          <div class="invoice-item">
            <span class="label">IBAN Rekeningnummer</span>
            <span class="val">BE29 7340 5844 8064</span>
          </div>
          <div class="invoice-item">
            <span class="label">BIC / Bankcode</span>
            <span class="val">KREDBEBB (KBC Bank)</span>
          </div>
          <div class="invoice-item">
            <span class="label">Contactpersoon &amp; E-mail</span>
            <span class="val">Dr. Ir. Frederik Leys — info@paraclimbing.be</span>
          </div>
          <div class="invoice-item">
            <span class="label">Standaard Betalingstermijn</span>
            <span class="val">14 dagen na factuurdatum</span>
          </div>
          <div class="invoice-item">
            <span class="label">Factuurreferentie / Prefix</span>
            <span class="val">INV-2026-004 (met vermelding bestelbon LRD)</span>
          </div>
          <div class="invoice-item">
            <span class="label">Overeengekomen Bedrag</span>
            <span class="val">&euro; 2.400,00</span>
          </div>
        </div>
      </div>

      <!-- Procedurale toelichting -->
      <div style="background: #ffffff; border: 1px solid #e4e4e7; border-radius: 6px; padding: 12px 16px; font-size: 11.5px; color: #52525b; line-height: 1.55; margin-bottom: 24px;">
        <strong style="color: #18181b;">Procedure bestelbon &amp; factuur:</strong><br>
        KU Leuven Research &amp; Development maakt op basis van dit engagementendocument en bovenstaande facturatiegegevens een officiële bestelbon op. Zodra het bestelbonnummer is bezorgd aan Paraclimbing Be VZW, wordt de definitieve factuur (met vermelding van het bestelbonnummer) opgemaakt en via Peppol / e-mail bezorgd voor betaling.
      </div>

      <!-- Signatures -->
      <div class="section-title">Ondertekening &amp; Akkoord</div>
      <p style="font-size: 11.5px; color: #71717a; margin-bottom: 12px;">
        Opgemaakt te Leuven op 2 september 2026, in twee originele exemplaren waarvan elke partij verklaart één exemplaar te hebben ontvangen.
      </p>

      <div class="signature-grid">
        <div class="sig-box">
          <div class="sig-label">Voor Paraclimbing Be VZW &amp; Atleet:</div>
          <div class="sig-name">
            <strong>Dr. Ir. Frederik Leys</strong><br>
            <span style="font-size: 10.5px; color: #71717a; font-weight: normal;">Paraklimmer &amp; Bestuurder Paraclimbing Be VZW</span>
          </div>
        </div>

        <div class="sig-box">
          <div class="sig-label">Voor KU Leuven Research &amp; Development (LRD):</div>
          <div class="sig-name">
            <strong>Dhr. Tom Wolfs</strong><br>
            <span style="font-size: 10.5px; color: #71717a; font-weight: normal;">KU Leuven Research &amp; Development</span>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <div>Partnerschapsovereenkomst — KU Leuven Research &amp; Development (LRD) &amp; Paraclimbing Be VZW</div>
      <div>Pagina 2 van 2</div>
    </div>
  </div>

</body>
</html>`;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const outPath1 = path.join(rootDir, '_sales', 'partners', 'LRD_Engagementen_Partnerschap_FRE2028.pdf');
  const outPath2 = path.join(rootDir, 'public', 'LRD_Engagementen_Partnerschap_FRE2028.pdf');

  await page.pdf({
    path: outPath1,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  fs.copyFileSync(outPath1, outPath2);
  await browser.close();

  console.log('PDF succesvol gegenereerd!');
  console.log('Opgeslagen in:', outPath1);
  console.log('Opgeslagen in:', outPath2);
}

generatePdf().catch(console.error);
