import React from "react";
import type { DraggableItem } from "../types";
import FrameStrip from "./timeline/FrameStrip";
import PlaybackControls from "./timeline/PlaybackControls";
import FrameActions from "./timeline/FrameActions";
import DangerZone from "./timeline/DangerZone";

interface TimelineControlsProps {
  frames: DraggableItem[][];
  currentFrameIndex: number;
  isRecording: boolean;
  isPlaying: boolean;
  hasSelectedItem: boolean;
  isDirty: boolean;
  onClearAll: () => void;
  onDeleteFrame: () => void;
  onDuplicateFrame: () => void;
  onAddFrame: () => void;
  onSelectFrame: (index: number) => void;
  onResetItem: () => void;
  onTogglePlay: () => void;
  onNextFrame: () => void;
  onPrevFrame: () => void;
}

const TimelineControls: React.FC<TimelineControlsProps> = ({
  frames,
  currentFrameIndex,
  isRecording,
  isPlaying,
  hasSelectedItem,
  isDirty,
  onClearAll,
  onDeleteFrame,
  onDuplicateFrame,
  onAddFrame,
  onSelectFrame,
  onResetItem,
  onTogglePlay,
  onNextFrame,
  onPrevFrame,
}) => {
  const canResetItem = hasSelectedItem && isDirty;
  const canGoPrev = currentFrameIndex > 0;
  const canGoNext = currentFrameIndex < frames.length - 1;

  return (
    <footer className="w-full bg-white border-t-2 border-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-5">
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary-600"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <h3 className="font-bold text-slate-900 text-base uppercase tracking-wide">
            ⏱️ Timeline Editor
          </h3>
        </div>

        {/* FRAME SEQUENCE (帧序列) */}
        <div className="mb-5">
          <FrameStrip
            frames={frames}
            currentFrameIndex={currentFrameIndex}
            isRecording={isRecording}
            onSelectFrame={onSelectFrame}
            onAddFrame={onAddFrame}
          />
        </div>

        {/* CONTROL ROW: Playback + Frame Actions + Danger Zone */}
        <div className="flex flex-wrap gap-4 items-start">
          {/* 播放控制 (Playback Controls) */}
          <PlaybackControls
            isRecording={isRecording}
            isPlaying={isPlaying}
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
            onPrevFrame={onPrevFrame}
            onTogglePlay={onTogglePlay}
            onNextFrame={onNextFrame}
          />

          {/* 帧操作 (Frame Actions) */}
          <FrameActions
            isRecording={isRecording}
            canResetItem={canResetItem}
            isDirty={isDirty}
            hasSelectedItem={hasSelectedItem}
            onResetItem={onResetItem}
            onDuplicateFrame={onDuplicateFrame}
          />

          {/* 危险区 (Danger Zone) */}
          <DangerZone
            isRecording={isRecording}
            onDeleteFrame={onDeleteFrame}
            onClearAll={onClearAll}
          />
        </div>
      </div>
    </footer>
  );
};

export default TimelineControls;
