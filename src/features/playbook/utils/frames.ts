import type { DraggableItem, PlaybookData } from "../types";

// Lightweight helpers shared across hooks for cloning and validating frame data.

// Clone a frame without carrying references to the original items.
export const cloneFrame = (frame: DraggableItem[]): DraggableItem[] =>
  frame.map((item) => ({ ...item }));

// Guard to ensure JSON payloads look like an array of frames with typed items.
export const isValidFramesArray = (framesCandidate: unknown): framesCandidate is DraggableItem[][] =>
  Array.isArray(framesCandidate) &&
  framesCandidate.every(
    (frame) =>
      Array.isArray(frame) &&
      frame.every(
        (item) =>
          item &&
          typeof (item as DraggableItem).id === "string" &&
          typeof (item as DraggableItem).type === "string" &&
          typeof (item as DraggableItem).x === "number" &&
          typeof (item as DraggableItem).y === "number"
      )
  );

export const isValidPlaybook = (data: PlaybookData): boolean =>
  Boolean(data.version && isValidFramesArray(data.frames));
