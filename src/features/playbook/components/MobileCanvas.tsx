import { forwardRef, useRef, useState, useEffect } from "react";
import { Stage, Layer } from "react-konva";
import Konva from "konva";
import type { DraggableItem } from "../types";
import { calculateScale, toCanvas } from "../utils/coordinates";
import { DEFAULT_STANDARD } from "../constants/standards";
import FieldLayer from "./canvas/FieldLayer";
import GhostLayer from "./canvas/GhostLayer";
import ItemsLayer from "./canvas/ItemsLayer";

interface MobileCanvasProps {
  currentItems: DraggableItem[];
  prevFrameItems?: DraggableItem[];
  animatingItems: DraggableItem[] | null;
  selectedItemId: string | null;
  isPlaying: boolean;
  isRecording: boolean;
  readOnly?: boolean;
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
      readOnly = false,
      onDragEnd,
      onSelect,
    },
    ref
  ) => {
    const itemsRendered = isPlaying && animatingItems ? animatingItems : currentItems;
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
      const updateScale = () => {
        if (containerRef.current) {
          const newScale = calculateScale(
            containerRef.current.offsetWidth,
            containerRef.current.offsetHeight,
            DEFAULT_STANDARD,
            10 // Mobile padding
          );
          setScale(newScale);
        }
      };

      updateScale();
      window.addEventListener('resize', updateScale);
      return () => window.removeEventListener('resize', updateScale);
    }, []);

    // Calculate stage dimensions based on logical size and current scale
    const stageWidth = toCanvas(DEFAULT_STANDARD.dimensions.length, scale);
    const stageHeight = toCanvas(DEFAULT_STANDARD.dimensions.width, scale);

    // --- Handler: Deselect on empty click ---
    const handleClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        onSelect(null);
      }
    };

    return (
      <div ref={containerRef} className="w-full h-full bg-slate-200 flex items-center justify-center">
        <Stage
          width={stageWidth}
          height={stageHeight}
          draggable={false}
          ref={ref}
          onClick={handleClick}
          onTap={handleClick}
        >
          <Layer>
            <FieldLayer scale={scale} standard={DEFAULT_STANDARD} />
            <GhostLayer 
              prevFrameItems={prevFrameItems} 
              showGhosts={!isPlaying} 
              scale={scale}
            />
            <ItemsLayer
              items={itemsRendered}
              selectedItemId={selectedItemId}
              isInteractive={!readOnly && !isPlaying && !isRecording}
              onDragEnd={onDragEnd}
              onSelect={onSelect}
              scale={scale}
            />
          </Layer>
        </Stage>
      </div>
    );
  }
);

MobileCanvas.displayName = "MobileCanvas";