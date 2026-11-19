"use client";
import { Divider, Input, Slider, Textarea } from "@heroui/react";
import { useTranslations } from "next-intl";
import type { PropertyInfo, UpdateProperty } from "./types";

interface TextSectionProps {
  /** 当前属性集合。 */
  propertyInfo: PropertyInfo;
  /** 改一项属性。 */
  updateProperty: UpdateProperty;
}

/**
 * 文字设置：标题、标题字号、标题宽度、作者、作者字号。
 */
export const TextSection = ({ propertyInfo, updateProperty }: TextSectionProps) => {
  const t = useTranslations("RightPropertyPanel");

  return (
    <>
      <Textarea
        label={t("title")}
        placeholder={t("title_place")}
        className="w-full py-2"
        value={propertyInfo.title}
        onValueChange={(value) => updateProperty("title", value)}
      />

      <Slider
        label={t("font_size")}
        value={Number(propertyInfo.fontSizeValue)}
        onChange={(value) => updateProperty("fontSizeValue", typeof value === "number" ? value.toString() : value[0].toString())}
        size="sm"
        step={1}
        minValue={10}
        maxValue={100}
        className="w-full my-2"
      />

      <Slider
        label={t("title_width")}
        value={Number(propertyInfo.titleWidthValue || 100)}
        onChange={(value) => updateProperty("titleWidthValue", typeof value === "number" ? value.toString() : value[0].toString())}
        size="sm"
        step={5}
        minValue={50}
        maxValue={150}
        className="w-full my-2"
      />

      <Divider />
      <Input
        label={t("author")}
        type="search"
        className="w-full py-2"
        placeholder={t("author_placeholder")}
        value={propertyInfo.author}
        onValueChange={(value) => updateProperty("author", value)}
      />

      <Slider
        label={t("author_size")}
        value={Number(propertyInfo.authorFontSizeValue)}
        onChange={(value) => updateProperty("authorFontSizeValue", typeof value === "number" ? value.toString() : value[0].toString())}
        size="sm"
        step={1}
        minValue={10}
        maxValue={100}
        className="w-full my-2"
      />
    </>
  );
};
