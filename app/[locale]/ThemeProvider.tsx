"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * 主题模式。
 *
 * 深色不是靠组件里写 dark: 变体实现的 —— 那样每加一个组件就要补一遍，
 * 漏一个就出现「浅色正常、深色瞎」。这里是翻转 <html> 上的 .dark 类，
 * 整套 token（app/[locale]/styles/tokens.css）跟着翻。
 */
export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "picprose-theme";

interface ThemeContextValue {
  mode: ThemeMode;
  /** mode = system 时，resolved 是系统实际给出的那一档 */
  resolved: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  // 本地偏好只能在客户端读 —— SSR 阶段没有 localStorage。
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      setModeState(stored);
    }
  }, []);

  useEffect(() => {
    const apply = () => {
      const next = mode === "system" ? systemTheme() : mode;
      setResolved(next);
      document.documentElement.classList.toggle("dark", next === "dark");
    };

    apply();
    if (mode !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo(
    () => ({ mode, resolved, setMode }),
    [mode, resolved, setMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
