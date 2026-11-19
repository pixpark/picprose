"use client";
import React from "react";
import { SOLID_COLORS, GRADIENT_COLORS } from "../data/colors";

export interface ColorSectionProps {
  /** 选中一个颜色（纯色或者渐变）。 */
  onSelectColor: (color: string) => void;
  /** 文案。 */
  t: (key: string) => string;
}

/**
 * 左栏的「颜色」面板：纯色板 + 渐变色板。
 *
 * 色值是内容预设，不是界面配色 —— 见 data/colors.ts 的说明。
 */
export const ColorSection = ({ onSelectColor, t }: ColorSectionProps) => (
  <div className="p-4">
    <h3 className="text-lg font-medium mb-4">{t("solid_colors")}</h3>
    <div className="grid grid-cols-6 gap-2 mb-6">
      {SOLID_COLORS.map((color, index) => (
        <div
          key={index}
          className="w-full aspect-square rounded-md cursor-pointer hover:scale-110 transition-transform border border-border"
          style={{ backgroundColor: color }}
          onClick={() => onSelectColor(color)}
        />
      ))}
    </div>

    <h3 className="text-lg font-medium my-4">{t("gradient_colors")}</h3>
    <div className="grid grid-cols-3 gap-2">
      {GRADIENT_COLORS.map((gradient, index) => (
        <div
          key={index}
          className="w-full h-20 rounded-md cursor-pointer hover:scale-105 transition-transform border border-border"
          style={{ background: gradient }}
          onClick={() => onSelectColor(gradient)}
        />
      ))}
    </div>
  </div>
);
