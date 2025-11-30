import { useState, useCallback } from "react";
import type { DraggableItem } from "../types";
import { getInitialFormation, getStandardFormation } from "../utils/formation";
import { cloneFrame } from "../utils/frames";
import { DEFENSE_OFFSETS } from "../constants/canvas";

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

  const updateTeamConfig = useCallback(
    (offenseCount: number, defenseCount: number) => {
      // Generate standard formation for the requested count to get default positions (fallback)
      const standardItems = getStandardFormation(offenseCount, defenseCount);
      const sourceFrame = editingFrame || currentItems;
      const newFrame: DraggableItem[] = [];

      // Always keep the disc
      const disc = sourceFrame.find((item) => item.id === "disc");
      if (disc) {
        newFrame.push(disc);
      } else {
        const standardDisc = standardItems.find((item) => item.id === "disc");
        if (standardDisc) newFrame.push(standardDisc);
      }

      // Handle Offense (Preserve existing positions)
      for (let i = 1; i <= offenseCount; i++) {
        const id = `offense-${i}`;
        const existing = sourceFrame.find((item) => item.id === id);
        if (existing) {
          newFrame.push(existing);
        } else {
          const standard = standardItems.find((item) => item.id === id);
          if (standard) newFrame.push(standard);
        }
      }

      // Detect Formation Type (Heuristic)
      // Horizontal Stack: Cutters (e.g., 4 and 5) share similar X coordinates
      const off4 = sourceFrame.find((i) => i.id === "offense-4");
      const off5 = sourceFrame.find((i) => i.id === "offense-5");
      const isHorizontalStack =
        off4 && off5 && Math.abs(off4.x - off5.x) < 20;

      // Handle Defense (Anchor to Offense with Formation Offsets)
      for (let i = 1; i <= defenseCount; i++) {
        const id = `defense-${i}`;
        const existing = sourceFrame.find((item) => item.id === id);
        const offensePartner = newFrame.find((item) => item.id === `offense-${i}`);

        if (existing) {
          // Keep existing defense player if they are already on the field
          newFrame.push(existing);
        } else if (offensePartner) {
          // NEW DEFENDER: Calculate position based on Offense partner
          let offsetX = 20;
          let offsetY = 20;

          if (isHorizontalStack) {
            // Horizontal Stack Offsets
            if (i === 1) {
              // Center Handler
              offsetX = DEFENSE_OFFSETS.HORIZONTAL.HANDLER_CENTER.x;
              offsetY = DEFENSE_OFFSETS.HORIZONTAL.HANDLER_CENTER.y;
            } else if (i === 2 || i === 3) {
              // Wing Handlers
              offsetX = DEFENSE_OFFSETS.HORIZONTAL.HANDLER_WING.x;
              offsetY = DEFENSE_OFFSETS.HORIZONTAL.HANDLER_WING.y;
            } else {
              // Cutters (4-7)
              offsetX = DEFENSE_OFFSETS.HORIZONTAL.CUTTER.x;
              offsetY = DEFENSE_OFFSETS.HORIZONTAL.CUTTER.y;
            }
          } else {
            // Vertical Stack Offsets (Default)
            if (i === 1) {
              // Handler
              offsetX = DEFENSE_OFFSETS.VERTICAL.HANDLER.x;
              offsetY = DEFENSE_OFFSETS.VERTICAL.HANDLER.y;
            } else if (i === 2) {
              // Dump
              offsetX = DEFENSE_OFFSETS.VERTICAL.DUMP.x;
              offsetY = DEFENSE_OFFSETS.VERTICAL.DUMP.y;
            } else {
              // Stack (3-7)
              offsetX = DEFENSE_OFFSETS.VERTICAL.STACK.x;
              offsetY = DEFENSE_OFFSETS.VERTICAL.STACK.y;
            }
          }

          newFrame.push({
            id,
            type: "defense",
            x: offensePartner.x + offsetX,
            y: offensePartner.y + offsetY,
            label: i.toString(),
          });
        } else {
          // Fallback: Use standard formation position if no offense partner found
          const standard = standardItems.find((item) => item.id === id);
          if (standard) newFrame.push(standard);
        }
      }

      setEditingFrame(newFrame);
    },
    [editingFrame, currentItems]
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
    updateTeamConfig,
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
