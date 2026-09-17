import { useCallback, useEffect, useState } from "react";
import type { FieldOrientation } from "../features/field/FieldStage";

/**
 * Picks the field orientation that fills the screen — a phone held upright gets
 * the field rotated so the attack runs upward — until the user overrides it.
 */
export const useAutoOrientation = () => {
  const detect = (): FieldOrientation =>
    window.innerHeight > window.innerWidth * 1.15 ? "vertical" : "horizontal";

  const [override, setOverride] = useState<FieldOrientation | null>(null);
  const [detected, setDetected] = useState<FieldOrientation>(detect);

  useEffect(() => {
    const onResize = () => setDetected(detect());
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  const setOrientation = useCallback((next: FieldOrientation) => {
    setOverride(next);
  }, []);

  return {
    orientation: override ?? detected,
    setOrientation,
    /** False once the user has manually chosen an orientation. */
    auto: override === null,
  };
};
