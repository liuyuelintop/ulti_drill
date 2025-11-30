import React from "react";
import { PLAYS } from "../../../presets";
import type { PlaybookData } from "../types";

interface PlaySelectorProps {
  onSelect: (data: PlaybookData) => void;
  onImport: () => void;
  disabled?: boolean;
}

export const PlaySelector: React.FC<PlaySelectorProps> = ({
  onSelect,
  onImport,
  disabled,
}) => {
  return (
    <div className="relative inline-block">
      <select
        className="appearance-none pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-xs"
        onChange={(e) => {
          const selectedValue = e.target.value;
          if (!selectedValue) return;

          if (selectedValue === "IMPORT_FILE") {
            onImport();
          } else {
            const play = PLAYS.find((p) => p.name === selectedValue);
            if (play) {
              onSelect(play);
            }
          }
          e.target.value = ""; // Reset selection
        }}
        disabled={disabled}
        defaultValue=""
      >
        <option value="" disabled>
          📁 Load Play...
        </option>
        <optgroup label="Built-in Plays">
          {PLAYS.map((play) => (
            <option key={play.name} value={play.name}>
              {play.name}
            </option>
          ))}
        </optgroup>
        <optgroup label="Custom">
          <option value="IMPORT_FILE">📂 Import from file...</option>
        </optgroup>
      </select>
      
      {/* Icon Left */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      </div>

      {/* Chevron Right */}
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
