/**
 * 比例预设（纯数据 + 纯函数）。
 *
 * 四组预设 —— 横屏 / 竖屏 / 社交平台 / 设备 —— 原来都写在
 * RightPropertyPanel 里，比例卡片和尺寸弹窗各用一份。
 * 拆到这里，两边共用同一份定义。
 *
 * 这个文件不碰 React，不需要 "use client"。
 */
import type { PropertyInfo } from "./types";

/** 一个比例预设。 */
export interface AspectOption {
  /** 比例文字，例如 "16:9"。 */
  label: string;
  /**
   * 显示名的 i18n key。
   *
   * 平台名这种要翻译的才填；纯数字比例（"16: 9"）不用填。
   */
  labelKey?: string;
  /** 预设标识，存进 propertyInfo.selectedValue。 */
  value: string;
  /** 尺寸文字，例如 "1920 × 1080"。 */
  description: string;
  /** Tailwind 比例类名，存进 propertyInfo.aspect。 */
  ratio: string;
}

export const horizontalAspectOptions: AspectOption[] = [
  { label: "1 : 1", value: "horizontal-square-aspect-square", description: "1185 × 1185", ratio: "aspect-square" },
  { label: "2 : 1", value: "horizontal-2x1-aspect-[2/1]", description: "1185 × 593", ratio: "aspect-[2/1]" },
  { label: "3 : 2", value: "horizontal-3x2-aspect-[3/2]", description: "1185 × 790", ratio: "aspect-[3/2]" },
  { label: "4 : 3", value: "horizontal-4x3-aspect-[4/3]", description: "1185 × 889", ratio: "aspect-[4/3]" },
  { label: "16: 9", value: "horizontal-16x9-aspect-[16/9]", description: "1185 × 667", ratio: "aspect-[16/9]" },
];

export const verticalAspectOptions: AspectOption[] = [
  { label: "1:2", value: "vertical-1x2-aspect-[1/2]", description: "593 × 1185", ratio: "aspect-[1/2]" },
  { label: "2:3", value: "vertical-2x3-aspect-[2/3]", description: "790 × 1185", ratio: "aspect-[2/3]" },
  { label: "3:4", value: "vertical-3x4-aspect-[3/4]", description: "889 × 1185", ratio: "aspect-[3/4]" },
  { label: "9:16", value: "vertical-9x16-aspect-[9/16]", description: "667 × 1185", ratio: "aspect-[9/16]" },
];

// Social platform preset sizes - add unique identifiers for each option
export const socialMediaAspectOptions: AspectOption[] = [
  { label: "WeChat Official Account", labelKey: "aspect_wechat", value: "social-wechat-aspect-[900/383]", description: "900 × 383", ratio: "aspect-[900/383]" },
  { label: "BiliBili", value: "social-bilibili-aspect-[16/9]", description: "1920 × 1080", ratio: "aspect-[16/9]" },
  { label: "YouTube Channel", labelKey: "aspect_youtube_channel", value: "social-youtube-channel-aspect-[16/9]", description: "2560 × 1440", ratio: "aspect-[16/9]" },
  { label: "YouTube Video", labelKey: "aspect_youtube_video", value: "social-youtube-video-aspect-[16/9]", description: "1280 × 720", ratio: "aspect-[16/9]" },
  { label: "Twitter", value: "social-twitter-aspect-[3/1]", description: "1500 × 500", ratio: "aspect-[3/1]" },
  { label: "Facebook Desktop", labelKey: "aspect_facebook_desktop", value: "social-facebook-desktop-aspect-[820/312]", description: "820 × 312", ratio: "aspect-[820/312]" },
  { label: "Facebook Mobile", labelKey: "aspect_facebook_mobile", value: "social-facebook-mobile-aspect-[16/9]", description: "640 × 360", ratio: "aspect-[16/9]" },
];

// Device preset sizes - add unique identifiers for each option
export const deviceAspectOptions: AspectOption[] = [
  { label: "Full HD", value: "device-fullhd-aspect-[16/9]", description: "1920 × 1080", ratio: "aspect-[16/9]" },
  { label: "MacBook", value: "device-macbook-aspect-[16/10]", description: "2560 × 1600", ratio: "aspect-[16/10]" },
  { label: "iPhone 13", value: "device-iphone13-aspect-[9/19.5]", description: "1170 × 2532", ratio: "aspect-[9/19.5]" },
  { label: "Galaxy S10", value: "device-galaxys10-aspect-[9/19]", description: "1440 × 3040", ratio: "aspect-[9/19]" },
  { label: "iPhone SE", value: "device-iphonese-aspect-[9/16]", description: "750 × 1334", ratio: "aspect-[9/16]" },
];

/** 全部预设（查当前选中项时用）。 */
export const allAspectOptions: AspectOption[] = [
  ...horizontalAspectOptions,
  ...verticalAspectOptions,
  ...socialMediaAspectOptions,
  ...deviceAspectOptions,
];

const gcd = (a: number, b: number): number => {
  return b === 0 ? a : gcd(b, a % b);
};

const formatAspectRatio = (width: number, height: number): string => {
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
};

/**
 * 比例卡片上显示的两行文字。
 *
 * 自定义比例按实际宽高约分；预设比例直接显示标签；
 * 都没匹配上就回落到 16:9。
 */
export const getCurrentDimensionsText = (
  propertyInfo: PropertyInfo,
  /** 翻译函数：平台名这类标签要走 i18n。 */
  translate?: (key: string) => string,
): { ratio: string; dimensions: string } => {
  if (propertyInfo.isCustomAspect) {
    return {
      ratio: formatAspectRatio(propertyInfo.customWidth || 1920, propertyInfo.customHeight || 1080),
      dimensions: `${propertyInfo.customWidth || 1920} × ${propertyInfo.customHeight || 1080}`
    };
  }

  const selectedOption = allAspectOptions.find(option => option.value === propertyInfo.selectedValue);

  if (selectedOption) {
    return {
      ratio:
        selectedOption.labelKey && translate
          ? translate(selectedOption.labelKey)
          : selectedOption.label,
      dimensions: selectedOption.description
    };
  }

  return {
    ratio: "16:9",
    dimensions: "1920 × 1080"
  };
};
