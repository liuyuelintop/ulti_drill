import React from "react";
import Konva from "konva";
import { Group, Circle, Text, Ring } from "react-konva";
import type { DraggableItem } from "../playbook/types";
import { FIELD_THEME as T, radiusFor, TOUCH_PADDING_PX } from "./theme";

interface ItemsLayerProps {
  items: DraggableItem[];
  scale: number;
  selectedId?: string | null;
  draggable: boolean;
  /** Counter-rotation for labels so numbers stay upright when the field rotates. */
  textRotation?: number;
  onDragEnd?: (id: string, e: Konva.KonvaEventObject<DragEvent>) => void;
  onSelect?: (id: string | null) => void;
  /** Rendered translucent, e.g. the previous frame. */
  ghost?: boolean;
}

export const ItemsLayer: React.FC<ItemsLayerProps> = ({
  items,
  scale,
  selectedId,
  draggable,
  textRotation = 0,
  onDragEnd,
  onSelect,
  ghost = false,
}) => (
  <>
    {/* Disc last, so it always sits on top of the player holding it. */}
    {[...items]
      .sort((a, b) => Number(a.type === "disc") - Number(b.type === "disc"))
      .map((item) => {
      const r = radiusFor(item.type, scale);
      const selected = !ghost && selectedId === item.id;
      const isDisc = item.type === "disc";
      const isOffense = item.type === "offense";

      const fill = isDisc ? T.disc : isOffense ? T.offense : T.defense;
      const stroke = isDisc ? T.discRing : isOffense ? T.offenseDark : T.defenseDark;

      return (
        <Group
          key={`${ghost ? "ghost-" : ""}${item.id}`}
          x={item.x * scale}
          y={item.y * scale}
          draggable={draggable}
          opacity={ghost ? 0.3 : 1}
          listening={!ghost}
          onDragEnd={(e) => onDragEnd?.(item.id, e)}
          onMouseDown={() => onSelect?.(item.id)}
          onTouchStart={() => onSelect?.(item.id)}
          onClick={(e) => {
            e.cancelBubble = true;
            onSelect?.(item.id);
          }}
          onTap={(e) => {
            e.cancelBubble = true;
            onSelect?.(item.id);
          }}
        >
          {/* Invisible, finger-sized hit area */}
          {!ghost && (
            <Circle radius={r + TOUCH_PADDING_PX} fill="rgba(0,0,0,0.001)" />
          )}

          {selected && (
            <Ring
              innerRadius={r + 4}
              outerRadius={r + 7}
              fill={T.selected}
              opacity={0.9}
              listening={false}
            />
          )}

          <Circle
            radius={r}
            fill={fill}
            stroke={isDisc ? stroke : "rgba(255,255,255,0.9)"}
            strokeWidth={isDisc ? 2 : 2}
            shadowColor="rgba(0,0,0,0.45)"
            shadowBlur={ghost ? 0 : 6}
            shadowOffsetY={ghost ? 0 : 2}
            shadowOpacity={ghost ? 0 : 0.6}
          />

          {!isDisc && !ghost && (
            <Text
              text={item.label ?? ""}
              fontSize={r * 1.15}
              fontFamily="Outfit, system-ui, sans-serif"
              fontStyle="bold"
              fill="#ffffff"
              align="center"
              verticalAlign="middle"
              width={r * 3}
              height={r * 3}
              offsetX={r * 1.5}
              offsetY={r * 1.5}
              rotation={textRotation}
              listening={false}
            />
          )}
        </Group>
      );
    })}
  </>
);

export default ItemsLayer;
