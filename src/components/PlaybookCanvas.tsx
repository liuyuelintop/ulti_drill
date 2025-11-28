import { forwardRef, useState, useEffect, useRef } from "react";
import { Stage, Layer, Rect, Circle, Text, Line, Group } from "react-konva";
import Konva from "konva";
import type { DraggableItem } from "../types";
import {
  SCALE,
  FIELD_LENGTH,
  FIELD_WIDTH,
  ENDZONE_LENGTH,
  BRICK_MARK,
  PLAYER_RADIUS,
  DISC_RADIUS,
  SELECTION_STROKE_WIDTH,
  COLORS,
} from "../constants";
import { colors } from "../design-tokens"; // Import colors for direct usage

interface PlaybookCanvasProps {
  currentItems: DraggableItem[];
  prevFrameItems?: DraggableItem[];
  animatingItems: DraggableItem[] | null;
  selectedItemId: string | null;
  isPlaying: boolean;
  isRecording: boolean;
  onDragEnd: (e: any, id: string) => void;
  onSelect: (id: string | null) => void;
}

const PlaybookCanvas = forwardRef<Konva.Stage, PlaybookCanvasProps>(
  (
    {
      currentItems,
      prevFrameItems,
      animatingItems,
      selectedItemId,
      isPlaying,
      isRecording,
      onDragEnd,
      onSelect,
    },
    ref
  ) => {
    const itemsRendered =
      isPlaying && animatingItems ? animatingItems : currentItems;

    const containerRef = useRef<HTMLDivElement>(null);
    const [canvasScale, setCanvasScale] = useState(1);

    // Calculate responsive scale based on container width
    useEffect(() => {
      const updateScale = () => {
        if (containerRef.current) {
          const containerWidth = containerRef.current.offsetWidth;
          const containerHeight = containerRef.current.offsetHeight;

          // Calculate scale to fit width, with some padding
          const scaleX = containerWidth / FIELD_LENGTH;
          const scaleY = containerHeight / FIELD_WIDTH;

          // Use the smaller scale to ensure it fits both dimensions
          const newScale = Math.min(scaleX, scaleY, 1); // Cap at 1 to avoid upscaling

          setCanvasScale(newScale);
        }
      };

      // Initial scale calculation
      updateScale();

      // Update on window resize
      const resizeObserver = new ResizeObserver(updateScale);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }, []);

    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_8px_40px_rgba(0,0,0,0.08)] relative">
        <div
          ref={containerRef}
          className="rounded-xl overflow-hidden shadow-inner border border-slate-100 flex items-center justify-center"
          style={{ minHeight: `${FIELD_WIDTH}px` }}
        >
          <Stage
            width={FIELD_LENGTH}
            height={FIELD_WIDTH}
            scaleX={canvasScale}
            scaleY={canvasScale}
            style={{
              width: `${FIELD_LENGTH * canvasScale}px`,
              height: `${FIELD_WIDTH * canvasScale}px`,
            }}
            ref={ref}
            onMouseDown={(e) => {
              // deselect when clicked on empty area
              const clickedOnEmpty = e.target === e.target.getStage();
              if (clickedOnEmpty) {
                onSelect(null);
              }
            }}
            onTouchStart={(e) => {
              const clickedOnEmpty = e.target === e.target.getStage();
              if (clickedOnEmpty) {
                onSelect(null);
              }
            }}
          >
            <Layer>
              {/* --- FIELD BACKGROUND & STRIPING --- */}
              {/* We render 10-yard strips for the entire field length (110 yards) */}
              {Array.from({ length: 11 }).map((_, i) => {
                const x = i * (FIELD_LENGTH / 11);
                const width = FIELD_LENGTH / 11;
                const isEven = i % 2 === 0;
                // Use light mode grass colors from design tokens
                const fill = isEven
                  ? colors.field.grass
                  : colors.field.grassLight;

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
              {/* Left Endzone (Home - Green Gradient) */}
              <Rect
                x={0}
                y={0}
                width={ENDZONE_LENGTH}
                height={FIELD_WIDTH}
                fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                fillLinearGradientEndPoint={{ x: ENDZONE_LENGTH, y: 0 }}
                fillLinearGradientColorStops={[
                  0,
                  colors.field.grass, // Start with main field grass
                  1,
                  colors.field.endzone, // End with slightly darker endzone green
                ]}
              />
              {/* Right Endzone (Away - Green Gradient) */}
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
                fillLinearGradientColorStops={[
                  0,
                  colors.field.endzone, // Start with slightly darker endzone green
                  1,
                  colors.field.grass, // End with main field grass
                ]}
              />

              {/* --- MARKINGS --- */}
              {/* Goal lines */}
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

              {/* Hash Marks & Yard Lines */}
              {/* We iterate through the playing field yards (0 to 70) */}
              {Array.from({ length: 7 }).map((_, i) => {
                // i=0 is goal line (already drawn), i=1 is 10 yards out, etc.
                // We want lines at 10, 20, 30...
                if (i === 0) return null; // Skip goal line
                const yardLineX = ENDZONE_LENGTH + i * 10 * SCALE; // 10 yards * scale

                return (
                  <Group key={`yard-mark-${i}`}>
                    {/* Full width yard line (faint) */}
                    <Line
                      points={[yardLineX, 0, yardLineX, FIELD_WIDTH]}
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth={1}
                    />
                  </Group>
                );
              })}

              {/* Brick marks (18 yards from goal lines) */}
              <Group>
                {/* Left Brick Mark - Vertical */}
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
                {/* Left Brick Mark - Horizontal */}
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
                {/* Right Brick Mark - Vertical */}
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
                {/* Right Brick Mark - Horizontal */}
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
              {/* HOME Text in Left Endzone */}
              <Text
                text="HOME"
                x={ENDZONE_LENGTH / 2}
                y={FIELD_WIDTH / 2}
                fontSize={28}
                fontFamily="Outfit, sans-serif"
                fontStyle="bold"
                fill="rgba(255,255,255,0.2)"
                rotation={90}
                offsetX={14} // Approx half height
                offsetY={40} // Approx half width
                letterSpacing={8}
                listening={false}
              />
              {/* AWAY Text in Right Endzone */}
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

              {/* Yard Numbers */}
              {[10, 20, 30, 40, 50, 60].map((yard) => {
                // Calculate position relative to center? No, absolute from left endzone.
                // 0 is goal line.
                const x = ENDZONE_LENGTH + yard * SCALE;
                // Display "50" at 35 yards? No, standard field numbering 0-100 or 0-50-0.
                // Ultimate is 70 yards deep. Midfield is 35.
                // Let's just show distance from goal line.
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

              {/* --- GAME OBJECTS --- */}

              {/* Ghost positions (previous frame) */}
              {!isPlaying &&
                prevFrameItems &&
                prevFrameItems.map((item) => (
                  <Circle
                    key={`ghost-${item.id}`}
                    x={item.x}
                    y={item.y}
                    radius={item.type === "disc" ? DISC_RADIUS : PLAYER_RADIUS}
                    fill={COLORS.GHOST}
                    stroke="none"
                    opacity={0.2} // Lower opacity for ghost
                  />
                ))}

              {/* Players and disc */}
              {itemsRendered.map((item) => {
                const isSelected = selectedItemId === item.id;
                const radius =
                  item.type === "disc" ? DISC_RADIUS : PLAYER_RADIUS;

                // Define gradient colors based on item type
                let gradientStartColor, gradientEndColor, shadowColor;

                if (item.type === "offense") {
                  gradientStartColor = COLORS.OFFENSE_LIGHT; // lighter
                  gradientEndColor = COLORS.OFFENSE; // darker
                  shadowColor = "rgba(239, 68, 68, 0.4)"; // red shadow
                } else if (item.type === "defense") {
                  gradientStartColor = COLORS.DEFENSE_LIGHT; // lighter
                  gradientEndColor = COLORS.DEFENSE; // darker
                  shadowColor = "rgba(37, 99, 235, 0.4)"; // blue shadow
                } else {
                  // Disc
                  gradientStartColor = COLORS.DISC_GLOW; // lighter yellow
                  gradientEndColor = COLORS.DISC; // darker yellow
                  shadowColor = "rgba(250, 204, 21, 0.5)"; // yellow shadow
                }

                return (
                  <Group
                    key={item.id}
                    x={item.x}
                    y={item.y}
                    draggable={!isPlaying && !isRecording}
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
                    {/* Selection glow ring (outer indicator) */}
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

                    {/* Shadow circle for depth */}
                    <Circle
                      radius={radius}
                      fill={shadowColor}
                      offsetY={-2}
                      opacity={0.6}
                      blur={4}
                    />

                    {/* Main circle with radial gradient */}
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
                      strokeWidth={
                        isSelected ? SELECTION_STROKE_WIDTH + 1 : 1.5
                      }
                      shadowColor="rgba(0, 0, 0, 0.3)"
                      shadowBlur={3}
                      shadowOffset={{ x: 1, y: 2 }}
                      shadowOpacity={0.5}
                    />

                    {/* Label for players */}
                    {item.type !== "disc" && (
                      <>
                        {/* Text shadow for better readability */}
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
            </Layer>
          </Stage>
        </div>

      </div>
    );
  }
);

PlaybookCanvas.displayName = "PlaybookCanvas";

export default PlaybookCanvas;
