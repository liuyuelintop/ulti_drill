import React from "react";
import { Button } from "./ui/Button";
import type { DraggableItem } from "../types";

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
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1">
              {frames.map((_, idx) => {
                const isActive = idx === currentFrameIndex;

                return (
                  <button
                    key={idx}
                    onClick={() => onSelectFrame(idx)}
                    className={`
                      min-w-[100px] h-16 rounded-lg border-2
                      flex flex-col items-center justify-center text-xs font-semibold
                      transition-all duration-200 shrink-0 relative
                      ${
                        isActive
                          ? "bg-white border-emerald-500 text-emerald-700 shadow-md ring-2 ring-emerald-500/20"
                          : "bg-white border-slate-200 text-slate-600 hover:border-sky-400 hover:text-sky-700 hover:-translate-y-0.5 hover:shadow-sm"
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                    disabled={isRecording}
                    aria-label={`Frame ${idx + 1}`}
                    aria-current={isActive ? "true" : "false"}
                  >
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
                      Frame
                    </div>
                    <div className="text-base font-bold">{idx + 1}</div>
                  </button>
                );
              })}

              {/* Add Frame Button */}
              <button
                onClick={onAddFrame}
                disabled={isRecording}
                className="min-w-[100px] h-16 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-400 hover:text-emerald-500 hover:bg-white hover:-translate-y-0.5 transition-all duration-200 shrink-0"
                aria-label="Add new frame"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span className="text-[9px] font-medium mt-0.5">Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* CONTROL ROW: Playback + Frame Actions + Danger Zone */}
        <div className="flex flex-wrap gap-4 items-start">
          {/* 播放控制 (Playback Controls) */}
          <div className="shrink-0 bg-slate-50 rounded-lg border border-slate-200 p-3">
            <div className="flex items-center gap-2">
              {/* Previous Frame */}
              <button
                onClick={onPrevFrame}
                disabled={currentFrameIndex === 0 || isRecording || isPlaying}
                className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous frame"
                title="Previous frame"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="w-4 h-4"
                >
                  <polygon points="19 20 9 12 19 4 19 20" />
                  <line x1="5" y1="19" x2="5" y2="5" />
                </svg>
              </button>

              {/* Play/Pause */}
              <button
                onClick={onTogglePlay}
                disabled={isRecording}
                className={`
                  w-11 h-11 rounded-lg flex items-center justify-center
                  bg-linear-to-br from-emerald-500 to-emerald-600
                  shadow-md shadow-emerald-500/25
                  text-white
                  hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/30
                  active:scale-95
                  transition-all duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed
                `}
                aria-label={isPlaying ? "Pause" : "Play"}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 ml-0.5"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </button>

              {/* Next Frame */}
              <button
                onClick={onNextFrame}
                disabled={
                  currentFrameIndex === frames.length - 1 ||
                  isRecording ||
                  isPlaying
                }
                className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next frame"
                title="Next frame"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="w-4 h-4"
                >
                  <polygon points="5 4 15 12 5 20 5 4" />
                  <line x1="19" y1="5" x2="19" y2="19" />
                </svg>
              </button>
            </div>
          </div>

          {/* 帧操作 (Frame Actions) */}
          <div className="shrink-0 bg-slate-50 rounded-lg border border-slate-200 p-3">
            <div className="flex items-center gap-2">
              <Button
                onClick={onResetItem}
                variant="ghost"
                size="sm"
                disabled={isRecording || !canResetItem}
                title={
                  !isDirty
                    ? "Make changes to a frame first"
                    : !hasSelectedItem
                    ? "Select an item to reset"
                    : "Reset selected item to last saved position"
                }
                aria-label="Reset selected item"
              >
                🔄 Reset
              </Button>

              <Button
                onClick={onDuplicateFrame}
                variant="ghost"
                size="sm"
                disabled={isRecording}
                title="Duplicate current frame"
                aria-label="Duplicate current frame"
              >
                📋 Duplicate
              </Button>
            </div>
          </div>

          {/* 危险区 (Danger Zone) */}
          <div className="shrink-0 bg-red-50/50 rounded-lg border border-red-200 p-3">
            <div className="flex items-center gap-2">
              <Button
                onClick={onDeleteFrame}
                variant="danger"
                size="sm"
                disabled={isRecording}
                title="Delete current frame"
                aria-label="Delete current frame"
              >
                🗑️ Delete
              </Button>

              <Button
                onClick={onClearAll}
                variant="danger"
                size="sm"
                disabled={isRecording}
                title="Clear all frames"
                aria-label="Clear all frames"
              >
                ⚠️ Clear All
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default TimelineControls;
