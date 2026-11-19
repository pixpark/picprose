"use client";
import React from "react";
import { SVG_BACKGROUNDS, type SvgTemplate } from "../svgBackgrounds";

export interface SvgSectionProps {
  /** 当前选中的模板下标。 */
  selectedSvgIndex: number | null;
  /** 选中第 n 个模板。 */
  onSelectTemplate: (index: number) => void;
  /** 文案。 */
  t: (key: string) => string;
}

/**
 * 左栏的「图案」面板：SVG 模板选择。
 *
 * 模板登记表是全局唯一的（svgBackgrounds/index.ts），
 * 右面板也按这张表的下标取模板 —— 两边下标必须对得上。
 */
export const SvgSection = ({
  selectedSvgIndex,
  onSelectTemplate,
  t,
}: SvgSectionProps) => {
  const svgBgs: SvgTemplate[] = SVG_BACKGROUNDS;

  // Ensure available templates
  if (!svgBgs || svgBgs.length === 0) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-medium mb-4">{t("svg_patterns")}</h3>
        <div className="text-center p-4 border border-border rounded-lg">
          {t("svg_not_found")}
        </div>
      </div>
    );
  }

  // Use safe rendering approach
  const renderSvgPreview = (index: number) => {
    if (index >= svgBgs.length) {
      return <div className="w-full h-full bg-surface-tertiary flex items-center justify-center text-muted">{t("svg_unavailable")}</div>;
    }

    const svg = svgBgs[index];

    if (!svg || !svg.svgTemplate || !svg.defaultParams) {
      return <div className="w-full h-full bg-surface-tertiary flex items-center justify-center text-muted">{t("svg_template_invalid")}</div>;
    }

    try {
      const svgString = svg.svgTemplate(svg.defaultParams);
      return (
        <div
          dangerouslySetInnerHTML={{ __html: svgString }}
          style={{ width: '100%', height: '100%' }}
        />
      );
    } catch (error) {
      return <div className="w-full h-full bg-surface-tertiary flex items-center justify-center text-muted">{t("svg_render_error")}</div>;
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">{t("svg_patterns")}</h3>
      <div className="grid grid-cols-2 gap-4">
        {/* Heazy wave SVG template */}
        <div className="flex flex-col items-center">
          <div
            className={`w-full aspect-[4/3] rounded-md cursor-pointer hover:scale-105 transition-transform overflow-hidden ${selectedSvgIndex === 0 ? 'border-2 border-pp-accent' : 'border border-border'}`}
            onClick={() => onSelectTemplate(0)}
            style={{ backgroundImage: 'url(waves.svg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
          </div>
          <div className="text-center text-muted mt-2">
            {svgBgs[0] ? t(svgBgs[0].nameKey) : t("svg_wave")}
          </div>
        </div>

        {/* Corner SVG template */}
        <div className="flex flex-col items-center">
          <div
            className={`w-full aspect-[4/3] rounded-md cursor-pointer hover:scale-105 transition-transform overflow-hidden ${selectedSvgIndex === 1 ? 'border-2 border-pp-accent' : 'border border-border'}`}
            onClick={() => onSelectTemplate(1)}
            style={{ backgroundImage: 'url(corners.svg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
          >

          </div>
          <div className="text-center text-muted mt-2">
            {svgBgs[1] ? t(svgBgs[1].nameKey) : t("svg_corner")}
          </div>
        </div>
      </div>
    </div>
  );
};
