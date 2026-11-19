"use client";
import React from "react";
import { Button } from "@heroui/react";
import { useTranslations } from "next-intl";
import { SVG_BACKGROUNDS } from "../svgBackgrounds";
import type { SvgTemplateParams } from "../svgBackgrounds";
import { SvgColorsSection } from "./SvgColorsSection";
import { applySvgParam, randomizeWaveParams } from "./svgParams";
import type {
  SetBackgroundPattern,
  SetBackgroundType,
  SetSvgPatternParams,
} from "./types";

interface SvgParamsSectionProps {
  /** 当前选中的 SVG 模板下标。 */
  selectedSvgIndex: number | null;
  /** 当前参数。 */
  svgPatternParams: SvgTemplateParams;
  /** 写参数。 */
  setSvgPatternParams: SetSvgPatternParams;
  /** 换背景图案。 */
  setBackgroundPattern: SetBackgroundPattern;
  /** 换背景类型。 */
  setBackgroundType: SetBackgroundType;
}

/** 滑块行：标题 + 当前值 + 左右两个圆按钮 + 一根 range。 */
interface RangeControlProps {
  label: string;
  /** 右侧显示的当前值（可能带单位）。 */
  displayValue: React.ReactNode;
  /** range 的值。 */
  value: number | undefined;
  min: number;
  max: number;
  step: number;
  /** 拿到滑块的原始字符串，交给调用方解析。 */
  onChange: (raw: string) => void;
  leftIcon: React.ReactNode;
  rightIcon: React.ReactNode;
}

const RangeControl = ({
  label,
  displayValue,
  value,
  min,
  max,
  step,
  onChange,
  leftIcon,
  rightIcon,
}: RangeControlProps) => (
  <div className="mb-5">
    <div className="flex justify-between text-muted mb-2">
      <span>{label}</span>
      <span>{displayValue}</span>
    </div>
    <div className="flex items-center">
      <div className="rounded-full w-10 h-10 bg-surface-tertiary flex items-center justify-center mr-2">
        {leftIcon}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 h-1 bg-default rounded-lg appearance-none cursor-pointer mx-2"
      />
      <div className="rounded-full w-10 h-10 bg-surface-tertiary flex items-center justify-center ml-2">
        {rightIcon}
      </div>
    </div>
  </div>
);

/**
 * SVG 参数面板。
 *
 * 只对「波浪」模板有意义：实心 / 描边、振幅、频率、速度、方向、
 * 旋转、层数、层透明度，外加一个随机生成；颜色部分在
 * SvgColorsSection 里。
 */
export const SvgParamsSection = ({
  selectedSvgIndex,
  svgPatternParams,
  setSvgPatternParams,
  setBackgroundPattern,
  setBackgroundType,
}: SvgParamsSectionProps) => {
  const t = useTranslations("RightPropertyPanel");

  if (selectedSvgIndex === null || !SVG_BACKGROUNDS[selectedSvgIndex]) {
    return null;
  }

  const currentSvg = SVG_BACKGROUNDS[selectedSvgIndex];
  const params = svgPatternParams;

  /** 改一个参数。 */
  const handleSvgParamChange = (param: string, value: unknown) => {
    applySvgParam(
      selectedSvgIndex,
      svgPatternParams,
      setSvgPatternParams,
      setBackgroundType,
      setBackgroundPattern,
      param,
      value
    );
  };

  /** 随机生成一整套波浪参数。 */
  const randomizeHeazyWave = () => {
    randomizeWaveParams(
      selectedSvgIndex,
      setSvgPatternParams,
      setBackgroundPattern,
      setBackgroundType
    );
  };

  return (
    <div className="text-foreground">
      {/* 随机生成按钮 */}
      <Button
        variant="primary"
        className="w-full mb-6"
        onPress={() => randomizeHeazyWave()}
      >
        {t("randomize_wave")}
      </Button>

      {/* 顶部切换按钮 - Solid/Outline */}
      <div className="w-full mb-6 rounded-xl overflow-hidden bg-surface-secondary">
        <div className="flex">
          <div
            className={`w-1/2 flex items-center justify-center py-4 ${params?.style === 'solid' || !params?.style ? 'bg-surface-tertiary' : ''}`}
            onClick={() => handleSvgParamChange('style', 'solid')}
          >
            <svg className="w-5 h-5 mr-2 text-foreground" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h18v18H3z" />
            </svg>
            <span className="text-foreground">{t("solid")}</span>
          </div>
          <div
            className={`w-1/2 flex items-center justify-center py-4 ${params?.style === 'outline' ? 'bg-surface-tertiary' : ''}`}
            onClick={() => handleSvgParamChange('style', 'outline')}
          >
            <svg className="w-5 h-5 mr-2 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 3h18v18H3z" strokeWidth="2" />
            </svg>
            <span className="text-foreground">Outline</span>
          </div>
        </div>
      </div>

      {/* SHAPE 部分 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-5 text-foreground">{t("shape")}</h3>

        {/* Amplitude 振幅控制 */}
        <RangeControl
          label={t("amplitude")}
          displayValue={params?.amplitude || currentSvg.defaultParams.amplitude}
          value={params?.amplitude || currentSvg.defaultParams.amplitude}
          min={5}
          max={150}
          step={5}
          onChange={(raw) => handleSvgParamChange('amplitude', parseFloat(raw))}
          leftIcon={
            <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24">
              <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          }
          rightIcon={
            <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          }
        />

        {/* Frequency 频率控制 */}
        <RangeControl
          label={t("frequency")}
          displayValue={params?.frequency || currentSvg.defaultParams.frequency}
          value={params?.frequency || currentSvg.defaultParams.frequency}
          min={0.005}
          max={0.05}
          step={0.001}
          onChange={(raw) => handleSvgParamChange('frequency', parseFloat(raw))}
          leftIcon={
            <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24">
              <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          }
          rightIcon={
            <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          }
        />

        {/* Speed 速度控制 */}
        <RangeControl
          label={t("speed")}
          displayValue={params?.speed || currentSvg.defaultParams.speed}
          value={params?.speed || currentSvg.defaultParams.speed}
          min={0.05}
          max={1}
          step={0.05}
          onChange={(raw) => handleSvgParamChange('speed', parseFloat(raw))}
          leftIcon={
            <svg className="w-6 h-6 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M5 12h14" strokeWidth="2" strokeLinecap="round" />
            </svg>
          }
          rightIcon={
            <svg className="w-6 h-6 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" />
            </svg>
          }
        />

        {/* Direction 方向控制 */}
        <div className="mb-5">
          <div className="text-muted mb-2">{t("direction")}</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              className={`p-3 flex items-center justify-center ${params?.direction === 'left' ? 'bg-accent-soft text-accent-soft-foreground' : 'bg-surface-secondary'} rounded-lg`}
              onClick={() => handleSvgParamChange('direction', 'left')}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M19 12H5" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="ml-2">{t("left")}</span>
            </button>
            <button
              className={`p-3 flex items-center justify-center ${params?.direction === 'right' || !params?.direction ? 'bg-accent-soft text-accent-soft-foreground' : 'bg-surface-secondary'} rounded-lg`}
              onClick={() => handleSvgParamChange('direction', 'right')}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 12h14" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="ml-2">{t("right")}</span>
            </button>
            <button
              className={`p-3 flex items-center justify-center ${params?.direction === 'none' ? 'bg-accent-soft text-accent-soft-foreground' : 'bg-surface-secondary'} rounded-lg`}
              onClick={() => handleSvgParamChange('direction', 'none')}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="3" strokeWidth="2" />
                <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" strokeWidth="1" strokeLinecap="round" />
              </svg>
              <span className="ml-2">{t("none")}</span>
            </button>
          </div>
        </div>

        {/* Rotation 旋转控制 */}
        <RangeControl
          label={t("rotation")}
          displayValue={`${params?.rotation || currentSvg.defaultParams.rotation}°`}
          value={params?.rotation || currentSvg.defaultParams.rotation}
          min={0}
          max={360}
          step={15}
          onChange={(raw) => handleSvgParamChange('rotation', parseInt(raw))}
          leftIcon={
            <svg className="w-6 h-6 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M5 12h14" strokeWidth="2" strokeLinecap="round" />
            </svg>
          }
          rightIcon={
            <svg className="w-6 h-6 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" />
            </svg>
          }
        />

        {/* Layers 控制 - 使用数字输入框 */}
        <div className="mb-5">
          <div className="flex justify-between text-muted mb-2">
            <span>{t("layers")}</span>
            <span>{params?.layers || currentSvg.defaultParams.layers}</span>
          </div>
          <div className="relative">
            <input
              type="number"
              min={1}
              max={8}
              value={params?.layers || currentSvg.defaultParams.layers}
              onChange={(e) => handleSvgParamChange('layers', parseInt(e.target.value))}
              className="w-full bg-surface-secondary text-foreground py-3 px-4 rounded-lg appearance-none"
            />
            <div className="absolute right-0 top-0 bottom-0 flex flex-col pr-2">
              <button
                className="flex-1 focus:outline-none text-muted hover:text-foreground"
                onClick={() => {
                  const newValue = Math.min((params?.layers ?? currentSvg.defaultParams.layers ?? 3) + 1, 8);
                  handleSvgParamChange('layers', newValue);
                }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 15l-6-6-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                className="flex-1 focus:outline-none text-muted hover:text-foreground"
                onClick={() => {
                  const newValue = Math.max((params?.layers ?? currentSvg.defaultParams.layers ?? 3) - 1, 1);
                  handleSvgParamChange('layers', newValue);
                }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Layer Opacity 控制 */}
        <RangeControl
          label={t("layer_opacity")}
          displayValue={params?.wavesOpacity || currentSvg.defaultParams.wavesOpacity}
          value={params?.wavesOpacity || currentSvg.defaultParams.wavesOpacity}
          min={0.1}
          max={1}
          step={0.05}
          onChange={(raw) => handleSvgParamChange('wavesOpacity', parseFloat(raw))}
          leftIcon={
            <svg className="w-6 h-6 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" strokeOpacity="0.3" />
              <path d="M9 9h6v6H9z" fill="currentColor" fillOpacity="0.2" />
            </svg>
          }
          rightIcon={
            <svg className="w-6 h-6 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
              <path d="M6 6h12v12H6z" fill="currentColor" />
            </svg>
          }
        />
      </div>

      {/* COLORS 部分 */}
      <SvgColorsSection
        selectedSvgIndex={selectedSvgIndex}
        svgPatternParams={svgPatternParams}
        onParamChange={handleSvgParamChange}
      />
    </div>
  );
};
