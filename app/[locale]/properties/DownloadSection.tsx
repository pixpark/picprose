"use client";
import { Button, Link } from "@heroui/react";
import { useTranslations } from "next-intl";
import type { ExportFormat } from "../ComponentToImg";
import type { DownloadImage } from "./types";

interface DownloadSectionProps {
  /** 导出图片。 */
  downloadImage: DownloadImage;
}

/** 导出格式按钮组。 */
export const DownloadSection = ({ downloadImage }: DownloadSectionProps) => {
  const t = useTranslations("RightPropertyPanel");

  const handleImageDownload = (format: ExportFormat) => {
    downloadImage(format);
  };

  return (
    <div className="w-full mt-4 px-4 pb-4">
      <div className="text-default-500 text-sm">{t("download")}</div>
      <div className="flex justify-between my-3">
        <Button
          onClick={() => handleImageDownload("jpg")}
          as={Link}
          color="primary"
          variant="flat"
        >
          JPG
        </Button>
        <Button
          onClick={() => handleImageDownload("png")}
          as={Link}
          color="primary"
          variant="flat"
        >
          PNG
        </Button>
        <Button
          onClick={() => handleImageDownload("svg")}
          as={Link}
          color="primary"
          variant="flat"
        >
          SVG
        </Button>
      </div>
    </div>
  );
};
