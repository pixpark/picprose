"use client";
import {
  Button,
  Input,
  Label,
  Popover,
  Slider,
  TextField,
} from "@heroui/react";
import { Circle } from "@uiw/react-color";
import type { ColorResult } from "@uiw/react-color";
import { useTranslations } from "next-intl";
import React from "react";
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
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);

  const handleColorChange = (color: ColorResult) => {
    updateProperty("color", color.hex.toUpperCase());
    // 选完就收起浮层 —— v2 里点色块会顺带关掉下拉，v3 的 Popover 不会自动关。
    setIsPickerOpen(false);
  };

  /**
   * 遮罩浓度：滑块给的是 0-100 的百分比。
   *
   * 遮罩颜色是「色号 + 两位 hex」拼出来的（见 ImageEditor），
   * 所以这里必须存 hex 而不是十进制 —— 之前存十进制、读的时候按
   * hex 读，拖一次滑块界面显示和实际遮罩就全对不上了。
   */
  const handleBlurTransChange = (value: number | number[]) => {
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
          <TextField className="w-full">
            <Label>{t("mask")}</Label>
            <Input
              type="url"
              value={propertyInfo.color}
              placeholder={propertyInfo.color}
              onChange={(e) => updateProperty("color", e.target.value)}
            />
          </TextField>
        </div>
        <div className="flex-grow" />
        <div className="w-1/6 ml-2 mt-1">
          {/* 取色器用 Popover，不用 Dropdown ——
              菜单项里塞一个可交互的取色板本身就是误用（点色块会顺手把菜单点了）。 */}
          <Popover
            isOpen={isPickerOpen}
            onOpenChange={setIsPickerOpen}
          >
            <Button
              isIconOnly
              variant="outline"
              size="lg"
              aria-label={t("mask")}
              style={colorBackgroundStyle}
            />
            <Popover.Content>
              <Popover.Dialog>
                <Circle
                  colors={MASK_COLORS}
                  onChange={(color: ColorResult) => handleColorChange(color)}
                />
              </Popover.Dialog>
            </Popover.Content>
          </Popover>
        </div>
      </div>
      <Slider
        value={hexAlphaToPercent(propertyInfo.blurTrans)}
        onChange={handleBlurTransChange}
        step={5}
        className="w-full my-2"
      >
        <Label>{t("transparence")}</Label>
        <Slider.Output />
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb />
        </Slider.Track>
      </Slider>

      {/* 图片位置滑动条 - 仅在背景类型为图片时显示 */}
      {backgroundType === 'image' && (
        <Slider
          value={imagePosition}
          onChange={(value) =>
            setImagePosition(typeof value === "number" ? value : value[0])
          }
          step={10}
          minValue={-100}
          maxValue={100}
          className="w-full my-2"
          formatOptions={{
            style: "decimal",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }}
        >
          <Label>{t("image_position")}</Label>
          <Slider.Output />
          <Slider.Track>
            <Slider.Fill />
            <Slider.Thumb />
          </Slider.Track>
        </Slider>
      )}
    </>
  );
};
