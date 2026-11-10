// Hand values saved by /shop/tailr-edge-measure and read by /shop/tailr-edge-photo.
// Same 7-value format as the design links: ring,middle,index lengths then pinky,ring,middle,index widths.

import type { FingerParams } from './layout';

const STORAGE_KEY = 'tailr_edge_photo_hand';
const HEIGHT_KEY = 'tailr_edge_height_cm';
const GENDER_KEY = 'tailr_edge_gender';
const MEASUREMENT_KEY = 'tailr_edge_measurement';
const INVITE_KEY = 'tailr_edge_photo_invite';

export const GENDERS = [
  ['male', 'Male'],
  ['female', 'Female'],
] as const;
export type Gender = (typeof GENDERS)[number][0];
export const isGender = (v: unknown): v is Gender => GENDERS.some(([id]) => id === v);

export const MEASURE_PAGE = '/shop/tailr-edge-measure';
export const PHOTO_DESIGNER_PAGE = '/shop/tailr-edge-photo';
export const FRIENDS_PAGE = '/tailr-edge/friends';

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

/** `invite`: the early-access link it was measured for ('' in the shop), so another link starts unmeasured. */
export function saveHand(p: FingerParams, invite = '') {
  try {
    localStorage.setItem(STORAGE_KEY, encodeHand(p));
    localStorage.setItem(INVITE_KEY, invite);
  } catch {}
}

/** With `invite`, only a hand measured through that same early-access link. */
export function loadHand(invite?: string): FingerParams | null {
  try {
    if (invite !== undefined && (localStorage.getItem(INVITE_KEY) || '') !== invite) return null;
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

/** Id of the stored measurement photo (photo with overlay), sent along with the order. */
export const isMeasurementId = (v: unknown): v is string => typeof v === 'string' && /^[A-Za-z0-9_-]{16}$/.test(v);

export function saveMeasurementId(id: string) {
  try {
    localStorage.setItem(MEASUREMENT_KEY, id);
  } catch {}
}

export function loadMeasurementId(): string | null {
  try {
    const v = localStorage.getItem(MEASUREMENT_KEY);
    return isMeasurementId(v) ? v : null;
  } catch {
    return null;
  }
}
