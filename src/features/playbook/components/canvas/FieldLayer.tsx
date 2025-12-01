import React from "react";
import { Rect, Line, Group, Text } from "react-konva";
import { COLORS } from "../../constants/canvas";
import type { FieldStandard } from "../../constants/standards";
import { toCanvas } from "../../utils/coordinates";

interface FieldLayerProps {
  scale: number;
  standard: FieldStandard;
}

export const FieldLayer: React.FC<FieldLayerProps> = ({ scale, standard }) => {
  const { length, width, endzoneLength, brickMark } = standard.dimensions;

  // Pre-calculate canvas dimensions
  const canvasLength = toCanvas(length, scale);
  const canvasWidth = toCanvas(width, scale);
  const canvasEndzone = toCanvas(endzoneLength, scale);
  const canvasBrick = toCanvas(brickMark, scale);

  return (
    <>
      {/* --- FIELD BACKGROUND & STRIPING --- */}
      {Array.from({ length: 11 }).map((_, i) => {
        const logicalX = i * (length / 11);
        const stripWidth = length / 11;
        const x = toCanvas(logicalX, scale);
        const w = toCanvas(stripWidth, scale);
        
        const isEven = i % 2 === 0;
        const fill = isEven ? COLORS.GRASS : COLORS.GRASS_LIGHT;

        return (
          <Rect
            key={`field-strip-${i}`}
            x={x}
            y={0}
            width={w}
            height={canvasWidth}
            fill={fill}
          />
        );
      })}

      {/* --- ENDZONES --- */}
      {/* Left Endzone */}
      <Rect
        x={0}
        y={0}
        width={canvasEndzone}
        height={canvasWidth}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: canvasEndzone, y: 0 }}
        fillLinearGradientColorStops={[0, COLORS.GRASS, 1, COLORS.GRASS_DARK]}
      />
      {/* Right Endzone */}
      <Rect
        x={canvasLength - canvasEndzone}
        y={0}
        width={canvasEndzone}
        height={canvasWidth}
        fillLinearGradientStartPoint={{
          x: canvasLength - canvasEndzone,
          y: 0,
        }}
        fillLinearGradientEndPoint={{ x: canvasLength, y: 0 }}
        fillLinearGradientColorStops={[0, COLORS.GRASS_DARK, 1, COLORS.GRASS]}
      />

      {/* --- MARKINGS --- */}
      {/* Goal Lines */}
      <Line
        points={[canvasEndzone, 0, canvasEndzone, canvasWidth]}
        stroke="rgba(255,255,255,0.3)"
        strokeWidth={2}
      />
      <Line
        points={[
          canvasLength - canvasEndzone,
          0,
          canvasLength - canvasEndzone,
          canvasWidth,
        ]}
        stroke="rgba(255,255,255,0.3)"
        strokeWidth={2}
      />

      {/* Yard Lines (Every 10 units) */}
      {Array.from({ length: Math.floor((length - 2 * endzoneLength) / 10) }).map((_, i) => {
        if (i === 0) return null; // Skip goal line
        const logicalX = endzoneLength + i * 10;
        const x = toCanvas(logicalX, scale);

        return (
          <Group key={`yard-mark-${i}`}>
            <Line
              points={[x, 0, x, canvasWidth]}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={1}
            />
          </Group>
        );
      })}

      {/* Brick marks */}
      {/* Left Brick */}
      <Group>
        <Line
          points={[
            canvasEndzone + canvasBrick,
            canvasWidth / 2 - 10,
            canvasEndzone + canvasBrick,
            canvasWidth / 2 + 10,
          ]}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={2}
        />
        <Line
          points={[
            canvasEndzone + canvasBrick - 10,
            canvasWidth / 2,
            canvasEndzone + canvasBrick + 10,
            canvasWidth / 2,
          ]}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={2}
        />
      </Group>
      {/* Right Brick */}
      <Group>
        <Line
          points={[
            canvasLength - canvasEndzone - canvasBrick,
            canvasWidth / 2 - 10,
            canvasLength - canvasEndzone - canvasBrick,
            canvasWidth / 2 + 10,
          ]}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={2}
        />
        <Line
          points={[
            canvasLength - canvasEndzone - canvasBrick - 10,
            canvasWidth / 2,
            canvasLength - canvasEndzone - canvasBrick + 10,
            canvasWidth / 2,
          ]}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={2}
        />
      </Group>

      {/* --- TEXT LABELS --- */}
      <Text
        text="HOME"
        x={canvasEndzone / 2}
        y={canvasWidth / 2}
        fontSize={28}
        fontFamily="Outfit, sans-serif"
        fontStyle="bold"
        fill="rgba(255,255,255,0.2)"
        rotation={90}
        offsetX={14}
        offsetY={40}
        letterSpacing={8}
        listening={false}
      />
      <Text
        text="AWAY"
        x={canvasLength - canvasEndzone / 2}
        y={canvasWidth / 2}
        fontSize={28}
        fontFamily="Outfit, sans-serif"
        fontStyle="bold"
        fill="rgba(255,255,255,0.2)"
        rotation={-90}
        offsetX={14}
        offsetY={40}
        letterSpacing={8}
        listening={false}
      />

      {/* Yard Numbers */}
      {[10, 20, 30, 40, 50, 60].map((yard) => {
        // Only show if within playing field
        if (yard * 10 > length - 2 * endzoneLength) return null;
        
        const logicalX = endzoneLength + yard;
        const x = toCanvas(logicalX, scale);
        
        // Only render if inside the right goal line
        if (logicalX >= length - endzoneLength) return null;

        return (
          <Text
            key={`yard-num-${yard}`}
            x={x}
            y={canvasWidth / 2}
            text={String(yard)}
            fontSize={18}
            fontFamily="Outfit, sans-serif"
            fontStyle="bold"
            fill="rgba(255,255,255,0.15)"
            offsetX={10}
            offsetY={9}
            listening={false}
          />
        );
      })}
    </>
  );
};

export default FieldLayer;
