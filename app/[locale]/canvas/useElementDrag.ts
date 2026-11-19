"use client";
import { useEffect, useRef, useState } from "react";
import type React from "react";
import type { EditorElements } from "../types";

/** 可拖动的元素。 */
export type DraggableElement = "title" | "author" | "icon" | "image";

/** 网格步长（px）。 */
export const GRID_STEP = 10;

/**
 * 拖拽原点：鼠标落点 + 元素落点。
 *
 * 只在 mousedown 记一次，之后所有位移都相对它算。
 */
interface DragOrigin {
  element: DraggableElement;
  mouseX: number;
  mouseY: number;
  originX: number;
  originY: number;
}

/** 取整到网格。 */
const snapToGrid = (value: number): number =>
  Math.round(value / GRID_STEP) * GRID_STEP;

interface UseElementDragOptions {
  /** 是否处于拖拽模式。 */
  isDragMode: boolean;
  /** 当前的元素位置。 */
  elements: EditorElements;
  /** 改元素位置。 */
  setElements: React.Dispatch<React.SetStateAction<EditorElements>>;
  /** 拖完记一笔历史。 */
  saveHistory: (elements: EditorElements) => void;
}

/**
 * 画布元素的拖拽。
 *
 * **只记一次原点，取整只做一次。**
 *
 * 旧实现每来一次 mousemove 就把 dragStart 重置到当前鼠标位置，并且单独对
 * delta 取整 —— 5px 的小步会被 snap 成 10px，一格不多一格不少地累加，
 * 拖 60px 位移 120px（实测）。现在只记录一次原点，所有位移都相对原点算，
 * 并且只在「原点 + 总偏移」上取整一次。
 *
 * 另外，document 上的监听只在拖拽开始时订阅一次（不再每次 move 退订重订），
 * 回调里要用的最新值一律从 ref 读。
 */
export function useElementDrag({
  isDragMode,
  elements,
  setElements,
  saveHistory,
}: UseElementDragOptions) {
  const [draggingElement, setDraggingElement] =
    useState<DraggableElement | null>(null);

  const dragOriginRef = useRef<DragOrigin | null>(null);

  /** 始终指向最新的 elements / saveHistory，避免监听器闭包过期。 */
  const elementsRef = useRef(elements);
  const saveHistoryRef = useRef(saveHistory);
  useEffect(() => {
    elementsRef.current = elements;
    saveHistoryRef.current = saveHistory;
  });

  /** 开始拖某个元素。 */
  const startDrag = (
    element: DraggableElement,
    event: React.MouseEvent
  ) => {
    if (!isDragMode) return;
    event.stopPropagation();

    const current = elements[element];
    dragOriginRef.current = {
      element,
      mouseX: event.clientX,
      mouseY: event.clientY,
      originX: current.x,
      originY: current.y,
    };
    setDraggingElement(element);
  };

  useEffect(() => {
    if (!draggingElement) return;

    const onMove = (event: MouseEvent) => {
      const origin = dragOriginRef.current;
      if (!origin || !isDragMode) return;

      // 只在「拖拽原点 + 总偏移」上取整一次，delta 绝不单独取整。
      const targetX = snapToGrid(
        origin.originX + (event.clientX - origin.mouseX)
      );
      const targetY = snapToGrid(
        origin.originY + (event.clientY - origin.mouseY)
      );

      setElements((prev) => {
        const current = prev[origin.element];
        if (current.x === targetX && current.y === targetY) return prev;
        return {
          ...prev,
          [origin.element]: { ...current, x: targetX, y: targetY },
        };
      });
    };

    const onUp = () => {
      if (dragOriginRef.current) {
        saveHistoryRef.current(elementsRef.current);
      }
      dragOriginRef.current = null;
      setDraggingElement(null);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [draggingElement, isDragMode, setElements]);

  return { draggingElement, startDrag };
}
