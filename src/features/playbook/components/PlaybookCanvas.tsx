import { forwardRef, useState, useEffect, useRef } from "react";
import { Stage, Layer } from "react-konva";
import Konva from "konva";
import type { DraggableItem } from "../types";
import { calculateScale, toCanvas } from "../utils/coordinates";
import { DEFAULT_STANDARD } from "../constants/standards";
import FieldLayer from "./canvas/FieldLayer";
import GhostLayer from "./canvas/GhostLayer";
import ItemsLayer from "./canvas/ItemsLayer";

interface PlaybookCanvasProps {
  currentItems: DraggableItem[];
  prevFrameItems?: DraggableItem[];
  animatingItems: DraggableItem[] | null;
  selectedItemId: string | null;
  isPlaying: boolean;
  isRecording: boolean;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>, id: string) => void;
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
    const [scale, setScale] = useState(1);

    useEffect(() => {
      const updateScale = () => {
        if (containerRef.current) {
          const newScale = calculateScale(
            containerRef.current.offsetWidth,
            containerRef.current.offsetHeight,
            DEFAULT_STANDARD,
            0
          );
          setScale(newScale);
        }
      };

      updateScale();
      const resizeObserver = new ResizeObserver(updateScale);
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }, []);

    const stageWidth = toCanvas(DEFAULT_STANDARD.dimensions.length, scale);
    const stageHeight = toCanvas(DEFAULT_STANDARD.dimensions.width, scale);

    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_8px_40px_rgba(0,0,0,0.08)] relative h-full flex flex-col">
        <div
          ref={containerRef}
          className="rounded-xl overflow-hidden shadow-inner border border-slate-100 flex items-center justify-center flex-1 w-full"
        >
          <Stage
            width={stageWidth}
            height={stageHeight}
            ref={ref}
            onMouseDown={(e) => {
              const clickedOnEmpty = e.target === e.target.getStage();
              if (clickedOnEmpty) onSelect(null);
            }}
            onTouchStart={(e) => {
              const clickedOnEmpty = e.target === e.target.getStage();
              if (clickedOnEmpty) onSelect(null);
            }}
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
                isInteractive={!isPlaying && !isRecording}
                onDragEnd={onDragEnd}
                onSelect={onSelect}
                scale={scale}
              />
            </Layer>
          </Stage>
        </div>
      </div>
    );
  }
);

PlaybookCanvas.displayName = "PlaybookCanvas";

export default PlaybookCanvas;
