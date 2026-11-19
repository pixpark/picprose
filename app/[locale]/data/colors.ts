/**
 * 背景色预设 —— 这些是**内容**，不是界面配色。
 *
 * 用户从左栏挑一个颜色铺在封面上，取值是任意的具体色号，
 * 跟 --pp-* 设计 token 不是一回事（token 管的是界面本身的颜色）。
 * 所以它们不进 tokens.css，护栏脚本里也单独豁免（见 scripts/check-ui.mjs）。
 */

/** 纯色预设。 */
export const SOLID_COLORS = [
  "#1F2937", "#1E3A8A", "#312E81", "#4C1D95", "#5B21B6", "#6D28D9",
  "#7C3AED", "#8B5CF6", "#9333EA", "#A855F7", "#C026D3", "#D946EF",
  "#831843", "#9D174D", "#BE185D", "#DB2777", "#E11D48", "#F43F5E",
  "#991B1B", "#B91C1C", "#DC2626", "#EF4444", "#F59E0B", "#F97316",
  "#FBBF24", "#065F46", "#047857", "#059669", "#10B981", "#34D399"
];

/** 渐变预设。 */
export const GRADIENT_COLORS = [
  "linear-gradient(to right, #8e2de2, #4a00e0)",
  "linear-gradient(to right, #fc466b, #3f5efb)",
  "linear-gradient(to right, #00b09b, #96c93d)",
  "linear-gradient(to right, #ff9966, #ff5e62)",
  "linear-gradient(to right, #a770ef, #cf8bf3, #fdb99b)",
  "linear-gradient(to right, #f953c6, #b91d73)",
  "linear-gradient(to right, #1e3c72, #2a5298)",
  "linear-gradient(to right, #c33764, #1d2671)",
  "linear-gradient(to right, #6190e8, #a7bfe8)",
  "linear-gradient(to right, #ff416c, #ff4b2b)",
  "linear-gradient(to right, #493240, #f09)",
  "linear-gradient(to right, #0f0c29, #302b63, #24243e)"
];

/** 遮罩色圆环选择器的色环。 */
export const MASK_COLORS = [
  "#1f2937",
  "#e91e63",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
  "#03a9f4",
  "#00bcd4",
  "#009688",
  "#4caf50",
  "#8bc34a",
  "#cddc39",
];
