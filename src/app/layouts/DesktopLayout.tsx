import React from "react";
import Konva from "konva";
import {
  HeaderControls,
  HelpFooter,
  PlaybookCanvas,
  TimelineControls,
} from "../../features/playbook";
import type { DraggableItem } from "../../features/playbook/types";

export interface AppLayoutProps {
  // State
  frames: DraggableItem[][];
  currentFrameIndex: number;
  isDirty: boolean;
  isPlaying: boolean;
  isRecording: boolean;
  isExporting: boolean;
  selectedItemId: string | null;
  itemsToRender: DraggableItem[];
  prevFrameItems: DraggableItem[] | undefined;
  animatingItems: DraggableItem[] | null;

  // Refs
  stageRef: React.RefObject<Konva.Stage | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;

  // Handlers - File Ops
  onLoadPlay: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTriggerLoadPlay: () => void;
  onSavePlay: () => void;
  onExportVideo: () => void;

  // Handlers - Edit Ops
  onSaveChanges: () => void;
  onDiscardChanges: () => void;
  onDragEnd: (e: any, id: string) => void;
  onSelect: (id: string | null) => void;
  onResetItem: () => void;

  // Handlers - Timeline Ops
  onAddFrame: () => void;
  onDuplicateFrame: () => void;
  onDeleteFrame: () => void;
  onClearAllFrames: () => void;
  onSelectFrame: (index: number) => void;
  onNextFrame: () => void;
  onPrevFrame: () => void;
  onTogglePlay: () => void;
}

export const DesktopLayout: React.FC<AppLayoutProps> = ({
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
  
  // Refs
  stageRef,
  fileInputRef,

  // Handlers
  onLoadPlay,
  onTriggerLoadPlay,
  onSavePlay,
  onExportVideo,
  onSaveChanges,
  onDiscardChanges,
  onDragEnd,
  onSelect,
  onResetItem,
  onAddFrame,
  onDuplicateFrame,
  onDeleteFrame,
  onClearAllFrames,
  onSelectFrame,
  onNextFrame,
  onPrevFrame,
  onTogglePlay,
}) => {
  return (
    <div className="flex flex-col h-screen font-sans text-slate-900 bg-slate-50">
      {/* Hidden file input for load functionality */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onLoadPlay}
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
        onLoadPlay={onTriggerLoadPlay}
        onSavePlay={onSavePlay}
        onExportVideo={onExportVideo}
        isRecording={isRecording}
        isExporting={isExporting}
        onSaveChanges={onSaveChanges}
        onDiscardChanges={onDiscardChanges}
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
            onDragEnd={onDragEnd}
            onSelect={onSelect}
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
        onClearAll={onClearAllFrames}
        onDeleteFrame={onDeleteFrame}
        onDuplicateFrame={onDuplicateFrame}
        onAddFrame={onAddFrame}
        onSelectFrame={onSelectFrame}
        onResetItem={onResetItem}
        onTogglePlay={onTogglePlay}
        onNextFrame={onNextFrame}
        onPrevFrame={onPrevFrame}
      />

      {/* HELP FOOTER */}
      <HelpFooter />
    </div>
  );
};
