/**
 * SVG 背景模板的参数结构。
 *
 * 参数面板（RightPropertyPanel）和渲染函数共用这一份定义：
 * 面板改哪个 key，渲染函数就读哪个 key，中间不再各写一份。
 *
 * 已知参数列出类型，未知参数走索引签名 —— 模板可以带自己的扩展参数。
 */
export interface SvgTemplateParams {
  color1?: string;
  color2?: string;
  backgroundColor?: string;
  height?: number;
  amplitude?: number;
  frequency?: number;
  layers?: number;
  speed?: number;
  rotation?: number;
  contrast?: number;
  wavesOpacity?: number;
  style?: "solid" | "outline";
  direction?: "left" | "right" | "none";
  useGradientBg?: boolean;
  [key: string]: unknown;
}

/**
 * 一个 SVG 背景模板。
 *
 * 逻辑判断一律用 id，不要用 name ——
 * name 是给用户看的（还要翻译），拿它做判断迟早会因为改文案而失效。
 */
export interface SvgTemplate {
  /** 稳定标识，例如 "wave"。 */
  id: string;
  /** 显示名的 i18n key，例如 "svg_wave"。 */
  nameKey: string;
  svgTemplate: (params: SvgTemplateParams) => string;
  defaultParams: SvgTemplateParams;
}
