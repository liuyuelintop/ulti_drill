import { forwardRef, useState, useEffect, useRef } from "react";
import { Stage, Layer } from "react-konva";
import Konva from "konva";
import type { DraggableItem } from "../types";
import { FIELD_LENGTH, FIELD_WIDTH } from "../constants/canvas";
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
    const [canvasScale, setCanvasScale] = useState(1);

    useEffect(() => {
      const updateScale = () => {
        if (containerRef.current) {
          const containerWidth = containerRef.current.offsetWidth;
          const containerHeight = containerRef.current.offsetHeight;
          const scaleX = containerWidth / FIELD_LENGTH;
          const scaleY = containerHeight / FIELD_WIDTH;
          const newScale = Math.min(scaleX, scaleY, 1);
          setCanvasScale(newScale);
        }
      };

      updateScale();
      const resizeObserver = new ResizeObserver(updateScale);
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
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
              const clickedOnEmpty = e.target === e.target.getStage();
              if (clickedOnEmpty) onSelect(null);
            }}
            onTouchStart={(e) => {
              const clickedOnEmpty = e.target === e.target.getStage();
              if (clickedOnEmpty) onSelect(null);
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
      </div>
    );
  }
);

PlaybookCanvas.displayName = "PlaybookCanvas";

export default PlaybookCanvas;
