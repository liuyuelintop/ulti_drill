import { useRef, useEffect } from "react";
import Konva from "konva";
import {
  HeaderControls,
  HelpFooter,
  PlaybookCanvas,
  TimelineControls,
  useAnimation,
  useVideoExport,
  useFileHandler,
  usePlaybookState,
} from "../features/playbook";

const App = () => {
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

  const { fileInputRef, savePlay, loadPlay, triggerLoadPlay } = useFileHandler({
    frames,
    setFrames,
    setCurrentFrameIndex,
    setEditingFrame,
    isDirty,
  });

  // --- INTERACTION STATE ---
  // Centralized logic for what is allowed in the current state
  const interactionState = {
    isEditable: !isPlaying && !isRecording && !isExporting,
    canExport: !isPlaying && !isRecording && !isExporting && !isDirty,
    canLoadSave: !isRecording && !isExporting,
    canModifyTimeline: !isRecording && !isExporting, // Add/Delete/Clear frames
  };

  // --- HANDLERS ---
  const handleAddFrame = () => {
    if (isDirty) {
      alert("Please save or discard changes before adding a new frame.");
      return;
    }
    addFrame();
  };

  const handleDragEnd = (e: any, id: string) => {
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
  // Deselect item on 'Delete' key press
  // Reset item on 'r' key press (if selected)
  // etc.

  // Effect for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Deselect item on 'Delete' key
      if (event.key === "Escape" && selectedItemId) {
        selectItem(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedItemId, selectItem]); // Dependencies for the effect

  return (
    <div className="flex flex-col h-screen font-sans text-slate-900 bg-slate-50">
      {/* Hidden file input for load functionality */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={loadPlay}
        accept=".json"
        className="hidden"
        aria-label="File input for loading playbook"
      />

      {/* STICKY HEADER - Three Rows */}
      <HeaderControls
        currentFrameIndex={currentFrameIndex}
        totalFrames={frames.length}
        isDirty={isDirty}
        isPlaying={isPlaying}
        onLoadPlay={triggerLoadPlay}
        onSavePlay={savePlay}
        onExportVideo={handleExportVideo}
        isRecording={isRecording}
        isExporting={isExporting}
        onSaveChanges={saveChanges}
        onDiscardChanges={discardChanges}
      />

      {/* CANVAS - Takes remaining space */}
      <main className="flex-1 flex items-center justify-center p-6 overflow-auto">
        <div className="w-full max-w-6xl">
          <PlaybookCanvas
            ref={stageRef}
            currentItems={itemsToRender}
            prevFrameItems={prevFrameItems}
            animatingItems={animatingItems}
            selectedItemId={selectedItemId}
            isPlaying={isPlaying}
            isRecording={isRecording}
            onDragEnd={handleDragEnd}
            onSelect={selectItem}
          />
        </div>
      </main>

      {/* TIMELINE FOOTER */}
      <TimelineControls
        frames={frames}
        currentFrameIndex={currentFrameIndex}
        isRecording={isRecording || isExporting}
        isPlaying={isPlaying}
        hasSelectedItem={!!selectedItemId}
        isDirty={isDirty}
        onClearAll={handleClearAllFrames}
        onDeleteFrame={handleDeleteFrame}
        onDuplicateFrame={duplicateFrame}
        onAddFrame={handleAddFrame}
        onSelectFrame={handleSelectFrame}
        onResetItem={resetToPrevious}
        onTogglePlay={togglePlay}
        onNextFrame={handleNextFrame}
        onPrevFrame={handlePrevFrame}
      />

      {/* HELP FOOTER */}
      <HelpFooter />
    </div>
  );
};

export default App;