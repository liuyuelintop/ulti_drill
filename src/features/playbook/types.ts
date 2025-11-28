export type ItemType = "offense" | "defense" | "disc";

export interface DraggableItem {
  id: string;
  x: number;
  y: number;
  type: ItemType;
  label?: string;
}

export interface PlaybookData {
  version: string;
  name: string;
  description?: string;
  frames: DraggableItem[][];
}
