import { useCallback, useEffect, useRef, useState } from "react";
import { pointOnPath, type DraggableItem } from "../playbook/types";

const MS_PER_FRAME = 1300;

/**
 * Walk each item along its path into the next frame. Items carrying a control
 * point follow the curve, so a fake-in-go-deep cut animates as one bend rather
 * than a straight line through the defender.
 */
const lerpFrames = (
  a: DraggableItem[],
  b: DraggableItem[],
  t: number
): DraggableItem[] =>
  a.map((item) => {
    const target = b.find((i) => i.id === item.id);
    if (!target) return item;
    const { x, y } = pointOnPath(item, target, t);
    return { ...item, x, y };
  });

/**
 * Frame-by-frame playback with interpolation between key frames.
 * `renderItems` is what the canvas should draw right now.
 */
export const usePlayback = (frames: DraggableItem[][]) => {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [tween, setTween] = useState<DraggableItem[] | null>(null);

  const posRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    lastRef.current = null;
  }, []);

  // Keep the index valid when the play is edited or swapped out.
  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(frames.length - 1, 0)));
  }, [frames.length]);

  useEffect(() => {
    if (!playing || frames.length < 2) {
      stop();
      setTween(null);
      return;
    }

    // Restart from the top when play is pressed on the last frame.
    posRef.current = index >= frames.length - 1 ? 0 : index;

    const step = (now: number) => {
      if (lastRef.current === null) lastRef.current = now;
      const dt = now - lastRef.current;
      lastRef.current = now;

      posRef.current += (dt / MS_PER_FRAME) * speed;

      if (posRef.current >= frames.length - 1) {
        setTween(null);
        setIndex(frames.length - 1);
        setPlaying(false);
        return;
      }

      const i = Math.floor(posRef.current);
      setIndex(i);
      setTween(lerpFrames(frames[i], frames[i + 1], posRef.current - i));
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return stop;
    // `index` is read once to pick the start point; re-running on every frame
    // change would restart playback on each tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, frames, speed, stop]);

  const toggle = useCallback(() => {
    if (frames.length < 2) return;
    setPlaying((p) => !p);
  }, [frames.length]);

  const goTo = useCallback(
    (i: number) => {
      setPlaying(false);
      setTween(null);
      setIndex(Math.min(Math.max(i, 0), Math.max(frames.length - 1, 0)));
    },
    [frames.length]
  );

  const renderItems = tween ?? frames[index] ?? [];
  const prevItems = index > 0 ? frames[index - 1] : undefined;

  return {
    index,
    playing,
    speed,
    setSpeed,
    toggle,
    goTo,
    renderItems,
    prevItems,
    isTweening: tween !== null,
  };
};
