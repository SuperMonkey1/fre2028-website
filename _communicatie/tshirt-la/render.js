// Renders logo.html to print-ready PNGs: node _communicatie/tshirt-la/render.js
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 4 });
  await page.goto('file://' + path.join(__dirname, 'logo.html'), { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  for (const variant of ['panel', 'dark', 'light', 'mono-black', 'mono-white']) {
    await page.evaluate(v => { document.body.className = v; }, variant);
    const el = await page.$('#logo');
    await el.screenshot({ path: path.join(__dirname, `fre2028-la-${variant}.png`), omitBackground: true });
  }
  // glyph positions for cutfile.py (vector file for the ScanNCut)
  const layout = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll('.year span, .url, .invite .big, .invite .small').forEach(el => {
      const node = el.firstChild, cs = getComputedStyle(el);
      const probe = document.createElement('i');
      probe.style.cssText = 'display:inline-block;width:0;height:0';
      el.appendChild(probe);
      const baseline = probe.getBoundingClientRect().top;
      el.removeChild(probe);
      for (let i = 0; i < node.length; i++) {
        const r = document.createRange();
        r.setStart(node, i); r.setEnd(node, i + 1);
        items.push({ ch: node.data[i], x: r.getBoundingClientRect().left, y: baseline,
                     size: parseFloat(cs.fontSize), weight: parseInt(cs.fontWeight) });
      }
    });
    const z = document.querySelector('.zero').getBoundingClientRect();
    const sponsors = [...document.querySelectorAll('.sp')].map(el => {
      const b = el.getBoundingClientRect(), vb = el.viewBox.baseVal;
      return { name: el.dataset.name, x: b.left, y: b.top, w: b.width, h: b.height, vw: vb.width, vh: vb.height };
    });
    const inv = document.querySelector('.invite'), ib = inv.getBoundingClientRect(), ics = getComputedStyle(inv);
    const invite = { x: ib.left, y: ib.top, w: ib.width, h: ib.height,
                     border: parseFloat(ics.borderTopWidth), radius: parseFloat(ics.borderTopLeftRadius) };
    return { glyphs: items, zero: { x: z.left, y: z.top, size: z.width }, sponsors, invite };
  });
  require('fs').writeFileSync(path.join(__dirname, 'layout.json'), JSON.stringify(layout, null, 1));
  await browser.close();
})();
