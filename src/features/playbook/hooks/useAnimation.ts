import { useState, useEffect, useRef, useCallback } from "react";
import type { DraggableItem } from "../types";
import { createFrameAnimator } from "../utils/animation";

interface UseAnimationProps {
  frames: DraggableItem[][];
  setCurrentFrameIndex: (index: number) => void;
}

/**
 * useAnimation
 * 
 * Manages the playback loop for the playbook:
 * - Interpolates positions between frames
 * - Handles Play/Pause state
 * - Updates the `animatingItems` state for the canvas to render
 */
export const useAnimation = ({
  frames,
  setCurrentFrameIndex,
}: UseAnimationProps) => {
  const [animatingItems, setAnimatingItems] = useState<DraggableItem[] | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  
  const animatorRef = useRef<ReturnType<typeof createFrameAnimator> | null>(
    null
  );

  // --- ANIMATION ENGINE ---
  useEffect(() => {
    // 1. If not playing, reset UI and exit
    if (!isPlaying) {
      setAnimatingItems(null); // Safe to do synchronously here
      return;
    }

    // 2. Start Animation
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

    // 3. Consolidated Cleanup (Runs on Stop OR Unmount)
    return () => {
      animator.stop();
    };
  }, [isPlaying, frames, setCurrentFrameIndex]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  return {
    animatingItems,
    isPlaying,
    setIsPlaying,
    togglePlay,
  };
};
