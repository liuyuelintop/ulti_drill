import type { DraggableItem } from "../playbook/types";
import { DEFAULT_STANDARD } from "../playbook/constants/standards";

const { length: FIELD_L, width: FIELD_W } = DEFAULT_STANDARD.dimensions;

export interface Region {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export const FULL_FIELD: Region = { x0: 0, y0: 0, x1: FIELD_L, y1: FIELD_W };

/** Breathing room around the players, in metres. */
const PAD = 5;
/** Never zoom in past this, or a static formation fills the screen absurdly. */
const MIN_LENGTH = 38;
const MIN_WIDTH = 22;

/**
 * The slice of field a play actually uses, so phones can zoom into the action
 * instead of rendering 40 metres of empty grass.
 */
export const playRegion = (frames: DraggableItem[][]): Region => {
  const items = frames.flat();
  if (items.length === 0) return FULL_FIELD;

  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;

  for (const item of items) {
    if (item.x < x0) x0 = item.x;
    if (item.x > x1) x1 = item.x;
    if (item.y < y0) y0 = item.y;
    if (item.y > y1) y1 = item.y;
  }

  x0 -= PAD;
  x1 += PAD;
  y0 -= PAD;
  y1 += PAD;

  // Grow around the centre up to the minimum window, then clamp to the field.
  const grow = (a: number, b: number, min: number, limit: number) => {
    if (b - a < min) {
      const mid = (a + b) / 2;
      a = mid - min / 2;
      b = mid + min / 2;
    }
    if (a < 0) {
      b = Math.min(limit, b - a);
      a = 0;
    }
    if (b > limit) {
      a = Math.max(0, a - (b - limit));
      b = limit;
    }
    return [a, b] as const;
  };

  [x0, x1] = grow(x0, x1, MIN_LENGTH, FIELD_L);
  [y0, y1] = grow(y0, y1, MIN_WIDTH, FIELD_W);

  return { x0, y0, x1, y1 };
};

/**
 * Grow the region along whichever axis is not limiting the fit, so the field
 * fills the viewport instead of leaving empty gutters beside it.
 */
export const expandToFill = (
  region: Region,
  scale: number,
  availW: number,
  availH: number,
  vertical: boolean
): Region => {
  if (scale <= 0) return region;

  // Screen width maps to field width when rotated, to field length otherwise.
  const alongScreenX = availW / scale;
  const alongScreenY = availH / scale;
  const wantL = vertical ? alongScreenY : alongScreenX;
  const wantW = vertical ? alongScreenX : alongScreenY;

  const stretch = (a: number, b: number, want: number, limit: number) => {
    const size = b - a;
    if (want <= size) return [a, b] as const;
    const extra = Math.min(want, limit) - size;
    let lo = a - extra / 2;
    let hi = b + extra / 2;
    if (lo < 0) {
      hi = Math.min(limit, hi - lo);
      lo = 0;
    }
    if (hi > limit) {
      lo = Math.max(0, lo - (hi - limit));
      hi = limit;
    }
    return [lo, hi] as const;
  };

  const [x0, x1] = stretch(region.x0, region.x1, wantL, FIELD_L);
  const [y0, y1] = stretch(region.y0, region.y1, wantW, FIELD_W);
  return { x0, y0, x1, y1 };
};
