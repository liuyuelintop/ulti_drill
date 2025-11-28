import React from "react";

interface PlaybackControlsProps {
  isRecording: boolean;
  isPlaying: boolean;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrevFrame: () => void;
  onTogglePlay: () => void;
  onNextFrame: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isRecording,
  isPlaying,
  canGoPrev,
  canGoNext,
  onPrevFrame,
  onTogglePlay,
  onNextFrame,
}) => {
  return (
    <div className="shrink-0 bg-slate-50 rounded-lg border border-slate-200 p-3">
      <div className="flex items-center gap-2">
        {/* Previous Frame */}
        <button
          onClick={onPrevFrame}
          disabled={!canGoPrev || isRecording}
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
          disabled={!canGoNext || isRecording}
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
  );
};

export default PlaybackControls;
