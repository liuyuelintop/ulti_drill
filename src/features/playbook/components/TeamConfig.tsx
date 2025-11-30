import React from "react";
import { Button } from "../../../shared/ui/Button";

interface TeamConfigProps {
  offenseCount: number;
  defenseCount: number;
  onUpdate: (offense: number, defense: number) => void;
}

export const TeamConfig: React.FC<TeamConfigProps> = ({
  offenseCount,
  defenseCount,
  onUpdate,
}) => {
  const handleOffenseChange = (delta: number) => {
    const newCount = Math.max(1, Math.min(7, offenseCount + delta));
    if (newCount + defenseCount <= 14) {
      onUpdate(newCount, defenseCount);
    }
  };

  const handleDefenseChange = (delta: number) => {
    const newCount = Math.max(0, Math.min(7, defenseCount + delta));
    if (offenseCount + newCount <= 14) {
      onUpdate(offenseCount, newCount);
    }
  };

  const toggleDefense = () => {
    if (defenseCount > 0) {
      onUpdate(offenseCount, 0);
    } else {
      // Default to matching offense or 7, capped at 7
      const initialDefense = Math.min(offenseCount, 7);
      onUpdate(offenseCount, initialDefense);
    }
  };

  return (
    <div className="flex items-center space-x-4 p-2 bg-slate-50 rounded-lg border border-slate-200 shadow-sm">
      {/* Offense Controls */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-slate-700">Offense:</span>
        <div className="flex items-center bg-white rounded-md border border-slate-300">
          <button
            className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-l-md disabled:opacity-50"
            onClick={() => handleOffenseChange(-1)}
            disabled={offenseCount <= 1}
          >
            -
          </button>
          <span className="px-2 py-1 text-sm font-bold text-sky-600 min-w-[1.5rem] text-center">
            {offenseCount}
          </span>
          <button
            className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-r-md disabled:opacity-50"
            onClick={() => handleOffenseChange(1)}
            disabled={offenseCount >= 7}
          >
            +
          </button>
        </div>
      </div>

      <div className="h-6 w-px bg-slate-300" />

      {/* Defense Controls */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-slate-700">Defense:</span>
        {defenseCount === 0 ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleDefense}
            className="h-8"
          >
            + Add Defense
          </Button>
        ) : (
          <div className="flex items-center bg-white rounded-md border border-slate-300">
            <button
              className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-l-md"
              onClick={() => handleDefenseChange(-1)}
            >
              -
            </button>
            <span className="px-2 py-1 text-sm font-bold text-indigo-600 min-w-[1.5rem] text-center">
              {defenseCount}
            </span>
            <button
              className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-r-md disabled:opacity-50"
              onClick={() => handleDefenseChange(1)}
              disabled={defenseCount >= 7}
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
