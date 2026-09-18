import React from "react";
import Konva from "konva";
import { Arrow, Circle, Group } from "react-konva";
import {
  controlToHandle,
  handleToControl,
  pointOnPath,
  type DraggableItem,
} from "../playbook/types";
import { colorFor, TOUCH_PADDING_PX, type FieldTheme } from "./theme";

interface TrailsLayerProps {
  from?: DraggableItem[];
  to: DraggableItem[];
  scale: number;
  theme: FieldTheme;
  visible: boolean;
  /** Shows a draggable midpoint so a straight run can be bent into a cut. */
  editable?: boolean;
  onCurve?: (id: string, cx: number, cy: number, done: boolean) => void;
}

/** Movement under this many metres is jitter, not a cut. */
const MIN_TRAVEL_M = 0.8;
/** Radius of the drag dot that bends a path. */
const HANDLE_RADIUS = 8;
/** Samples used to draw a curved path. Enough to look smooth at any zoom. */
const CURVE_STEPS = 24;

const pathPoints = (
  prev: DraggableItem,
  item: DraggableItem,
  scale: number
): number[] => {
  if (item.cx === undefined || item.cy === undefined) {
    return [prev.x * scale, prev.y * scale, item.x * scale, item.y * scale];
  }
  const points: number[] = [];
  for (let i = 0; i <= CURVE_STEPS; i++) {
    const p = pointOnPath(prev, item, i / CURVE_STEPS);
    points.push(p.x * scale, p.y * scale);
  }
  return points;
};

/** Arrows showing how each token moved into the current frame. */
export const TrailsLayer: React.FC<TrailsLayerProps> = ({
  from,
  to,
  scale,
  theme,
  visible,
  editable = false,
  onCurve,
}) => {
  if (!visible || !from?.length) return null;

  return (
    <>
      {to.map((item) => {
        const prev = from.find((p) => p.id === item.id);
        if (!prev) return null;
        // Annotations don't run; drawing a trail for them is noise.
        if (item.type === "text") return null;
        if (Math.hypot(item.x - prev.x, item.y - prev.y) < MIN_TRAVEL_M) return null;

        const isDisc = item.type === "disc";
        const color = colorFor(item.type, theme);
        const handle = controlToHandle(prev, item);

        const onHandleDrag =
          (done: boolean) => (e: Konva.KonvaEventObject<DragEvent>) => {
            if (!onCurve || scale === 0) return;
            const c = handleToControl(prev, item, {
              x: e.target.x() / scale,
              y: e.target.y() / scale,
            });
            onCurve(item.id, c.cx, c.cy, done);
          };

        return (
          <React.Fragment key={`trail-${item.id}`}>
            <Arrow
              points={pathPoints(prev, item, scale)}
              stroke={color}
              fill={color}
              strokeWidth={isDisc ? 2.5 : 2}
              // Solid for the throw, dashed for the run — the standard notation.
              dash={isDisc ? undefined : [7, 5]}
              pointerLength={8}
              pointerWidth={7}
              opacity={0.85}
              lineCap="round"
              lineJoin="round"
              listening={false}
            />
            {editable && (
              <Group
                x={handle.x * scale}
                y={handle.y * scale}
                draggable
                onDragMove={onHandleDrag(false)}
                onDragEnd={onHandleDrag(true)}
              >
                {/* A 8px dot is a fine target for a mouse and a hopeless one
                    for a thumb, so the grabbable area is much bigger. */}
                <Circle radius={HANDLE_RADIUS + TOUCH_PADDING_PX} fill="rgba(0,0,0,0.001)" />
                <Circle
                  radius={HANDLE_RADIUS}
                  fill={theme.handle}
                  stroke={color}
                  strokeWidth={2}
                  listening={false}
                />
              </Group>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default TrailsLayer;
