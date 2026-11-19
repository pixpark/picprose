"use client";
import React from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { Chrome } from "@uiw/react-color";
import type { ColorResult } from "@uiw/react-color";
import { useTranslations } from "next-intl";
import { SVG_BACKGROUNDS } from "../svgBackgrounds";
import type { SvgTemplateParams } from "../svgBackgrounds";

interface SvgColorsSectionProps {
  /** 当前选中的 SVG 模板下标。 */
  selectedSvgIndex: number | null;
  /** 当前参数。 */
  svgPatternParams: SvgTemplateParams;
  /** 改一个参数。 */
  onParamChange: (param: string, value: unknown) => void;
}

/** 颜色选择器：色块 + 色号 + 取色器。 */
interface ColorFieldProps {
  label: string;
  /** 色块和取色器用的颜色。 */
  color: string | undefined;
  /** 右侧显示的色号文字。 */
  text: string;
  /** 下拉项的 key。 */
  pickerKey: string;
  /** 选定颜色。 */
  onChange: (hex: string) => void;
  /**
   * 外面再包一层 div。
   *
   * 两端颜色在 grid 里，需要一层；背景色那格外面已经有
   * mb-4 的容器，再包一层就多了一个节点。
   */
  wrap?: boolean;
}

const ColorField = ({ label, color, text, pickerKey, onChange, wrap = true }: ColorFieldProps) => {
  const field = (
    <>
      <div className="text-default-600 mb-2">{label}</div>
      <div className="relative">
        <Dropdown>
          <DropdownTrigger>
            <div className="flex items-center cursor-pointer">
              <div
                className="w-10 h-10 rounded-lg border-2 border-default-300"
                style={{ backgroundColor: color }}
              ></div>
              <div className="flex-1 ml-2 bg-default-100 text-foreground rounded-lg px-3 py-2">
                {text}
              </div>
            </div>
          </DropdownTrigger>
          <DropdownMenu>
            <DropdownItem key={pickerKey}>
              <Chrome
                color={color}
                onChange={(color: ColorResult) => onChange(color.hex)}
              />
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </>
  );

  return wrap ? <div>{field}</div> : field;
};

/**
 * SVG 参数面板的「颜色」部分。
 *
 * 两端颜色、背景色（仅实色背景时出现）、渐变 / 实色背景切换。
 */
export const SvgColorsSection = ({
  selectedSvgIndex,
  svgPatternParams,
  onParamChange,
}: SvgColorsSectionProps) => {
  const t = useTranslations("RightPropertyPanel");

  if (selectedSvgIndex === null || !SVG_BACKGROUNDS[selectedSvgIndex]) {
    return null;
  }

  const currentSvg = SVG_BACKGROUNDS[selectedSvgIndex];
  const params = svgPatternParams;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-5 text-foreground">{t("colors")}</h3>

      {/* 颜色选择器 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <ColorField
          label={t("start_color")}
          color={params?.color1 || currentSvg.defaultParams.color1}
          text={(params?.color1 || currentSvg.defaultParams.color1 || "").toUpperCase()}
          pickerKey="svg-color1"
          onChange={(hex) => onParamChange('color1', hex)}
        />
        <ColorField
          label={t("end_color")}
          color={params?.color2 || currentSvg.defaultParams.color2}
          text={(params?.color2 || currentSvg.defaultParams.color2 || "").toUpperCase()}
          pickerKey="svg-color2"
          onChange={(hex) => onParamChange('color2', hex)}
        />
      </div>

      {/* 背景颜色选择器，仅当选择实色背景时显示 */}
      {params?.useGradientBg === false && (
        <div className="mb-4">
          <ColorField
            label={t("backgroundColor")}
            color={params?.backgroundColor || currentSvg.defaultParams.backgroundColor || ''}
            text={(params?.backgroundColor || currentSvg.defaultParams.backgroundColor || '').toUpperCase()}
            pickerKey="svg-background-color"
            onChange={(hex) => onParamChange('backgroundColor', hex)}
            wrap={false}
          />
        </div>
      )}


      {/* 背景选项 */}
      <div>
        <div className="text-default-600 mb-2">{t("background")}</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            className={`p-3 flex items-center justify-center ${params?.useGradientBg || !params?.hasOwnProperty('useGradientBg') ? 'bg-primary-100 text-primary-600' : 'bg-default-100'} rounded-lg`}
            onClick={() => onParamChange('useGradientBg', true)}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" fill="url(#gradient)" />
              <defs>
                <linearGradient id="gradient" x1="3" y1="3" x2="21" y2="21">
                  <stop offset="0%" stopColor={params?.color1 || currentSvg.defaultParams.color1 || ''} />
                  <stop offset="100%" stopColor={params?.color2 || currentSvg.defaultParams.color2 || ''} />
                </linearGradient>
              </defs>
            </svg>
            <span className="ml-2">{t("gradient")}</span>
          </button>
          <button
            className={`p-3 flex items-center justify-center ${params?.useGradientBg === false ? 'bg-primary-100 text-primary-600' : 'bg-default-100'} rounded-lg`}
            onClick={() => {
              onParamChange('useGradientBg', false);
              // 如果背景色未设置，给一个默认值
              if (!params?.backgroundColor) {
                onParamChange('backgroundColor', currentSvg.defaultParams.backgroundColor || '');
              }
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span className="ml-2">{t("solid")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
