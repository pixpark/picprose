"use client";
import { Button } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useTheme, type ThemeMode } from "./ThemeProvider";

const ORDER: ThemeMode[] = ["light", "dark", "system"];

const LABEL: Record<ThemeMode, string> = {
  light: "☀ Light",
  dark: "☾ Dark",
  system: "◐ System",
};

/**
 * 主题切换：浅色 → 深色 → 跟随系统 → 浅色。
 *
 * 放工具条上，和撤销 / 重做 / 复位一排。
 */
export const ThemeToggle = () => {
  const t = useTranslations("ImageEditorToolbar");
  const { mode, resolved, setMode } = useTheme();

  const next = () => {
    // 从「跟随系统」出发时，第一下直接翻到当前主题的对面 ——
    // 点一下就知道切到了什么，而不是先跳到浅色再点一次。
    if (mode === "system") {
      setMode(resolved === "dark" ? "light" : "dark");
      return;
    }
    const idx = ORDER.indexOf(mode);
    setMode(ORDER[(idx + 1) % ORDER.length]);
  };

  return (
    <Button
      variant="secondary"
      onPress={next}
      isIconOnly
      size="sm"
      aria-label={`${t("theme")}: ${LABEL[mode]}`}
    >
      <span className="text-sm leading-none">{LABEL[mode].slice(0, 1)}</span>
    </Button>
  );
};
