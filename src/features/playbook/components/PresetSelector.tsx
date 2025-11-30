import React from "react";
import { PRESETS } from "../../../presets";
import type { PlaybookData } from "../types";

interface PresetSelectorProps {
  onSelect: (data: PlaybookData) => void;
  disabled?: boolean;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  onSelect,
  disabled,
}) => {
  return (
    <div className="relative inline-block">
      <select
        className="appearance-none pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        onChange={(e) => {
          const selectedName = e.target.value;
          if (!selectedName) return;
          const preset = PRESETS.find((p) => p.name === selectedName);
          if (preset) {
            onSelect(preset);
          }
          e.target.value = ""; // Reset selection so same preset can be re-selected
        }}
        disabled={disabled}
        defaultValue=""
      >
        <option value="" disabled>
          📋 Load Preset...
        </option>
        {PRESETS.map((preset) => (
          <option key={preset.name} value={preset.name}>
            {preset.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
};
