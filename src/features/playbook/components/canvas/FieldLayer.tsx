import React from "react";
import { Rect, Line, Group, Text } from "react-konva";
import {
  SCALE,
  FIELD_LENGTH,
  FIELD_WIDTH,
  ENDZONE_LENGTH,
  BRICK_MARK,
  COLORS,
} from "../../constants/canvas";

export const FieldLayer: React.FC = () => (
  <>
    {/* --- FIELD BACKGROUND & STRIPING --- */}
    {Array.from({ length: 11 }).map((_, i) => {
      const x = i * (FIELD_LENGTH / 11);
      const width = FIELD_LENGTH / 11;
      const isEven = i % 2 === 0;
      const fill = isEven ? COLORS.GRASS : COLORS.GRASS_LIGHT;

      return (
        <Rect
          key={`field-strip-${i}`}
          x={x}
          y={0}
          width={width}
          height={FIELD_WIDTH}
          fill={fill}
        />
      );
    })}

    {/* --- ENDZONES --- */}
    <Rect
      x={0}
      y={0}
      width={ENDZONE_LENGTH}
      height={FIELD_WIDTH}
      fillLinearGradientStartPoint={{ x: 0, y: 0 }}
      fillLinearGradientEndPoint={{ x: ENDZONE_LENGTH, y: 0 }}
      fillLinearGradientColorStops={[0, COLORS.GRASS, 1, COLORS.GRASS_DARK]}
    />
    <Rect
      x={FIELD_LENGTH - ENDZONE_LENGTH}
      y={0}
      width={ENDZONE_LENGTH}
      height={FIELD_WIDTH}
      fillLinearGradientStartPoint={{
        x: FIELD_LENGTH - ENDZONE_LENGTH,
        y: 0,
      }}
      fillLinearGradientEndPoint={{ x: FIELD_LENGTH, y: 0 }}
      fillLinearGradientColorStops={[0, COLORS.GRASS_DARK, 1, COLORS.GRASS]}
    />

    {/* --- MARKINGS --- */}
    <Line
      points={[ENDZONE_LENGTH, 0, ENDZONE_LENGTH, FIELD_WIDTH]}
      stroke="rgba(255,255,255,0.3)"
      strokeWidth={2}
    />
    <Line
      points={[
        FIELD_LENGTH - ENDZONE_LENGTH,
        0,
        FIELD_LENGTH - ENDZONE_LENGTH,
        FIELD_WIDTH,
      ]}
      stroke="rgba(255,255,255,0.3)"
      strokeWidth={2}
    />

    {Array.from({ length: 7 }).map((_, i) => {
      if (i === 0) return null;
      const yardLineX = ENDZONE_LENGTH + i * 10 * SCALE;

      return (
        <Group key={`yard-mark-${i}`}>
          <Line
            points={[yardLineX, 0, yardLineX, FIELD_WIDTH]}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={1}
          />
        </Group>
      );
    })}

    {/* Brick marks */}
    <Group>
      <Line
        points={[
          ENDZONE_LENGTH + BRICK_MARK,
          FIELD_WIDTH / 2 - 10,
          ENDZONE_LENGTH + BRICK_MARK,
          FIELD_WIDTH / 2 + 10,
        ]}
        stroke="rgba(255,255,255,0.5)"
        strokeWidth={2}
      />
      <Line
        points={[
          ENDZONE_LENGTH + BRICK_MARK - 10,
          FIELD_WIDTH / 2,
          ENDZONE_LENGTH + BRICK_MARK + 10,
          FIELD_WIDTH / 2,
        ]}
        stroke="rgba(255,255,255,0.5)"
        strokeWidth={2}
      />
    </Group>
    <Group>
      <Line
        points={[
          FIELD_LENGTH - ENDZONE_LENGTH - BRICK_MARK,
          FIELD_WIDTH / 2 - 10,
          FIELD_LENGTH - ENDZONE_LENGTH - BRICK_MARK,
          FIELD_WIDTH / 2 + 10,
        ]}
        stroke="rgba(255,255,255,0.5)"
        strokeWidth={2}
      />
      <Line
        points={[
          FIELD_LENGTH - ENDZONE_LENGTH - BRICK_MARK - 10,
          FIELD_WIDTH / 2,
          FIELD_LENGTH - ENDZONE_LENGTH - BRICK_MARK + 10,
          FIELD_WIDTH / 2,
        ]}
        stroke="rgba(255,255,255,0.5)"
        strokeWidth={2}
      />
    </Group>

    {/* --- TEXT LABELS --- */}
    <Text
      text="HOME"
      x={ENDZONE_LENGTH / 2}
      y={FIELD_WIDTH / 2}
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
      x={FIELD_LENGTH - ENDZONE_LENGTH / 2}
      y={FIELD_WIDTH / 2}
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

    {[10, 20, 30, 40, 50, 60].map((yard) => {
      const x = ENDZONE_LENGTH + yard * SCALE;
      return (
        <Text
          key={`yard-num-${yard}`}
          x={x}
          y={FIELD_WIDTH / 2}
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

export default FieldLayer;
