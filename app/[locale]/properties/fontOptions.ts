/**
 * 字体预设（纯数据）。
 *
 * 原来写在 RightPropertyPanel 里，字体下拉直接 map 这个数组。
 * 拆到这里以后，右面板外壳不再关心字体列表。
 *
 * 这个文件不碰 React，不需要 "use client"。
 */
export interface FontOption {
  /** 下拉里显示的名字。 */
  label: string;
  /** 字体标识，存进 propertyInfo.font。 */
  value: string;
  /** 预留描述。 */
  description: string;
}

export const fontOptions: FontOption[] = [
  {
    label: "Font-DingTalk",
    value: "font-dingtalk",
    description: "The largest land animal",
  },
  {
    label: "Font-Alibaba",
    value: "font-alibaba",
    description: "The largest land animal",
  },
  {
    label: "Font-OpenSans",
    value: "font-opensans",
    description: "The largest land animal",
  },
  {
    label: "Font-Anke",
    value: "font-anke",
    description: "The second most popular pet in the world",
  },
  {
    label: "Font-Roboto",
    value: "font-roboto-mono",
    description: "The most popular pet in the world",
  },
  {
    label: "Font-KingSoft",
    value: "font-kingsoft",
    description: "The largest land animal",
  },
  {
    label: "Font-XinYiGuanHei",
    value: "font-xinyiguanhei",
    description: "The largest land animal",
  },
];
