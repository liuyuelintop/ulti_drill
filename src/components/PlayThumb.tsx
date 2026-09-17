import React from "react";
import type { DraggableItem } from "../features/playbook/types";
import { DEFAULT_STANDARD } from "../features/playbook/constants/standards";

const { length: L, width: W, endzoneLength: EZ } = DEFAULT_STANDARD.dimensions;

interface PlayThumbProps {
  frames: DraggableItem[][];
  className?: string;
}

/** Lightweight SVG preview of a play's opening setup, for library cards. */
export const PlayThumb: React.FC<PlayThumbProps> = ({ frames, className = "" }) => {
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
      <rect x="0" y="0" width={L} height={W} fill="#2f7d4f" />
      <rect x="0" y="0" width={EZ} height={W} fill="#256541" />
      <rect x={L - EZ} y="0" width={EZ} height={W} fill="#256541" />
      <line x1={EZ} y1="0" x2={EZ} y2={W} stroke="rgba(255,255,255,.5)" strokeWidth="0.6" />
      <line
        x1={L - EZ}
        y1="0"
        x2={L - EZ}
        y2={W}
        stroke="rgba(255,255,255,.5)"
        strokeWidth="0.6"
      />

      {multiFrame &&
        first.map((item) => {
          const end = last.find((i) => i.id === item.id);
          if (!end || Math.hypot(end.x - item.x, end.y - item.y) < 1.5) return null;
          return (
            <line
              key={`t-${item.id}`}
              x1={item.x}
              y1={item.y}
              x2={end.x}
              y2={end.y}
              stroke="rgba(255,255,255,.45)"
              strokeWidth="0.5"
              strokeDasharray="1.5 1.2"
            />
          );
        })}

      {first.map((item) => (
        <circle
          key={item.id}
          cx={item.x}
          cy={item.y}
          r={item.type === "disc" ? 1 : 1.7}
          fill={
            item.type === "disc"
              ? "#ffffff"
              : item.type === "offense"
                ? "#ef4444"
                : "#2563eb"
          }
          stroke="rgba(255,255,255,.85)"
          strokeWidth="0.35"
        />
      ))}
    </svg>
  );
};

export default PlayThumb;
