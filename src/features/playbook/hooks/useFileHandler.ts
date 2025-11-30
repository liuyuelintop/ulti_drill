import { useRef, useCallback } from "react";
import type { DraggableItem, PlaybookData } from "../types";
import { isValidPlaybook } from "../utils/frames";

interface UseFileHandlerProps {
  frames: DraggableItem[][];
  setFrames: (frames: DraggableItem[][]) => void;
  setCurrentFrameIndex: (index: number) => void;
  setEditingFrame: (frame: DraggableItem[] | null) => void;
  isDirty: boolean;
}

/**
 * useFileHandler
 * 
 * Handles file-based operations for the playbook:
 * - Saving (Downloading JSON)
 * - Loading (Parsing and Validating JSON)
 */
export const useFileHandler = ({
  frames,
  setFrames,
  setCurrentFrameIndex,
  setEditingFrame,
  isDirty,
}: UseFileHandlerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Serialize current frames to a JSON download.
  const savePlay = useCallback(() => {
    const playName = prompt("Enter a name for this play:", "My Play") || "My Play";
    // Sanitize filename: replace spaces/special chars with underscores
    const fileName = playName.replace(/[^a-z0-9]/gi, "_").toLowerCase();

    const data: PlaybookData = {
      version: "1.0",
      name: playName,
      frames: frames,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [frames]);

  // Directly load a PlaybookData object (e.g. from presets)
  const loadPlaybookData = useCallback(
    (data: PlaybookData) => {
      if (isDirty) {
        const confirm = window.confirm(
          "Discard unsaved changes before loading a new play?"
        );
        if (!confirm) return;
        setEditingFrame(null);
      }

      if (isValidPlaybook(data)) {
        setFrames(data.frames as DraggableItem[][]);
        setCurrentFrameIndex(0);
        setEditingFrame(null);
        // alert(`Play "${data.name || "Unnamed Play"}" loaded successfully!`); // Optional: Removed alert for presets to be smoother
      } else {
        alert("Invalid playbook data.");
      }
    },
    [isDirty, setEditingFrame, setFrames, setCurrentFrameIndex]
  );

  // Load frames from a user-provided JSON file with validation.
  const loadPlay = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (isDirty) {
        const confirm = window.confirm(
          "Discard unsaved changes before loading a new play?"
        );
        if (!confirm) {
          e.target.value = ""; // Clear the file input
          return;
        }
        setEditingFrame(null);
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = event.target?.result as string;
          const data: PlaybookData = JSON.parse(json);
          if (isValidPlaybook(data)) {
            setFrames(data.frames as DraggableItem[][]);
            setCurrentFrameIndex(0);
            setEditingFrame(null); // Clear any editing state
            alert(`Play "${data.name || "Unnamed Play"}" loaded successfully!`);
          } else {
            alert("Invalid playbook file format. Missing frames or version.");
          }
        } catch (error) {
          console.error("Error loading play:", error);
          alert("Error loading play: " + (error as Error).message);
        }
      };
      reader.readAsText(file);
      // Reset input value so same file can be selected again
      e.target.value = "";
    },
    [isDirty, setEditingFrame, setFrames, setCurrentFrameIndex]
  );

  const triggerLoadPlay = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    fileInputRef,
    savePlay,
    loadPlay,
    loadPlaybookData,
    triggerLoadPlay,
  };
};
