"use client";
import { useTranslations } from "next-intl";
import { getCurrentDimensionsText } from "./aspectOptions";
import type { PropertyInfo } from "./types";

interface AspectSectionProps {
  /** 当前属性集合（用来算比例卡片上显示的文字）。 */
  propertyInfo: PropertyInfo;
  /** 打开「选择尺寸」面板。 */
  onOpenDimensions: () => void;
}

/**
 * 比例卡片。
 *
 * 只显示当前比例和尺寸，点一下打开尺寸弹窗 —— 真正的选项在
 * DimensionsModal 里。
 */
export const AspectSection = ({ propertyInfo, onOpenDimensions }: AspectSectionProps) => {
  const t = useTranslations("RightPropertyPanel");

  const { ratio, dimensions } = getCurrentDimensionsText(propertyInfo, t);

  return (
    <div className="w-full py-2">
      <p className="text-sm text-default-600 mb-1">{t("aspect")}</p>
      <div
        className="rounded-lg bg-default-100 p-4 flex justify-between items-center cursor-pointer border border-default-200"
        onClick={onOpenDimensions}
      >
        <div>
          <div className="text-lg font-bold">
            {ratio}
          </div>
          <div className="text-sm text-default-500">
            {dimensions}
          </div>
        </div>
        <span className="text-xl text-default-500">›</span>
      </div>
    </div>
  );
};
