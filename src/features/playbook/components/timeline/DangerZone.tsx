import React from "react";
import { Button } from "../../../../shared/ui/Button";

interface DangerZoneProps {
  isRecording: boolean;
  onDeleteFrame: () => void;
  onClearAll: () => void;
}

export const DangerZone: React.FC<DangerZoneProps> = ({
  isRecording,
  onDeleteFrame,
  onClearAll,
}) => {
  return (
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
  );
};

export default DangerZone;
