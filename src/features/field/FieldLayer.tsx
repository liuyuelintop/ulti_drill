import React from "react";
import { Rect, Line, Text, Group } from "react-konva";
import type { FieldStandard } from "../playbook/constants/standards";
import { FIELD_THEME as T } from "./theme";

interface FieldLayerProps {
  scale: number;
  standard: FieldStandard;
  /** Degrees the parent group is rotated by; text is counter-rotated to stay upright. */
  textRotation?: number;
}

const STRIPES = 12;

export const FieldLayer: React.FC<FieldLayerProps> = ({
  scale,
  standard,
  textRotation = 0,
}) => {
  const { length, width, endzoneLength, brickMark } = standard.dimensions;
  const L = length * scale;
  const W = width * scale;
  const EZ = endzoneLength * scale;
  const brick = brickMark * scale;

  const cross = (cx: number, cy: number, size: number) => (
    <Group>
      <Line points={[cx - size, cy, cx + size, cy]} stroke={T.lineSoft} strokeWidth={2} />
      <Line points={[cx, cy - size, cx, cy + size]} stroke={T.lineSoft} strokeWidth={2} />
    </Group>
  );

  return (
    <>
      {/* Mown stripes */}
      {Array.from({ length: STRIPES }).map((_, i) => (
        <Rect
          key={`stripe-${i}`}
          x={(L / STRIPES) * i}
          y={0}
          width={L / STRIPES + 1}
          height={W}
          fill={i % 2 === 0 ? T.grass : T.grassAlt}
        />
      ))}

      {/* End zones */}
      <Rect x={0} y={0} width={EZ} height={W} fill={T.endzone} opacity={0.55} />
      <Rect x={L - EZ} y={0} width={EZ} height={W} fill={T.endzone} opacity={0.55} />

      {/* Every-10-unit reference lines inside the playing field */}
      {Array.from({ length: Math.floor((length - 2 * endzoneLength) / 10) }).map(
        (_, i) => {
          const x = (endzoneLength + (i + 1) * 10) * scale;
          if (x >= L - EZ) return null;
          return (
            <Line
              key={`ref-${i}`}
              points={[x, 0, x, W]}
              stroke={T.lineFaint}
              strokeWidth={1}
              dash={[6, 8]}
            />
          );
        }
      )}

      {/* Brick marks */}
      {cross(EZ + brick, W / 2, Math.max(6, scale * 0.9))}
      {cross(L - EZ - brick, W / 2, Math.max(6, scale * 0.9))}

      {/* Goal lines */}
      <Line points={[EZ, 0, EZ, W]} stroke={T.line} strokeWidth={2.5} />
      <Line points={[L - EZ, 0, L - EZ, W]} stroke={T.line} strokeWidth={2.5} />

      {/* Sidelines */}
      <Rect x={0} y={0} width={L} height={W} stroke={T.line} strokeWidth={2.5} />

      {/* End zone labels, kept upright regardless of field rotation */}
      {[EZ / 2, L - EZ / 2].map((cx, i) => {
        const size = Math.max(10, scale * 1.4);
        const boxW = size * 10;
        return (
          <Text
            key={`ez-${i}`}
            x={cx}
            y={W / 2}
            text="END ZONE"
            fontSize={size}
            fontFamily="Outfit, system-ui, sans-serif"
            fontStyle="bold"
            letterSpacing={size * 0.12}
            fill={T.text}
            align="center"
            width={boxW}
            offsetX={boxW / 2}
            offsetY={size / 2}
            rotation={textRotation}
            listening={false}
          />
        );
      })}

    </>
  );
};

export default FieldLayer;
