import type { DraggableItem } from "../types";
import { getStandardFormation } from "./formation";

/** How far a new defender is placed from the player they mark, in metres. */
const MARK_OFFSET = 2.8;

/**
 * Resize the roster across *every* frame, so player ids stay consistent and
 * playback can still interpolate between frames.
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
