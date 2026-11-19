import { WAVE_DEFAULT_PARAMS, waveTemplate } from "./wave";
import { CORNER_DEFAULT_PARAMS, cornerTemplate } from "./corner";
import type { SvgTemplate } from "./types";

/**
 * SVG 背景模板登记表。
 *
 * 一模板一文件（`./wave.ts`、`./corner.ts`），这里只负责登记。
 * 左栏和右面板都按**这张表**的下标取模板 —— 之前左栏自己拼了一个
 * 局部数组，两边下标对不上，「角落」选不中（P1-2）。
 *
 * 右面板的「随机生成」按 `name === "波浪"` 判断类型，加新模板时记得同步。
 */
export const SVG_BACKGROUNDS: SvgTemplate[] = [
  {
    id: "wave",
    nameKey: "svg_wave",
    svgTemplate: waveTemplate,
    defaultParams: WAVE_DEFAULT_PARAMS,
  },
  {
    id: "corner",
    nameKey: "svg_corner",
    svgTemplate: cornerTemplate,
    defaultParams: CORNER_DEFAULT_PARAMS,
  },
];

export type { SvgTemplate, SvgTemplateParams } from "./types";
