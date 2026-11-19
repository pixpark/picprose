"use client";
import { Button } from "@heroui/react";
import { useTranslations } from "next-intl";
import type { ExportFormat } from "../ComponentToImg";
import type { DownloadImage } from "./types";

interface DownloadSectionProps {
  /** 导出图片。 */
  downloadImage: DownloadImage;
}

/**
 * 导出格式按钮组。
 *
 * 三个按钮走的是「触发一次导出」，不是跳转 ——
 * HeroUI v2 时这里写的是 as={Link}，那是误用：as={Link} 会把按钮渲染成
 * <a> 再套一层点击处理，键盘和无障碍语义都是错的。
 * HeroUI v3 的 Button 只渲染 <button>，正好对上这里的真实语义。
 */
export const DownloadSection = ({ downloadImage }: DownloadSectionProps) => {
  const t = useTranslations("RightPropertyPanel");

  const handleImageDownload = (format: ExportFormat) => {
    downloadImage(format);
  };

  return (
    <div className="w-full mt-4 px-4 pb-4">
      <div className="text-muted text-sm">{t("download")}</div>
      <div className="flex justify-between my-3">
        <Button
          onPress={() => handleImageDownload("jpg")}
          variant="primary"
        >
          JPG
        </Button>
        <Button
          onPress={() => handleImageDownload("png")}
          variant="primary"
        >
          PNG
        </Button>
        <Button
          onPress={() => handleImageDownload("svg")}
          variant="primary"
        >
          SVG
        </Button>
      </div>
    </div>
  );
};
