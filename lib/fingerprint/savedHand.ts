// Hand values saved by /shop/tailr-edge-measure and read by /shop/tailr-edge-photo.
// Same 7-value format as the design links: ring,middle,index lengths then pinky,ring,middle,index widths.

import type { FingerParams } from './layout';

const STORAGE_KEY = 'tailr_edge_photo_hand';

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
