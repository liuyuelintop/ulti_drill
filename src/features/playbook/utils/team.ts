import type { DraggableItem } from "../types";
import { getStandardFormation, MARK_OFFSET } from "./formation";

const isRoster = (item: DraggableItem) =>
  item.type === "offense" || item.type === "defense" || item.type === "disc";

/**
 * Resize the roster across *every* frame, so player ids stay consistent and
 * playback can still interpolate between frames.
 *
 * Cones and annotations are not part of the roster and are carried through
 * untouched — changing the number of cutters must never wipe a drill's cones.
 */
export const applyTeamSize = (
  frames: DraggableItem[][],
  offenseCount: number,
  defenseCount: number
): DraggableItem[][] => {
  const template = getStandardFormation(offenseCount, defenseCount);

  return frames.map((frame) => {
    const next: DraggableItem[] = [];
    const find = (id: string) => frame.find((i) => i.id === id);
    const fromTemplate = (id: string) => template.find((i) => i.id === id);

    const disc = find("disc") ?? fromTemplate("disc");
    if (disc) next.push(disc);

    for (let i = 1; i <= offenseCount; i++) {
      const id = `offense-${i}`;
      const item = find(id) ?? fromTemplate(id);
      if (item) next.push({ ...item, label: String(i) });
    }

    for (let i = 1; i <= defenseCount; i++) {
      const id = `defense-${i}`;
      const existing = find(id);
      if (existing) {
        next.push({ ...existing, label: String(i) });
        continue;
      }
      // New defender: shadow the matching offensive player, far enough away
      // that both tokens stay readable on a phone.
      const partner = next.find((p) => p.id === `offense-${i}`);
      if (partner) {
        next.push({
          id,
          type: "defense",
          x: partner.x + MARK_OFFSET,
          y: partner.y - MARK_OFFSET,
          label: String(i),
        });
      } else {
        const fallback = fromTemplate(id);
        if (fallback) next.push({ ...fallback, label: String(i) });
      }
    }

    for (const item of frame) if (!isRoster(item)) next.push(item);

    return next;
  });
};

export const countByType = (frame: DraggableItem[] = []) => ({
  offense: frame.filter((i) => i.type === "offense").length,
  defense: frame.filter((i) => i.type === "defense").length,
});

export const createInitialFrames = (): DraggableItem[][] => [
  getStandardFormation(7, 0),
];

/** Next free `<prefix>-<n>` id across the whole play. */
const nextId = (frames: DraggableItem[][], prefix: string): string => {
  let max = 0;
  for (const frame of frames) {
    for (const item of frame) {
      const match = item.id.match(new RegExp(`^${prefix}-(\\d+)$`));
      if (match) max = Math.max(max, Number(match[1]));
    }
  }
  return `${prefix}-${max + 1}`;
};

/**
 * Add a cone or annotation to every frame at the same spot. Present in all
 * frames means it never pops in and out, and playback can move it if it should.
 */
export const addItem = (
  frames: DraggableItem[][],
  type: "cone" | "text",
  position: { x: number; y: number },
  label = ""
): { frames: DraggableItem[][]; id: string } => {
  const id = nextId(frames, type);
  const item: DraggableItem = { id, type, x: position.x, y: position.y, label };
  return { frames: frames.map((frame) => [...frame, { ...item }]), id };
};

/** Remove an item from every frame. */
export const removeItem = (
  frames: DraggableItem[][],
  id: string
): DraggableItem[][] => frames.map((frame) => frame.filter((i) => i.id !== id));

/** Relabel an item across every frame, so a note reads the same throughout. */
export const relabelItem = (
  frames: DraggableItem[][],
  id: string,
  label: string
): DraggableItem[][] =>
  frames.map((frame) =>
    frame.map((item) => (item.id === id ? { ...item, label } : item))
  );
