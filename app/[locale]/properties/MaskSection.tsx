"use client";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Slider,
} from "@heroui/react";
import type { SliderValue } from "@heroui/react";
import { Circle } from "@uiw/react-color";
import type { ColorResult } from "@uiw/react-color";
import { useTranslations } from "next-intl";
import { hexAlphaToPercent, percentToHexAlpha } from "@/lib/alpha";
import { MASK_COLORS } from "../data/colors";
import type {
  BackgroundType,
  PropertyInfo,
  SetImagePosition,
  UpdateProperty,
} from "./types";

interface MaskSectionProps {
  /** 当前属性集合。 */
  propertyInfo: PropertyInfo;
  /** 改一项属性。 */
  updateProperty: UpdateProperty;
  /** 当前背景类型（决定要不要显示图片位置滑块）。 */
  backgroundType: BackgroundType;
  /** 背景图位置。 */
  imagePosition: number;
  /** 挪背景图。 */
  setImagePosition: SetImagePosition;
}

/**
 * 遮罩设置：颜色、浓度，以及背景为图片时的图片位置。
 */
export const MaskSection = ({
  propertyInfo,
  updateProperty,
  backgroundType,
  imagePosition,
  setImagePosition,
}: MaskSectionProps) => {
  const t = useTranslations("RightPropertyPanel");

  const handleColorChange = (color: ColorResult) => {
    updateProperty("color", color.hex.toUpperCase());
  };

  /**
   * 遮罩浓度：滑块给的是 0-100 的百分比。
   *
   * 遮罩颜色是「色号 + 两位 hex」拼出来的（见 ImageEditor），
   * 所以这里必须存 hex 而不是十进制 —— 之前存十进制、读的时候按
   * hex 读，拖一次滑块界面显示和实际遮罩就全对不上了。
   */
  const handleBlurTransChange = (value: SliderValue) => {
    const percent = typeof value === "number" ? value : value[0];
    updateProperty("blurTrans", percentToHexAlpha(percent));
  };

  const colorBackgroundStyle = {
    fontSize: "20px",
    backgroundColor: propertyInfo.color,
    borderWidth: "6px",
    borderColor: "var(--pp-line)",
  };

  return (
    <>
      <div className="flex w-full py-2">
        <div className="w-4/5">
          <Input
            type="url"
            label={t("mask")}
            value={propertyInfo.color}
            placeholder={propertyInfo.color}
            onChange={(e) => updateProperty("color", e.target.value)}
          />
        </div>
        <div className="flex-grow" />
        <div className="w-1/6 ml-2 mt-1">
          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                color="primary"
                variant="bordered"
                size="lg"
                style={colorBackgroundStyle}
              ></Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Single selection example"
              variant="flat"
              disallowEmptySelection
              selectionMode="single"
            >
              <DropdownItem key="text">
                <div className="m-2">
                  <Circle
                    colors={MASK_COLORS}
                    onChange={(color: ColorResult) => handleColorChange(color)}
                  />
                </div>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
      <Slider
        label={t("transparence")}
        value={hexAlphaToPercent(propertyInfo.blurTrans)}
        onChange={handleBlurTransChange}
        size="sm"
        step={5}
        className="w-full my-2"
      />

      {/* 图片位置滑动条 - 仅在背景类型为图片时显示 */}
      {backgroundType === 'image' && (
        <Slider
          label={t("image_position")}
          value={imagePosition}
          onChange={(value) => setImagePosition(typeof value === "number" ? value : value[0])}
          size="sm"
          step={10}
          minValue={-100}
          maxValue={100}
          className="w-full my-2"
          formatOptions={{
            style: "decimal",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }}
        />
      )}
    </>
  );
};
