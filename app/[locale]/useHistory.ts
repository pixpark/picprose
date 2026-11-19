"use client";
import { useCallback, useEffect, useReducer, useRef } from "react";
import type { EditorElements } from "./types";

/**
 * 撤销 / 重做。
 *
 * 之前这套逻辑散在 page.tsx 里：
 *   const [history, setHistory] = useState([initial]);
 *   const [historyIndex, setHistoryIndex] = useState(0);
 *   const saveHistory = (el) => {
 *     setHistory(prev => [...prev.slice(0, historyIndex + 1), {...el}]);  // ← 闭包里的旧索引
 *     setHistoryIndex(prev => prev + 1);
 *   };
 *
 * 两个 useState 分开存，索引更新要等下一次渲染，同一批里连着存两次
 * 就会拿同一个旧索引把历史截断。现在快照和索引放**同一份 state**，
 * 一次 dispatch 原子更新，不可能对不上。
 */

interface HistoryState {
  entries: EditorElements[];
  index: number;
}

type HistoryAction =
  | { type: "push"; entry: EditorElements }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset"; entry: EditorElements };

function reducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case "push": {
      const entries = [
        ...state.entries.slice(0, state.index + 1),
        { ...action.entry },
      ];
      return { entries, index: entries.length - 1 };
    }
    case "undo":
      return state.index > 0
        ? { ...state, index: state.index - 1 }
        : state;
    case "redo":
      return state.index < state.entries.length - 1
        ? { ...state, index: state.index + 1 }
        : state;
    case "reset":
      return { entries: [{ ...action.entry }], index: 0 };
  }
}

export function useHistory(
  initial: EditorElements,
  /** 把某个快照刷到画布上。 */
  apply: (entry: EditorElements) => void
) {
  const [state, dispatch] = useReducer(reducer, {
    entries: [initial],
    index: 0,
  });

  // apply 是 setElements，身份每次渲染都变；用 ref 兜住，
  // 免得 effect 因为它重挂。
  const applyRef = useRef(apply);
  useEffect(() => {
    applyRef.current = apply;
  });

  // 索引动了就把对应快照刷到画布上。
  const appliedRef = useRef<EditorElements | null>(null);
  useEffect(() => {
    const entry = state.entries[state.index];
    if (!entry || appliedRef.current === entry) return;
    appliedRef.current = entry;
    applyRef.current(entry);
  }, [state]);

  const push = useCallback(
    (entry: EditorElements) => dispatch({ type: "push", entry }),
    []
  );
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);
  const reset = useCallback(
    (entry: EditorElements) => dispatch({ type: "reset", entry }),
    []
  );

  return {
    entries: state.entries,
    index: state.index,
    canUndo: state.index > 0,
    canRedo: state.index < state.entries.length - 1,
    push,
    undo,
    redo,
    reset,
  };
}
