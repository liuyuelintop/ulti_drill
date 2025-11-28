import { useState, useCallback } from "react";
import type { DraggableItem } from "../types";
import { getInitialFormation } from "../utils/formation";
import { cloneFrame } from "../utils/frames";

/**
 * usePlaybookState
 * 
 * Manages the core data model of the playbook:
 * - Frames list (the sequence of tactical setups)
 * - Current frame index (timeline position)
 * - Selection state (which player/disc is selected)
 * - Editing state (unsaved changes buffer)
 */
export const usePlaybookState = () => {
  const [frames, setFrames] = useState<DraggableItem[][]>([
    getInitialFormation(),
  ]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  
  // Temporary state for unsaved changes in the current frame
  const [editingFrame, setEditingFrame] = useState<DraggableItem[] | null>(
    null
  ); 
  
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // --- Derived State ---
  const currentItems = frames[currentFrameIndex];
  const itemsToRender = editingFrame || currentItems;
  const prevFrameItems =
    currentFrameIndex > 0 ? frames[currentFrameIndex - 1] : undefined;
  const isDirty = editingFrame !== null;

  // --- Editing Logic ---
  
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

  // --- Frame Management (CRUD) ---

  const addFrame = useCallback(() => {
    setFrames((prev) => {
      const newFrame = cloneFrame(prev[prev.length - 1]);
      return [...prev, newFrame];
    });
    setCurrentFrameIndex(frames.length);
  }, [frames.length]);

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
    
    // If deleting the last frame, step back.
    // Otherwise, stay at current index (next frame slides into place).
    if (currentFrameIndex === frames.length - 1) {
      setCurrentFrameIndex((prev) => Math.max(0, prev - 1));
    }
    setEditingFrame(null);
  }, [frames.length, currentFrameIndex]);

  const clearAllFrames = useCallback(() => {
    setFrames([getInitialFormation()]);
    setCurrentFrameIndex(0);
    setEditingFrame(null);
    setSelectedItemId(null);
  }, []);

  // --- Selection & Reset ---

  const selectItem = useCallback((id: string | null) => {
    setSelectedItemId(id);
  }, []);

  const resetToPrevious = useCallback(() => {
    if (!selectedItemId || !editingFrame) return;

    // Reset to the SAVED position in the CURRENT frame
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
