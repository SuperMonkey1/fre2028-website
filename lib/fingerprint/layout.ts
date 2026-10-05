// Pure layout math for the FingerPrint edges (no CAD dependency, safe for SSR).

export type Finger = 'index' | 'middle' | 'ring' | 'pinky';
export type Hand = 'left' | 'right';

export interface FingerParams {
  /** Edge offset relative to the pinky edge, in mm, measured perpendicular to the edge faces. */
  offset: Record<Exclude<Finger, 'pinky'>, number>;
  /** Width of each finger's edge, in mm. */
  width: Record<Finger, number>;
}

/** Parameters of the original design (FingerPrint/FingerPrint.step). */
export const DEFAULT_PARAMS: FingerParams = {
  offset: { ring: 23.909, middle: 27.893, index: 11.954 },
  width: { index: 20, middle: 21, ring: 20, pinky: 18 },
};

export const MIN_WIDTH = 12;
export const MAX_WIDTH = 30;

export const TILT = (5 * Math.PI) / 180;
export const COS = Math.cos(TILT);
const TAN = Math.tan(TILT);

/** Distance from the front face (y = -17) to an edge at y = 0. */
export const FRONT_DEPTH = 17;

/** Finger order along +X in the left-hand model. */
export const FINGER_ORDER: Finger[] = ['index', 'middle', 'ring', 'pinky'];

/**
 * The two ends of the original body (x < 15 and x > 64 of the 79 mm wide STEP) hold the eyelets and the
 * cord fillets under the plate. Any column reaching into them must keep its edge in front of those.
 */
export const END_ZONE = 15;
const END_ZONE_MAX_Y = 22.5;
const CENTRE_MAX_Y = 44;

export interface Column {
  finger: Finger;
  x0: number;
  x1: number;
}

export interface EdgeLayout {
  columns: Column[];
  /** Total width of the edge block (original: 79 mm). */
  width: number;
  /** Absolute edge position (y at z = 0) per finger. */
  edgeY: Record<Finger, number>;
  /** How far all edges were pushed back so no edge cuts into the cord channel. */
  shift: number;
  errors: string[];
  /** Scale of the central load hole (1 = original size, 0 = no hole). */
  holeScale: number;
  /** X position of the load hole centre (middle of the block). */
  holeX: number;
}

export function computeLayout(p: FingerParams): EdgeLayout {
  const errors: string[] = [];
  for (const f of ['ring', 'middle', 'index'] as const) {
    if (!Number.isFinite(p.offset[f])) errors.push(`Enter a length for the ${f} finger.`);
  }
  for (const f of FINGER_ORDER) {
    const w = p.width[f];
    if (!Number.isFinite(w)) errors.push(`Enter a width for the ${f} finger.`);
    else if (w < MIN_WIDTH || w > MAX_WIDTH) errors.push(`The ${f} width must be between ${MIN_WIDTH} and ${MAX_WIDTH} mm.`);
  }

  const columns: Column[] = [];
  let x = 0;
  for (const f of FINGER_ORDER) {
    const w = Number.isFinite(p.width[f]) ? p.width[f] : 0;
    columns.push({ finger: f, x0: x, x1: x + w });
    x += w;
  }
  const width = x;
  const holeX = width / 2;

  if (errors.length) {
    return { columns, width, edgeY: { pinky: 0, ring: 0, middle: 0, index: 0 }, shift: 0, errors, holeScale: 0, holeX };
  }

  const rel: Record<Finger, number> = {
    pinky: 0,
    ring: p.offset.ring / COS,
    middle: p.offset.middle / COS,
    index: p.offset.index / COS,
  };
  // An edge may not sit in front of the original pinky edge, or it would cut into the cord channel.
  const shift = Math.max(0, -Math.min(rel.ring, rel.middle, rel.index));
  const edgeY = {} as Record<Finger, number>;
  for (const c of columns) {
    const E = (edgeY[c.finger] = rel[c.finger] + shift);
    const maxY = maxEdgeY(c, width);
    if (E > maxY + 1e-6) {
      errors.push(`The ${c.finger} edge would end up ${(E - maxY).toFixed(1)} mm too far back to fit the body.`);
    }
  }
  return { columns, width, edgeY, shift, errors, holeScale: computeHoleScale(columns, edgeY, holeX), holeX };
}

function maxEdgeY(c: Column, width: number) {
  return c.x0 < END_ZONE || c.x1 > width - END_ZONE ? END_ZONE_MAX_Y : CENTRE_MAX_Y;
}

/* ---------- Central load hole ---------- */

// Original hole: R9.5 through hole with an R4 flare (R13.5 at the bottom face), centred at y = 5.
export const HOLE = { y: 5, r: 9.5, flareR: 4 };
/** Smallest wall left between hole and edge. The original design has ~0.13 mm at the bottom of the ring edge. */
const HOLE_WALL = 0.1;
const HOLE_MIN_SCALE = 0.3;

/** Back of the edge column at height z (R5 bottom fillet, then the 5° face). */
function edgeBoundary(E: number, z: number) {
  if (z < 5) return E - (5 * TAN + 5 / COS) + Math.sqrt(25 - (5 - z) ** 2);
  return E - z * TAN;
}

function holeRadiusAt(z: number, k: number) {
  const f = HOLE.flareR * k;
  if (z >= f) return HOLE.r * k;
  return (HOLE.r + HOLE.flareR) * k - Math.sqrt(f * f - (f - z) ** 2);
}

/**
 * Largest uniform scale (≤ 1) of the load hole that still stays inside the edge columns,
 * or 0 when even a small hole would break through.
 */
function computeHoleScale(columns: Column[], edgeY: Record<Finger, number>, holeX: number): number {
  const fits = (k: number) =>
    columns.every((c) => {
      const dx = holeX < c.x0 ? c.x0 - holeX : holeX > c.x1 ? holeX - c.x1 : 0;
      for (let z = 0; z <= 20; z += 0.1) {
        const R = holeRadiusAt(z, k);
        if (R <= dx) continue;
        const yHole = HOLE.y + Math.sqrt(R * R - dx * dx);
        if (yHole + HOLE_WALL > edgeBoundary(edgeY[c.finger], z)) return false;
      }
      return true;
    });
  for (let k = 1; k >= HOLE_MIN_SCALE; k -= 0.01) if (fits(k)) return k;
  return 0;
}
