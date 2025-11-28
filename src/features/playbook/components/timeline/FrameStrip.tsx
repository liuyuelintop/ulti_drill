import React from "react";
import type { DraggableItem } from "../../types";

interface FrameStripProps {
  frames: DraggableItem[][];
  currentFrameIndex: number;
  isRecording: boolean;
  onSelectFrame: (index: number) => void;
  onAddFrame: () => void;
}

export const FrameStrip: React.FC<FrameStripProps> = ({
  frames,
  currentFrameIndex,
  isRecording,
  onSelectFrame,
  onAddFrame,
}) => {
  return (
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
  );
};

export default FrameStrip;
