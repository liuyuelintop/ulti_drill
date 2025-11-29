import React, { useState, useRef, useEffect } from "react";
import type { AppLayoutProps } from "./DesktopLayout";
import { MobileCanvas } from "../../features/playbook";
import { useOrientation } from "../../shared/hooks/useOrientation";

export const MobileLayout: React.FC<AppLayoutProps> = ({
  // State
  currentFrameIndex,
  frames,
  isDirty,
  isPlaying,
  isRecording,
  itemsToRender,
  prevFrameItems,
  animatingItems,
  selectedItemId,

  // Refs
  stageRef,
  fileInputRef,

  // Handlers - File Ops
  onLoadPlay,
  onTriggerLoadPlay,
  onSavePlay,
  onExportVideo,

  // Handlers - Edit Ops
  onSaveChanges,
  onDiscardChanges,
  onDragEnd,
  onSelect,
  onResetItem,

  // Handlers - Timeline Ops
  onAddFrame,
  onDuplicateFrame,
  onDeleteFrame,
  onClearAllFrames,
  onTogglePlay,
  onSelectFrame,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const isLandscape = useOrientation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleHelp = () => setShowHelp(!showHelp);

  // Safe handlers that close menu
  const handleAction = (action: () => void) => {
    action();
    setIsMenuOpen(false);
  };

  // Auto-scroll timeline to keep active frame in view
  useEffect(() => {
    if (timelineRef.current) {
      const activeBtn = timelineRef.current.children[
        currentFrameIndex
      ] as HTMLElement;
      if (activeBtn) {
        const containerWidth = timelineRef.current.offsetWidth;
        const btnLeft = activeBtn.offsetLeft;
        const btnWidth = activeBtn.offsetWidth;

        // Scroll to center
        timelineRef.current.scrollTo({
          left: btnLeft - containerWidth / 2 + btnWidth / 2,
          behavior: "smooth",
        });
      }
    }
  }, [currentFrameIndex]);

  // Portrait mode warning
  if (!isLandscape) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-8">
        <div className="text-white text-center">
          {/* Rotate phone icon */}
          <svg
            className="w-24 h-24 mx-auto mb-6 animate-bounce"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <path d="M12 18h.01" />
            <path d="M8 2l8 10" strokeDasharray="2 2" />
          </svg>

          <h2 className="text-2xl font-bold mb-4">请旋转手机</h2>
          <p className="text-slate-300 text-lg">
            为获得最佳编辑体验
            <br />
            请将手机横屏使用
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-100 overflow-hidden select-none">
      {/* Hidden Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onLoadPlay}
        accept=".json"
        className="hidden"
      />

      {/* LAYER 0: Full Screen Canvas */}
      <div className="absolute inset-0 z-0">
        <MobileCanvas
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

      {/* LAYER 1: HUD & Panels */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between">
        {/* ==================== TOP BAR ==================== */}
        <div className="flex justify-between items-start p-4 pointer-events-auto bg-gradient-to-b from-black/10 to-transparent">
          <button
            onClick={toggleMenu}
            className="bg-white/90 p-2.5 rounded-full shadow-md backdrop-blur-sm text-slate-700 active:scale-95 transition-transform"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          {/* Right side: Recording badge or Help button */}
          <div className="flex items-center gap-2">
            {isRecording && (
              <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse shadow-md">
                REC
              </div>
            )}
            <button
              onClick={toggleHelp}
              className="bg-white/90 p-2.5 rounded-full shadow-md backdrop-blur-sm text-slate-700 active:scale-95 transition-transform"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </button>
          </div>
        </div>

        {/* ==================== HELP TIPS (Slide down from top) ==================== */}
        {showHelp && (
          <div className="absolute top-0 left-0 right-0 pointer-events-auto animate-slide-down z-20">
            <div className="bg-sky-50/95 backdrop-blur-md border-b border-sky-200 shadow-lg">
              <div className="px-4 py-3">
                {/* Header with close button */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sky-700 text-sm font-semibold">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                    Quick Tips
                  </div>
                  <button
                    onClick={toggleHelp}
                    className="text-sky-600 hover:text-sky-800 active:scale-95 transition-transform p-1"
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
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Tips content */}
                <div className="flex flex-col gap-1.5 text-sky-700 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-sky-500 flex-none mt-0.5">•</span>
                    <span>Tap a player or disc, then drag to set new position</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sky-500 flex-none mt-0.5">•</span>
                    <span>Use "Reset Selected Item" to undo changes to an item</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sky-500 flex-none mt-0.5">•</span>
                    <span>Tap timeline frames to navigate between plays</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sky-500 flex-none mt-0.5">•</span>
                    <span>Save changes before switching frames or playing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== BOTTOM PANEL (Fixed) ==================== */}
        <div className="pointer-events-auto bg-white/90 backdrop-blur-md border-t border-slate-200/50 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] pb-safe flex flex-col">
          {/* Save/Discard Bar (appears when dirty) */}
          {isDirty && (
            <div className="px-4 py-1.5 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
              <button
                onClick={onDiscardChanges}
                className="flex-1 px-2 py-1.5 rounded-lg font-bold text-xs text-slate-500 border border-slate-200 bg-white shadow-sm active:scale-95 transition-transform"
              >
                ✕ Discard All changes
              </button>

              <button
                onClick={onSaveChanges}
                className="flex-1 px-2 py-1.5 rounded-lg font-bold text-xs bg-emerald-500 text-white shadow-md active:scale-95 transition-transform"
              >
                ✓ Save Changes
              </button>
            </div>
          )}

          {/* -------------------- 紧凑单行控制栏 -------------------- */}
          <div className="px-2 py-1.5 bg-white/90 backdrop-blur-md flex items-center gap-2">
            {/* Play button - 36×36 */}
            <button
              onClick={onTogglePlay}
              className={`flex-none flex items-center justify-center w-9 h-9 rounded-full shadow-sm transition-all active:scale-95
                    ${
                      isPlaying
                        ? "bg-amber-100 text-amber-700 border border-amber-200"
                        : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    }
                `}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>

            {/* Reset - 32×32, icon-only */}
            <button
              onClick={onResetItem}
              disabled={!selectedItemId}
              className={`flex-none w-8 h-8 flex items-center justify-center rounded transition-all active:scale-95
                    ${
                      selectedItemId
                        ? "text-slate-700 hover:bg-slate-100"
                        : "text-slate-300 cursor-not-allowed"
                    }`}
              title="Reset Selected"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>

            {/* Duplicate - 32×32, icon-only */}
            <button
              onClick={onDuplicateFrame}
              className="flex-none w-8 h-8 flex items-center justify-center rounded text-slate-700 hover:bg-slate-100 transition-all active:scale-95"
              title="Duplicate Frame"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>

            {/* Delete - 32×32, icon-only */}
            <button
              onClick={onDeleteFrame}
              className="flex-none w-8 h-8 flex items-center justify-center rounded text-red-600 hover:bg-red-50 transition-all active:scale-95"
              title="Delete Frame"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>

            {/* Timeline - compact */}
            <div
              ref={timelineRef}
              className="flex-1 flex overflow-x-auto gap-1.5 scrollbar-hide snap-x snap-mandatory"
            >
              {frames.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => !isPlaying && onSelectFrame(idx)}
                  className={`
                                flex-none w-12 h-9 rounded flex items-center justify-center text-xs font-bold snap-center border-2 transition-all
                                ${
                                  currentFrameIndex === idx
                                    ? "border-primary-500 bg-primary-50 text-primary-600 shadow-sm scale-105"
                                    : "border-slate-200 bg-slate-50 text-slate-400"
                                }
                            `}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {/* Add button - 36×36 */}
            <button
              onClick={onAddFrame}
              className="flex-none w-9 h-9 flex items-center justify-center rounded-lg bg-gray-300 hover:bg-gray-400 text-white shadow-sm active:scale-95 transition-transform"
              title="Add Frame"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="12" y1="6" x2="12" y2="18" />
                <line x1="6" y1="12" x2="18" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* MENU OVERLAY (Drawer) */}
      {isMenuOpen && (
        <div className="absolute inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={toggleMenu}
          />
          <div className="relative w-3/4 max-w-xs bg-white h-full shadow-2xl p-6 flex flex-col gap-6 overflow-y-auto animate-slide-in-left">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-800">Menu</h2>
              <button onClick={toggleMenu} className="text-slate-400 p-2">
                ✕
              </button>
            </div>

            {/* File Operations */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Project
              </h3>
              <button
                onClick={() => handleAction(onSavePlay)}
                className="text-left px-4 py-3 bg-blue-50 rounded-xl font-medium text-blue-700 active:bg-blue-100"
              >
                💾 Save Playbook
              </button>
              <button
                onClick={() => handleAction(onTriggerLoadPlay)}
                className="text-left px-4 py-3 bg-blue-50 rounded-xl font-medium text-blue-700 active:bg-blue-100"
              >
                📁 Load Playbook
              </button>
              <button
                onClick={() => handleAction(onExportVideo)}
                className="text-left px-4 py-3 bg-purple-50 rounded-xl font-medium text-purple-700 active:bg-purple-100"
              >
                🎥 Export Video
              </button>
            </div>

            {/* Advanced Actions */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Danger Zone
              </h3>
              <button
                onClick={() => handleAction(onClearAllFrames)}
                className="text-left px-4 py-3 bg-red-50 rounded-xl font-medium text-red-600 active:bg-red-100"
              >
                ⚠️ Clear All Frames
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
