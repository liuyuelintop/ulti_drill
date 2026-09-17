import React from "react";
import { Arrow } from "react-konva";
import type { DraggableItem } from "../playbook/types";
import { FIELD_THEME as T } from "./theme";

interface TrailsLayerProps {
  from?: DraggableItem[];
  to: DraggableItem[];
  scale: number;
  visible: boolean;
}

/** Dashed arrows showing how each token moved into the current frame. */
export const TrailsLayer: React.FC<TrailsLayerProps> = ({
  from,
  to,
  scale,
  visible,
}) => {
  if (!visible || !from?.length) return null;

  return (
    <>
      {to.map((item) => {
        const prev = from.find((p) => p.id === item.id);
        if (!prev) return null;

        const dx = item.x - prev.x;
        const dy = item.y - prev.y;
        // Ignore jitter under half a meter — keeps the field readable.
        if (Math.hypot(dx, dy) < 0.8) return null;

        const isDisc = item.type === "disc";
        return (
          <Arrow
            key={`trail-${item.id}`}
            points={[prev.x * scale, prev.y * scale, item.x * scale, item.y * scale]}
            stroke={isDisc ? T.disc : item.type === "offense" ? T.offense : T.defense}
            fill={isDisc ? T.disc : item.type === "offense" ? T.offense : T.defense}
            strokeWidth={isDisc ? 2.5 : 2}
            dash={isDisc ? undefined : [7, 5]}
            pointerLength={8}
            pointerWidth={7}
            opacity={0.8}
            lineCap="round"
            listening={false}
          />
        );
      })}
    </>
  );
};

export default TrailsLayer;
