import { DEFAULT_STANDARD } from "../constants/standards";

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
  const { length, width } = DEFAULT_STANDARD.dimensions;
  
  // Available space after padding
  const availW = cW - padding * 2;
  const availH = cH - padding * 2;

  // Ratios
  const ratioW = availW / length;
  const ratioH = availH / width;

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
  const x = (cW - length * scale) / 2;
  const y = (cH - width * scale) / 2;

  return { scale, x, y };
};

/**
 * Constrains a transform to keep the field somewhat visible.
 * Prevents the user from panning the field completely off-screen.
 */
export const constrainTransform = (
  current: ViewportTransform,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _container: ContainerSize
): ViewportTransform => {
    // TODO: Implement boundary constraints if needed (e.g., bounce back)
    // For now, just limiting scale range is handled in the interaction hook
    return current;
};
