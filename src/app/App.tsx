import { useRef, useEffect } from "react";
import Konva from "konva";
import {
  useAnimation,
  useVideoExport,
  useFileHandler,
  usePlaybookState,
} from "../features/playbook";
import { useIsMobile } from "../shared/hooks/useIsMobile";
import { DesktopLayout } from "./layouts/DesktopLayout";
import { MobileLayout } from "./layouts/MobileLayout";

const App = () => {
  // --- RESPONSIVE CHECK ---
  const isMobile = useIsMobile();

  // --- REFS ---
  const stageRef = useRef<Konva.Stage>(null);

  // --- CUSTOM HOOKS ---
  const {
    frames,
    setFrames,
    currentFrameIndex,
    setCurrentFrameIndex,
    setEditingFrame,
    selectedItemId,
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
  } = usePlaybookState();

  const {
    animatingItems,
    isPlaying,
    setIsPlaying,
    togglePlay,
  } = useAnimation({
    frames,
    setCurrentFrameIndex,
  });

  const {
    isRecording,
    isExporting,
    handleExportVideo,
  } = useVideoExport({
    isDirty,
    isPlaying,
    setIsPlaying,
    setCurrentFrameIndex,
    stageRef,
  });

  const {
    fileInputRef,
    savePlay,
    loadPlay,
    loadPlaybookData,
    triggerLoadPlay,
  } = useFileHandler({
    frames,
    setFrames,
    setCurrentFrameIndex,
    setEditingFrame,
    isDirty,
  });

  // --- INTERACTION STATE ---
  const interactionState = {
    isEditable: !isPlaying && !isRecording && !isExporting,
  };

  // --- DERIVED STATE ---
  const offenseCount = itemsToRender.filter((i) => i.type === "offense").length;
  const defenseCount = itemsToRender.filter((i) => i.type === "defense").length;

  // --- HANDLERS ---
  const handleAddFrame = () => {
    if (isDirty) {
      alert("Please save or discard changes before adding a new frame.");
      return;
    }
    addFrame();
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>, id: string) => {
    if (!interactionState.isEditable) return;
    updateEditingFrame(id, e.target.x(), e.target.y());
  };

  const handleClearAllFrames = () => {
    if (isDirty) {
      const confirm = window.confirm(
        "Discard unsaved changes before clearing all frames?"
      );
      if (!confirm) return;
    }
    const confirmClear = window.confirm(
      "Are you sure you want to clear ALL frames?"
    );
    if (!confirmClear) return;

    clearAllFrames();
    setIsPlaying(false);
  };

  const ensureCleanAnd = (action: () => void) => {
    if (isDirty) {
      const confirm = window.confirm("Discard unsaved changes?");
      if (!confirm) return;
      setEditingFrame(null);
    }
    action();
  };

  const handleDeleteFrame = () => {
    const confirmDelete = window.confirm(
      "Delete current frame? This cannot be undone."
    );
    if (!confirmDelete) return;
    deleteFrame();
  };

  const handleSelectFrame = (idx: number) => {
    if (isRecording || isExporting) return;
    ensureCleanAnd(() => {
      setCurrentFrameIndex(idx);
      if (isPlaying) togglePlay();
    });
  };

  const handleNextFrame = () => {
    if (isRecording || isExporting || isPlaying) return;
    ensureCleanAnd(() =>
      setCurrentFrameIndex((prev) => Math.min(prev + 1, frames.length - 1))
    );
  };

  const handlePrevFrame = () => {
    if (isRecording || isExporting || isPlaying) return;
    ensureCleanAnd(() =>
      setCurrentFrameIndex((prev) => Math.max(prev - 1, 0))
    );
  };

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && selectedItemId) {
        selectItem(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItemId, selectItem]);

  // --- PROPS BUNDLING ---
  const layoutProps = {
    // State
    frames,
    currentFrameIndex,
    isDirty,
    isPlaying,
    isRecording,
    isExporting,
    selectedItemId,
    itemsToRender,
    prevFrameItems,
    animatingItems,
    offenseCount,
    defenseCount,

    // Refs
    stageRef,
    fileInputRef,

    // Handlers
    onLoadPlay: loadPlay,
    onLoadPreset: loadPlaybookData,
    onTriggerLoadPlay: triggerLoadPlay,
    onSavePlay: savePlay,
    onExportVideo: handleExportVideo,
    onSaveChanges: saveChanges,
    onDiscardChanges: discardChanges,
    onDragEnd: handleDragEnd,
    onSelect: selectItem,
    onResetItem: resetToPrevious,
    onAddFrame: handleAddFrame,
    onDuplicateFrame: duplicateFrame,
    onDeleteFrame: handleDeleteFrame,
    onClearAllFrames: handleClearAllFrames,
    onSelectFrame: handleSelectFrame,
    onNextFrame: handleNextFrame,
    onPrevFrame: handlePrevFrame,
    onTogglePlay: togglePlay,
    onUpdateTeamConfig: updateTeamConfig,
  };

  // --- RENDER ---
  return isMobile ? (
    <MobileLayout {...layoutProps} />
  ) : (
    <DesktopLayout {...layoutProps} />
  );
};

export default App;
