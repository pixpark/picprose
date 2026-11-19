/**
 * SVG 参数面板的纯逻辑。
 *
 * 两个动作都是「改参数 → 重新生成 SVG → 挂到背景上」：
 *   applySvgParam     改单个参数（振幅、颜色、渐变开关……）
 *   randomizeWaveParams  随机生成一整套波浪参数
 *
 * 抽成纯函数以后，参数面板组件里只剩渲染。
 * 这个文件不碰 React，不需要 "use client"。
 */
import { SVG_BACKGROUNDS } from "../svgBackgrounds";
import type { SvgTemplateParams } from "../svgBackgrounds";
import type {
  SetBackgroundPattern,
  SetBackgroundType,
  SetSvgPatternParams,
} from "./types";

/** 把 SVG 模板渲染成可以当 background 用的 data URI。 */
const toBackgroundPattern = (svgPattern: string): string =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(svgPattern)}")`;

/** 改一个参数，并立刻把新的 SVG 挂到背景上。 */
export const applySvgParam = (
  selectedSvgIndex: number | null,
  svgPatternParams: SvgTemplateParams,
  setSvgPatternParams: SetSvgPatternParams,
  setBackgroundType: SetBackgroundType,
  setBackgroundPattern: SetBackgroundPattern,
  param: string,
  value: unknown,
): void => {
  if (selectedSvgIndex === null) return;

  // Create new parameter object
  const currentSvg = SVG_BACKGROUNDS[selectedSvgIndex];
  const newParams: SvgTemplateParams = {
    ...currentSvg.defaultParams, // Ensure default values
    ...svgPatternParams, // Current values
    [param]: value // New value
  };

  // Update parameter state
  setSvgPatternParams(newParams);

  // Generate new SVG template
  const svgPattern = currentSvg.svgTemplate(newParams);

  // Update background
  setBackgroundType("svg");
  setBackgroundPattern(toBackgroundPattern(svgPattern));
};

/**
 * 随机生成一组波浪参数。
 *
 * 只对「波浪」模板有效 —— 别的模板直接返回。
 */
export const randomizeWaveParams = (
  selectedSvgIndex: number | null,
  setSvgPatternParams: SetSvgPatternParams,
  setBackgroundPattern: SetBackgroundPattern,
  setBackgroundType: SetBackgroundType,
): void => {
  if (selectedSvgIndex === null) return;

  // Confirm it's Heazy wave
  const currentSvg = SVG_BACKGROUNDS[selectedSvgIndex];
  if (currentSvg.id !== "wave") return;

  // Create new parameter object, preserving default value structure
  const params: SvgTemplateParams = {...currentSvg.defaultParams};

  // Extended random color generation - includes multiple beautiful color tones
  const colorPalettes = [
    // Ocean blue tones
    [200, 210, 220, 230, 240, 190, 180],
    // Purple tones
    [260, 270, 280, 290, 300, 250, 240],
    // Green tones
    [120, 130, 140, 150, 160, 110, 100],
    // Orange-red tones
    [10, 20, 30, 340, 350, 0, 15],
    // Pink tones
    [300, 310, 320, 330, 340, 290, 280],
    // Cyan-green tones
    [160, 170, 180, 190, 200, 150, 140]
  ];

  // Randomly select a color palette
  const selectedPalette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
  const hue1 = selectedPalette[Math.floor(Math.random() * selectedPalette.length)];
  const hue2 = selectedPalette[Math.floor(Math.random() * selectedPalette.length)];

  // Ensure color saturation and lightness are within appropriate ranges
  const saturation1 = 65 + Math.floor(Math.random() * 25); // 65-90%
  const saturation2 = 65 + Math.floor(Math.random() * 25); // 65-90%
  const lightness1 = 45 + Math.floor(Math.random() * 25); // 45-70%
  const lightness2 = 45 + Math.floor(Math.random() * 25); // 45-70%

  params.color1 = `hsl(${hue1}, ${saturation1}%, ${lightness1}%)`;
  params.color2 = `hsl(${hue2}, ${saturation2}%, ${lightness2}%)`;

  // Optimize parameter ranges to ensure stable visual effects
  params.amplitude = 45 + Math.floor(Math.random() * 30); // 45-75, avoid too small or too large
  params.frequency = 0.006 + (Math.random() * 0.008); // 0.006-0.014, maintain appropriate wave density
  params.layers = 3 + Math.floor(Math.random() * 2); // 3-4 layers, maintain depth
  params.speed = 0.2 + (Math.random() * 0.3); // 0.2-0.5, moderate animation speed
  params.rotation = 0; // Fixed at 0, avoid rotation affecting aesthetics
  params.contrast = 75 + Math.floor(Math.random() * 20); // 75-95, maintain good contrast
  params.wavesOpacity = 0.7 + (Math.random() * 0.2); // 0.7-0.9, maintain sufficient transparency

  // Fixed to right direction, best effect
  params.direction = 'right';

  // Fixed to solid style, better visual effect
  params.style = 'solid';

  // Always use gradient background, better effect
  params.useGradientBg = true;

  if (!params.useGradientBg) {
    // If not using gradient, randomly generate background color (dark tones)
    const bgHue = Math.floor(Math.random() * 360);
    params.backgroundColor = `hsl(${bgHue}, 70%, 10%)`;
  }

  // 更新状态
  setSvgPatternParams(params);

  // 生成SVG
  const svgPattern = currentSvg.svgTemplate(params);
  setBackgroundPattern(toBackgroundPattern(svgPattern));
  setBackgroundType("svg");
};
