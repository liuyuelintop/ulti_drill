import React from "react";

const HelpFooter: React.FC = () => {
  return (
    <div className="w-full bg-slate-50 border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex flex-col gap-2">
          <p className="text-slate-600 text-xs font-medium flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-sky-500"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            Tips:
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-slate-500 text-[11px]">
            <span className="flex items-center gap-1.5">
              • Select a player or disc, then drag to set new position
            </span>
            <span className="flex items-center gap-1.5">
              • Press{" "}
              <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-200 text-slate-600">
                Esc
              </kbd>{" "}
              to unselect item
            </span>
            <span className="flex items-center gap-1.5">
              • Use{" "}
              <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-200 text-slate-600">
                ← →
              </kbd>{" "}
              to navigate frames
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpFooter;
