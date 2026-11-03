// Measures a hand from a photo (palm up, coin next to it), entirely in the browser.
// 1. MediaPipe finds the hand and its 21 landmarks (no hand -> stop).
// 2. A Hough transform finds the coin, a ray search + ellipse fit refines its outline and the colours tell which coin it is.
// 3. The photo is flattened (the affine transform that turns the coin ellipse back into a circle) and turned so the
//    fingers point straight up.
// 4. On that photo each finger gets an upright box: its width across the upper-joint (DIP) crease, and the crease height.

import type { Finger } from './layout';

export type Pt = { x: number; y: number };

export interface Coin {
  id: string;
  label: string;
  diameter: number;
}

export const COINS: Coin[] = [
  { id: 'eur200', label: '€2', diameter: 25.75 },
  { id: 'eur100', label: '€1', diameter: 23.25 },
  { id: 'eur050', label: '50 cent', diameter: 24.25 },
  { id: 'eur020', label: '20 cent', diameter: 22.25 },
  { id: 'eur010', label: '10 cent', diameter: 19.75 },
  { id: 'eur005', label: '5 cent', diameter: 21.25 },
  { id: 'eur002', label: '2 cent', diameter: 18.75 },
  { id: 'eur001', label: '1 cent', diameter: 16.25 },
  { id: 'usd025', label: 'US quarter', diameter: 24.26 },
  { id: 'usd001', label: 'US penny', diameter: 19.05 },
  { id: 'gbp100', label: 'UK £1', diameter: 23.43 },
  { id: 'gbp010', label: 'UK 10p', diameter: 24.5 },
];
export const coinById = (id: string) => COINS.find((c) => c.id === id) || COINS[0];

export const MEASURED_FINGERS: Finger[] = ['index', 'middle', 'ring', 'pinky'];

/** Extra width added outside the index and the pinky (mm). */
const OUTER_MARGIN_MM = 2;

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
  /** Coin on the flattened photo (a circle). */
  coin: { center: Pt; radius: number; id: string; ellipseRatio: number };
  fingers: Record<Finger, FingerBox>;
  warnings: string[];
}

export interface Measurements {
  offset: { ring: number; middle: number; index: number };
  width: Record<Finger, number>;
}

export class HandPhotoError extends Error {}

export type Stage = 'loading' | 'hand' | 'coin' | 'flatten' | 'fingers';

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

/** Turns the (edited) finger boxes into the designer values (mm). */
export function measure(r: HandPhotoResult, coinId = r.coin.id): Measurements {
  const mmPerPx = coinById(coinId).diameter / (2 * r.coin.radius);
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
let landmarkerPromise: Promise<any> | null = null;
function getLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');
      const fileset = await FilesetResolver.forVisionTasks(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/wasm`);
      return HandLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'CPU',
        },
        runningMode: 'IMAGE',
        numHands: 1,
        minHandDetectionConfidence: 0.4,
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

function hsv([r, g, b]: [number, number, number]) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d > 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max ? d / max : 0, v: max / 255 };
}

const median = (a: number[]) => {
  const s = [...a].sort((x, y) => x - y);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
};

/* ---------- coin ---------- */

/** Distance from p to the segment ab. */
function segDist(p: Pt, a: Pt, b: Pt) {
  const ab = sub(b, a);
  const t = Math.min(1, Math.max(0, dot(sub(p, a), ab) / (dot(ab, ab) || 1)));
  return dist(p, add(a, mul(ab, t)));
}

const HAND_BONES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [0, 17], [17, 18], [18, 19], [19, 20], [0, 9], [0, 13], [1, 5],
];

/** Rough coin circle (centre, radius in px of the original photo) via a gradient Hough transform on a downscaled copy. */
function findCoinRough(src: HTMLCanvasElement, lm: Pt[]): { c: Pt; r: number } | null {
  const k = Math.min(1, 700 / Math.max(src.width, src.height));
  const W = Math.round(src.width * k), H = Math.round(src.height * k);
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d')!;
  ctx.drawImage(src, 0, 0, W, H);
  const im = new Img(ctx.getImageData(0, 0, W, H));
  const P = lm.map((p) => mul(p, k));
  const L = dist(P[0], P[9]);
  const pad = 0.17 * L;
  const up = norm(sub(P[9], P[0]));
  const side = perp(up);
  const inHand = (p: Pt) => {
    for (const [i, j] of HAND_BONES) if (segDist(p, P[i], P[j]) < pad) return true;
    // forearm below the wrist
    const q = sub(p, P[0]);
    return dot(q, up) < 0.1 * L && Math.abs(dot(q, side)) < 0.6 * L;
  };

  // Sobel
  const G = im.gray;
  const gx = new Float32Array(W * H), gy = new Float32Array(W * H), mag = new Float32Array(W * H);
  const mags: number[] = [];
  for (let y = 1; y < H - 1; y++)
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      const a = G[i - W - 1], b = G[i - W], c = G[i - W + 1], d = G[i - 1], f = G[i + 1], g = G[i + W - 1], h = G[i + W], j = G[i + W + 1];
      gx[i] = c + 2 * f + j - a - 2 * d - g;
      gy[i] = g + 2 * h + j - a - 2 * b - c;
      mag[i] = Math.hypot(gx[i], gy[i]);
      if ((x + y) % 7 === 0) mags.push(mag[i]);
    }
  mags.sort((a, b) => a - b);
  const thr = Math.max(40, mags[Math.floor(mags.length * 0.9)]);

  const rmin = Math.max(4, 0.06 * L), rmax = 0.21 * L;
  const acc = new Float32Array(W * H);
  const handMask = new Uint8Array(W * H);
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (inHand({ x, y })) handMask[y * W + x] = handMask[y * W + x + 1] = handMask[(y + 1) * W + x] = handMask[(y + 1) * W + x + 1] = 1;
  for (let y = 1; y < H - 1; y++)
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      if (mag[i] < thr || handMask[i]) continue;
      const nx = gx[i] / mag[i], ny = gy[i] / mag[i];
      for (let r = rmin; r <= rmax; r += 1)
        for (const s of [1, -1]) {
          const cx = Math.round(x + s * r * nx), cy = Math.round(y + s * r * ny);
          if (cx >= 0 && cy >= 0 && cx < W && cy < H) acc[cy * W + cx] += 1;
        }
    }

  // 5x5 box blur of the accumulator, then local maxima
  const blur = new Float32Array(W * H);
  for (let y = 2; y < H - 2; y++)
    for (let x = 2; x < W - 2; x++) {
      let s = 0;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) s += acc[(y + dy) * W + x + dx];
      blur[y * W + x] = s;
    }
  const peaks: { x: number; y: number; v: number }[] = [];
  for (let y = 3; y < H - 3; y++)
    for (let x = 3; x < W - 3; x++) {
      const v = blur[y * W + x];
      if (v <= 0 || handMask[y * W + x]) continue;
      let max = true;
      for (let dy = -3; dy <= 3 && max; dy++) for (let dx = -3; dx <= 3; dx++) if (blur[(y + dy) * W + x + dx] > v) { max = false; break; }
      if (max) peaks.push({ x, y, v });
    }
  peaks.sort((a, b) => b.v - a.v);

  // Score each candidate by how much of a circle of edge pixels (gradient pointing radially) surrounds it
  let best: { c: Pt; r: number; score: number } | null = null;
  const N = 120;
  for (const pk of peaks.slice(0, 12)) {
    const scores: { r: number; score: number }[] = [];
    for (let r = rmin; r <= rmax; r += 0.5) {
      let hit = 0;
      for (let t = 0; t < N; t++) {
        const ang = (t / N) * 2 * Math.PI, ux = Math.cos(ang), uy = Math.sin(ang);
        for (const dr of [-1, 0, 1]) {
          const x = Math.round(pk.x + (r + dr) * ux), y = Math.round(pk.y + (r + dr) * uy);
          if (x < 1 || y < 1 || x >= W - 1 || y >= H - 1) continue;
          const i = y * W + x;
          if (mag[i] >= thr * 0.7 && Math.abs(gx[i] * ux + gy[i] * uy) > 0.75 * mag[i]) { hit++; break; }
        }
      }
      scores.push({ r, score: hit / N });
    }
    // Bimetal coins (€1, €2) show an inner circle too: take the outermost circle that is nearly as strong
    const top = Math.max(...scores.map((s) => s.score));
    const outer = scores.filter((s) => s.score >= 0.75 * top).pop()!;
    if (!best || top > best.score) best = { c: { x: pk.x, y: pk.y }, r: outer.r, score: top };
  }
  if (!best || best.score < 0.4) return null;
  return { c: mul(best.c, 1 / k), r: best.r / k };
}

/** Least-squares conic fit, returned as ellipse centre, semi-axes (a >= b) and angle of the major axis. */
function fitEllipse(pts: Pt[]) {
  const m = mul(pts.reduce((s, p) => add(s, p), { x: 0, y: 0 }), 1 / pts.length);
  const sc = Math.sqrt(pts.reduce((s, p) => s + dot(sub(p, m), sub(p, m)), 0) / pts.length) || 1;
  // A x² + B xy + C y² + D x + E y = 1 on normalised points
  const M = Array.from({ length: 5 }, () => new Array(6).fill(0));
  for (const p of pts) {
    const x = (p.x - m.x) / sc, y = (p.y - m.y) / sc;
    const row = [x * x, x * y, y * y, x, y];
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) M[i][j] += row[i] * row[j];
      M[i][5] += row[i];
    }
  }
  for (let i = 0; i < 5; i++) {
    let piv = i;
    for (let r = i + 1; r < 5; r++) if (Math.abs(M[r][i]) > Math.abs(M[piv][i])) piv = r;
    [M[i], M[piv]] = [M[piv], M[i]];
    if (Math.abs(M[i][i]) < 1e-12) return null;
    for (let r = 0; r < 5; r++) {
      if (r === i) continue;
      const f = M[r][i] / M[i][i];
      for (let c = i; c < 6; c++) M[r][c] -= f * M[i][c];
    }
  }
  const [A, B, C, D, E] = M.map((r, i) => r[5] / r[i]);
  const F = -1;
  if (B * B - 4 * A * C >= 0) return null;
  const det = 4 * A * C - B * B;
  const x0 = (B * E - 2 * C * D) / det, y0 = (B * D - 2 * A * E) / det;
  const F0 = A * x0 * x0 + B * x0 * y0 + C * y0 * y0 + D * x0 + E * y0 + F;
  const th = 0.5 * Math.atan2(B, A - C);
  const cs = Math.cos(th), sn = Math.sin(th);
  const A2 = A * cs * cs + B * sn * cs + C * sn * sn;
  const C2 = A * sn * sn - B * sn * cs + C * cs * cs;
  if (-F0 / A2 <= 0 || -F0 / C2 <= 0) return null;
  const ax = Math.sqrt(-F0 / A2) * sc, ay = Math.sqrt(-F0 / C2) * sc;
  const center = { x: x0 * sc + m.x, y: y0 * sc + m.y };
  return ax >= ay ? { center, a: ax, b: ay, angle: th } : { center, a: ay, b: ax, angle: th + Math.PI / 2 };
}

/** Radius of an ellipse in direction ang. */
function ellipseRadius(e: { a: number; b: number; angle: number }, ang: number) {
  const t = ang - e.angle;
  return (e.a * e.b) / Math.hypot(e.b * Math.cos(t), e.a * Math.sin(t));
}

/** Refines the rough circle into an ellipse on the full-resolution photo. */
function refineCoin(im: Img, rough: { c: Pt; r: number }) {
  const pts: Pt[] = [];
  const N = 144;
  for (let t = 0; t < N; t++) {
    const ang = (t / N) * 2 * Math.PI, u = { x: Math.cos(ang), y: Math.sin(ang) };
    // The rough radius is close to the rim. Take the innermost strong edge: the rim comes before the coin's shadow.
    const prof: { r: number; d: number }[] = [];
    for (let r = 0.85 * rough.r; r <= 1.2 * rough.r; r += 0.5) {
      const p1 = add(rough.c, mul(u, r - 1)), p2 = add(rough.c, mul(u, r + 1));
      if (!im.inside(p1) || !im.inside(p2)) continue;
      prof.push({ r, d: Math.abs(im.g(p2.x, p2.y) - im.g(p1.x, p1.y)) });
    }
    const max = Math.max(0, ...prof.map((p) => p.d));
    const rim = prof.find((p, i) => p.d >= 0.5 * max && p.d >= (prof[i - 1]?.d ?? 0) && p.d >= (prof[i + 1]?.d ?? 0));
    if (rim && max > 6) pts.push(add(rough.c, mul(u, rim.r)));
  }
  const circle = { center: rough.c, a: rough.r, b: rough.r, angle: 0 };
  if (pts.length < 20) return circle;
  let e = fitEllipse(pts);
  if (!e) return circle;
  // Drop outliers (shadows, glare) once and refit
  const res = pts.map((p) => Math.abs(dist(p, e!.center) - ellipseRadius(e!, Math.atan2(p.y - e!.center.y, p.x - e!.center.x))));
  const mad = median(res) || 0.5;
  const kept = pts.filter((_, i) => res[i] < 2.5 * mad + 0.5);
  e = (kept.length >= 20 && fitEllipse(kept)) || e;
  if (e.a / e.b > 1.6) return circle;
  // A slightly oval fit is mostly noise (coin relief, shadow), and flattening on noise distorts the lengths.
  // Below 10 % treat the coin as a circle with the median rim distance as radius.
  if (e.a / e.b < 1.1) {
    const c = e.center;
    const r = median((kept.length >= 20 ? kept : pts).map((p) => dist(p, c)));
    return { center: c, a: r, b: r, angle: 0 };
  }
  return e;
}

/** Guesses the coin from its colours (bimetal or not, gold/copper/silver) and the hand size. */
function identifyCoin(im: Img, c: Pt, r: number, palmLenPx: number): string {
  const avg = (r0: number, r1: number) => {
    const s = [0, 0, 0];
    let n = 0;
    for (let rr = r0; rr <= r1; rr += Math.max(1, r / 20))
      for (let t = 0; t < 48; t++) {
        const a = (t / 48) * 2 * Math.PI;
        const px = im.rgb(c.x + rr * Math.cos(a), c.y + rr * Math.sin(a));
        s[0] += px[0]; s[1] += px[1]; s[2] += px[2]; n++;
      }
    return s.map((v) => v / n) as [number, number, number];
  };
  // White-balance against the background just around the coin
  const bg = avg(1.35 * r, 1.6 * r);
  const wb = (p: [number, number, number]) => p.map((v, i) => Math.min(255, (v / (bg[i] || 1)) * 200)) as [number, number, number];
  const centre = hsv(wb(avg(0, 0.4 * r)));
  const ring = hsv(wb(avg(0.78 * r, 0.9 * r)));

  let family: string[];
  if (Math.abs(centre.s - ring.s) > 0.1) family = centre.s > ring.s ? ['eur200'] : ['eur100'];
  else if (centre.s < 0.15) family = ['usd025', 'gbp010'];
  else if (centre.h < 25) family = ['eur005', 'eur002', 'eur001', 'usd001'];
  else family = ['eur050', 'eur020', 'eur010', 'gbp100'];
  // Pick the size that gives the most typical adult palm (wrist to middle knuckle ≈ 95 mm)
  let best = family[0], bestErr = Infinity;
  for (const id of family) {
    const err = Math.abs((palmLenPx * coinById(id).diameter) / (2 * r) - 95);
    if (err < bestErr) { bestErr = err; best = id; }
  }
  return best;
}

/* ---------- fingers ---------- */

/** P are the landmarks on the flattened, upright photo. */
function measureFingers(im: Img, P: Pt[], coin: { center: Pt; radius: number }, warnings: string[]): Record<Finger, FingerBox> {
  // Skin colour model from the palm
  const palmC = mul([0, 5, 9, 13, 17].reduce((s, i) => add(s, P[i]), { x: 0, y: 0 }), 1 / 5);
  const skin: { cb: number; cr: number; y: number }[] = [];
  for (const i of [0, 5, 9, 13, 17])
    for (let f = 0.1; f <= 0.6; f += 0.1) {
      const p = add(palmC, mul(sub(P[i], palmC), f));
      skin.push(chroma(im.rgb(p.x, p.y)));
    }
  const mcb = skin.reduce((s, v) => s + v.cb, 0) / skin.length, mcr = skin.reduce((s, v) => s + v.cr, 0) / skin.length;
  // Background colour model: around the coin and just past the fingertips
  const bgS: { cb: number; cr: number; y: number }[] = [];
  for (let t = 0; t < 36; t++) {
    const a = (t / 36) * 2 * Math.PI;
    for (const k of [1.6, 2.0]) {
      const p = add(coin.center, mul({ x: Math.cos(a), y: Math.sin(a) }, k * coin.radius));
      if (im.inside(p)) bgS.push(chroma(im.rgb(p.x, p.y)));
    }
  }
  for (const f of MEASURED_FINGERS) {
    const [, , d, tip] = LM[f];
    const p = add(P[tip], mul(sub(P[tip], P[d]), 0.8));
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
    const seg = dist(P[LM[f][1]], P[LM[f][2]]);

    // Crease: the darkest line across the finger near the DIP landmark. MediaPipe puts that landmark on the joint
    // centre, which lies a little below the crease seen on the palm side, so the search leans towards the fingertip.
    // A median across the finger keeps calluses and skin flakes from shifting it.
    const step = 0.5;
    const ts: number[] = [], prof: number[] = [];
    for (let t = -0.35 * seg; t <= 0.75 * seg; t += step) {
      const row: number[] = [];
      for (let w = -0.45 * halfW; w <= 0.45 * halfW; w += 1) {
        const p = add(dip(f), add(mul(u, t), mul(v, w)));
        row.push(im.g(p.x, p.y));
      }
      ts.push(t); prof.push(median(row));
    }
    const win = Math.max(2, Math.round((0.15 * seg) / step));
    const expected = 0.2 * seg;
    let bestT = expected, bestScore = Infinity, contrast = 0;
    for (let i = 0; i < prof.length; i++) {
      if (ts[i] < -0.2 * seg || ts[i] > 0.6 * seg) continue;
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
    // An outer side (no finger next to it) must cover the whole finger: the widest point between the
    // middle of the last segment and the middle joint, not just the width at the crease
    const outer = (sideSign: number) => {
      // Outward position per row; a high percentile instead of the single widest row, so one stray row can't win
      const xs = [sideSign * (c.x + sideSign * outerEdgeAt(sideSign, c))];
      const yFrom = P[d].y + 0.5 * (P[tip].y - P[d].y), yTo = P[pip].y;
      for (let y = yFrom; y <= yTo; y += 2) {
        // point on the finger axis at this height (tip-DIP-PIP polyline)
        const [a, b] = y < P[d].y ? [P[tip], P[d]] : [P[d], P[pip]];
        const t = (y - a.y) / (b.y - a.y || 1);
        const from = { x: a.x + t * (b.x - a.x), y };
        const e = from.x + sideSign * outerEdgeAt(sideSign, from);
        xs.push(sideSign * e);
      }
      xs.sort((p, q) => p - q);
      return sideSign * xs[Math.floor(0.85 * (xs.length - 1))];
    };
    const hasNb = (sideSign: number) => neighbours.some((n) => Math.sign(dip(n).x - c.x) === sideSign);
    out[f] = {
      x0: hasNb(-1) ? c.x - edgeAt(-1) : outer(-1),
      x1: hasNb(1) ? c.x + edgeAt(1) : outer(1),
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

/* ---------- main ---------- */

export async function analyzeHandPhoto(file: File, onStage: (s: Stage) => void = () => {}): Promise<HandPhotoResult> {
  const tick = () => new Promise((r) => setTimeout(r, 20));
  const warnings: string[] = [];
  onStage('loading');
  const src = await loadImage(file);
  let landmarker: any;
  try {
    landmarker = await getLandmarker();
  } catch (e) {
    console.error(e);
    throw new HandPhotoError('The hand detection model could not be loaded. Check your connection and try again.');
  }

  onStage('hand');
  await tick();
  const det = landmarker.detect(src);
  if (!det.landmarks?.length) throw new HandPhotoError('No hand found in this photo. Lay your hand flat, palm up, with the whole hand in view.');
  const lm: Pt[] = det.landmarks[0].map((p: { x: number; y: number }) => ({ x: p.x * src.width, y: p.y * src.height }));
  const edgeMargin = 0.01 * Math.max(src.width, src.height);
  if (lm.slice(5).some((p) => p.x < edgeMargin || p.y < edgeMargin || p.x > src.width - edgeMargin || p.y > src.height - edgeMargin))
    throw new HandPhotoError('Part of your fingers is outside the photo. Take the photo again with the whole hand in view.');

  onStage('coin');
  await tick();
  const rough = findCoinRough(src, lm);
  if (!rough) throw new HandPhotoError('No coin found. Put a coin flat next to your hand (not touching it) and take the photo again.');
  const full = new Img(src.getContext('2d')!.getImageData(0, 0, src.width, src.height));
  const ell = refineCoin(full, rough);
  const coinId = identifyCoin(full, ell.center, (ell.a + ell.b) / 2, dist(lm[0], lm[9]));

  onStage('flatten');
  await tick();
  // Stretch along the coin's minor axis so the ellipse becomes a circle again
  const ratio = ell.a / ell.b;
  if (ratio > 1.25) warnings.push('The photo was taken at an angle. Hold your phone straight above the hand for more accurate values.');
  const w = { x: -Math.sin(ell.angle), y: Math.cos(ell.angle) };
  const S = [1 + (ratio - 1) * w.x * w.x, (ratio - 1) * w.x * w.y, (ratio - 1) * w.x * w.y, 1 + (ratio - 1) * w.y * w.y];
  // ... and turn it so the fingers point straight up, which makes every crease line horizontal
  const sApply = (p: Pt): Pt => ({ x: S[0] * p.x + S[1] * p.y, y: S[2] * p.x + S[3] * p.y });
  const axis = MEASURED_FINGERS.reduce((s, f) => add(s, sub(sApply(lm[LM[f][3]]), sApply(lm[LM[f][1]]))), { x: 0, y: 0 });
  const rot = -Math.PI / 2 - Math.atan2(axis.y, axis.x);
  const rc = Math.cos(rot), rs = Math.sin(rot);
  const M = [rc * S[0] - rs * S[2], rc * S[1] - rs * S[3], rs * S[0] + rc * S[2], rs * S[1] + rc * S[3]];
  const corners = [{ x: 0, y: 0 }, { x: src.width, y: 0 }, { x: 0, y: src.height }, { x: src.width, y: src.height }].map((p) => ({
    x: M[0] * p.x + M[1] * p.y,
    y: M[2] * p.x + M[3] * p.y,
  }));
  const minX = Math.min(...corners.map((p) => p.x)), minY = Math.min(...corners.map((p) => p.y));
  const fw = Math.max(...corners.map((p) => p.x)) - minX, fh = Math.max(...corners.map((p) => p.y)) - minY;
  const k = Math.min(1, (MAX_SIDE * 1.1) / Math.max(fw, fh));
  const T = (p: Pt): Pt => ({ x: (M[0] * p.x + M[1] * p.y - minX) * k, y: (M[2] * p.x + M[3] * p.y - minY) * k });
  const flat = document.createElement('canvas');
  flat.width = Math.round(fw * k);
  flat.height = Math.round(fh * k);
  const fctx = flat.getContext('2d')!;
  fctx.fillStyle = '#fff';
  fctx.fillRect(0, 0, flat.width, flat.height);
  fctx.setTransform(M[0] * k, M[2] * k, M[1] * k, M[3] * k, -minX * k, -minY * k);
  fctx.drawImage(src, 0, 0);
  fctx.setTransform(1, 0, 0, 1, 0, 0);

  onStage('fingers');
  await tick();
  const fim = new Img(fctx.getImageData(0, 0, flat.width, flat.height));
  const coin = { center: T(ell.center), radius: ell.a * k };
  const fingers = measureFingers(fim, lm.map(T), coin, warnings);

  // Crop to the fingers and the coin, so the boxes are big enough to adjust
  const xs = [coin.center.x - coin.radius, coin.center.x + coin.radius], ys = [coin.center.y - coin.radius, coin.center.y + coin.radius];
  for (const f of MEASURED_FINGERS) xs.push(fingers[f].x0, fingers[f].x1), ys.push(fingers[f].top, fingers[f].bottom);
  const margin = 0.12 * (Math.max(...xs) - Math.min(...xs));
  const cx = Math.max(0, Math.floor(Math.min(...xs) - margin)), cy = Math.max(0, Math.floor(Math.min(...ys) - margin));
  const cw = Math.min(flat.width, Math.ceil(Math.max(...xs) + margin)) - cx, ch = Math.min(flat.height, Math.ceil(Math.max(...ys) + margin)) - cy;
  const crop = document.createElement('canvas');
  crop.width = cw;
  crop.height = ch;
  crop.getContext('2d')!.drawImage(flat, cx, cy, cw, ch, 0, 0, cw, ch);
  const shifted = {} as Record<Finger, FingerBox>;
  for (const f of MEASURED_FINGERS) {
    const b = fingers[f];
    shifted[f] = { x0: b.x0 - cx, x1: b.x1 - cx, crease: b.crease - cy, top: b.top - cy, bottom: b.bottom - cy };
  }
  // Neighbouring boxes always touch: the side they share sits halfway between the two measured edges
  const order = fingersLeftToRight(shifted);
  for (let i = 0; i + 1 < order.length; i++) {
    const l = shifted[order[i]], r = shifted[order[i + 1]];
    l.x1 = r.x0 = (l.x1 + r.x0) / 2;
  }
  // Some room on both outer sides
  const outerMargin = (OUTER_MARGIN_MM * 2 * coin.radius) / coinById(coinId).diameter;
  shifted[order[0]].x0 -= outerMargin;
  shifted[order[order.length - 1]].x1 += outerMargin;

  return {
    image: crop.toDataURL('image/jpeg', 0.9),
    width: cw,
    height: ch,
    coin: { center: { x: coin.center.x - cx, y: coin.center.y - cy }, radius: coin.radius, id: coinId, ellipseRatio: ratio },
    fingers: shifted,
    warnings,
  };
}
