"use client";
import React from "react";
import { Button, Label, ListBox, Select } from "@heroui/react";
import { useTranslations } from "next-intl";
import { fontOptions } from "./fontOptions";
import type { UpdateProperty } from "./types";

interface FontSectionProps {
  /** 改一项属性。 */
  updateProperty: UpdateProperty;
}

/**
 * 字体设置：字体下拉 + 上传自定义字体。
 *
 * HeroUI v3 的 Select 是复合结构（Trigger / Value / Indicator / Popover），
 * 选项用 ListBox.Item，且用 id 而不是 key 标识选项。
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

  const handleFontChange = (key: React.Key | null) => {
    if (key == null) return;
    updateProperty("font", String(key));
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
          className="w-full"
          defaultValue="font-anke"
          onChange={handleFontChange}
        >
          <Label>{t("font")}</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {fontOptions.map((font) => (
                <ListBox.Item
                  key={font.value}
                  id={font.value}
                  textValue={font.label}
                >
                  {font.label}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
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
          variant="secondary"
          size="lg"
          onPress={handleFontButtonClick}
        >
          <svg
            className="w-5 h-5"
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
