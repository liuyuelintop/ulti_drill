import React from "react";
import Konva from "konva";
import { Group, Circle, Rect, RegularPolygon, Text } from "react-konva";
import type { DraggableItem } from "../playbook/types";
import {
  colorFor,
  radiusFor,
  shapeFor,
  TOUCH_PADDING_PX,
  type FieldTheme,
} from "./theme";

interface ItemsLayerProps {
  items: DraggableItem[];
  scale: number;
  theme: FieldTheme;
  selectedId?: string | null;
  draggable: boolean;
  /** Counter-rotation for labels so numbers stay upright when the field rotates. */
  textRotation?: number;
  onDragEnd?: (id: string, e: Konva.KonvaEventObject<DragEvent>) => void;
  onSelect?: (id: string | null) => void;
  /** Rendered translucent, e.g. the previous frame. */
  ghost?: boolean;
}

/** Annotations sit under the action; the disc sits on top of whoever holds it. */
const STACK_ORDER: Record<string, number> = {
  text: 0,
  cone: 1,
  defense: 2,
  offense: 3,
  disc: 4,
};

const FONT = "Outfit, system-ui, sans-serif";

export const ItemsLayer: React.FC<ItemsLayerProps> = ({
  items,
  scale,
  theme,
  selectedId,
  draggable,
  textRotation = 0,
  onDragEnd,
  onSelect,
  ghost = false,
}) => (
  <>
    {[...items]
      .sort((a, b) => (STACK_ORDER[a.type] ?? 0) - (STACK_ORDER[b.type] ?? 0))
      .map((item) => {
        const r = radiusFor(item.type, scale);
        const shape = shapeFor(item.type);
        const selected = !ghost && selectedId === item.id;
        const fill = colorFor(item.type, theme);

        const select = (e: Konva.KonvaEventObject<Event>) => {
          e.cancelBubble = true;
          onSelect?.(item.id);
        };

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
            onClick={select}
            onTap={select}
          >
            {/* Invisible, finger-sized hit area */}
            {!ghost && (
              <Circle radius={r + TOUCH_PADDING_PX} fill="rgba(0,0,0,0.001)" />
            )}

            {selected && (
              <SelectionHalo
                shape={shape}
                r={r}
                color={theme.selected}
                label={item.label ?? ""}
                textRotation={textRotation}
              />
            )}

            <Token
              shape={shape}
              r={r}
              fill={fill}
              stroke={shape === "disc" ? theme.discRing : theme.tokenStroke}
              ghost={ghost}
              label={item.label ?? ""}
              labelColor={theme.tokenLabel}
              annotation={theme.annotation}
              backing={theme.annotationBacking}
              textRotation={textRotation}
            />
          </Group>
        );
      })}
  </>
);

/* ------------------------------------------------------------------ shapes */

interface TokenProps {
  shape: ReturnType<typeof shapeFor>;
  r: number;
  fill: string;
  stroke: string;
  ghost: boolean;
  label: string;
  labelColor: string;
  annotation: string;
  backing: string;
  textRotation: number;
}

const Token: React.FC<TokenProps> = ({
  shape,
  r,
  fill,
  stroke,
  ghost,
  label,
  labelColor,
  annotation,
  backing,
  textRotation,
}) => {
  const shadow = ghost
    ? {}
    : {
        shadowColor: "rgba(0,0,0,0.45)",
        shadowBlur: 6,
        shadowOffsetY: 2,
        shadowOpacity: 0.6,
      };

  if (shape === "text") {
    const size = r * 1.1;
    const width = textWidth(label, size);
    return (
      <Group rotation={textRotation} listening={false}>
        <Rect
          x={-width / 2}
          y={-size * 0.85}
          width={width}
          height={size * 1.7}
          cornerRadius={size * 0.45}
          fill={backing}
        />
        <Text
          text={label}
          fontSize={size}
          fontFamily={FONT}
          fontStyle="bold"
          fill={annotation}
          align="center"
          verticalAlign="middle"
          width={width}
          height={size * 1.7}
          offsetX={width / 2}
          offsetY={size * 0.85}
        />
      </Group>
    );
  }

  if (shape === "disc") {
    return <Circle radius={r} fill={fill} stroke={stroke} strokeWidth={2} {...shadow} />;
  }

  if (shape === "triangle") {
    // A cone is a symbol, not an object on the grass: it stays pointing up when
    // the field rotates, the same way jersey numbers do.
    return (
      <Group rotation={textRotation} listening={false}>
        {/* Nudged down so the triangle's visual centre sits on the coordinate. */}
        <RegularPolygon
          sides={3}
          radius={r * 1.25}
          y={r * 0.2}
          fill={fill}
          stroke={stroke}
          strokeWidth={1.5}
          {...shadow}
        />
      </Group>
    );
  }

  const body =
    shape === "square" ? (
      <Rect
        x={-r * 0.92}
        y={-r * 0.92}
        width={r * 1.84}
        height={r * 1.84}
        cornerRadius={r * 0.3}
        fill={fill}
        stroke={stroke}
        strokeWidth={2}
        {...shadow}
      />
    ) : (
      <Circle radius={r} fill={fill} stroke={stroke} strokeWidth={2} {...shadow} />
    );

  return (
    <>
      {body}
      {!ghost && label && (
        <Text
          text={label}
          fontSize={r * 1.15}
          fontFamily={FONT}
          fontStyle="bold"
          fill={labelColor}
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
    </>
  );
};

/** Konva cannot measure text before laying it out, so approximate it. */
const textWidth = (label: string, size: number) =>
  Math.max(label.length, 1) * size * 0.62 + size;

const SelectionHalo: React.FC<{
  shape: ReturnType<typeof shapeFor>;
  r: number;
  color: string;
  label: string;
  textRotation: number;
}> = ({ shape, r, color, label, textRotation }) => {
  const common = {
    stroke: color,
    strokeWidth: 3,
    opacity: 0.9,
    listening: false,
  };
  if (shape === "text") {
    const size = r * 1.1;
    const width = textWidth(label, size);
    // Rotating the Rect itself would pivot on its corner; the Group pivots on
    // the item, the same way the note it outlines does.
    return (
      <Group rotation={textRotation}>
        <Rect
          x={-width / 2 - 3}
          y={-size * 0.85 - 3}
          width={width + 6}
          height={size * 1.7 + 6}
          cornerRadius={size * 0.55}
          {...common}
        />
      </Group>
    );
  }
  if (shape === "square") {
    return (
      <Rect
        x={-r * 1.28}
        y={-r * 1.28}
        width={r * 2.56}
        height={r * 2.56}
        cornerRadius={r * 0.42}
        {...common}
      />
    );
  }
  if (shape === "triangle") {
    return (
      <Group rotation={textRotation}>
        <RegularPolygon sides={3} radius={r * 1.7} y={r * 0.2} {...common} />
      </Group>
    );
  }
  return <Circle radius={r + 5.5} {...common} />;
};

export default ItemsLayer;
