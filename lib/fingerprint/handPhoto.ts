// Measures a hand from a photo (palm up, a bank card flat on the palm), entirely in the browser.
// 1. MediaPipe finds the hand and its 21 landmarks (no hand -> stop).
// 2. A search over angles finds the rectangle with the card's proportions (85.6 x 54 mm); its four edges are fitted as lines.
// 3. The photo is flattened with the full perspective correction from the card's four corners and turned so the
//    fingers point straight up.
// 4. On that photo each finger gets an upright box: its width across the upper-joint (DIP) crease, and the crease height.
// 5. Height correction: the creases lie about 1 mm below the card, so they look slightly smaller. The camera distance
//    follows from the card's size in pixels and the lens (photo metadata when present, otherwise a normal phone camera).

import type { Finger } from './layout';

export type Pt = { x: number; y: number };

/** ISO/IEC 7810 ID-1: bank cards, loyalty cards, ID cards (mm). */
export const CARD = { long: 85.6, short: 53.98 };

/** How far the finger creases are above the card (mm): the card lies on the palm, about 1 mm above them. */
const CREASE_HEIGHT_ABOVE_CARD = -1;

/** 35 mm equivalent focal length of a normal phone main camera, used when the photo has no metadata. */
const DEFAULT_FOCAL_35 = 26;

export const MEASURED_FINGERS: Finger[] = ['index', 'middle', 'ring', 'pinky'];


/** Upright box around a finger on the flattened photo (fingers point up, -y), in px. */
export interface FingerBox {
  /** Left and right side of the finger at the crease. */
  x0: number;
  x1: number;
  /** Height of the upper-joint crease. */
  crease: number;
  /** Fingertip and finger base, only for drawing the box. */
  top: number;
  bottom: number;
}

export interface HandPhotoResult {
  /** Flattened photo as a data URL, with its size in px. */
  image: string;
  width: number;
  height: number;
  /** Card on the flattened photo (its corners), and the photo scale it gives. */
  card: { corners: Pt[]; mmPerPx: number };
  /** Camera distance = distPerRefMm × card length (mm); heightMm = how far the creases are above the card. */
  camera: { distPerRefMm: number; heightMm: number; focal35: number; fromMetadata: boolean };
  fingers: Record<Finger, FingerBox>;
  warnings: string[];
}

export interface Measurements {
  offset: { ring: number; middle: number; index: number };
  width: Record<Finger, number>;
}

export class HandPhotoError extends Error {}

export type Stage = 'loading' | 'hand' | 'card' | 'flatten' | 'fingers';

/* ---------- small vector helpers ---------- */
const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y });
const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y });
const mul = (a: Pt, k: number): Pt => ({ x: a.x * k, y: a.y * k });
const dot = (a: Pt, b: Pt) => a.x * b.x + a.y * b.y;
const len = (a: Pt) => Math.hypot(a.x, a.y);
const dist = (a: Pt, b: Pt) => len(sub(a, b));
const norm = (a: Pt): Pt => mul(a, 1 / (len(a) || 1));
const perp = (a: Pt): Pt => ({ x: -a.y, y: a.x });

/** Landmark indices (MCP, PIP, DIP, TIP) per finger. */
const LM: Record<Finger, [number, number, number, number]> = {
  index: [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring: [13, 14, 15, 16],
  pinky: [17, 18, 19, 20],
};

/** Fingers in the order they appear on the photo, left to right (index first for a right hand, palm up). */
export const fingersLeftToRight = (boxes: Record<Finger, FingerBox>) =>
  [...MEASURED_FINGERS].sort((a, b) => boxes[a].x0 + boxes[a].x1 - boxes[b].x0 - boxes[b].x1);

/** Estimated camera distance to the card (mm). */
export const cameraDistance = (r: HandPhotoResult) => r.camera.distPerRefMm * CARD.long;

/** Scale of the flattened photo at the height of the creases (mm per px), corrected for camera distance. */
export function mmPerPxAtCreases(r: HandPhotoResult) {
  const D = cameraDistance(r);
  return D > 0 ? (r.card.mmPerPx * (D - r.camera.heightMm)) / D : r.card.mmPerPx;
}

/** Turns the (edited) finger boxes into the designer values (mm). */
export function measure(r: HandPhotoResult): Measurements {
  const mmPerPx = mmPerPxAtCreases(r);
  const round1 = (n: number) => Math.round(n * 10) / 10;
  // Fingers point up, so a crease higher than the pinky's has a smaller y
  const off = (f: Finger) => round1((r.fingers.pinky.crease - r.fingers[f].crease) * mmPerPx);
  const w = (f: Finger) => round1(Math.abs(r.fingers[f].x1 - r.fingers[f].x0) * mmPerPx);
  return {
    offset: { ring: off('ring'), middle: off('middle'), index: off('index') },
    width: { index: w('index'), middle: w('middle'), ring: w('ring'), pinky: w('pinky') },
  };
}

/* ---------- MediaPipe ---------- */
const MP_VERSION = '0.10.14';
const MP_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}`;
// Loaded from the CDN at runtime, past the bundler (like the CAD engine): a lazily compiled chunk makes the dev
// server rebuild and reload the page in the middle of an analysis
const runtimeImport = new Function('url', 'return import(url)') as (url: string) => Promise<any>;
let landmarkerPromise: Promise<any> | null = null;
function getLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const { FilesetResolver, HandLandmarker } = await runtimeImport(`${MP_BASE}/vision_bundle.mjs`);
      const fileset = await FilesetResolver.forVisionTasks(`${MP_BASE}/wasm`);
      return HandLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'CPU',
        },
        runningMode: 'IMAGE',
        numHands: 1,
        minHandDetectionConfidence: 0.3,
      });
    })().catch((e) => {
      landmarkerPromise = null;
      throw e;
    });
  }
  return landmarkerPromise;
}

/* ---------- image helpers ---------- */
const MAX_SIDE = 2000;

async function loadImage(file: File): Promise<HTMLCanvasElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new HandPhotoError('This file could not be opened as an image. Use a JPG or PNG photo.'));
      el.src = url;
    });
    const k = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * k);
    c.height = Math.round(img.naturalHeight * k);
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
    return c;
  } finally {
    URL.revokeObjectURL(url);
  }
}

class Img {
  w: number;
  h: number;
  d: Uint8ClampedArray;
  gray: Float32Array;
  constructor(data: ImageData) {
    this.w = data.width;
    this.h = data.height;
    this.d = data.data;
    this.gray = new Float32Array(this.w * this.h);
    for (let i = 0, j = 0; i < this.gray.length; i++, j += 4) this.gray[i] = 0.299 * this.d[j] + 0.587 * this.d[j + 1] + 0.114 * this.d[j + 2];
  }
  inside(p: Pt) {
    return p.x >= 0 && p.y >= 0 && p.x < this.w - 1 && p.y < this.h - 1;
  }
  /** Bilinear grey value. */
  g(x: number, y: number) {
    x = Math.min(Math.max(x, 0), this.w - 1.001);
    y = Math.min(Math.max(y, 0), this.h - 1.001);
    const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
    const i = y0 * this.w + x0;
    const G = this.gray;
    return G[i] * (1 - fx) * (1 - fy) + G[i + 1] * fx * (1 - fy) + G[i + this.w] * (1 - fx) * fy + G[i + this.w + 1] * fx * fy;
  }
  rgb(x: number, y: number): [number, number, number] {
    const i = (Math.min(Math.max(Math.round(y), 0), this.h - 1) * this.w + Math.min(Math.max(Math.round(x), 0), this.w - 1)) * 4;
    return [this.d[i], this.d[i + 1], this.d[i + 2]];
  }
}

const chroma = ([r, g, b]: [number, number, number]) => ({
  cb: 128 - 0.168736 * r - 0.331264 * g + 0.5 * b,
  cr: 128 + 0.5 * r - 0.418688 * g - 0.081312 * b,
  y: 0.299 * r + 0.587 * g + 0.114 * b,
});

const median = (a: number[]) => {
  const s = [...a].sort((x, y) => x - y);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
};

/* ---------- photo metadata ---------- */

/** 35 mm equivalent focal length from the JPEG's Exif data, or null (WhatsApp and screenshots have none). */
async function readFocal35(file: File): Promise<number | null> {
  try {
    const buf = new DataView(await file.slice(0, 256 * 1024).arrayBuffer());
    if (buf.getUint16(0) !== 0xffd8) return null;
    let o = 2;
    while (o + 4 < buf.byteLength) {
      const marker = buf.getUint16(o);
      const size = buf.getUint16(o + 2);
      if (marker === 0xffe1 && buf.getUint32(o + 4) === 0x45786966) {
        const t = o + 10; // TIFF header
        const le = buf.getUint16(t) === 0x4949;
        const u16 = (p: number) => buf.getUint16(p, le);
        const u32 = (p: number) => buf.getUint32(p, le);
        const tag = (ifd: number, id: number) => {
          const n = u16(t + ifd);
          for (let i = 0; i < n; i++) {
            const e = t + ifd + 2 + i * 12;
            if (u16(e) === id) return e;
          }
          return -1;
        };
        const exifPtr = tag(u32(t + 4), 0x8769);
        if (exifPtr < 0) return null;
        const f35 = tag(u32(exifPtr + 8), 0xa405); // FocalLengthIn35mmFilm (SHORT)
        return f35 < 0 ? null : u16(f35 + 8) || null;
      }
      if ((marker & 0xff00) !== 0xff00) return null;
      o += 2 + size;
    }
  } catch {}
  return null;
}

/* ---------- card ---------- */

/** Fits a line through points (total least squares): a point on it and its direction. */
function fitLine(pts: Pt[]) {
  const m = mul(pts.reduce((s, p) => add(s, p), { x: 0, y: 0 }), 1 / pts.length);
  let sxx = 0, sxy = 0, syy = 0;
  for (const p of pts) {
    const d = sub(p, m);
    sxx += d.x * d.x; sxy += d.x * d.y; syy += d.y * d.y;
  }
  const a = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  return { p: m, d: { x: Math.cos(a), y: Math.sin(a) } };
}

function intersect(l1: { p: Pt; d: Pt }, l2: { p: Pt; d: Pt }): Pt {
  const den = l1.d.x * l2.d.y - l1.d.y * l2.d.x;
  const t = ((l2.p.x - l1.p.x) * l2.d.y - (l2.p.y - l1.p.y) * l2.d.x) / (den || 1e-9);
  return add(l1.p, mul(l1.d, t));
}

/**
 * Finds a card (85.6 × 54 mm) around the palm and returns its four corners on the photo, in order around it.
 * For each angle, edge pixels whose gradient points along one of the two card axes are projected onto that axis;
 * card sides show up as peaks. Peak pairs with the card's proportions are checked along all four sides, then each
 * side is refined to a fitted line and the corners are where those lines cross.
 */
function findCard(im: Img, P: Pt[]): Pt[] | null {
  // With the palm covered, MediaPipe's wrist and palm points are unreliable; the fingers are not. The last two finger
  // segments (middle joint to tip) average about 45 mm, which gives the expected card size; the card sits on the palm,
  // just below the knuckles.
  const fingerLen = (['index', 'middle', 'ring'] as Finger[]).reduce((s, f) => s + dist(P[LM[f][1]], P[LM[f][3]]), 0) / 3;
  const L = (fingerLen * CARD.long) / 45;
  const knuckles = mul([5, 9, 13, 17].reduce((s, i) => add(s, P[i]), { x: 0, y: 0 }), 1 / 4);
  const up = norm((['index', 'middle', 'ring', 'pinky'] as Finger[]).reduce((s, f) => add(s, sub(P[LM[f][3]], P[LM[f][1]])), { x: 0, y: 0 }));
  const C = sub(knuckles, mul(up, 0.5 * L));
  const R = Math.round(1.1 * L);
  const x0 = Math.max(1, Math.round(C.x - R)), x1 = Math.min(im.w - 2, Math.round(C.x + R));
  const y0 = Math.max(1, Math.round(C.y - R)), y1 = Math.min(im.h - 2, Math.round(C.y + R));
  const G = im.gray, W = im.w;
  const ex: number[] = [], ey: number[] = [], enx: number[] = [], eny: number[] = [], em: number[] = [];
  const mags: number[] = [];
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const i = y * W + x;
      const gx = G[i - W + 1] + 2 * G[i + 1] + G[i + W + 1] - G[i - W - 1] - 2 * G[i - 1] - G[i + W - 1];
      const gy = G[i + W - 1] + 2 * G[i + W] + G[i + W + 1] - G[i - W - 1] - 2 * G[i - W] - G[i - W + 1];
      const m = Math.hypot(gx, gy);
      if ((x + y) % 5 === 0) mags.push(m);
      if (m > 30) { ex.push(x - C.x); ey.push(y - C.y); enx.push(gx / m); eny.push(gy / m); em.push(m); }
    }
  mags.sort((a, b) => a - b);
  const thr = Math.max(30, mags[Math.floor(mags.length * 0.85)] || 0);

  // Is there an edge across this side point (gradient along n) within ±2 px?
  const edgeAcross = (p: Pt, n: Pt) => {
    for (let o = -2; o <= 2; o += 0.5) {
      const q = add(p, mul(n, o));
      if (!im.inside(add(q, n)) || !im.inside(sub(q, n))) continue;
      if (Math.abs(im.g(q.x + n.x, q.y + n.y) - im.g(q.x - n.x, q.y - n.y)) > 14) return true;
    }
    return false;
  };
  // Fraction of the middle 70 % of a side (from a to b, normal n) that has an edge across it
  const sideSupport = (a: Pt, b: Pt, n: Pt) => {
    let hit = 0;
    const N = 30;
    for (let i = 0; i < N; i++) {
      const t = 0.15 + (0.7 * i) / (N - 1);
      if (edgeAcross(add(a, mul(sub(b, a), t)), n)) hit++;
    }
    return hit / N;
  };

  const ratio = CARD.long / CARD.short;
  const minLong = 0.6 * L, maxLong = 1.5 * L;
  const size = 2 * R + 3;
  let best: { score: number; u: Pt; v: Pt; a: number; b: number; c: number; d: number } | null = null;
  for (let deg = 0; deg < 180; deg += 1) {
    const th = (deg * Math.PI) / 180;
    const u = { x: Math.cos(th), y: Math.sin(th) }, v = { x: -u.y, y: u.x };
    const Hu = new Float32Array(size), Hv = new Float32Array(size);
    for (let k = 0; k < em.length; k++) {
      if (em[k] < thr) continue;
      if (Math.abs(enx[k] * u.x + eny[k] * u.y) > 0.95) Hu[Math.round(ex[k] * u.x + ey[k] * u.y) + R + 1] += em[k];
      else if (Math.abs(enx[k] * v.x + eny[k] * v.y) > 0.95) Hv[Math.round(ex[k] * v.x + ey[k] * v.y) + R + 1] += em[k];
    }
    const peaks = (H: Float32Array) => {
      const sm = H.map((_, i) => (H[i - 1] || 0) + H[i] + (H[i + 1] || 0));
      const pk: { i: number; v: number }[] = [];
      for (let i = 2; i < size - 2; i++)
        if (sm[i] > 0 && sm[i] >= sm[i - 1] && sm[i] > sm[i + 1] && sm[i] >= sm[i - 2] && sm[i] > sm[i + 2]) pk.push({ i, v: sm[i] });
      return pk.sort((a, b) => b.v - a.v).slice(0, 8).map((p) => p.i - R - 1);
    };
    const pu = peaks(Hu), pv = peaks(Hv);
    for (let i = 0; i < pu.length; i++)
      for (let j = i + 1; j < pu.length; j++)
        for (let k = 0; k < pv.length; k++)
          for (let l = k + 1; l < pv.length; l++) {
            const a = Math.min(pu[i], pu[j]), b = Math.max(pu[i], pu[j]), c = Math.min(pv[k], pv[l]), d = Math.max(pv[k], pv[l]);
            const du = b - a, dv = d - c;
            const lng = Math.max(du, dv), sht = Math.min(du, dv);
            if (lng < minLong || lng > maxLong || Math.abs(lng / sht / ratio - 1) > 0.08) continue;
            const corner = (s: number, t: number) => add(C, add(mul(u, s), mul(v, t)));
            const sup = [
              sideSupport(corner(a, c), corner(a, d), u),
              sideSupport(corner(b, c), corner(b, d), u),
              sideSupport(corner(a, c), corner(b, c), v),
              sideSupport(corner(a, d), corner(b, d), v),
            ];
            if (Math.min(...sup) < 0.5) continue;
            const score = sup.reduce((x, y) => x + y, 0);
            if (!best || score > best.score) best = { score, u, v, a, b, c, d };
          }
  }
  if (!best) return null;

  // Refine each side: strongest edge across it at many points, then a fitted line
  const { u, v, a, b, c, d } = best;
  const at = (s: number, t: number) => add(C, add(mul(u, s), mul(v, t)));
  const sides = [
    { p0: at(a, c), p1: at(a, d), n: u },
    { p0: at(a, d), p1: at(b, d), n: v },
    { p0: at(b, d), p1: at(b, c), n: u },
    { p0: at(b, c), p1: at(a, c), n: v },
  ];
  const lines = sides.map(({ p0, p1, n }) => {
    const pts: Pt[] = [];
    for (let i = 0; i < 40; i++) {
      const base = add(p0, mul(sub(p1, p0), 0.12 + (0.76 * i) / 39));
      let bestO = 0, bestD = 0;
      for (let o = -4; o <= 4; o += 0.25) {
        const q = add(base, mul(n, o));
        const dd = Math.abs(im.g(q.x + n.x, q.y + n.y) - im.g(q.x - n.x, q.y - n.y));
        if (dd > bestD) { bestD = dd; bestO = o; }
      }
      if (bestD > 10) pts.push(add(base, mul(n, bestO)));
    }
    let line = fitLine(pts.length >= 8 ? pts : [p0, p1]);
    const res = pts.map((q) => Math.abs(dot(sub(q, line.p), perp(line.d))));
    const kept = pts.filter((_, i) => res[i] < 1.5);
    if (kept.length >= 8) line = fitLine(kept);
    return line;
  });
  return [0, 1, 2, 3].map((i) => intersect(lines[(i + 3) % 4], lines[i]));
}

/** Homography (3×3, row-major) mapping the four points `from` onto `to`. */
function homography(from: Pt[], to: Pt[]): number[] {
  const A: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const { x, y } = from[i], { x: X, y: Y } = to[i];
    A.push([x, y, 1, 0, 0, 0, -X * x, -X * y, X]);
    A.push([0, 0, 0, x, y, 1, -Y * x, -Y * y, Y]);
  }
  for (let i = 0; i < 8; i++) {
    let piv = i;
    for (let r = i + 1; r < 8; r++) if (Math.abs(A[r][i]) > Math.abs(A[piv][i])) piv = r;
    [A[i], A[piv]] = [A[piv], A[i]];
    for (let r = 0; r < 8; r++) {
      if (r === i) continue;
      const f = A[r][i] / A[i][i];
      for (let col = i; col < 9; col++) A[r][col] -= f * A[i][col];
    }
  }
  return [...A.map((r, i) => r[8] / r[i]), 1];
}

const applyH = (H: number[], p: Pt): Pt => {
  const w = H[6] * p.x + H[7] * p.y + H[8];
  return { x: (H[0] * p.x + H[1] * p.y + H[2]) / w, y: (H[3] * p.x + H[4] * p.y + H[5]) / w };
};

function invert3(m: number[]): number[] {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C;
  return [A, -(b * i - c * h), b * f - c * e, B, a * i - c * g, -(a * f - c * d), C, -(a * h - b * g), a * e - b * d].map((v) => v / det);
}

/** Draws the photo through a projective transform: `outToSrc` maps an output pixel back to the source photo. */
function warp(src: Img, outW: number, outH: number, outToSrc: (q: Pt) => Pt): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = outW;
  cv.height = outH;
  const ctx = cv.getContext('2d')!;
  const out = ctx.createImageData(outW, outH);
  const D = src.d, W = src.w, Hh = src.h;
  for (let y = 0; y < outH; y++)
    for (let x = 0; x < outW; x++) {
      const p = outToSrc({ x: x + 0.5, y: y + 0.5 });
      const o = (y * outW + x) * 4;
      const sx = p.x - 0.5, sy = p.y - 0.5;
      out.data[o + 3] = 255;
      if (sx < 0 || sy < 0 || sx >= W - 1 || sy >= Hh - 1) {
        out.data[o] = out.data[o + 1] = out.data[o + 2] = 255;
        continue;
      }
      const x0 = Math.floor(sx), y0 = Math.floor(sy), fx = sx - x0, fy = sy - y0;
      const i = (y0 * W + x0) * 4;
      for (let ch = 0; ch < 3; ch++)
        out.data[o + ch] =
          D[i + ch] * (1 - fx) * (1 - fy) + D[i + 4 + ch] * fx * (1 - fy) + D[i + W * 4 + ch] * (1 - fx) * fy + D[i + W * 4 + 4 + ch] * fx * fy;
    }
  ctx.putImageData(out, 0, 0);
  return cv;
}

/* ---------- fingers ---------- */

/**
 * P are the landmarks on the flattened, upright photo. The card covers the palm, so skin colour comes from the middle
 * finger segments and the background from around the fingers.
 */
function measureFingers(im: Img, P: Pt[], pxPerMm: number, warnings: string[]): Record<Finger, FingerBox> {
  // Skin colour model from the middle segment of each finger (between the two joints)
  const skin: { cb: number; cr: number; y: number }[] = [];
  for (const f of MEASURED_FINGERS)
    for (let t = 0.3; t <= 0.7; t += 0.1) {
      const p = add(P[LM[f][1]], mul(sub(P[LM[f][2]], P[LM[f][1]]), t));
      skin.push(chroma(im.rgb(p.x, p.y)));
    }
  const mcb = skin.reduce((s, v) => s + v.cb, 0) / skin.length, mcr = skin.reduce((s, v) => s + v.cr, 0) / skin.length;
  // Background colour model: past the fingertips and beside the outer fingers
  const bgS: { cb: number; cr: number; y: number }[] = [];
  for (const f of MEASURED_FINGERS) {
    const [, , d, tip] = LM[f];
    for (const k of [0.8, 1.2, 1.6]) {
      const p = add(P[tip], mul(sub(P[tip], P[d]), k));
      if (im.inside(p)) bgS.push(chroma(im.rgb(p.x, p.y)));
    }
  }
  const spacing = Math.abs(P[LM.index[2]].x - P[LM.middle[2]].x);
  const outerSide = Math.sign(P[LM.index[2]].x - P[LM.pinky[2]].x);
  for (const [f, side] of [['index', outerSide], ['pinky', -outerSide]] as [Finger, number][])
    for (const k of [1.6, 2.2])
      for (const j of [1, 2]) {
        const p = add(P[LM[f][j]], { x: side * k * spacing, y: 0 });
        if (im.inside(p)) bgS.push(chroma(im.rgb(p.x, p.y)));
      }
  const bcb = bgS.reduce((s, v) => s + v.cb, 0) / bgS.length, bcr = bgS.reduce((s, v) => s + v.cr, 0) / bgS.length;
  const bgLum = median(bgS.map((v) => v.y));

  const dip = (f: Finger) => P[LM[f][2]];
  const out = {} as Record<Finger, FingerBox>;
  // The photo is upright: along the finger is straight up, across is horizontal
  const u = { x: 0, y: -1 };
  const v = { x: 1, y: 0 };

  MEASURED_FINGERS.forEach((f, idx) => {
    const neighbours = [MEASURED_FINGERS[idx - 1], MEASURED_FINGERS[idx + 1]].filter(Boolean) as Finger[];
    const spacing = Math.min(...neighbours.map((n) => Math.abs(dot(sub(dip(n), dip(f)), v))));
    const halfW = 0.5 * spacing;
    // Middle segment length; MediaPipe sometimes bunches the joints together (the pinky especially), so never less
    // than 18 mm, which keeps the crease search wide enough
    const seg = Math.max(dist(P[LM[f][1]], P[LM[f][2]]), 18 * pxPerMm);

    // Crease: the darkest line across the finger near the DIP landmark. MediaPipe puts that landmark on the joint
    // centre, which lies a little below the crease seen on the palm side, so the search leans towards the fingertip.
    // A median across the finger keeps calluses and skin flakes from shifting it.
    const step = 0.5;
    const ts: number[] = [], prof: number[] = [];
    for (let t = -0.55 * seg; t <= 0.75 * seg; t += step) {
      const row: number[] = [];
      for (let w = -0.45 * halfW; w <= 0.45 * halfW; w += 1) {
        const p = add(dip(f), add(mul(u, t), mul(v, w)));
        row.push(im.g(p.x, p.y));
      }
      ts.push(t); prof.push(median(row));
    }
    const win = Math.max(2, Math.round((0.15 * seg) / step));
    const half = Math.max(1, Math.round(win / 2));
    const expected = 0.2 * seg;
    let bestT = expected, bestScore = Infinity, contrast = 0;
    for (let i = 0; i < prof.length; i++) {
      if (ts[i] < -0.4 * seg || ts[i] > 0.6 * seg) continue;
      // Only the darkest point of its neighbourhood counts: points on a slope (towards the brighter fingertip) are
      // darker than the average around them without being a crease
      let isMin = true;
      for (let j = Math.max(0, i - half); j <= Math.min(prof.length - 1, i + half); j++) if (prof[j] < prof[i]) { isMin = false; break; }
      if (!isMin) continue;
      let s = 0, n = 0;
      for (let j = Math.max(0, i - win); j <= Math.min(prof.length - 1, i + win); j++) { s += prof[j]; n++; }
      const d = prof[i] - s / n;
      const score = d + 4 * ((ts[i] - expected) / seg) ** 2;
      if (score < bestScore) { bestScore = score; bestT = ts[i]; contrast = -d; }
    }
    if (contrast < 1.5) bestT = expected;
    const c = add(dip(f), mul(u, bestT));

    // Width: walk out from the crease centre to the background or the dark gap to the next finger.
    // Colours are averaged over a band along the finger so the dark crease line itself does not stop the walk.
    const band = (p: Pt) => {
      const s = [0, 0, 0];
      for (let i = -3; i <= 3; i++) {
        const px = im.rgb(p.x + u.x * i * 0.05 * seg, p.y + u.y * i * 0.05 * seg);
        s[0] += px[0]; s[1] += px[1]; s[2] += px[2];
      }
      return s.map((x) => x / 7) as [number, number, number];
    };
    // Skin or background, by colour only: the shaded sides of a finger are darker but keep most of their colour.
    // Position on the background -> skin colour scale; the shaded edges drift towards the background, so the cut is at 35 %.
    const sd = { cb: mcb - bcb, cr: mcr - bcr };
    const sd2 = sd.cb * sd.cb + sd.cr * sd.cr || 1;
    const bandSkin = (rgb: [number, number, number]) => {
      const ch = chroma(rgb);
      return ((ch.cb - bcb) * sd.cb + (ch.cr - bcr) * sd.cr) / sd2 > 0.35;
    };
    const centreLum = median(Array.from({ length: 9 }, (_, i) => chroma(band(add(c, mul(v, ((i - 4) / 4) * 0.3 * halfW)))).y));
    /** Distance from `from` to the finger edge on one side (-1 left, 1 right). */
    const edgeAt = (sideSign: number, from: Pt = c) => {
      const nb = neighbours.find((n) => Math.sign(dip(n).x - c.x) === sideSign);
      // half the horizontal distance to the neighbouring finger
      const half = nb ? Math.abs(dip(nb).x - from.x) / 2 : halfW;
      const hasNb = !!nb && half > 0;
      const maxD = hasNb ? 1.25 * half : 1.6 * halfW;
      let minLum = Infinity, minD = hasNb ? half : halfW, misses = 0;
      for (let d = 0.3 * halfW; d <= maxD; d += 0.5) {
        const p = add(from, mul(v, sideSign * d));
        if (!im.inside(p)) return d;
        const rgb = band(p);
        const lum = chroma(rgb).y;
        // 3 px of background in a row mark the edge, so a callus or a skin flake does not
        if (!bandSkin(rgb) || lum < 0.5 * centreLum) {
          if (++misses >= 6) return d - 2.5;
        } else misses = 0;
        if (hasNb && d >= 0.75 * half && lum < minLum) { minLum = lum; minD = d; }
      }
      return minD;
    };
    /**
     * Outer side: the side of a finger turned away from the light is so dark it loses its skin colour.
     * Carry on past the colour edge through that dark band, up to where the bright background starts.
     */
    const outerEdgeAt = (sideSign: number, from: Pt) => {
      let e = edgeAt(sideSign, from);
      for (let dd = e; dd <= e + 0.25 * halfW; dd += 0.5) {
        const p = add(from, mul(v, sideSign * dd));
        if (!im.inside(p) || chroma(band(p)).y > 0.6 * bgLum) break;
        e = dd;
      }
      return e;
    };
    const [mcp, pip, d, tip] = LM[f];
    const hasNb = (sideSign: number) => neighbours.some((n) => Math.sign(dip(n).x - c.x) === sideSign);
    // Each side at the finger's widest point between the middle of the last segment and the middle joint, not just
    // at the crease (so neighbouring boxes may overlap a little). Outer sides also take in the dark shaded edge.
    const widest = (sideSign: number) => {
      const edge = hasNb(sideSign) ? edgeAt : outerEdgeAt;
      // Outward position per row; a high percentile instead of the single widest row, so one stray row can't win
      const xs = [sideSign * (c.x + sideSign * edge(sideSign, c))];
      const yFrom = P[d].y + 0.5 * (P[tip].y - P[d].y), yTo = P[pip].y;
      for (let y = yFrom; y <= yTo; y += 2) {
        // point on the finger axis at this height (tip-DIP-PIP polyline)
        const [a, b] = y < P[d].y ? [P[tip], P[d]] : [P[d], P[pip]];
        const t = (y - a.y) / (b.y - a.y || 1);
        const from = { x: a.x + t * (b.x - a.x), y };
        xs.push(sideSign * (from.x + sideSign * edge(sideSign, from)));
      }
      xs.sort((p, q) => p - q);
      return sideSign * xs[Math.floor(0.85 * (xs.length - 1))];
    };
    out[f] = {
      x0: widest(-1),
      x1: widest(1),
      crease: c.y,
      // the tip landmark sits just inside the fingertip
      top: P[tip].y - 0.3 * dist(P[tip], P[d]),
      bottom: P[mcp].y,
    };

    const straight = dist(P[LM[f][0]], P[LM[f][3]]) /
      (dist(P[LM[f][0]], P[LM[f][1]]) + dist(P[LM[f][1]], P[LM[f][2]]) + dist(P[LM[f][2]], P[LM[f][3]]));
    if (straight < 0.9) warnings.push(`Your ${f} finger looks bent. Keep all fingers straight and flat for the best result.`);
  });
  return out;
}

/**
 * MediaPipe shrinks the photo to about 192 px before looking for a palm, so a small hand (or one whose palm is
 * covered by a card) can be missed. Try the whole photo first, then zoomed-in squares, each also turned a quarter
 * turn both ways (it finds upright hands best). Returns the 21 landmarks in photo px.
 */
function detectHand(landmarker: any, src: HTMLCanvasElement): Pt[] | null {
  const side = Math.min(src.width, src.height);
  const crops: { x: number; y: number; s: number }[] = [];
  for (const s of [side, side * 0.6]) {
    for (let y = 0; y <= src.height - s + 1; y += s / 2)
      for (let x = 0; x <= src.width - s + 1; x += s / 2) crops.push({ x, y, s });
  }
  const tries: { crop: { x: number; y: number; s: number } | null; turn: number }[] = [{ crop: null, turn: 0 }];
  for (const crop of crops) for (const turn of [0, 1, 3]) tries.push({ crop, turn });
  for (const { crop, turn } of tries) {
    const { x, y, s } = crop || { x: 0, y: 0, s: 0 };
    const w = crop ? s : src.width, h = crop ? s : src.height;
    const cv = document.createElement('canvas');
    const size = crop ? Math.min(s, 640) : 0;
    cv.width = crop ? size : w;
    cv.height = crop ? size : h;
    const k = crop ? size / s : 1;
    const ctx = cv.getContext('2d')!;
    // turn quarter turns clockwise around the centre of the (square) crop
    ctx.translate(cv.width / 2, cv.height / 2);
    ctx.rotate((turn * Math.PI) / 2);
    ctx.translate(-cv.width / 2, -cv.height / 2);
    ctx.drawImage(src, x, y, w, h, 0, 0, cv.width, cv.height);
    const det = landmarker.detect(cv);
    if (!det.landmarks?.length) continue;
    return det.landmarks[0].map((p: { x: number; y: number }) => {
      // undo the turn (in the drawn canvas), then the crop and scale
      let px = p.x * cv.width - cv.width / 2, py = p.y * cv.height - cv.height / 2;
      for (let i = 0; i < turn; i++) [px, py] = [py, -px];
      return { x: x + (px + cv.width / 2) / k, y: y + (py + cv.height / 2) / k };
    });
  }
  return null;
}

/* ---------- main ---------- */

export async function analyzeHandPhoto(file: File, onStage: (s: Stage) => void = () => {}): Promise<HandPhotoResult> {
  const tick = () => new Promise((r) => setTimeout(r, 20));
  const warnings: string[] = [];
  onStage('loading');
  const [src, focalFromMeta] = await Promise.all([loadImage(file), readFocal35(file)]);
  let landmarker: any;
  try {
    landmarker = await getLandmarker();
  } catch (e) {
    console.error(e);
    throw new HandPhotoError('The hand detection model could not be loaded. Check your connection and try again.');
  }

  onStage('hand');
  await tick();
  const lm = detectHand(landmarker, src);
  if (!lm) throw new HandPhotoError('No hand found in this photo. Lay your hand flat, palm up, with the whole hand in view.');
  const edgeMargin = 0.01 * Math.max(src.width, src.height);
  if (lm.slice(5).some((p) => p.x < edgeMargin || p.y < edgeMargin || p.x > src.width - edgeMargin || p.y > src.height - edgeMargin))
    throw new HandPhotoError('Part of your fingers is outside the photo. Take the photo again with the whole hand in view.');

  // Lens: focal length in px of this photo (35 mm equivalent is defined on the 43.3 mm full-frame diagonal)
  const focal35 = focalFromMeta || DEFAULT_FOCAL_35;
  const focalPx = (focal35 / 43.27) * Math.hypot(src.width, src.height);

  onStage('card');
  await tick();
  const full = new Img(src.getContext('2d')!.getImageData(0, 0, src.width, src.height));
  const fromMetadata = !!focalFromMeta;
  const found = findCard(full, lm);
  if (!found)
    throw new HandPhotoError('No card found. Lay a bank card (or any card of that size) flat on your palm, fully in view, and take the photo again.');
  // The flattened card rectangle runs clockwise (on screen); corners running the other way would mirror the photo
  const turn = found.reduce((s, p, i) => s + p.x * found[(i + 1) % 4].y - found[(i + 1) % 4].x * p.y, 0);
  const corners = turn > 0 ? found : [found[0], found[3], found[2], found[1]];
  const sideLen = [0, 1, 2, 3].map((i) => dist(corners[i], corners[(i + 1) % 4]));
  const longPx = sideLen[0] >= sideLen[1] ? (sideLen[0] + sideLen[2]) / 2 : (sideLen[1] + sideLen[3]) / 2;
  const shortPx = sideLen[0] >= sideLen[1] ? (sideLen[1] + sideLen[3]) / 2 : (sideLen[0] + sideLen[2]) / 2;
  if (Math.abs(longPx / shortPx / (CARD.long / CARD.short) - 1) > 0.15)
    warnings.push('The card outline looks skewed. Hold your phone straight above the hand for more accurate values.');

  onStage('flatten');
  await tick();
  // Perspective correction from the four corners: photo px -> mm on the card plane
  const [Lw, Sw] = sideLen[0] >= sideLen[1] ? [CARD.long, CARD.short] : [CARD.short, CARD.long];
  const H = homography(corners, [{ x: 0, y: 0 }, { x: Lw, y: 0 }, { x: Lw, y: Sw }, { x: 0, y: Sw }]);
  // ... turned so the fingers point straight up
  const m = lm.map((p) => applyH(H, p));
  const axis = MEASURED_FINGERS.reduce((s, f) => add(s, sub(m[LM[f][3]], m[LM[f][1]])), { x: 0, y: 0 });
  const rot = -Math.PI / 2 - Math.atan2(axis.y, axis.x);
  const rc = Math.cos(rot), rs = Math.sin(rot);
  const R = (p: Pt): Pt => ({ x: rc * p.x - rs * p.y, y: rs * p.x + rc * p.y });
  const Rinv = (p: Pt): Pt => ({ x: rc * p.x + rs * p.y, y: -rs * p.x + rc * p.y });
  // Output scale: keep about the resolution the card had on the photo
  let s = longPx / CARD.long;
  const bounds = [{ x: 0, y: 0 }, { x: src.width, y: 0 }, { x: 0, y: src.height }, { x: src.width, y: src.height }].map((p) => R(applyH(H, p)));
  const minX = Math.min(...bounds.map((p) => p.x)), minY = Math.min(...bounds.map((p) => p.y));
  const bw = Math.max(...bounds.map((p) => p.x)) - minX, bh = Math.max(...bounds.map((p) => p.y)) - minY;
  s = Math.min(s, (MAX_SIDE * 1.1) / Math.max(bw, bh));
  const T = (p: Pt): Pt => {
    const q = R(applyH(H, p));
    return { x: (q.x - minX) * s, y: (q.y - minY) * s };
  };
  const Hinv = invert3(H);
  const flat = warp(full, Math.round(bw * s), Math.round(bh * s), (q) => applyH(Hinv, Rinv({ x: q.x / s + minX, y: q.y / s + minY })));

  onStage('fingers');
  await tick();
  const fim = new Img(flat.getContext('2d')!.getImageData(0, 0, flat.width, flat.height));
  const card = corners.map(T);
  const fingers = measureFingers(fim, lm.map(T), s, warnings);
  const { image, width, height, shift, boxes } = cropAndTidy(flat, fingers, card);
  return {
    image,
    width,
    height,
    card: { corners: card.map((p) => sub(p, shift)), mmPerPx: 1 / s },
    camera: { distPerRefMm: focalPx / longPx, heightMm: CREASE_HEIGHT_ABOVE_CARD, focal35, fromMetadata },
    fingers: boxes,
    warnings,
  };
}

/** Crops the flattened photo to the fingers and the card, and moves the boxes along. */
function cropAndTidy(flat: HTMLCanvasElement, fingers: Record<Finger, FingerBox>, extent: Pt[]) {
  const xs = extent.map((p) => p.x), ys = extent.map((p) => p.y);
  for (const f of MEASURED_FINGERS) xs.push(fingers[f].x0, fingers[f].x1), ys.push(fingers[f].top, fingers[f].bottom);
  const margin = 0.12 * (Math.max(...xs) - Math.min(...xs));
  const cx = Math.max(0, Math.floor(Math.min(...xs) - margin)), cy = Math.max(0, Math.floor(Math.min(...ys) - margin));
  const cw = Math.min(flat.width, Math.ceil(Math.max(...xs) + margin)) - cx, ch = Math.min(flat.height, Math.ceil(Math.max(...ys) + margin)) - cy;
  const crop = document.createElement('canvas');
  crop.width = cw;
  crop.height = ch;
  crop.getContext('2d')!.drawImage(flat, cx, cy, cw, ch, 0, 0, cw, ch);
  const boxes = {} as Record<Finger, FingerBox>;
  for (const f of MEASURED_FINGERS) {
    const b = fingers[f];
    boxes[f] = { x0: b.x0 - cx, x1: b.x1 - cx, crease: b.crease - cy, top: b.top - cy, bottom: b.bottom - cy };
  }
  return { image: crop.toDataURL('image/jpeg', 0.9), width: cw, height: ch, shift: { x: cx, y: cy }, boxes };
}
