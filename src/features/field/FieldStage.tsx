import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Konva from "konva";
import { Stage, Layer, Group } from "react-konva";
import type { DraggableItem } from "../playbook/types";
import { DEFAULT_STANDARD } from "../playbook/constants/standards";
import { FULL_FIELD, expandToFill, type Region } from "./bounds";
import {
  DEFAULT_THEME,
  FIELD_THEMES,
  type FieldThemeName,
} from "./theme";
import FieldLayer from "./FieldLayer";
import ItemsLayer from "./ItemsLayer";
import TrailsLayer from "./TrailsLayer";

/** `vertical` rotates the field so the attack runs up the screen — fills a phone. */
export type FieldOrientation = "horizontal" | "vertical";

interface FieldStageProps {
  items: DraggableItem[];
  ghostItems?: DraggableItem[];
  trailFrom?: DraggableItem[];
  showTrails?: boolean;
  orientation: FieldOrientation;
  editable?: boolean;
  selectedId?: string | null;
  onMove?: (id: string, x: number, y: number) => void;
  onSelect?: (id: string | null) => void;
  onCurve?: (id: string, cx: number, cy: number, done: boolean) => void;
  /** Slice of field to fill the viewport with. Defaults to the whole field. */
  region?: Region;
  themeName?: FieldThemeName;
  /** Sentence describing what is on the field, for screen readers. */
  ariaLabel?: string;
  className?: string;
}

const { length: FIELD_L, width: FIELD_W } = DEFAULT_STANDARD.dimensions;
const PADDING = 8;

export const FieldStage = forwardRef<Konva.Stage, FieldStageProps>(
  (
    {
      items,
      ghostItems,
      trailFrom,
      showTrails = true,
      orientation,
      editable = false,
      selectedId,
      onMove,
      onSelect,
      onCurve,
      region = FULL_FIELD,
      themeName = DEFAULT_THEME,
      ariaLabel,
      className = "",
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [box, setBox] = useState({ w: 0, h: 0 });
    const theme = FIELD_THEMES[themeName] ?? FIELD_THEMES[DEFAULT_THEME];

    // Track the container so the field always fills whatever space it is given.
    useLayoutEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const measure = () =>
        setBox({ w: el.clientWidth, h: el.clientHeight });
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    // Recompute after an orientation flip, whose layout change ResizeObserver
    // may not report when the box size itself is unchanged.
    useEffect(() => {
      const el = containerRef.current;
      if (el) setBox({ w: el.clientWidth, h: el.clientHeight });
    }, [orientation]);

    const vertical = orientation === "vertical";
    const availW = Math.max(box.w - PADDING * 2, 1);
    const availH = Math.max(box.h - PADDING * 2, 1);

    // Scale so the requested region — not necessarily the whole field — fills
    // the viewport.
    const baseL = Math.max(region.x1 - region.x0, 1);
    const baseW = Math.max(region.y1 - region.y0, 1);
    const scale = vertical
      ? Math.min(availW / baseW, availH / baseL)
      : Math.min(availW / baseL, availH / baseW);

    // Show more field along the axis that has room to spare, rather than
    // leaving empty gutters beside the play.
    const view = expandToFill(region, scale, availW, availH, vertical);
    const regionL = Math.max(view.x1 - view.x0, 1);
    const regionW = Math.max(view.y1 - view.y0, 1);

    // Rendered footprint of the region once rotation is applied.
    const drawnW = (vertical ? regionW : regionL) * scale;
    const drawnH = (vertical ? regionL : regionW) * scale;
    const offsetX = (box.w - drawnW) / 2;
    const offsetY = (box.h - drawnH) / 2;

    // Vertical rotates -90°, mapping field (x, y) -> (y, -x), which puts the
    // attacking end zone at the top of the screen.
    const groupProps = vertical
      ? {
          x: offsetX - view.y0 * scale,
          y: offsetY + view.x1 * scale,
          rotation: -90,
        }
      : {
          x: offsetX - view.x0 * scale,
          y: offsetY - view.y0 * scale,
          rotation: 0,
        };
    const textRotation = vertical ? 90 : 0;

    const handleDragEnd = useCallback(
      (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
        if (!onMove || scale === 0) return;
        // Konva reports the position inside the rotated group, i.e. field pixels.
        const x = e.target.x() / scale;
        const y = e.target.y() / scale;
        onMove(
          id,
          Math.min(Math.max(x, 0), FIELD_L),
          Math.min(Math.max(y, 0), FIELD_W)
        );
      },
      [onMove, scale]
    );

    const handleBackgroundClick = useCallback(
      (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
        if (e.target === e.target.getStage()) onSelect?.(null);
      },
      [onSelect]
    );

    const ready = box.w > 0 && box.h > 0 && scale > 0;

    return (
      <div
        ref={containerRef}
        role="img"
        aria-label={ariaLabel}
        className={`h-full w-full ${className}`}
      >
        {ready && (
          <Stage
            ref={ref}
            width={box.w}
            height={box.h}
            onClick={handleBackgroundClick}
            onTap={handleBackgroundClick}
          >
            <Layer listening={false}>
              <Group {...groupProps}>
                <FieldLayer
                  scale={scale}
                  standard={DEFAULT_STANDARD}
                  theme={theme}
                  textRotation={textRotation}
                />
              </Group>
            </Layer>
            <Layer>
              <Group {...groupProps}>
                {ghostItems && (
                  <ItemsLayer
                    items={ghostItems}
                    scale={scale}
                    theme={theme}
                    draggable={false}
                    ghost
                  />
                )}
                <TrailsLayer
                  from={trailFrom}
                  to={items}
                  scale={scale}
                  theme={theme}
                  visible={showTrails}
                  editable={editable}
                  onCurve={onCurve}
                />
                <ItemsLayer
                  items={items}
                  scale={scale}
                  theme={theme}
                  selectedId={selectedId}
                  draggable={editable}
                  textRotation={textRotation}
                  onDragEnd={handleDragEnd}
                  onSelect={onSelect}
                />
              </Group>
            </Layer>
          </Stage>
        )}
      </div>
    );
  }
);

FieldStage.displayName = "FieldStage";

export default FieldStage;
