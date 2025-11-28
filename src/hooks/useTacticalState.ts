import { useState, useCallback } from "react";
import type { DraggableItem, ItemType } from "../types";
import { FIELD_WIDTH, ENDZONE_LENGTH, BRICK_MARK } from "../constants";

// --- HELPER: Initial State ---
export const getInitialFormation = () => {
  const items: DraggableItem[] = [];
  const CENTER_Y = FIELD_WIDTH / 2;
  const DISC_X = ENDZONE_LENGTH + BRICK_MARK;

  const addPlayer = (
    id: string,
    type: ItemType,
    x: number,
    y: number,
    label: string
  ) => {
    items.push({ id, type, x, y, label });
  };

  // Vert Stack Setup
  addPlayer("disc", "disc", DISC_X + 15, CENTER_Y + 5, "");
  addPlayer("offense-1", "offense", DISC_X, CENTER_Y, "1");
  addPlayer("offense-2", "offense", DISC_X - 60, CENTER_Y + 80, "2");
  for (let i = 0; i < 5; i++) {
    addPlayer(
      `offense-${i + 3}`,
      "offense",
      DISC_X + 140 + i * 50,
      CENTER_Y,
      (i + 3).toString()
    );
  }
  return items;
};

export const useTacticalState = () => {
  const [frames, setFrames] = useState<DraggableItem[][]>([
    getInitialFormation(),
  ]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [editingFrame, setEditingFrame] = useState<DraggableItem[] | null>(
    null
  ); // Temporary state for unsaved changes
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const currentItems = frames[currentFrameIndex];
  const itemsToRender = editingFrame || currentItems;
  const prevFrameItems =
    currentFrameIndex > 0 ? frames[currentFrameIndex - 1] : undefined;
  const isDirty = editingFrame !== null;

  const updateEditingFrame = useCallback(
    (id: string, x: number, y: number) => {
      // If not already editing, start with a copy of the current frame
      const sourceFrame =
        editingFrame || JSON.parse(JSON.stringify(currentItems));
      const updatedFrame = sourceFrame.map((item: DraggableItem) =>
        item.id === id ? { ...item, x, y } : item
      );
      setEditingFrame(updatedFrame);
    },
    [editingFrame, currentItems]
  );

  const saveChanges = useCallback(() => {
    if (!editingFrame) return;
    const newFrames = [...frames];
    newFrames[currentFrameIndex] = editingFrame;
    setFrames(newFrames);
    setEditingFrame(null);
  }, [editingFrame, frames, currentFrameIndex]);

  const discardChanges = useCallback(() => {
    setEditingFrame(null);
  }, []);

  const addFrame = useCallback(() => {
    const newFrame = JSON.parse(JSON.stringify(frames[frames.length - 1]));
    setFrames((prev) => [...prev, newFrame]);
    setCurrentFrameIndex((prev) => prev + 1);
  }, [frames]);

  const duplicateFrame = useCallback(() => {
    // Duplicate the current frame and insert it right after
    const frameToDuplicate = editingFrame || currentItems;
    const newFrame = JSON.parse(JSON.stringify(frameToDuplicate));
    const newFrames = [
      ...frames.slice(0, currentFrameIndex + 1),
      newFrame,
      ...frames.slice(currentFrameIndex + 1),
    ];
    setFrames(newFrames);
    setCurrentFrameIndex(currentFrameIndex + 1);
    setEditingFrame(null);
  }, [frames, currentFrameIndex, currentItems, editingFrame]);

  const deleteFrame = useCallback(() => {
    if (frames.length <= 1) return;
    const newFrames = frames.filter((_, i) => i !== currentFrameIndex);
    setFrames(newFrames);
    setCurrentFrameIndex((prev) => Math.max(0, prev - 1));
    setEditingFrame(null);
  }, [frames, currentFrameIndex]);

  const clearAllFrames = useCallback(() => {
    setFrames([getInitialFormation()]);
    setCurrentFrameIndex(0);
    setEditingFrame(null);
    setSelectedItemId(null);
  }, []);

  const selectItem = useCallback((id: string | null) => {
    setSelectedItemId(id);
  }, []);

  const resetToPrevious = useCallback(() => {
    if (!selectedItemId || !editingFrame) return;

    // Reset to the SAVED position in the CURRENT frame, not the previous frame
    const savedItem = currentItems.find((item) => item.id === selectedItemId);

    if (savedItem) {
      updateEditingFrame(selectedItemId, savedItem.x, savedItem.y);
    }
  }, [selectedItemId, editingFrame, currentItems, updateEditingFrame]);

  return {
    frames,
    setFrames,
    currentFrameIndex,
    setCurrentFrameIndex,
    editingFrame,
    setEditingFrame,
    selectedItemId,
    currentItems,
    itemsToRender,
    prevFrameItems,
    isDirty,
    updateEditingFrame,
    saveChanges,
    discardChanges,
    addFrame,
    duplicateFrame,
    deleteFrame,
    clearAllFrames,
    selectItem,
    resetToPrevious,
  };
};
