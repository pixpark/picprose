"use client";
import { useEffect, useState } from "react";
import type React from "react";
import { GRID_STEP } from "./useElementDrag";

/** 网格线数量上限，防止容器极大时渲染出海量节点。 */
const MAX_GRID_LINES = 1000;

interface CanvasGridProps {
  /** 是否处于拖拽模式。 */
  isDragMode: boolean;
  /** 画布容器，用来量尺寸。 */
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * 拖拽时的对齐参考线。
 *
 * 旧实现把 `containerRef.current?.clientWidth` 放进 useEffect 的依赖数组 ——
 * ref 变化不会触发重渲染，窗口缩放后网格线永远是旧的。
 * 现在用 ResizeObserver 主动跟随容器尺寸。
 */
export const CanvasGrid = ({ isDragMode, containerRef }: CanvasGridProps) => {
  const [gridLines, setGridLines] = useState({ horizontal: 0, vertical: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isDragMode) return;

    const update = () => {
      setGridLines({
        horizontal: Math.min(
          Math.floor(el.clientHeight / GRID_STEP),
          MAX_GRID_LINES
        ),
        vertical: Math.min(
          Math.floor(el.clientWidth / GRID_STEP),
          MAX_GRID_LINES
        ),
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isDragMode, containerRef]);

  if (!isDragMode) return null;

  return (
    <>
      {/* Main grid - large area divisions */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="border border-white/20"></div>
        ))}
      </div>

      {/* Fine grid - 10px alignment guides */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Horizontal lines */}
        {Array.from({ length: gridLines.horizontal }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute left-0 right-0 border-t border-white/10"
            style={{ top: `${i * GRID_STEP}px`, height: "1px" }}
          ></div>
        ))}

        {/* Vertical lines */}
        {Array.from({ length: gridLines.vertical }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute top-0 bottom-0 border-l border-white/10"
            style={{ left: `${i * GRID_STEP}px`, width: "1px" }}
          ></div>
        ))}
      </div>
    </>
  );
};
