"use client";
import { CheckboxIcon, Divider, Input } from "@heroui/react";
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

const AspectOptionRow = ({ option, label, selected, onSelect }: AspectOptionRowProps) => (
  <div
    onClick={() => onSelect(option)}
    className={`p-3 rounded-md flex justify-between items-center cursor-pointer ${
      selected
        ? "bg-primary-100 border border-primary-500"
        : "bg-default-100"
    }`}
  >
    <div>
      <div className="font-medium">{label}</div>
      <div className="text-sm text-default-600">{option.description}</div>
    </div>
    {selected && (
      <CheckboxIcon className="w-5 h-5 text-primary-500" />
    )}
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
        <p className="text-sm font-medium text-default-600">{t("custom_resolution")}</p>
        <div className="p-3 rounded-md bg-default-100">
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              min="1"
              label={t("width")}
              size="sm"
              value={String(propertyInfo.customWidth || 1185)}
              onChange={(e) => {
                const width = parseInt(e.target.value) || 1185;
                updateProperty("customWidth", width);
                updateProperty("isCustomAspect", true);
                updateProperty("aspect", `aspect-[${width}/${propertyInfo.customHeight || 1185}]`);
              }}
              className="flex-1"
            />
            <span className="mx-2">×</span>
            <Input
              type="number"
              min="1"
              label={t("height")}
              size="sm"
              value={String(propertyInfo.customHeight || 1185)}
              onChange={(e) => {
                const height = parseInt(e.target.value) || 1185;
                updateProperty("customHeight", height);
                updateProperty("isCustomAspect", true);
                updateProperty("aspect", `aspect-[${propertyInfo.customWidth || 1185}/${height}]`);
              }}
              className="flex-1"
            />
          </div>
        </div>

        <Divider className="my-2" />

        <p className="text-sm font-medium text-default-600">{t("landscape")}</p>
        {horizontalAspectOptions.map((option) => (
          <AspectOptionRow
            key={option.value}
            option={option}
            label={option.labelKey ? t(option.labelKey) : option.label}
            selected={propertyInfo.selectedValue === option.value}
            onSelect={selectOption}
          />
        ))}

        <p className="text-sm font-medium text-default-600 mt-2">{t("portrait")}</p>
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
        <p className="text-sm font-medium text-default-600 mt-2">{t("social_media")}</p>
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
        <p className="text-sm font-medium text-default-600 mt-2">{t("devices")}</p>
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
