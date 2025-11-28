import { useState, useEffect, useRef, useCallback } from "react";
import Konva from "konva";
import type { DraggableItem } from "../types";
import { createFrameAnimator } from "../utils/animation";

interface UsePlaybackAndExportProps {
  frames: DraggableItem[][];
  setCurrentFrameIndex: (index: number) => void;
  stageRef: React.RefObject<Konva.Stage | null>;
  isDirty: boolean;
}

// Handles playback interpolation plus video export/recording.
export const usePlaybackAndExport = ({
  frames,
  setCurrentFrameIndex,
  stageRef,
  isDirty,
}: UsePlaybackAndExportProps) => {
  const [animatingItems, setAnimatingItems] = useState<DraggableItem[] | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const requestRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const animatorRef = useRef<ReturnType<typeof createFrameAnimator> | null>(
    null
  );

  // --- ANIMATION ENGINE ---
  useEffect(() => {
    if (!isPlaying) {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      animatorRef.current?.stop();
      setAnimatingItems(null);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
      return;
    }

    const animator = createFrameAnimator({
      frames,
      durationPerFrame: 1000,
      onFrame: setAnimatingItems,
      onDone: () => {
        setIsPlaying(false);
        setCurrentFrameIndex(frames.length - 1);
      },
    });
    animatorRef.current = animator;
    animator.start();

    return () => {
      animator.stop();
    };
  }, [isPlaying, frames, setCurrentFrameIndex]);

  const togglePlay = useCallback(() => {
    if (isRecording) return;
    setIsPlaying((prev) => !prev);
  }, [isRecording]);

  const handleExportVideo = useCallback(() => {
    // Export is disabled during playback/recording or when dirty.
    if (isPlaying || isRecording) return;
    if (isDirty) {
      alert("Please save changes before exporting.");
      return;
    }

    const stage = stageRef.current;
    if (!stage) return;

    const container = stage.container();
    const canvas = container.querySelector("canvas");
    if (!canvas) {
      console.error("Could not find canvas element for recording.");
      setIsRecording(false);
      setIsExporting(false);
      return;
    }

    const stream = canvas.captureStream(30); // 30 FPS

    const mimeTypes = [
      "video/mp4",
      "video/webm; codecs=vp9",
      "video/webm",
    ];
    const selectedMimeType =
      mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) ||
      "video/webm";

    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: selectedMimeType,
    });

    recordedChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunksRef.current.push(e.data);
      }
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
      setIsRecording(false);
      setIsExporting(false);
    };

    setIsRecording(true);
    setIsExporting(true);
    setCurrentFrameIndex(0); // Start from the beginning
    setTimeout(() => {
      mediaRecorderRef.current?.start();
      setIsPlaying(true);
    }, 100); // Small delay to ensure everything is ready
  }, [isDirty, isPlaying, isRecording, setCurrentFrameIndex, stageRef]);

  return {
    animatingItems,
    isPlaying,
    setIsPlaying, // Exposed in case explicit set is needed
    isRecording,
    isExporting,
    togglePlay,
    handleExportVideo,
  };
};
