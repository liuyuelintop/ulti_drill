import React from "react";
import Konva from "konva";
import { Group, Circle, Text } from "react-konva";
import type { DraggableItem } from "../../types";
import {
  DISC_RADIUS_PX,
  PLAYER_RADIUS_PX,
  SELECTION_STROKE_WIDTH,
  COLORS,
} from "../../constants/canvas";
import { toCanvas } from "../../utils/coordinates";

interface ItemsLayerProps {
  items: DraggableItem[];
  selectedItemId: string | null;
  isInteractive: boolean;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>, id: string) => void;
  onSelect: (id: string | null) => void;
  scale: number;
}

export const ItemsLayer: React.FC<ItemsLayerProps> = ({
  items,
  selectedItemId,
  isInteractive,
  onDragEnd,
  onSelect,
  scale,
}) => (
  <>
    {items.map((item) => {
      const isSelected = selectedItemId === item.id;
      
      // Project logical coordinates to canvas pixels
      const x = toCanvas(item.x, scale);
      const y = toCanvas(item.y, scale);

      // Token size logic:
      // We want players to be visible even if the field is tiny.
      // Ideally, they scale with the field, but have a min/max size.
      // For now, we stick to the fixed pixel size for clarity as per the plan "Token Scaling"
      // Or we can scale them slightly but clamp.
      // Let's stick to fixed pixel size for tokens to ensure touch targets are constant.
      const radius = item.type === "disc" ? DISC_RADIUS_PX : PLAYER_RADIUS_PX;

      let gradientStartColor, gradientEndColor, shadowColor;

      if (item.type === "offense") {
        gradientStartColor = COLORS.OFFENSE_LIGHT;
        gradientEndColor = COLORS.OFFENSE;
        shadowColor = "rgba(239, 68, 68, 0.4)";
      } else if (item.type === "defense") {
        gradientStartColor = COLORS.DEFENSE_LIGHT;
        gradientEndColor = COLORS.DEFENSE;
        shadowColor = "rgba(37, 99, 235, 0.4)";
      } else {
        gradientStartColor = COLORS.DISC_GLOW;
        gradientEndColor = COLORS.DISC;
        shadowColor = "rgba(250, 204, 21, 0.5)";
      }

      return (
        <Group
          key={item.id}
          x={x}
          y={y}
          draggable={isInteractive}
          onDragEnd={(e) => onDragEnd(e, item.id)}
          onClick={(e) => {
            e.cancelBubble = true;
            onSelect(item.id);
          }}
          onTap={(e) => {
            e.cancelBubble = true;
            onSelect(item.id);
          }}
        >
          {isSelected && (
            <>
              <Circle
                radius={radius + 6}
                stroke={COLORS.SELECTED}
                strokeWidth={3}
                opacity={0.3}
              />
              <Circle
                radius={radius + 4}
                stroke={COLORS.SELECTED}
                strokeWidth={2}
                opacity={0.5}
              />
            </>
          )}

          <Circle
            radius={radius}
            fill={shadowColor}
            offsetY={-2}
            opacity={0.6}
            blur={4}
          />

          <Circle
            radius={radius}
            fillRadialGradientStartPoint={{
              x: -radius / 3,
              y: -radius / 3,
            }}
            fillRadialGradientStartRadius={0}
            fillRadialGradientEndPoint={{ x: 0, y: 0 }}
            fillRadialGradientEndRadius={radius}
            fillRadialGradientColorStops={[
              0,
              gradientStartColor,
              1,
              gradientEndColor,
            ]}
            stroke={isSelected ? COLORS.SELECTED : "white"}
            strokeWidth={isSelected ? SELECTION_STROKE_WIDTH + 1 : 1.5}
            shadowColor="rgba(0, 0, 0, 0.3)"
            shadowBlur={3}
            shadowOffset={{ x: 1, y: 2 }}
            shadowOpacity={0.5}
          />

          {item.type !== "disc" && (
            <>
              <Text
                text={item.label}
                fontSize={14}
                fontFamily="Outfit, sans-serif"
                fill="rgba(0, 0, 0, 0.3)"
                fontStyle="bold"
                offsetX={3}
                offsetY={5}
                listening={false}
              />
              <Text
                text={item.label}
                fontSize={14}
                fontFamily="Outfit, sans-serif"
                fill="white"
                fontStyle="bold"
                offsetX={4}
                offsetY={6}
                listening={false}
              />
            </>
          )}
        </Group>
      );
    })}
  </>
);

export default ItemsLayer;
