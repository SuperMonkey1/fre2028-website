// Hand values saved by /shop/tailr-edge-measure and read by /shop/tailr-edge-photo.
// Same 7-value format as the design links: ring,middle,index lengths then pinky,ring,middle,index widths.

import type { FingerParams } from './layout';

const STORAGE_KEY = 'tailr_edge_photo_hand';
const HEIGHT_KEY = 'tailr_edge_height_cm';
const GENDER_KEY = 'tailr_edge_gender';

export const GENDERS = [
  ['male', 'Male'],
  ['female', 'Female'],
] as const;
export type Gender = (typeof GENDERS)[number][0];
export const isGender = (v: unknown): v is Gender => GENDERS.some(([id]) => id === v);

export const MEASURE_PAGE = '/shop/tailr-edge-measure';
export const PHOTO_DESIGNER_PAGE = '/shop/tailr-edge-photo';

export const encodeHand = (p: FingerParams) =>
  [p.offset.ring, p.offset.middle, p.offset.index, p.width.pinky, p.width.ring, p.width.middle, p.width.index].join(',');

export function decodeHand(q: string | null | undefined): FingerParams | null {
  const v = (q || '').split(',').map((x) => Number(x.trim()));
  if (v.length !== 7 || v.some((x) => !Number.isFinite(x))) return null;
  return {
    offset: { ring: v[0], middle: v[1], index: v[2] },
    width: { pinky: v[3], ring: v[4], middle: v[5], index: v[6] },
  };
}

export function saveHand(p: FingerParams) {
  try {
    localStorage.setItem(STORAGE_KEY, encodeHand(p));
  } catch {}
}

export function loadHand(): FingerParams | null {
  try {
    return decodeHand(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

/** Body height (cm), asked on the measure page. */
export function saveHeight(cm: number) {
  try {
    localStorage.setItem(HEIGHT_KEY, String(cm));
  } catch {}
}

export function loadHeight(): number | null {
  try {
    const v = Number(localStorage.getItem(HEIGHT_KEY));
    return v > 0 ? v : null;
  } catch {
    return null;
  }
}

/** "182 cm (5 ft 11 in)" */
export function formatHeight(cm: number) {
  const totalIn = Math.round(cm / 2.54);
  return `${Math.round(cm)} cm (${Math.floor(totalIn / 12)} ft ${totalIn % 12} in)`;
}

/** Gender, asked on the measure page. */
export function saveGender(g: Gender) {
  try {
    localStorage.setItem(GENDER_KEY, g);
  } catch {}
}

export function loadGender(): Gender | null {
  try {
    const v = localStorage.getItem(GENDER_KEY);
    return isGender(v) ? v : null;
  } catch {
    return null;
  }
}
