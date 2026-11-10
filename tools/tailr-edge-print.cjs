// Prepares Tailr Edge orders for printing, so the only thing left is pressing Print in Bambu Studio.
//
//   npm run print:tailr                 the oldest one or two paid orders that weren't printed yet
//   npm run print:tailr -- --order ID   these orders (order id or 4-letter code, one or two --order; also reprints)
//   npm run print:tailr -- --single     one order per plate, even if two would fit
//   npm run print:tailr -- --dry-run    only show what would be printed
//   npm run print:tailr -- --no-slice   don't slice, just open the project
//   --no-open / --no-mark               don't open Bambu Studio / don't remember the orders as printed (for testing)
//
// Per order: the left hand and its mirror (right hand) are built with the same CAD code as the website, with the
// customer's name engraved in the face that lies on the bed, near the back edge. They go into the template project "Tailr Edge/unequal crimp.3mf" (printer, filament and print
// settings stay as they are there): two orders share a plate when the four parts fit in the pinwheel layout of the
// template, otherwise one order per plate. The project is sliced with the Bambu Studio command line and opened.
// Orders that were prepared are listed in "Tailr Edge/print/printed.json", so they aren't picked up again.

require('sucrase/register/ts');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn, spawnSync } = require('child_process');
const { unzipSync, zipSync, strFromU8, strToU8 } = require('fflate');
const replicad = require('replicad');
const { computeLayout } = require('../lib/fingerprint/layout.ts');
const { buildFingerPrint, loadBase } = require('../lib/fingerprint/model.ts');
const { orderCode } = require('../lib/fingerprint/orderCode.ts');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATE = path.join(ROOT, 'Tailr Edge', 'unequal crimp.3mf');
const OUT_DIR = path.join(ROOT, 'Tailr Edge', 'print');
const PRINTED_LOG = path.join(OUT_DIR, 'printed.json');
const BASE_STEP = path.join(ROOT, 'public', 'fingerprint', 'FingerPrint.step');
const FONT = ['arialbd.ttf', 'segoeuib.ttf'].map((f) => path.join(process.env.WINDIR || 'C:\\Windows', 'Fonts', f)).find((f) => fs.existsSync(f));
const BAMBU = ['C:\\Program Files\\Bambu Studio\\bambu-studio.exe', 'C:\\Program Files (x86)\\Bambu Studio\\bambu-studio.exe'].find((f) => fs.existsSync(f));
const ORDERS_API = 'https://us-central1-fre-2028-website.cloudfunctions.net/payments/fingerprint/admin/orders';

// Bed of the template printer (A1 mini) and spacing between parts (mm)
const BED = 180;
const EDGE = 2;
const GAP = 2;
// Engraved customer name (mm): letter size (smaller for long names, down to the minimum), depth, distance of its
// top from the back edge of the plate, and room kept free on both sides
const LABEL_SIZE = 7;
const LABEL_MIN_SIZE = 4;
const CODE_DEPTH = 0.6;
const LABEL_FROM_BACK = 5;
const LABEL_SIDE_MARGIN = 6;

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const options = (name) => args.flatMap((a, i) => (a === name && args[i + 1] ? [args[i + 1]] : []));

function adminKey() {
  if (process.env.SLOPERKING_ADMIN_KEY) return process.env.SLOPERKING_ADMIN_KEY;
  const env = fs.readFileSync(path.join(ROOT, 'functions', '.env'), 'utf8');
  const m = env.match(/^SLOPERKING_ADMIN_KEY=(.*)$/m);
  if (!m) throw new Error('SLOPERKING_ADMIN_KEY not found in functions/.env');
  return m[1].trim().replace(/^"|"$/g, '');
}

const readPrinted = () => (fs.existsSync(PRINTED_LOG) ? JSON.parse(fs.readFileSync(PRINTED_LOG, 'utf8')) : {});

/* ---------- CAD ---------- */

let basePromise = null;
async function initCad() {
  if (!basePromise) {
    basePromise = (async () => {
      const wasm = require.resolve('replicad-opencascadejs/wasm');
      const { default: init } = await import('replicad-opencascadejs');
      const OC = await init({ locateFile: () => wasm });
      replicad.setOC(OC);
      if (!FONT) throw new Error('No bold font found in C:\\Windows\\Fonts for the order code');
      const font = fs.readFileSync(FONT);
      await replicad.loadFont(font.buffer.slice(font.byteOffset, font.byteOffset + font.byteLength));
      return loadBase(new Blob([fs.readFileSync(BASE_STEP)]));
    })();
  }
  return basePromise;
}

/** One printable part as a mesh centred on its bounding box (like the parts in the template project). */
async function buildPart(params, hand, label) {
  const base = await initCad();
  const layout = computeLayout(params);
  if (layout.errors.length) throw new Error(layout.errors.join(' '));
  let shape = buildFingerPrint(base, layout, hand);
  // Customer name engraved in the top face of the plate (z = 25), which lies on the bed. It's cut after the mirroring
  // of the right hand, so it reads the right way on both. Centred, its top LABEL_FROM_BACK from the back edge;
  // a long name gets smaller letters so it stays within the plate.
  let text = replicad.drawText(label, { startX: 0, startY: 0, fontSize: LABEL_SIZE });
  const maxWidth = layout.width - 2 * LABEL_SIDE_MARGIN;
  if (text.boundingBox.width > maxWidth)
    text = replicad.drawText(label, { startX: 0, startY: 0, fontSize: Math.max(LABEL_MIN_SIZE, (LABEL_SIZE * maxWidth) / text.boundingBox.width) });
  const tb = text.boundingBox;
  const top = 50 + layout.backShift - LABEL_FROM_BACK;
  const solid = text
    .translate(layout.width / 2 - tb.center[0], top - tb.bounds[1][1])
    .sketchOnPlane('XY', 25 - CODE_DEPTH)
    .extrude(CODE_DEPTH + 1)
    // mirrored left to right (around the centre of the plate, so it stays in place)
    .mirror('YZ', [layout.width / 2, 0, 0]);
  shape = shape.cut(solid);

  const m = shape.mesh({ tolerance: 0.02, angularTolerance: 0.1 });
  const v = m.vertices;
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < v.length; i += 3) for (let k = 0; k < 3; k++) {
    min[k] = Math.min(min[k], v[i + k]);
    max[k] = Math.max(max[k], v[i + k]);
  }
  const c = min.map((lo, k) => (lo + max[k]) / 2);
  const vertices = new Float64Array(v.length);
  for (let i = 0; i < v.length; i += 3) for (let k = 0; k < 3; k++) vertices[i + k] = v[i + k] - c[k];
  shape.delete();
  return { vertices, triangles: m.triangles, size: max.map((hi, k) => hi - min[k]) };
}

/* ---------- plate layout ---------- */

// 3MF transforms (row vector convention: m00 m01 m02 m10 m11 m12 m20 m21 m22 tx ty tz). Both turn the part upside
// down (top plate on the bed, as in the template); "turned" also swaps x and y (a quarter turn on the plate).
const UPRIGHT = [1, 0, 0, 0, -1, 0, 0, 0, -1];
const TURNED = [0, 1, 0, 1, 0, 0, 0, 0, -1];

const footprint = (part, turned) => (turned ? [part.size[1], part.size[0]] : [part.size[0], part.size[1]]);

const permutations = (a) => (a.length <= 1 ? [a] : a.flatMap((x, i) => permutations([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p])));

/** True when the slots ({cx, cy, fp}) stay on the bed and keep GAP between each other. */
function fits(slots) {
  const rects = slots.map((s) => [s.cx - s.fp[0] / 2, s.cy - s.fp[1] / 2, s.cx + s.fp[0] / 2, s.cy + s.fp[1] / 2]);
  if (rects.some(([x0, y0, x1, y1]) => x0 < EDGE - 0.01 || y0 < EDGE - 0.01 || x1 > BED - EDGE + 0.01 || y1 > BED - EDGE + 0.01)) return false;
  for (let i = 0; i < rects.length; i++)
    for (let j = i + 1; j < rects.length; j++) {
      const [a, b] = [rects[i], rects[j]];
      if (a[0] < b[2] + GAP && b[0] < a[2] + GAP && a[1] < b[3] + GAP && b[1] < a[3] + GAP) return false;
    }
  return true;
}

/** Places parts on the bed: [{part, turned, cx, cy}] or null when they don't fit. */
function arrange(parts) {
  if (parts.length === 2) {
    // One pair: upright, one above the other, centred
    const [a, b] = [footprint(parts[0], false), footprint(parts[1], false)];
    const total = a[1] + GAP * 2 + b[1];
    const slots = [
      { turned: false, cx: BED / 2, cy: (BED + total) / 2 - a[1] / 2, fp: a },
      { turned: false, cx: BED / 2, cy: (BED - total) / 2 + b[1] / 2, fp: b },
    ];
    return fits(slots) ? slots.map((s, i) => ({ part: parts[i], ...s })) : null;
  }
  // Two pairs: the pinwheel of the template (two parts turned a quarter, in opposite corners). Bigger hands only
  // fit in some corners, so try every order of the parts in the corners, in both directions of the pinwheel.
  for (const turnedFirst of [true, false]) {
    for (const perm of permutations([0, 1, 2, 3])) {
      // corners: top left, top right, bottom right, bottom left
      const turned = [turnedFirst, !turnedFirst, turnedFirst, !turnedFirst];
      const fp = perm.map((p, i) => footprint(parts[p], turned[i]));
      const slots = [
        { cx: EDGE + fp[0][0] / 2, cy: BED - EDGE - fp[0][1] / 2 },
        { cx: BED - EDGE - fp[1][0] / 2, cy: BED - EDGE - fp[1][1] / 2 },
        { cx: BED - EDGE - fp[2][0] / 2, cy: EDGE + fp[2][1] / 2 },
        { cx: EDGE + fp[3][0] / 2, cy: EDGE + fp[3][1] / 2 },
      ].map((s, i) => ({ ...s, fp: fp[i], turned: turned[i], index: perm[i] }));
      if (fits(slots)) {
        const byPart = [];
        for (const s of slots) byPart[s.index] = { part: parts[s.index], turned: s.turned, cx: s.cx, cy: s.cy };
        return byPart;
      }
    }
  }
  return null;
}

/* ---------- 3MF ---------- */

const NS = 'xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" xmlns:BambuStudio="http://schemas.bambulab.com/package/2021" xmlns:p="http://schemas.microsoft.com/3dmanufacturing/production/2015/06" requiredextensions="p"';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const num = (n) => (Math.abs(n) < 1e-9 ? '0' : String(Math.round(n * 1e6) / 1e6));

function meshXml(id, part) {
  const out = [`  <object id="${id}" p:UUID="${crypto.randomUUID()}" type="model">\n   <mesh>\n    <vertices>\n`];
  const v = part.vertices;
  for (let i = 0; i < v.length; i += 3) out.push(`     <vertex x="${num(v[i])}" y="${num(v[i + 1])}" z="${num(v[i + 2])}"/>\n`);
  out.push('    </vertices>\n    <triangles>\n');
  const t = part.triangles;
  for (let i = 0; i < t.length; i += 3) out.push(`     <triangle v1="${t[i]}" v2="${t[i + 1]}" v3="${t[i + 2]}"/>\n`);
  out.push('    </triangles>\n   </mesh>\n  </object>\n');
  return out.join('');
}

/** The template project with its parts replaced by `placed` ({part, turned, cx, cy, name}). */
function writeProject(placed, file) {
  const files = unzipSync(fs.readFileSync(TEMPLATE));
  for (const name of Object.keys(files)) if (name.startsWith('3D/Objects/') || name === 'Metadata/cut_information.xml') delete files[name];

  const n = placed.length;
  files['3D/Objects/object_1.model'] = strToU8(
    `<?xml version="1.0" encoding="UTF-8"?>\n<model unit="millimeter" xml:lang="en-US" ${NS}>\n <metadata name="BambuStudio:3mfVersion">1</metadata>\n <resources>\n` +
      placed.map((p, i) => meshXml(i + 1, p.part)).join('') +
      ' </resources>\n <build/>\n</model>\n',
  );
  files['3D/_rels/3dmodel.model.rels'] = strToU8(
    '<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n' +
      ' <Relationship Target="/3D/Objects/object_1.model" Id="rel-1" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>\n</Relationships>\n',
  );

  // Main model: keep the template's metadata, replace objects and build items
  let model = strFromU8(files['3D/3dmodel.model']);
  const objects = placed
    .map(
      (p, i) =>
        `  <object id="${n + i + 1}" p:UUID="${crypto.randomUUID()}" type="model">\n   <components>\n` +
        `    <component p:path="/3D/Objects/object_1.model" objectid="${i + 1}" p:UUID="${crypto.randomUUID()}" transform="1 0 0 0 1 0 0 0 1 0 0 0"/>\n` +
        '   </components>\n  </object>\n',
    )
    .join('');
  const items = placed
    .map((p, i) => {
      const m = p.turned ? TURNED : UPRIGHT;
      const t = [...m, p.cx, p.cy, p.part.size[2] / 2].map(num).join(' ');
      return `  <item objectid="${n + i + 1}" p:UUID="${crypto.randomUUID()}" transform="${t}" printable="1"/>\n`;
    })
    .join('');
  model = model
    .replace(/<resources>[\s\S]*<\/resources>/, `<resources>\n${objects} </resources>`)
    .replace(/<build([^>]*)>[\s\S]*<\/build>/, `<build$1>\n${items} </build>`);
  files['3D/3dmodel.model'] = strToU8(model);

  // Object names and plate contents
  let settings = strFromU8(files['Metadata/model_settings.config']);
  const objSettings = placed
    .map(
      (p, i) =>
        `  <object id="${n + i + 1}">\n    <metadata key="name" value="${esc(p.name)}"/>\n    <metadata key="extruder" value="1"/>\n` +
        `    <part id="1" subtype="normal_part">\n      <metadata key="name" value="${esc(p.name)}"/>\n` +
        '      <metadata key="matrix" value="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 1"/>\n    </part>\n  </object>\n',
    )
    .join('');
  const instances = placed
    .map(
      (p, i) =>
        `    <model_instance>\n      <metadata key="object_id" value="${n + i + 1}"/>\n      <metadata key="instance_id" value="0"/>\n` +
        `      <metadata key="identify_id" value="${1000 + i}"/>\n    </model_instance>\n`,
    )
    .join('');
  settings = settings
    .replace(/<config>[\s\S]*?(\s*<plate>)/, `<config>\n${objSettings}$1`)
    .replace(/(<plate>[\s\S]*?)(\s*<model_instance>[\s\S]*<\/model_instance>)(\s*<\/plate>)/, `$1\n${instances}  </plate>`)
    .replace(/\s*<assemble>[\s\S]*<\/assemble>/, '');
  files['Metadata/model_settings.config'] = strToU8(settings);

  fs.writeFileSync(file, zipSync(files, { level: 6 }));
}

/* ---------- main ---------- */

async function main() {
  if (!fs.existsSync(TEMPLATE)) throw new Error(`Template project not found: ${TEMPLATE}`);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('Loading orders…');
  const res = await fetch(ORDERS_API, { headers: { 'x-admin-key': adminKey() } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Could not load orders (${res.status})`);
  const printed = readPrinted();
  // Chosen orders (e.g. from /admin/tailr-edge), or else the oldest ones not printed yet
  const chosen = options('--order').map((x) => x.toUpperCase());
  const only = chosen.length > 0;
  const isChosen = (o) => chosen.includes(o.orderId.toUpperCase()) || chosen.includes(orderCode(o.orderId));
  let todo = data.orders
    .filter((o) => o.status === 'paid' && o.design && (only ? isChosen(o) : !printed[o.orderId]))
    .sort((a, b) => String(a.paidAt).localeCompare(String(b.paidAt)));
  if (!todo.length) {
    console.log(only ? `No paid order found for ${chosen.join(', ')}.` : 'No new paid orders to print.');
    return;
  }

  // Two orders share a plate when all four parts fit
  const batch = todo.slice(0, flag('--single') ? 1 : 2);
  console.log(`Building ${batch.map((o) => `${orderCode(o.orderId)} (${o.customerName || o.customerEmail})`).join(' + ')}…`);
  const parts = [];
  for (const o of batch) {
    const code = orderCode(o.orderId);
    for (const hand of ['left', 'right']) {
      const part = await buildPart(o.design[hand], hand, (o.customerName || o.customerEmail || code).trim());
      parts.push({ order: o, hand, part, name: `${code} ${hand} - ${o.customerName || o.customerEmail}` });
      console.log(`  ${code} ${hand}: ${part.size.map((v) => v.toFixed(1)).join(' x ')} mm`);
    }
  }
  let used = batch;
  let placement = arrange(parts.map((p) => p.part));
  if (!placement && parts.length === 4) {
    console.log('The two orders together don\'t fit on one plate: printing only the first one.');
    used = batch.slice(0, 1);
    parts.splice(2);
    placement = arrange(parts.map((p) => p.part));
  }
  if (!placement) throw new Error('This order does not fit on the plate.');
  const placed = placement.map((p, i) => ({ ...p, name: parts[i].name }));

  const label = used.map((o) => orderCode(o.orderId)).join('+');
  const stamp = new Date().toISOString().slice(0, 10);
  const project = path.join(OUT_DIR, `${stamp} Tailr Edge ${label}.3mf`);
  if (flag('--dry-run')) {
    console.log(`Dry run: would make ${path.relative(ROOT, project)} with ${placed.map((p) => p.name).join(', ')}`);
    return;
  }
  writeProject(placed, project);
  console.log(`Project: ${path.relative(ROOT, project)}`);

  let toOpen = project;
  if (!flag('--no-slice')) {
    if (!BAMBU) throw new Error('Bambu Studio not found in Program Files; use --no-slice and slice it yourself.');
    const sliced = project.replace(/\.3mf$/, '.gcode.3mf');
    console.log('Slicing with Bambu Studio…');
    const r = spawnSync(BAMBU, ['--slice', '0', '--outputdir', OUT_DIR, '--export-3mf', path.basename(sliced), project], { encoding: 'utf8' });
    if (r.status !== 0 || !fs.existsSync(sliced)) {
      console.log((r.stdout || '').split('\n').filter((l) => /error|fail|warn/i.test(l)).slice(-15).join('\n'));
      throw new Error(`Slicing failed (exit code ${r.status}). The unsliced project is at ${project}`);
    }
    toOpen = sliced;
    // The command line also leaves the plain G-code next to it; the sliced project already contains it
    fs.rmSync(path.join(OUT_DIR, 'plate_1.gcode'), { force: true });
    console.log(`Sliced: ${path.relative(ROOT, sliced)}`);
  }

  // Remember the orders, then open the project in Bambu Studio: the Print button is yours
  if (!flag('--no-mark')) {
    const log = readPrinted();
    for (const o of used) log[o.orderId] = { code: orderCode(o.orderId), customer: o.customerName || o.customerEmail, file: path.basename(toOpen), at: new Date().toISOString() };
    fs.writeFileSync(PRINTED_LOG, JSON.stringify(log, null, 2));
  }
  if (BAMBU && !flag('--no-open')) spawn(BAMBU, [toOpen], { detached: true, stdio: 'ignore' }).unref();
  const codes = used.map((o) => `${orderCode(o.orderId)} = ${o.customerName || o.customerEmail}`).join(', ');
  console.log(`${flag('--no-open') ? 'Ready' : 'Opened in Bambu Studio'}. On the plate: ${codes}`);
  const left = todo.length - used.length;
  if (left > 0) console.log(`${left} more order(s) didn't fit on this plate: print them on a next plate.`);
}

main().catch((e) => {
  console.error(`\n${e.message || e}`);
  process.exit(1);
});
