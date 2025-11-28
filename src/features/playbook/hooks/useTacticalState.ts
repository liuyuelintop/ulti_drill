import { useState, useCallback } from "react";
import type { DraggableItem } from "../types";
import { getInitialFormation } from "../utils/formation";
import { cloneFrame } from "../utils/frames";

// Owns tactical frames, editing buffer, selection, and frame CRUD.
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
      setEditingFrame((prev) => {
        const sourceFrame = prev || cloneFrame(currentItems);
        return sourceFrame.map((item) =>
          item.id === id ? { ...item, x, y } : item
        );
      });
    },
    [currentItems]
  );

  const saveChanges = useCallback(() => {
    if (!editingFrame) return;
    setFrames((prev) => {
      const next = [...prev];
      next[currentFrameIndex] = cloneFrame(editingFrame);
      return next;
    });
    setEditingFrame(null);
  }, [editingFrame, currentFrameIndex]);

  const discardChanges = useCallback(() => {
    setEditingFrame(null);
  }, []);

  const addFrame = useCallback(() => {
    setFrames((prev) => {
      const newFrame = cloneFrame(prev[prev.length - 1]);
      return [...prev, newFrame];
    });
    setCurrentFrameIndex((prev) => prev + 1);
  }, []);

  const duplicateFrame = useCallback(() => {
    // Duplicate the current frame and insert it right after
    const frameToDuplicate = cloneFrame(editingFrame || currentItems);
    setFrames((prev) => [
      ...prev.slice(0, currentFrameIndex + 1),
      frameToDuplicate,
      ...prev.slice(currentFrameIndex + 1),
    ]);
    setCurrentFrameIndex(currentFrameIndex + 1);
    setEditingFrame(null);
  }, [currentFrameIndex, currentItems, editingFrame]);

  const deleteFrame = useCallback(() => {
    if (frames.length <= 1) return;
    setFrames((prev) => prev.filter((_, i) => i !== currentFrameIndex));
    setCurrentFrameIndex((prev) => Math.max(0, prev - 1));
    setEditingFrame(null);
  }, [frames.length, currentFrameIndex]);

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
