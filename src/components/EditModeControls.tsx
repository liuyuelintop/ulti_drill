import React from "react";
import { Button } from "./ui/Button";

interface EditModeControlsProps {
  isDirty: boolean;
  onSaveChanges: () => void;
  onDiscardChanges: () => void;
}

const EditModeControls: React.FC<EditModeControlsProps> = ({
  isDirty,
  onSaveChanges,
  onDiscardChanges,
}) => {
  if (!isDirty) return null;

  return (
    <div className="flex flex-wrap gap-3 items-center animate-slide-down">
      <Button
        onClick={onSaveChanges}
        variant="success"
        size="md"
        aria-label="Save frame changes"
      >
        SAVE CHANGES
      </Button>

      <Button
        onClick={onDiscardChanges}
        variant="secondary"
        size="md"
        aria-label="Discard frame changes"
      >
        DISCARD
      </Button>
    </div>
  );
};

export default EditModeControls;
