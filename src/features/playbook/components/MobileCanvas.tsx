import { forwardRef, useRef } from "react";
import { Stage, Layer } from "react-konva";
import Konva from "konva";
import type { DraggableItem } from "../types";
import FieldLayer from "./canvas/FieldLayer";
import GhostLayer from "./canvas/GhostLayer";
import ItemsLayer from "./canvas/ItemsLayer";
import { useCanvasViewport } from "../hooks/useCanvasViewport";
import { ViewportTransform } from "../utils/viewport";

interface MobileCanvasProps {
  currentItems: DraggableItem[];
  prevFrameItems?: DraggableItem[];
  animatingItems: DraggableItem[] | null;
  selectedItemId: string | null;
  isPlaying: boolean;
  isRecording: boolean;
  onDragEnd: (e: any, id: string) => void;
  onSelect: (id: string | null) => void;
}

const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

const getCenter = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
};

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

    // --- Intelligent Viewport System ---
    // Automatically calculates optimal scale/position
    const { scale, position, setTransform } = useCanvasViewport(containerRef, {
        mode: 'fit-width', // Force fit-width strategy
        padding: 10
    });

    // Gesture State (Temporary ref for ongoing gestures)
    const lastCenter = useRef<{ x: number; y: number } | null>(null);
    const lastDist = useRef<number>(0);

    // --- Handlers ---

    const handleTouchStart = (e: Konva.KonvaEventObject<TouchEvent>) => {
      const touch1 = e.evt.touches[0];
      const touch2 = e.evt.touches[1];

      if (touch1 && touch2) {
        // Pinch start
        const p1 = { x: touch1.clientX, y: touch1.clientY };
        const p2 = { x: touch2.clientX, y: touch2.clientY };
        
        lastCenter.current = getCenter(p1, p2);
        lastDist.current = getDistance(p1, p2);
      }
      
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        onSelect(null);
      }
    };

    const handleTouchMove = (e: Konva.KonvaEventObject<TouchEvent>) => {
      const touch1 = e.evt.touches[0];
      const touch2 = e.evt.touches[1];

      if (touch1 && touch2) {
        // Pinch Zooming
        e.evt.preventDefault();

        const p1 = { x: touch1.clientX, y: touch1.clientY };
        const p2 = { x: touch2.clientX, y: touch2.clientY };

        const newCenter = getCenter(p1, p2);
        const newDist = getDistance(p1, p2);

        if (!lastCenter.current || lastDist.current === 0) {
           return;
        }

        // Update via the centralized transform setter
        // Note: We need to perform the 'zoom at point' calculation here and pass the new state
        setTransform((prev: ViewportTransform) => {
            const pointTo = {
              x: (lastCenter.current!.x - prev.x) / prev.scale,
              y: (lastCenter.current!.y - prev.y) / prev.scale,
            };

            const scaleBy = newDist / lastDist.current;
            const newScale = prev.scale * scaleBy;
            
            // Constrain
            const constrainedScale = Math.max(0.2, Math.min(newScale, 3));

            const dx = newCenter.x - lastCenter.current!.x;
            const dy = newCenter.y - lastCenter.current!.y;

            const newX = newCenter.x - pointTo.x * constrainedScale + dx;
            const newY = newCenter.y - pointTo.y * constrainedScale + dy;

            return { scale: constrainedScale, x: newX, y: newY };
        });

        lastDist.current = newDist;
        lastCenter.current = newCenter;
      }
    };

    const handleTouchEnd = () => {
      lastDist.current = 0;
      lastCenter.current = null;
    };

    return (
      <div ref={containerRef} className="w-full h-full bg-slate-200 touch-none">
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          draggable={!isRecording} 
          x={position.x}
          y={position.y}
          scaleX={scale}
          scaleY={scale}
          ref={ref}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDragEnd={(e) => {
            if (e.target === e.target.getStage()) {
                // Sync back to viewport state
                setTransform((prev: ViewportTransform) => ({
                    ...prev,
                    x: e.target.x(),
                    y: e.target.y()
                }));
            }
          }}
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