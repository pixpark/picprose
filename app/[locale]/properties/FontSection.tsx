"use client";
import React from "react";
import { Button, Select, SelectItem } from "@heroui/react";
import { useTranslations } from "next-intl";
import { fontOptions } from "./fontOptions";
import type { UpdateProperty } from "./types";

interface FontSectionProps {
  /** 改一项属性。 */
  updateProperty: UpdateProperty;
}

/**
 * 字体设置：字体下拉 + 上传自定义字体。
 */
export const FontSection = ({ updateProperty }: FontSectionProps) => {
  const t = useTranslations("RightPropertyPanel");

  const fontInputRef = React.useRef<HTMLInputElement>(null);

  const loadFont = (fontName: string, fontUrl: string) => {
    const font = new FontFace(fontName, `url(${fontUrl})`);
    font
      .load()
      .then(() => {
        document.fonts.add(font);
        document.documentElement.style.setProperty("--font-custom", fontName);
      })
      .catch((error) => {
        console.error("Font loading failed:", error);
      });
  };

  const handleFontUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const file = URL.createObjectURL(event.target.files[0]);
      loadFont("--font-custom", file);
      updateProperty("font", "font-custom");
    }
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateProperty("font", e.target.value);
  };

  const handleFontButtonClick = () => {
    if (fontInputRef.current) {
      fontInputRef.current.click();
    }
  };

  return (
    <div className="flex w-full py-2 items-end gap-2">
      <div className="flex-grow">
        <Select
          label={t("font")}
          className="w-full"
          onChange={handleFontChange}
          defaultSelectedKeys={["font-anke"]}
        >
          {fontOptions.map((font) => (
            <SelectItem key={font.value}>
              {font.label}
            </SelectItem>
          ))}
        </Select>
      </div>
      <div>
        <input
          type="file"
          className="hidden"
          onChange={handleFontUpload}
          ref={fontInputRef}
        />
        <Button
          isIconOnly
          color="primary"
          variant="flat"
          size="lg"
          onClick={handleFontButtonClick}
        >
          <svg
            className="w-5 h-5 text-primary"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.3"
              d="M4 15v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2M12 4v12m0-12 4 4m-4-4L8 8"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
};
