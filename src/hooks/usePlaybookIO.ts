import { useRef, useCallback } from "react";
import type { DraggableItem, PlaybookData } from "../types";

interface UsePlaybookIOProps {
  frames: DraggableItem[][];
  setFrames: (frames: DraggableItem[][]) => void;
  setCurrentFrameIndex: (index: number) => void;
  setEditingFrame: (frame: DraggableItem[] | null) => void;
  isDirty: boolean;
}

export const usePlaybookIO = ({
  frames,
  setFrames,
  setCurrentFrameIndex,
  setEditingFrame,
  isDirty,
}: UsePlaybookIOProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const savePlay = useCallback(() => {
    const data: PlaybookData = {
      version: "1.0",
      name: "My Play", // TODO: Add UI for play name
      frames: frames,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "playbook.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [frames]);

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
          // Basic validation: check for 'frames' and 'version'
          if (data.frames && Array.isArray(data.frames) && data.version) {
            setFrames(data.frames);
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
    triggerLoadPlay,
  };
};
