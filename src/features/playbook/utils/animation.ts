import type { DraggableItem } from "../types";

// Small animation helper to interpolate frames on a timeline.
// Encapsulates RAF bookkeeping so hooks remain lean.

export type AnimationState = {
  requestId: number | null;
  startTime: number | null;
};

export type AnimationControl = {
  start: () => void;
  stop: () => void;
};

interface AnimationConfig {
  frames: DraggableItem[][];
  durationPerFrame: number;
  onFrame: (items: DraggableItem[]) => void;
  onDone: () => void;
}

export const createFrameAnimator = ({
  frames,
  durationPerFrame,
  onFrame,
  onDone,
}: AnimationConfig): AnimationControl => {
  const state: AnimationState = {
    requestId: null,
    startTime: null,
  };

  const animate = (time: number) => {
    if (state.startTime === null) state.startTime = time;
    const runtime = time - state.startTime;
    const totalIndex = runtime / durationPerFrame;
    const currentIndex = Math.floor(totalIndex);
    const nextIndex = currentIndex + 1;
    const progress = totalIndex - currentIndex;

    if (nextIndex >= frames.length) {
      stop();
      onDone();
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

    onFrame(interpolatedItems);
    state.requestId = requestAnimationFrame(animate);
  };

  const start = () => {
    state.startTime = null;
    state.requestId = requestAnimationFrame(animate);
  };

  const stop = () => {
    if (state.requestId) {
      cancelAnimationFrame(state.requestId);
      state.requestId = null;
    }
    state.startTime = null;
  };

  return { start, stop };
};
