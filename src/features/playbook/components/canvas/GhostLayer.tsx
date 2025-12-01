import React from "react";
import { Circle } from "react-konva";
import type { DraggableItem } from "../../types";
import { DISC_RADIUS_PX, PLAYER_RADIUS_PX, COLORS } from "../../constants/canvas";
import { toCanvas } from "../../utils/coordinates";

interface GhostLayerProps {
  prevFrameItems?: DraggableItem[];
  showGhosts: boolean;
  scale: number;
}

export const GhostLayer: React.FC<GhostLayerProps> = ({
  prevFrameItems,
  showGhosts,
  scale,
}) => {
  if (!showGhosts || !prevFrameItems) return null;

  return (
    <>
      {prevFrameItems.map((item) => (
        <Circle
          key={`ghost-${item.id}`}
          x={toCanvas(item.x, scale)}
          y={toCanvas(item.y, scale)}
          radius={item.type === "disc" ? DISC_RADIUS_PX : PLAYER_RADIUS_PX}
          fill={COLORS.GHOST}
          stroke="none"
          opacity={0.2}
        />
      ))}
    </>
  );
};

export default GhostLayer;
