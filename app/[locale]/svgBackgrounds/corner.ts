import type { SvgTemplate, SvgTemplateParams } from "./types";

/**
 * 「角落」模板。
 *
 * 之前它被临时塞在 LeftResourcePanel 里的一个局部数组中，而右面板
 * 按**全局** SVG_BACKGROUNDS 的下标取模板 —— 两边下标对不上，
 * 选「角落」时右面板一个控件都渲染不出来（见重构报告 P1-2）。
 * 现在它跟「波浪」一样进登记表，下标自然对齐。
 */
export const CORNER_DEFAULT_PARAMS: SvgTemplateParams = {
  color1: "#ff0071ff",
  color2: "#95ffa1ff",
  backgroundColor: "#95ffda",
  cornerRadius: 150,
  cornerCount: 5,
  strokeWidth: 30,
  rotation: 0,
  contrast: 50,
  layers: 3,
  height: 100,
  amplitude: 50,
  frequency: 0.02,
  speed: 0.5,
  wavesOpacity: 0.7,
  style: "solid",
  position: ["center"],
  mirrorEdges: false
};

export const cornerTemplate: SvgTemplate["svgTemplate"] = (
  params: SvgTemplateParams
) => {
  const { backgroundColor, color1, color2, strokeWidth, rotation } = params;

  return `<svg width="100%" height="100%" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="${backgroundColor ?? ""}" />
    <g transform="rotate(${rotation || 0}, 400, 300)">
      <path d="M200,150 Q350,50 500,150 T700,150"
            fill="none" stroke="${color1 ?? ""}" stroke-width="${strokeWidth || 30}" />
      <path d="M100,300 Q250,200 400,300 T600,300"
            fill="none" stroke="${color2 ?? ""}" stroke-width="${strokeWidth || 30}" />
    </g>
  </svg>`;
};
