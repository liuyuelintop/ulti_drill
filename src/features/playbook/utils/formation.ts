import type { DraggableItem, ItemType } from "../types";
import { BRICK_MARK, ENDZONE_LENGTH, FIELD_WIDTH } from "../constants/canvas";

export const getInitialFormation = () => {
  const items: DraggableItem[] = [];
  const centerY = FIELD_WIDTH / 2;
  const discX = ENDZONE_LENGTH + BRICK_MARK;

  const addPlayer = (
    id: string,
    type: ItemType,
    x: number,
    y: number,
    label: string
  ) => {
    items.push({ id, type, x, y, label });
  };

  // Vertical stack setup
  addPlayer("disc", "disc", discX + 15, centerY + 5, "");
  addPlayer("offense-1", "offense", discX, centerY, "1");
  addPlayer("offense-2", "offense", discX - 60, centerY + 80, "2");

  for (let i = 0; i < 5; i++) {
    addPlayer(
      `offense-${i + 3}`,
      "offense",
      discX + 140 + i * 50,
      centerY,
      (i + 3).toString()
    );
  }

  return items;
};
