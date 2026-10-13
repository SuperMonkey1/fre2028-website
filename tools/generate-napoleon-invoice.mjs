import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve('c:/Users/frede/Documents/GitHub/fre2028-website');

async function generateInvoicePdf() {
  console.log('Generating Napoleon Levensloop Invoice PDF...');

  const html = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <title>Factuur INV-2026-005 — Paraclimbing Be VZW</title>
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
      padding: 20mm 22mm;
      position: relative;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #18181b;
      padding-bottom: 18px;
      margin-bottom: 24px;
    }

    .org-title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #09090b;
      line-height: 1.1;
    }

    .org-subtitle {
      font-size: 12px;
      font-weight: 600;
      color: #71717a;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-top: 4px;
    }

    .invoice-badge {
      text-align: right;
    }

    .invoice-title {
      font-size: 26px;
      font-weight: 800;
      color: #18181b;
      letter-spacing: -0.01em;
      text-transform: uppercase;
    }

    .invoice-number {
      font-size: 13px;
      font-weight: 700;
      color: #52525b;
      margin-top: 2px;
    }

    /* Two column parties grid */
    .parties-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 28px;
    }

    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px 18px;
    }

    .card-label {
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      margin-bottom: 6px;
    }

    .card-title {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 6px;
    }

    .card-text {
      font-size: 12px;
      color: #475569;
      line-height: 1.55;
    }

    /* Meta bar */
    .meta-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 18px;
      margin-bottom: 28px;
    }

    .meta-item .meta-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #64748b;
      margin-bottom: 3px;
    }

    .meta-item .meta-value {
      font-size: 12.5px;
      font-weight: 600;
      color: #0f172a;
    }

    /* Table */
    .table-container {
      margin-bottom: 24px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    thead th {
      background: #0f172a;
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 10px 14px;
    }

    thead th:first-child {
      border-top-left-radius: 6px;
    }
    thead th:last-child {
      border-top-right-radius: 6px;
      text-align: right;
    }

    tbody td {
      padding: 14px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 12.5px;
      vertical-align: top;
      color: #1e293b;
    }

    tbody td:last-child {
      text-align: right;
      font-weight: 600;
    }

    .item-description {
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 3px;
    }

    .item-subtext {
      font-size: 11px;
      color: #64748b;
      line-height: 1.45;
    }

    /* Totals section */
    .totals-area {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 28px;
    }

    .totals-box {
      width: 280px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 18px;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #475569;
      margin-bottom: 6px;
    }

    .totals-row.grand-total {
      border-top: 2px solid #0f172a;
      padding-top: 8px;
      margin-top: 8px;
      margin-bottom: 0;
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
    }

    /* Payment card */
    .payment-box {
      background: #ffffff;
      border: 1.5px solid #0f172a;
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 24px;
    }

    .payment-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #0f172a;
      margin-bottom: 8px;
    }

    .payment-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      font-size: 12px;
      color: #334155;
    }

    .payment-grid strong {
      color: #0f172a;
    }

    /* Footer */
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #94a3b8;
    }
  </style>
</head>
<body>

  <div class="page">
    <div>
      <!-- Header -->
      <div class="header">
        <div>
          <div class="org-title">Paraclimbing Be VZW</div>
          <div class="org-subtitle">Officiële Factuur / Invoice</div>
        </div>
        <div class="invoice-badge">
          <div class="invoice-title">Factuur</div>
          <div class="invoice-number">Nr: INV-2026-005</div>
        </div>
      </div>

      <!-- Parties -->
      <div class="parties-grid">
        <!-- Dienstverlener -->
        <div class="card">
          <div class="card-label">Dienstverlener (Begunstigde)</div>
          <div class="card-title">Paraclimbing Be VZW</div>
          <div class="card-text">
            Valkerijgang 32<br>
            3000 Leuven, België<br>
            <strong>KBO / BTW:</strong> BE 0781.972.626<br>
            <strong>Peppol ID:</strong> 0208:0781972626<br>
            <strong>E-mail:</strong> info@paraclimbing.be
          </div>
        </div>

        <!-- Factuur aan -->
        <div class="card">
          <div class="card-label">Factuur aan (Opdrachtgever)</div>
          <div class="card-title">Napoleon Sports &amp; Casino / Superbet</div>
          <div class="card-text">
            Korte Keppestraat 21/51<br>
            9320 Erembodegem (Aalst), België<br>
            <strong>T.a.v.:</strong> Nigel Bottequin (Sponsorships Activation)<br>
            <strong>Referentie:</strong> Levensloop Aalst 2026 (Target Victory)
          </div>
        </div>
      </div>

      <!-- Metadata Bar -->
      <div class="meta-bar">
        <div class="meta-item">
          <div class="meta-label">Factuurnummer</div>
          <div class="meta-value">INV-2026-005</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Factuurdatum</div>
          <div class="meta-value">13/10/2026</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Vervaldatum</div>
          <div class="meta-value">27/10/2026 (14 dgn)</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Mededeling</div>
          <div class="meta-value">INV-2026-005 Levensloop</div>
        </div>
      </div>

      <!-- Invoice Table -->
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="width: 58%;">Omschrijving</th>
              <th style="width: 14%; text-align: center;">Aantal</th>
              <th style="width: 14%; text-align: right;">Eenheidsprijs</th>
              <th style="width: 14%; text-align: right;">Totaal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div class="item-description">Deelname, activatie &amp; ambassadeurschap Levensloop Aalst 2026</div>
                <div class="item-subtext">
                  Aanwezigheid, opening en aflossingsrondjes ten voordele van Stichting tegen Kanker (Target Victory x Napoleon) — Dr. Ir. Frederik Leys.<br>
                  Inclusief verplaatsing Leuven &leftrightarrow; Aalst (144 km h/t) en sportspecifieke materiaalkosten.
                </div>
              </td>
              <td style="text-align: center;">1 forfait</td>
              <td style="text-align: right;">&euro; 249,00</td>
              <td style="text-align: right;">&euro; 249,00</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Totals -->
      <div class="totals-area">
        <div class="totals-box">
          <div class="totals-row">
            <span>Subtotaal excl. BTW:</span>
            <span>&euro; 249,00</span>
          </div>
          <div class="totals-row">
            <span>BTW (0% - Vrijgesteld art. 44 W.BTW):</span>
            <span>&euro; 0,00</span>
          </div>
          <div class="totals-row grand-total">
            <span>Totaal te betalen:</span>
            <span>&euro; 249,00</span>
          </div>
        </div>
      </div>

      <!-- Payment Details Box -->
      <div class="payment-box">
        <div class="payment-title">Betalingsgegevens / Payment Instructions</div>
        <div class="payment-grid">
          <div>
            <strong>IBAN Rekeningnummer:</strong><br>
            BE29 7340 5844 8064
          </div>
          <div>
            <strong>BIC / Bankcode:</strong><br>
            KREDBEBB (KBC Bank)
          </div>
          <div>
            <strong>Rekeninghouder:</strong><br>
            Paraclimbing Be VZW
          </div>
          <div>
            <strong>Gestructureerde mededeling:</strong><br>
            INV-2026-005 Levensloop Aalst
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div>Paraclimbing Be VZW &bull; Valkerijgang 32, 3000 Leuven &bull; KBO BE 0781.972.626</div>
      <div>Vrijgesteld van BTW overeenkomstig artikel 44 van het W.BTW</div>
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

  const outDir = path.join(rootDir, '_sales', 'partners', 'napoleon');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPdf1 = path.join(outDir, 'INV-2026-005_Napoleon_Levensloop.pdf');
  const outPdf2 = path.join(rootDir, 'public', 'INV-2026-005_Napoleon_Levensloop.pdf');

  await page.pdf({
    path: outPdf1,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  fs.copyFileSync(outPdf1, outPdf2);
  await browser.close();

  console.log('Factuur PDF succesvol gegenereerd!');
  console.log('Opgeslagen in:', outPdf1);
  console.log('Opgeslagen in:', outPdf2);
}

generateInvoicePdf().catch(console.error);
