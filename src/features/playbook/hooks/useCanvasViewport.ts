import { useState, useEffect, useCallback } from "react";
import { calculateFieldTransform } from "../utils/viewport";
import type { ContainerSize, FitMode, ViewportTransform } from "../utils/viewport";

interface UseCanvasViewportOptions {
  mode?: FitMode;
  padding?: number;
  enableResizeObserver?: boolean; // Whether to auto-recalculate on resize
}

export const useCanvasViewport = (
  containerRef: React.RefObject<HTMLElement | null>,
  options: UseCanvasViewportOptions = {}
) => {
  const { 
    mode = 'contain', 
    padding = 20,
    enableResizeObserver = true
  } = options;

  const [transform, setTransform] = useState<ViewportTransform>({
    scale: 1,
    x: 0,
    y: 0
  });

  // Initialize & Handle Resize
  const updateViewport = useCallback(() => {
    if (!containerRef.current) {
        // Fallback to window if no container ref (e.g., mobile full screen)
        const container: ContainerSize = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        const newTransform = calculateFieldTransform(container, mode, padding);
        setTransform(newTransform);
        return;
    }

    const container: ContainerSize = {
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight
    };
    
    const newTransform = calculateFieldTransform(container, mode, padding);
    setTransform(newTransform);
  }, [mode, padding, containerRef]);

  useEffect(() => {
    if (!enableResizeObserver) return;

    // Initial calculation
    updateViewport();

    const handleResize = () => updateViewport();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [updateViewport, enableResizeObserver]);

  // Manual Update (for Gestures)
  const setManualTransform = useCallback((newTransform: ViewportTransform | ((prev: ViewportTransform) => ViewportTransform)) => {
      setTransform(newTransform);
  }, []);

  return {
    scale: transform.scale,
    position: { x: transform.x, y: transform.y },
    setTransform: setManualTransform,
    resetView: updateViewport
  };
};
