import type { DraggableItem, ItemType } from "../types";
import { DEFAULT_STANDARD } from "../constants/standards";

export const getStandardFormation = (
  offenseCount: number = 7,
  defenseCount: number = 0
) => {
  const items: DraggableItem[] = [];
  
  // Use logical dimensions from the standard
  const { width, endzoneLength, brickMark } = DEFAULT_STANDARD.dimensions;
  
  const centerY = width / 2;
  const discX = endzoneLength + brickMark;

  const addPlayer = (
    id: string,
    type: ItemType,
    x: number,
    y: number,
    label: string
  ) => {
    items.push({ id, type, x, y, label });
  };

  // Always add disc
  addPlayer("disc", "disc", discX + 2, centerY + 0.5, "");

  // --- Offense Setup (Vertical Stack Base) ---
  // Handler 1 (thrower)
  if (offenseCount >= 1) {
    addPlayer("offense-1", "offense", discX, centerY, "1");
  }
  // Handler 2 (dump)
  if (offenseCount >= 2) {
    addPlayer("offense-2", "offense", discX - 8, centerY + 10, "2");
  }
  // Stack players
  for (let i = 0; i < offenseCount - 2; i++) {
    addPlayer(
      `offense-${i + 3}`,
      "offense",
      discX + 18 + i * 6, // ~18 yards deep, 6 yard spacing
      centerY,
      (i + 3).toString()
    );
  }

  // --- Defense Setup (Person Marking Base) ---
  // Defense marks offense players 1-to-1 by default, offset slightly
  for (let i = 1; i <= defenseCount; i++) {
    const offenseId = `offense-${i}`;
    const offensePlayer = items.find((item) => item.id === offenseId);

    if (offensePlayer) {
      // Mark the corresponding offense player (slightly downfield and right)
      addPlayer(
        `defense-${i}`,
        "defense",
        offensePlayer.x + 2,
        offensePlayer.y + 2,
        i.toString()
      );
    } else {
      // Fallback if no matching offense player (extra defenders): zone positions?
      // Just place them in a line
      addPlayer(
        `defense-${i}`,
        "defense",
        discX + 12 + (i - 1) * 5,
        centerY + 12,
        i.toString()
      );
    }
  }

  return items;
};

export const getInitialFormation = () => getStandardFormation(7, 0);
