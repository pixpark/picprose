"use client";
import { Input, Label, Separator, Slider, TextArea, TextField } from "@heroui/react";
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
 *
 * HeroUI v3 的 Slider 是复合结构：Label + Output + Track(Fill/Thumb)，
 * 没有 v2 的 label / size 属性了。
 */
export const TextSection = ({ propertyInfo, updateProperty }: TextSectionProps) => {
  const t = useTranslations("RightPropertyPanel");

  /** 滑块回传 number | number[]，这里统一取第一个值。 */
  const firstValue = (value: number | number[]) =>
    typeof value === "number" ? value : value[0];

  return (
    <>
      <TextField className="w-full">
        <Label>{t("title")}</Label>
        <TextArea
          placeholder={t("title_place")}
          value={propertyInfo.title}
          onChange={(e) => updateProperty("title", e.target.value)}
        />
      </TextField>

      <Slider
        value={Number(propertyInfo.fontSizeValue)}
        onChange={(value) =>
          updateProperty("fontSizeValue", firstValue(value).toString())
        }
        step={1}
        minValue={10}
        maxValue={100}
        className="w-full my-2"
      >
        <Label>{t("font_size")}</Label>
        <Slider.Output />
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb />
        </Slider.Track>
      </Slider>

      <Slider
        value={Number(propertyInfo.titleWidthValue || 100)}
        onChange={(value) =>
          updateProperty("titleWidthValue", firstValue(value).toString())
        }
        step={5}
        minValue={50}
        maxValue={150}
        className="w-full my-2"
      >
        <Label>{t("title_width")}</Label>
        <Slider.Output />
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb />
        </Slider.Track>
      </Slider>

      <Separator />
      <TextField className="w-full">
        <Label>{t("author")}</Label>
        <Input
          type="search"
          placeholder={t("author_placeholder")}
          value={propertyInfo.author}
          onChange={(e) => updateProperty("author", e.target.value)}
        />
      </TextField>

      <Slider
        value={Number(propertyInfo.authorFontSizeValue)}
        onChange={(value) =>
          updateProperty("authorFontSizeValue", firstValue(value).toString())
        }
        step={1}
        minValue={10}
        maxValue={100}
        className="w-full my-2"
      >
        <Label>{t("author_size")}</Label>
        <Slider.Output />
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb />
        </Slider.Track>
      </Slider>
    </>
  );
};
