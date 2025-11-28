import { useState, useRef, useCallback } from "react";
import Konva from "konva";

interface UseVideoExportProps {
  isDirty: boolean;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  setCurrentFrameIndex: (index: number) => void;
  stageRef: React.RefObject<Konva.Stage | null>;
}

/**
 * useVideoExport
 * 
 * Handles recording the canvas to a video file:
 * - Controls the MediaRecorder API
 * - Orchestrates playback during recording
 * - Generates and downloads the video file (mp4/webm)
 */
export const useVideoExport = ({
  isDirty,
  isPlaying,
  setIsPlaying,
  setCurrentFrameIndex,
  stageRef,
}: UseVideoExportProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const handleExportVideo = useCallback(() => {
    if (isPlaying || isRecording) return;
    if (isDirty) {
      alert("Please save changes before exporting.");
      return;
    }

    const stage = stageRef.current;
    if (!stage) return;

    // Konva usually renders to a hidden canvas, ensure we get the right one
    const container = stage.container();
    const canvas = container.querySelector("canvas");
    if (!canvas) {
      console.error("Could not find canvas element for recording.");
      return;
    }

    try {
      // 30 FPS capture
      const stream = canvas.captureStream(30);
      
      // Prioritize avc3 to avoid "codec description not supposed to change" errors
      // caused by dynamic resolution changes or specific browser implementations.
      const mimeTypes = [
        "video/mp4; codecs=avc3", 
        "video/mp4; codecs=avc1", 
        "video/mp4", 
        "video/webm; codecs=vp9", 
        "video/webm"
      ];
      
      const selectedMimeType =
        mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) ||
        "video/webm";

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
      });

      recordedChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: selectedMimeType,
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const extension = selectedMimeType.includes("mp4") ? "mp4" : "webm";
        a.download = `animation.${extension}`;
        a.click();
        URL.revokeObjectURL(url);

        // Reset flags
        setIsRecording(false);
        setIsExporting(false);
      };

      // Set flags and prepare for playback
      setIsRecording(true);
      setIsExporting(true);
      setCurrentFrameIndex(0);

      // Add a slight delay to allow React state updates (setIsRecording, setIsExporting, setCurrentFrameIndex)
      // to settle and the DOM to potentially re-render before starting the MediaRecorder and playback.
      // This helps ensure the canvas is in the correct state for recording.
      setTimeout(() => {
        // Double check ref exists before starting (in case unmount happened in the 100ms)
        if (mediaRecorderRef.current?.state === "inactive") {
          mediaRecorderRef.current.start();
          setIsPlaying(true);
        }
      }, 100);
    } catch (error) {
      console.error("Export failed:", error);
      setIsRecording(false);
      setIsExporting(false);
    }
  }, [isDirty, isPlaying, isRecording, setCurrentFrameIndex, setIsPlaying, stageRef]);

  // Stop recording if playback stops externally or finishes
  // Note: This effect should probably be managed carefully. 
  // If isPlaying goes to false, and we are recording, we should stop the recorder.
  // We need to hook into the playback stopping event.
  // However, the original code handled this via the cleanup function of the useEffect in the playback hook.
  // Since we split them, we need a way to stop the recorder when playback stops.
  
  // The original code had:
  // return () => { animator.stop(); if(recorder.state === recording) recorder.stop() }
  //
  // We can achieve this with an effect here that watches `isPlaying`.
  
  /* 
     Effect to stop recording when playback finishes.
     When the animation finishes, `setIsPlaying(false)` is called in `useAnimation`.
     We detect that here and stop the recorder if it's running.
  */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // Using a ref for the recorder ensures we can access it without adding it to deps if we don't want to re-trigger
  
  // We need to be careful not to stop it immediately when it starts.
  // But since `setIsPlaying` flips to true *after* recording starts (in the setTimeout), 
  // the transition we care about is true -> false.
  
  // Let's rely on the fact that the parent component orchestrates this? 
  // No, the original code coupled them. 
  // Let's add a simple check: if we are recording and isPlaying becomes false, stop recording.
  
  if (isRecording && !isPlaying && mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
  }

  return {
    isRecording,
    isExporting,
    handleExportVideo,
  };
};
