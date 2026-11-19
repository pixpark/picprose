"use client";
import { Input, Label, Separator, TextField } from "@heroui/react";
import { useTranslations } from "next-intl";
import {
  deviceAspectOptions,
  horizontalAspectOptions,
  socialMediaAspectOptions,
  verticalAspectOptions,
  type AspectOption,
} from "./aspectOptions";
import type { PropertyInfo, UpdateProperty } from "./types";

interface DimensionsModalProps {
  /** 当前属性集合。 */
  propertyInfo: PropertyInfo;
  /** 改一项属性。 */
  updateProperty: UpdateProperty;
}

/** 一行比例选项（标签 + 尺寸，选中时打勾）。 */
interface AspectOptionRowProps {
  option: AspectOption;
  /** 显示用标签（平台名这类已翻译）。 */
  label: string;
  selected: boolean;
  onSelect: (option: AspectOption) => void;
}

/**
 * 选中标记。
 *
 * HeroUI v3 没有 v2 的 CheckboxIcon 导出，这里直接画一个对勾 ——
 * 纯装饰（真正的语义在整行的 aria 与视觉选中态上），不值得为一个图标引一整个 Checkbox。
 */
const CheckMarkIcon = () => (
  <svg
    className="w-5 h-5 text-accent"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const AspectOptionRow = ({ option, label, selected, onSelect }: AspectOptionRowProps) => (
  <div
    onClick={() => onSelect(option)}
    className={`p-3 rounded-md flex justify-between items-center cursor-pointer ${
      selected
        ? "bg-accent-soft border border-accent"
        : "bg-surface-secondary"
    }`}
  >
    <div>
      <div className="font-medium">{label}</div>
      <div className="text-sm text-muted">{option.description}</div>
    </div>
    {selected && <CheckMarkIcon />}
  </div>
);

/**
 * 「选择尺寸」面板的内容。
 *
 * 自定义分辨率 + 四组预设（横屏 / 竖屏 / 社交平台 / 设备）。
 * 外层容器和导航栏由 RightPropertyPanel 渲染。
 */
export const DimensionsModal = ({ propertyInfo, updateProperty }: DimensionsModalProps) => {
  const t = useTranslations("RightPropertyPanel");

  /** 选中一个预设比例：写比例类名、选中项、宽高。 */
  const selectOption = (option: AspectOption) => {
    updateProperty("aspect", option.ratio);
    updateProperty("selectedValue", option.value);
    updateProperty("isCustomAspect", false);

    const dimensions = option.description.split(" × ");
    const width = parseInt(dimensions[0]);
    const height = parseInt(dimensions[1]);

    updateProperty("customWidth", width);
    updateProperty("customHeight", height);
  };

  return (
    <div className="flex-grow overflow-y-auto overflow-x-hidden flex flex-col px-4">
      <div className="grid grid-cols-1 gap-2 py-2">
        <p className="text-sm font-medium text-muted">{t("custom_resolution")}</p>
        <div className="p-3 rounded-md bg-surface-secondary">
          <div className="flex gap-2 items-center">
            <TextField className="flex-1">
              <Label>{t("width")}</Label>
              <Input
                type="number"
                min="1"
                value={String(propertyInfo.customWidth || 1185)}
                onChange={(e) => {
                  const width = parseInt(e.target.value) || 1185;
                  updateProperty("customWidth", width);
                  updateProperty("isCustomAspect", true);
                  updateProperty("aspect", `aspect-[${width}/${propertyInfo.customHeight || 1185}]`);
                }}
              />
            </TextField>
            <span className="mx-2">×</span>
            <TextField className="flex-1">
              <Label>{t("height")}</Label>
              <Input
                type="number"
                min="1"
                value={String(propertyInfo.customHeight || 1185)}
                onChange={(e) => {
                  const height = parseInt(e.target.value) || 1185;
                  updateProperty("customHeight", height);
                  updateProperty("isCustomAspect", true);
                  updateProperty("aspect", `aspect-[${propertyInfo.customWidth || 1185}/${height}]`);
                }}
              />
            </TextField>
          </div>
        </div>

        <Separator className="my-2" />

        <p className="text-sm font-medium text-muted">{t("landscape")}</p>
        {horizontalAspectOptions.map((option) => (
          <AspectOptionRow
            key={option.value}
            option={option}
            label={option.labelKey ? t(option.labelKey) : option.label}
            selected={propertyInfo.selectedValue === option.value}
            onSelect={selectOption}
          />
        ))}

        <p className="text-sm font-medium text-muted mt-2">{t("portrait")}</p>
        {verticalAspectOptions.map((option) => (
          <AspectOptionRow
            key={option.value}
            option={option}
            label={option.labelKey ? t(option.labelKey) : option.label}
            selected={propertyInfo.selectedValue === option.value}
            onSelect={selectOption}
          />
        ))}

        {/* 添加社交平台选项 */}
        <p className="text-sm font-medium text-muted mt-2">{t("social_media")}</p>
        {socialMediaAspectOptions.map((option) => (
          <AspectOptionRow
            key={option.value}
            option={option}
            label={option.labelKey ? t(option.labelKey) : option.label}
            selected={propertyInfo.selectedValue === option.value}
            onSelect={selectOption}
          />
        ))}

        {/* 添加设备选项 */}
        <p className="text-sm font-medium text-muted mt-2">{t("devices")}</p>
        {deviceAspectOptions.map((option) => (
          <AspectOptionRow
            key={option.value}
            option={option}
            label={option.labelKey ? t(option.labelKey) : option.label}
            selected={propertyInfo.selectedValue === option.value}
            onSelect={selectOption}
          />
        ))}
      </div>
    </div>
  );
};
