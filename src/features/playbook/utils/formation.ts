import type { DraggableItem, ItemType } from "../types";
import { DEFAULT_STANDARD } from "../constants/standards";

const { width, endzoneLength, brickMark } = DEFAULT_STANDARD.dimensions;

/** How far a defender sets up from the player they mark, in metres. */
export const MARK_OFFSET = 2.8;

/** Depth of the first stack cutter past the disc, in metres. */
const STACK_DEPTH = 18;
/** Gap between stack cutters, in metres. */
const STACK_SPACING = 6;

/**
 * A vertical-stack starting set: thrower on the brick, dump behind, the rest
 * stacked down the centre line. Defenders shadow their matching cutter.
 *
 * All coordinates are in metres on the WFDF field, origin at the outer corner
 * of the left end zone.
 */
export const getStandardFormation = (
  offenseCount = 7,
  defenseCount = 0
): DraggableItem[] => {
  const items: DraggableItem[] = [];
  const centerY = width / 2;
  const discX = endzoneLength + brickMark;

  const add = (id: string, type: ItemType, x: number, y: number, label: string) =>
    items.push({ id, type, x, y, label });

  add("disc", "disc", discX + 2, centerY + 0.5, "");

  // Thrower on the brick mark, dump set up behind and to the open side.
  if (offenseCount >= 1) add("offense-1", "offense", discX, centerY, "1");
  if (offenseCount >= 2) add("offense-2", "offense", discX - 8, centerY + 10, "2");

  for (let i = 0; i < offenseCount - 2; i++) {
    add(
      `offense-${i + 3}`,
      "offense",
      discX + STACK_DEPTH + i * STACK_SPACING,
      centerY,
      String(i + 3)
    );
  }

  for (let i = 1; i <= defenseCount; i++) {
    const partner = items.find((item) => item.id === `offense-${i}`);
    // Extra defenders with nobody to mark fan out in front of the stack.
    const x = partner ? partner.x + MARK_OFFSET : discX + 12 + (i - 1) * 5;
    const y = partner ? partner.y - MARK_OFFSET : centerY + 12;
    add(`defense-${i}`, "defense", x, y, String(i));
  }

  return items;
};
