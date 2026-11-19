import type { Config } from "tailwindcss";
import type { PluginCreator } from "tailwindcss/types/config";
import {heroui} from "@heroui/react";

/**
 * PicProse 的 Tailwind 配置。
 *
 * 颜色分两套，别混着写：
 *  - pp-*       → app/[locale]/styles/tokens.css 里的品牌 token，跟随 <html>.dark 翻转
 *  - default-* / foreground-* → 组件库（NextUI → HeroUI）自己的语义色，同样跟随主题翻转
 *
 * Tailwind v3 没有 v4 的 @theme inline，所以变量到 class 的映射写在这里。
 */
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/**/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "pp-canvas": "var(--pp-canvas)",
        "pp-surface": "var(--pp-surface)",
        "pp-side": "var(--pp-side)",
        "pp-soft": "var(--pp-soft)",
        "pp-chip": "var(--pp-chip)",
        "pp-line": "var(--pp-line)",
        "pp-ink": "var(--pp-ink)",
        "pp-muted": "var(--pp-muted)",
        "pp-faint": "var(--pp-faint)",
        "pp-accent": "var(--pp-accent)",
        "pp-brand": "var(--pp-brand)",
        "pp-brand-hover": "var(--pp-brand-hover)",
        "pp-brand-soft": "var(--pp-brand-soft)",
        "pp-brand-soft-fg": "var(--pp-brand-soft-fg)",
        "pp-ok": "var(--pp-ok)",
        "pp-ok-bg": "var(--pp-ok-bg)",
        "pp-warn": "var(--pp-warn)",
        "pp-warn-bg": "var(--pp-warn-bg)",
        "pp-danger": "var(--pp-danger)",
        "pp-danger-bg": "var(--pp-danger-bg)",
        "pp-info": "var(--pp-info)",
        "pp-info-bg": "var(--pp-info-bg)",
      },
      borderRadius: {
        sm: "var(--pp-radius-sm)",
        md: "var(--pp-radius-md)",
        lg: "var(--pp-radius-lg)",
        xl: "var(--pp-radius-lg)",
        "2xl": "var(--pp-radius-lg)",
        "3xl": "var(--pp-radius-lg)",
      },
      boxShadow: {
        card: "var(--pp-shadow-card)",
        pop: "var(--pp-shadow-pop)",
        ring: "var(--pp-shadow-ring)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        // 👇 Add CSS variables
        sans: ["var(--font-opensans)"],
        mono: ["var(--font-roboto-mono)"],
        anke: ["var(--font-anke)"],
        dingtalk: ["var(--font-dingtalk)"],
        kingsoft: ["var(--font-kingsoft)"],
        xinyiguanhei: ["var(--font-xinyiguanhei)"],
        alibaba: ["var(--font-alibaba)"],
      },
      aspectRatio: {
        '2/1': '2 / 1',
        '3/2': '3 / 2',
        '4/3': '4 / 3',
        '16/9': '16 / 9',
        '9/16': '9 / 16',
        '1/2': '1 / 2',
        '2/3': '2 / 3',
        '3/4': '3 / 4',
      },
    },
  },
  darkMode: "class",
  // HeroUI v2 的插件类型是按 Tailwind v4 写的，本项目还在 Tailwind v3。
  // 插件本身用的还是 v3 的 API（addBase / addUtilities / addVariant），
  // 运行时没问题，只有类型对不上 —— 这里只在类型上放行。
  plugins: [heroui() as unknown as PluginCreator],
};
export default config;
