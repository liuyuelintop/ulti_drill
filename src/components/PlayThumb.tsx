import React from "react";
import type { DraggableItem } from "../features/playbook/types";
import { pointOnPath } from "../features/playbook/types";
import { DEFAULT_STANDARD } from "../features/playbook/constants/standards";
import { FIELD_THEMES, shapeFor, type FieldThemeName } from "../features/field/theme";

const { length: L, width: W, endzoneLength: EZ } = DEFAULT_STANDARD.dimensions;

/** Radii in metres — the card is too small for the full token sizes. */
const R = { player: 1.7, disc: 1, cone: 1.3 };

interface PlayThumbProps {
  frames: DraggableItem[][];
  themeName?: FieldThemeName;
  className?: string;
}

const curvePath = (from: DraggableItem, to: DraggableItem): string => {
  if (to.cx === undefined || to.cy === undefined) {
    return `M${from.x} ${from.y} L${to.x} ${to.y}`;
  }
  return `M${from.x} ${from.y} Q${to.cx} ${to.cy} ${to.x} ${to.y}`;
};

/** Lightweight SVG preview of a play's opening setup, for library cards. */
export const PlayThumb: React.FC<PlayThumbProps> = ({
  frames,
  themeName = "grass",
  className = "",
}) => {
  const theme = FIELD_THEMES[themeName] ?? FIELD_THEMES.grass;
  const first = frames[0] ?? [];
  const last = frames[frames.length - 1] ?? [];
  const multiFrame = frames.length > 1;

  return (
    <svg
      viewBox={`0 0 ${L} ${W}`}
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect x="0" y="0" width={L} height={W} fill={theme.grass} />
      <rect x="0" y="0" width={EZ} height={W} fill={theme.endzone} />
      <rect x={L - EZ} y="0" width={EZ} height={W} fill={theme.endzone} />
      <line x1={EZ} y1="0" x2={EZ} y2={W} stroke={theme.line} strokeWidth="0.6" />
      <line
        x1={L - EZ}
        y1="0"
        x2={L - EZ}
        y2={W}
        stroke={theme.line}
        strokeWidth="0.6"
      />

      {multiFrame &&
        first.map((item) => {
          const end = last.find((i) => i.id === item.id);
          if (!end || item.type === "text") return null;
          // Measure along the real path so a bent cut still shows as movement.
          const mid = pointOnPath(item, end, 0.5);
          const travel =
            Math.hypot(end.x - item.x, end.y - item.y) +
            Math.hypot(mid.x - (item.x + end.x) / 2, mid.y - (item.y + end.y) / 2);
          if (travel < 1.5) return null;
          return (
            <path
              key={`t-${item.id}`}
              d={curvePath(item, end)}
              fill="none"
              stroke={theme.lineSoft}
              strokeWidth="0.5"
              strokeDasharray={item.type === "disc" ? undefined : "1.5 1.2"}
            />
          );
        })}

      {first.map((item) => (
        <Token key={item.id} item={item} themeName={themeName} />
      ))}
    </svg>
  );
};

/** Same circle / square / triangle vocabulary the full field uses. */
const Token: React.FC<{ item: DraggableItem; themeName: FieldThemeName }> = ({
  item,
  themeName,
}) => {
  const theme = FIELD_THEMES[themeName] ?? FIELD_THEMES.grass;
  const stroke = theme.tokenStroke;
  const shape = shapeFor(item.type);

  if (shape === "text") return null;

  if (shape === "square") {
    return (
      <rect
        x={item.x - R.player}
        y={item.y - R.player}
        width={R.player * 2}
        height={R.player * 2}
        rx={R.player * 0.32}
        fill={theme.defense}
        stroke={stroke}
        strokeWidth="0.35"
      />
    );
  }

  if (shape === "triangle") {
    const h = R.cone * 1.5;
    return (
      <polygon
        points={`${item.x},${item.y - h} ${item.x - R.cone},${item.y + h * 0.55} ${item.x + R.cone},${item.y + h * 0.55}`}
        fill={theme.cone}
        stroke={stroke}
        strokeWidth="0.3"
      />
    );
  }

  return (
    <circle
      cx={item.x}
      cy={item.y}
      r={shape === "disc" ? R.disc : R.player}
      fill={shape === "disc" ? theme.disc : theme.offense}
      stroke={stroke}
      strokeWidth="0.35"
    />
  );
};

export default PlayThumb;
