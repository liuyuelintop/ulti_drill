import React from "react";
import { Button } from "../../../../shared/ui/Button";

interface FrameActionsProps {
  isRecording: boolean;
  canResetItem: boolean;
  isDirty: boolean;
  hasSelectedItem: boolean;
  onResetItem: () => void;
  onDuplicateFrame: () => void;
}

export const FrameActions: React.FC<FrameActionsProps> = ({
  isRecording,
  canResetItem,
  isDirty,
  hasSelectedItem,
  onResetItem,
  onDuplicateFrame,
}) => {
  return (
    <div className="shrink-0 bg-slate-50 rounded-lg border border-slate-200 p-3">
      <div className="flex items-center gap-2">
        <Button
          onClick={onResetItem}
          variant="ghost"
          size="sm"
          disabled={isRecording || !canResetItem}
          title={
            !isDirty
              ? "Make changes to a frame first"
              : !hasSelectedItem
              ? "Select an item to reset"
              : "Reset selected item to last saved position"
          }
          aria-label="Reset selected item"
        >
          🔄 Reset Item
        </Button>

        <Button
          onClick={onDuplicateFrame}
          variant="ghost"
          size="sm"
          disabled={isRecording}
          title="Duplicate current frame"
          aria-label="Duplicate current frame"
        >
          📋 Duplicate Frame
        </Button>
      </div>
    </div>
  );
};

export default FrameActions;
