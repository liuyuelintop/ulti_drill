import { useState, useEffect, useRef, useCallback } from "react";
import Konva from "konva";
import type { DraggableItem } from "../types";

interface UsePlaybackAndExportProps {
  frames: DraggableItem[][];
  currentFrameIndex: number;
  setCurrentFrameIndex: (index: number) => void;
  stageRef: React.RefObject<Konva.Stage | null>;
  isDirty: boolean;
}

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
  const startTimeRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // --- ANIMATION ENGINE ---
  useEffect(() => {
    if (!isPlaying) {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      setAnimatingItems(null);
      return;
    }

    const DURATION_PER_FRAME = 1000;

    const animate = (time: number) => {
      if (startTimeRef.current === null) startTimeRef.current = time;
      const runtime = time - startTimeRef.current;
      const totalIndex = runtime / DURATION_PER_FRAME;
      const currentIndex = Math.floor(totalIndex);
      const nextIndex = currentIndex + 1;
      const progress = totalIndex - currentIndex;

      if (nextIndex >= frames.length) {
        setIsPlaying(false);
        startTimeRef.current = null;
        setCurrentFrameIndex(frames.length - 1);
        return;
      }

      const startFrame = frames[currentIndex];
      const endFrame = frames[nextIndex];
      const interpolatedItems = startFrame.map((startItem) => {
        const endItem = endFrame.find((i) => i.id === startItem.id);
        if (!endItem) return startItem;
        return {
          ...startItem,
          x: startItem.x + (endItem.x - startItem.x) * progress,
          y: startItem.y + (endItem.y - startItem.y) * progress,
        };
      });

      setAnimatingItems(interpolatedItems);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, frames, setCurrentFrameIndex]);

  const togglePlay = useCallback(() => {
    if (isRecording) return;
    setIsPlaying((prev) => !prev);
  }, [isRecording]);

  const handleExportVideo = useCallback(() => {
    if (isPlaying || isRecording) return;
    if (isDirty) {
      alert("Please save changes before exporting.");
      return;
    }

    const stage = stageRef.current;
    if (!stage) return;

    const container = stage.container();
    const canvas = container.querySelector('canvas');
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
    startTimeRef.current = null; // Reset start time
    setTimeout(() => {
      mediaRecorderRef.current?.start();
      setIsPlaying(true);
    }, 100); // Small delay to ensure everything is ready
  }, [isPlaying, isRecording, isDirty, stageRef, setCurrentFrameIndex]);

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
