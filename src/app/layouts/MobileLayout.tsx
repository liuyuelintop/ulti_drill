import React, { useState, useRef, useEffect } from "react";
import type {
  DraggableItem,
  PlaybookData,
} from "../../features/playbook/types";
import { MobileCanvas } from "../../features/playbook";
import { PlaySelector } from "../../features/playbook/components/PlaySelector";
import { PresetSelector } from "../../features/playbook/components/PresetSelector";
import Konva from "konva";

export interface MobileLayoutProps {
  // State
  currentFrameIndex: number;
  frames: DraggableItem[][];
  isPlaying: boolean;
  itemsToRender: DraggableItem[];
  animatingItems: DraggableItem[] | null;
  prevFrameItems: DraggableItem[] | undefined;

  // Refs
  stageRef: React.RefObject<Konva.Stage | null>;

  // Handlers
  onTogglePlay: () => void;
  onSelectFrame: (index: number) => void;
  onLoadPreset: (data: PlaybookData) => void;
  onLoadPlay: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTriggerLoadPlay: () => void;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  currentFrameIndex,
  frames,
  isPlaying,
  itemsToRender,
  animatingItems,
  prevFrameItems,
  stageRef,
  onTogglePlay,
  onSelectFrame,
  onLoadPreset,
  onLoadPlay,
  onTriggerLoadPlay,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Auto-scroll timeline
  useEffect(() => {
    if (timelineRef.current) {
      const activeBtn = timelineRef.current.children[
        currentFrameIndex
      ] as HTMLElement;
      if (activeBtn) {
        const containerWidth = timelineRef.current.offsetWidth;
        const btnLeft = activeBtn.offsetLeft;
        const btnWidth = activeBtn.offsetWidth;
        timelineRef.current.scrollTo({
          left: btnLeft - containerWidth / 2 + btnWidth / 2,
          behavior: "smooth",
        });
      }
    }
  }, [currentFrameIndex]);

  // Helper to close menu after selection
  const handleLoad = (action: () => void) => {
    action();
    setShowMenu(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900 overflow-hidden select-none">
      {/* Hidden File Input */}
      <input
        type="file"
        onChange={onLoadPlay}
        accept=".json"
        className="hidden"
        id="mobile-file-upload"
      />

      {/* LAYER 0: Canvas (Read-Only) */}
      <div className="absolute inset-0 z-0">
        <MobileCanvas
          ref={stageRef}
          currentItems={itemsToRender}
          prevFrameItems={prevFrameItems}
          animatingItems={animatingItems}
          selectedItemId={null}
          isPlaying={isPlaying}
          isRecording={false}
          readOnly={true}
          onDragEnd={() => {}} // No-op
          onSelect={() => {}} // No-op
        />
      </div>

      {/* LAYER 1: HUD */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between">
        {/* TOP BAR */}
        <div className="flex justify-between items-start p-4 pointer-events-auto bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="bg-white/10 text-white p-2 rounded-full backdrop-blur-md border border-white/20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <h1 className="text-white font-bold text-lg shadow-black drop-shadow-md">
              Tactical Player
            </h1>
          </div>

          {/* Frame Counter */}
          <div className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-white text-xs font-mono border border-white/10">
            {currentFrameIndex + 1} / {frames.length}
          </div>
        </div>

        {/* MENU DRAWER */}
        {showMenu && (
          <div className="absolute top-16 left-4 z-20 flex flex-col gap-2 animate-slide-in-left pointer-events-auto">
            <div className="bg-white rounded-xl shadow-xl p-4 w-64 space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Load Tactics
              </h3>
              <div className="flex flex-col gap-2">
                <PlaySelector
                  onSelect={(data) => handleLoad(() => onLoadPreset(data))}
                  onImport={() => handleLoad(onTriggerLoadPlay)}
                />
                <PresetSelector
                  onSelect={(data) => handleLoad(() => onLoadPreset(data))}
                />
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM BAR (Playback) */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe px-4 py-3 flex items-center gap-4">
          {/* Play/Pause */}
          <button
            onClick={onTogglePlay}
            className={`flex-none w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-transform active:scale-95 ${
              isPlaying
                ? "bg-amber-100 text-amber-600"
                : "bg-sky-600 text-white"
            }`}
          >
            {isPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          {/* Timeline Slider */}
          <div
            className="flex-1 relative h-12 flex items-center"
            ref={timelineRef}
          >
            <div className="flex gap-1 overflow-x-auto w-full no-scrollbar snap-x">
              {frames.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectFrame(idx)}
                  className={`flex-none w-10 h-8 rounded-md text-xs font-bold snap-center transition-all ${
                    currentFrameIndex === idx
                      ? "bg-primary-600 text-white scale-110 shadow-md"
                      : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
