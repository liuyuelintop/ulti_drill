import React from "react";
import { Circle } from "react-konva";
import type { DraggableItem } from "../../types";
import { DISC_RADIUS, PLAYER_RADIUS, COLORS } from "../../constants/canvas";

interface GhostLayerProps {
  prevFrameItems?: DraggableItem[];
  showGhosts: boolean;
}

export const GhostLayer: React.FC<GhostLayerProps> = ({
  prevFrameItems,
  showGhosts,
}) => {
  if (!showGhosts || !prevFrameItems) return null;

  return (
    <>
      {prevFrameItems.map((item) => (
        <Circle
          key={`ghost-${item.id}`}
          x={item.x}
          y={item.y}
          radius={item.type === "disc" ? DISC_RADIUS : PLAYER_RADIUS}
          fill={COLORS.GHOST}
          stroke="none"
          opacity={0.2}
        />
      ))}
    </>
  );
};

export default GhostLayer;
