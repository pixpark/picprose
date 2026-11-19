/**
 * default config
 */
export const config = {
  /**
   * 示例标题，按语言分。
   *
   * 之前是一份混着中英文的数组，英文界面下标题会随机蹦出中文诗句。
   */
  titles: {
    zh: [
      "海内存知己, 天涯若比邻",
      "星垂平野阔, 月涌大江流",
      "大漠孤烟直, 长河落日圆",
    ],
    en: [
      "Why UI designers should understand Flexbox and CSS Grid",
      "The best interface is the one that disappears",
      "Ship it, then make it beautiful",
    ],
  },
  subTitle: "",
  author: "@PicProse",
  font: "font-anke",
  icon: "",
  backColor: "#1F2937",
  backBlurLevel: 60,
  deviconValue: ["aarch64-plain"],
  aspect: "aspect-[16/9]",
  blur: 0,
  blurTrans: 60,
  logoPosition: "default",
  fontSize: 40,
  authorFontSize: 25,
};

export type Config = typeof config;
