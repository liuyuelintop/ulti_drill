import React from "react";
import { Button } from "../../../shared/ui/Button";
import { TeamConfig } from "./TeamConfig";
import { PresetSelector } from "./PresetSelector";
import { PlaySelector } from "./PlaySelector";
import type { PlaybookData } from "../types";

interface HeaderControlsProps {
  // Row 1: Branding + Status
  currentFrameIndex: number;
  totalFrames: number;
  isDirty: boolean;
  isPlaying: boolean;

  // Row 2: File Operations
  onLoadPlay: () => void;
  onLoadPreset: (data: PlaybookData) => void;
  onSavePlay: () => void;
  onExportVideo: () => void;
  isRecording: boolean;
  isExporting: boolean;

  // Row 3: Edit Bar
  onSaveChanges: () => void;
  onDiscardChanges: () => void;

  // Configuration
  offenseCount: number;
  defenseCount: number;
  onUpdateTeamConfig: (offense: number, defense: number) => void;
}

const HeaderControls: React.FC<HeaderControlsProps> = ({
  currentFrameIndex,
  totalFrames,
  isDirty,
  isPlaying,
  onLoadPlay,
  onLoadPreset,
  onSavePlay,
  onExportVideo,
  isRecording,
  isExporting,
  onSaveChanges,
  onDiscardChanges,
  offenseCount,
  defenseCount,
  onUpdateTeamConfig,
}) => {
  const handleFileOperation = (operation: () => void) => {
    if (isDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Save current frame first?"
      );
      if (!confirmed) return;
      onSaveChanges();
    }
    operation();
  };

  return (
    <header className="sticky top-0 bg-white border-b-2 border-slate-200 shadow-sm z-50">
      {/* ROW 1: Branding + Status Indicator */}
      <div className="w-full px-6 py-4 flex justify-between items-center">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-linear-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-primary-500/20 text-white">
            🥏
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              GamePlay Animator
            </h1>
            <p className="text-slate-500 text-[13px] font-normal">
              Ultimate Frisbee Play Designer
            </p>
          </div>
        </div>

        {/* Right: Frame Counter + Status Badges */}
        <div className="flex items-center gap-3">
          {/* Frame Counter */}
          {!isPlaying && (
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200">
              <span className="text-[12px] text-slate-500 uppercase tracking-wider font-medium">
                Frame
              </span>
              <span className="font-mono text-base text-primary-600 font-medium">
                {currentFrameIndex + 1} / {totalFrames}
              </span>
            </div>
          )}

          {/* Unsaved Badge */}
          {!isPlaying && isDirty && (
            <div className="flex items-center gap-2 bg-amber-100 px-3 py-2 rounded-lg border border-amber-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
              </span>
              <span className="text-[12px] text-amber-800 font-semibold uppercase tracking-wide">
                Unsaved
              </span>
            </div>
          )}

          {/* Recording/Preview Badge */}
          {isPlaying && (
            <div
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border ${
                isRecording
                  ? "bg-red-600 border-red-500 text-white"
                  : "bg-emerald-600 border-emerald-500 text-white"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span className="text-[12px] font-bold uppercase tracking-wider">
                {isRecording ? "● Recording" : "▶ Live Preview"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ROW 2: File Operations & Team Config */}
      <div
        className={`w-full px-6 py-3 border-t border-slate-100 transition-opacity duration-200 ${
          isDirty ? "opacity-60 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="flex flex-wrap justify-between items-center gap-4">
          {/* File Operations Group */}
          <div className="flex flex-wrap gap-3 items-center">
            <PlaySelector
              onSelect={(data) => handleFileOperation(() => onLoadPreset(data))}
              onImport={() => handleFileOperation(onLoadPlay)}
              disabled={isRecording || isExporting}
            />

            <PresetSelector
              onSelect={(data) => handleFileOperation(() => onLoadPreset(data))}
              disabled={isRecording || isExporting}
            />

            <Button
              onClick={() => handleFileOperation(onSavePlay)}
              variant="ghost"
              size="md"
              disabled={isRecording || isExporting}
              aria-label="Save playbook to file"
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
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              💾 Download Play
            </Button>

            <Button
              onClick={() => handleFileOperation(onExportVideo)}
              variant="ghost"
              size="md"
              disabled={isRecording || isExporting || isDirty}
              isLoading={isExporting}
              aria-label="Export animation as video"
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
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              🎥 Export Video
            </Button>
          </div>

          {/* Team Configuration */}
          <TeamConfig
            offenseCount={offenseCount}
            defenseCount={defenseCount}
            onUpdate={onUpdateTeamConfig}
          />
        </div>
      </div>

      {/* ROW 3: Edit Bar (Conditional - Only When Editing) */}
      {isDirty && (
        <div className="w-full px-6 py-3 bg-amber-50 border-t border-amber-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-amber-600"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="text-sm text-amber-900 font-medium">
              You have unsaved changes to Frame {currentFrameIndex + 1}
            </span>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onSaveChanges}
              variant="success"
              size="md"
              aria-label="Save frame changes"
            >
              ✓ SAVE CHANGES
            </Button>

            <Button
              onClick={onDiscardChanges}
              variant="secondary"
              size="md"
              aria-label="Discard frame changes"
            >
              ✕ DISCARD
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default HeaderControls;
