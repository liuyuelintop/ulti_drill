import { FIELD_LENGTH, FIELD_WIDTH } from "../constants/canvas";

export interface ViewportTransform {
  scale: number;
  x: number;
  y: number;
}

export interface ContainerSize {
  width: number;
  height: number;
}

export type FitMode = 'contain' | 'fit-width' | 'fit-height' | 'manual';

/**
 * Calculates the optimal transform (scale & position) to fit the field into a container.
 */
export const calculateFieldTransform = (
  container: ContainerSize,
  mode: FitMode = 'contain',
  padding: number = 20
): ViewportTransform => {
  const { width: cW, height: cH } = container;
  
  // Available space after padding
  const availW = cW - padding * 2;
  const availH = cH - padding * 2;

  // Ratios
  const ratioW = availW / FIELD_LENGTH;
  const ratioH = availH / FIELD_WIDTH;

  let scale = 1;

  switch (mode) {
    case 'contain':
      scale = Math.min(ratioW, ratioH);
      break;
    case 'fit-width':
      scale = ratioW;
      break;
    case 'fit-height':
      scale = ratioH;
      break;
    case 'manual':
      return { scale: 1, x: 0, y: 0 }; // Should be handled externally
  }

  // Always Center
  const x = (cW - FIELD_LENGTH * scale) / 2;
  const y = (cH - FIELD_WIDTH * scale) / 2;

  return { scale, x, y };
};

/**
 * Constrains a transform to keep the field somewhat visible.
 * Prevents the user from panning the field completely off-screen.
 */
export const constrainTransform = (
  current: ViewportTransform,
  _container: ContainerSize
): ViewportTransform => {
    // TODO: Implement boundary constraints if needed (e.g., bounce back)
    // For now, just limiting scale range is handled in the interaction hook
    return current;
};
