import { forwardRef, useRef } from "react";
import { Stage, Layer } from "react-konva";
import Konva from "konva";
import type { DraggableItem } from "../types";
import FieldLayer from "./canvas/FieldLayer";
import GhostLayer from "./canvas/GhostLayer";
import ItemsLayer from "./canvas/ItemsLayer";
import { useCanvasViewport } from "../hooks/useCanvasViewport";

interface MobileCanvasProps {
  currentItems: DraggableItem[];
  prevFrameItems?: DraggableItem[];
  animatingItems: DraggableItem[] | null;
  selectedItemId: string | null;
  isPlaying: boolean;
  isRecording: boolean;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>, id: string) => void;
  onSelect: (id: string | null) => void;
}

export const MobileCanvas = forwardRef<Konva.Stage, MobileCanvasProps>(
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
    const itemsRendered = isPlaying && animatingItems ? animatingItems : currentItems;
    const containerRef = useRef<HTMLDivElement>(null);

    // --- Fixed Viewport (No gestures) ---
    // Automatically calculates optimal scale/position, but stays fixed
    const { scale, position } = useCanvasViewport(containerRef, {
        mode: 'fit-width',
        padding: 10
    });

    // --- Handler: Deselect on empty click ---
    const handleClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        onSelect(null);
      }
    };

    return (
      <div ref={containerRef} className="w-full h-full bg-slate-200">
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          draggable={false}
          x={position.x}
          y={position.y}
          scaleX={scale}
          scaleY={scale}
          ref={ref}
          onClick={handleClick}
          onTap={handleClick}
        >
          <Layer>
            <FieldLayer />
            <GhostLayer prevFrameItems={prevFrameItems} showGhosts={!isPlaying} />
            <ItemsLayer
              items={itemsRendered}
              selectedItemId={selectedItemId}
              isInteractive={!isPlaying && !isRecording}
              onDragEnd={onDragEnd}
              onSelect={onSelect}
            />
          </Layer>
        </Stage>
      </div>
    );
  }
);

MobileCanvas.displayName = "MobileCanvas";