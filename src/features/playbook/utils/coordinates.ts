import type { FieldStandard } from "../constants/standards";

/**
 * Converts logical field coordinates (Yards/Meters) to Canvas Pixels.
 * @param logicalValue - The coordinate in real-world units (e.g., 10 yards).
 * @param scale - Pixels per unit (e.g., 8 px/yard).
 */
export const toCanvas = (logicalValue: number, scale: number): number => {
  return logicalValue * scale;
};

/**
 * Converts Canvas Pixels to logical field coordinates.
 * @param canvasValue - The coordinate in pixels (e.g., 80px).
 * @param scale - Pixels per unit (e.g., 8 px/yard).
 */
export const toLogical = (canvasValue: number, scale: number): number => {
  if (scale === 0) return 0;
  return canvasValue / scale;
};

/**
 * Calculates the optimal pixels-per-unit scale to fit the field within a container.
 * @param containerWidth - Width of the container in pixels.
 * @param containerHeight - Height of the container in pixels.
 * @param standard - The field standard defining logical dimensions.
 * @param padding - Padding in pixels to leave around the field.
 */
export const calculateScale = (
  containerWidth: number,
  containerHeight: number,
  standard: FieldStandard,
  padding: number = 20
): number => {
  const availableWidth = containerWidth - padding * 2;
  const availableHeight = containerHeight - padding * 2;

  const scaleX = availableWidth / standard.dimensions.length;
  const scaleY = availableHeight / standard.dimensions.width;

  // Use the smaller scale to ensure the whole field fits ("contain" mode)
  return Math.min(scaleX, scaleY);
};
