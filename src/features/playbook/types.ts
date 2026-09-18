/**
 * `cone` and `text` are field furniture rather than players: they are not part
 * of the roster, so the offence/defence steppers leave them alone.
 */
export type ItemType = "offense" | "defense" | "disc" | "cone" | "text";

/** Item types that make up the roster and are numbered 1..n. */
export const ROSTER_TYPES = ["offense", "defense"] as const;

export interface DraggableItem {
  id: string;
  x: number;
  y: number;
  type: ItemType;
  /** Jersey number for players; the drawn note for `text` items. */
  label?: string;
  /**
   * Quadratic Bézier control point for the path *into* this position from the
   * previous frame, in field metres. Absent means the item travels in a
   * straight line — which is what a fake-in-go-deep cut never does.
   */
  cx?: number;
  cy?: number;
}

export interface PlaybookData {
  version: string;
  name: string;
  description?: string;
  frames: DraggableItem[][];
}

/** Position along the quadratic path from `from` to `to` at time `t` (0..1). */
export const pointOnPath = (
  from: { x: number; y: number },
  to: DraggableItem,
  t: number
): { x: number; y: number } => {
  if (to.cx === undefined || to.cy === undefined) {
    return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
  }
  const u = 1 - t;
  const a = u * u;
  const b = 2 * u * t;
  const c = t * t;
  return {
    x: a * from.x + b * to.cx + c * to.x,
    y: a * from.y + b * to.cy + c * to.y,
  };
};

/**
 * The control point is off-curve, but the handle people drag should sit *on*
 * the curve. These two convert between them at the midpoint.
 */
export const handleToControl = (
  from: { x: number; y: number },
  to: { x: number; y: number },
  handle: { x: number; y: number }
) => ({
  cx: 2 * handle.x - (from.x + to.x) / 2,
  cy: 2 * handle.y - (from.y + to.y) / 2,
});

export const controlToHandle = (
  from: { x: number; y: number },
  to: DraggableItem
) => pointOnPath(from, to, 0.5);
