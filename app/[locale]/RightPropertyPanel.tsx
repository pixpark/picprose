"use client";
import React from "react";
import {
  Button,
  Divider,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { usePicprose } from "./PicproseContext";
import { AspectSection } from "./properties/AspectSection";
import { DimensionsModal } from "./properties/DimensionsModal";
import { DownloadSection } from "./properties/DownloadSection";
import { FontSection } from "./properties/FontSection";
import { IconSection } from "./properties/IconSection";
import { MaskSection } from "./properties/MaskSection";
import { SvgParamsSection } from "./properties/SvgParamsSection";
import { TextSection } from "./properties/TextSection";

const ChevronLeftIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
  >
    <path
      d="M15.41 16.59L10.83 12L15.41 7.41L14 6L8 12L14 18L15.41 16.59Z"
      fill="currentColor"
    />
  </svg>
);

/**
 * 右栏外壳。
 *
 * 这里只做三件事：取 context、翻译、各个 Section 的编排 ——
 * 具体的控件都在 `properties/` 下面按功能域拆开了：
 *
 *   AspectSection     比例卡片
 *   DimensionsModal   选择尺寸面板
 *   MaskSection       遮罩颜色 / 浓度 / 图片位置
 *   IconSection       devicon 下拉 + 上传图标
 *   FontSection       字体下拉 + 上传字体
 *   TextSection       标题 / 字号 / 宽度 / 作者
 *   SvgParamsSection  SVG 图案参数
 *   DownloadSection   导出格式
 */
export const RightPropertyPanel = () => {
  const t = useTranslations("RightPropertyPanel");
  const {
    propertyInfo,
    updateProperty,
    downloadImage,
    selectedSvgIndex,
    svgPatternParams,
    setSvgPatternParams,
    setBackgroundPattern,
    setBackgroundType,
    showSvgPanel,
    setShowSvgPanel,
    backgroundType,
    imagePosition,
    setImagePosition
  } = usePicprose();

  const [showDimensionsModal, setShowDimensionsModal] = React.useState(false);

  return (
    <div className="w-full flex flex-col h-screen max-w-md mx-auto relative overflow-hidden">
      {/* 原始面板内容 */}
      <div
        className={`absolute inset-0 flex flex-col w-full h-full transition-transform duration-300 ${
          showDimensionsModal || showSvgPanel ? 'translate-x-[-100%]' : 'translate-x-0'
        }`}
      >
        <div className="w-full">
          <Navbar
            classNames={{
              wrapper: "px-4",
            }}
          >
            <NavbarBrand>
              <p className="text-default-600 font-bold text-inherit">
                {t("property")}
              </p>
            </NavbarBrand>

            <NavbarContent justify="end">
              <NavbarItem>
                <Button
                  as={Link}
                  color="primary"
                  variant="flat"
                  target="_blank"
                  href="https://github.com/pixpark/picprose"
                >
                  <i
                    className={`devicon-github-plain text-primary dev-icon text-xl`}
                  />
                  GitHub
                </Button>
              </NavbarItem>
            </NavbarContent>
          </Navbar>
        </div>

        <div className="flex-grow overflow-y-auto overflow-x-hidden flex flex-col px-4">
          <AspectSection
            propertyInfo={propertyInfo}
            onOpenDimensions={() => setShowDimensionsModal(true)}
          />

          <Divider className="my-2" />

          <MaskSection
            propertyInfo={propertyInfo}
            updateProperty={updateProperty}
            backgroundType={backgroundType}
            imagePosition={imagePosition}
            setImagePosition={setImagePosition}
          />

          <Divider />

          <IconSection updateProperty={updateProperty} />

          <Divider />

          <FontSection updateProperty={updateProperty} />

          <TextSection
            propertyInfo={propertyInfo}
            updateProperty={updateProperty}
          />
        </div>

        <Divider />
        <DownloadSection downloadImage={downloadImage} />
      </div>

      {/* 比例选择面板 */}
      <div
        className={`absolute inset-0 flex flex-col w-full h-full bg-background transition-transform duration-300 ${
          showDimensionsModal ? 'translate-x-0' : 'translate-x-[100%]'
        }`}
      >
        <div className="w-full">
          <Navbar classNames={{ wrapper: "px-4" }}>
            <NavbarBrand>
              <Button
                isIconOnly
                variant="light"
                onPress={() => setShowDimensionsModal(false)}
                className="mr-2"
              >
                <ChevronLeftIcon />
              </Button>
              <p className="text-default-600 font-bold text-inherit">
                {t("select_dimensions")}
              </p>
            </NavbarBrand>

            {/* 确认按钮已移除 */}
          </Navbar>
        </div>

        <DimensionsModal
          propertyInfo={propertyInfo}
          updateProperty={updateProperty}
        />
      </div>

      {/* 新增SVG参数面板 - 只保留波浪图案相关的设置 */}
      <div
        className={`absolute inset-0 flex flex-col w-full h-full bg-background transition-transform duration-300 ${
          showSvgPanel ? 'translate-x-0' : 'translate-x-[100%]'
        }`}
      >
        <div className="w-full">
          <Navbar
            classNames={{
              wrapper: "px-4",
            }}
          >
            <NavbarBrand className="flex-1">
              <Button
                size="sm"
                variant="flat"
                onClick={() => setShowSvgPanel(false)}
                className="mr-2"
              >
                <ChevronLeftIcon />
              </Button>
              <p className="text-default-600 font-bold text-inherit">
                {t("customize_svg")}
              </p>
            </NavbarBrand>
          </Navbar>
        </div>

        <div className="flex-grow overflow-y-auto px-4">
          <SvgParamsSection
            selectedSvgIndex={selectedSvgIndex}
            svgPatternParams={svgPatternParams}
            setSvgPatternParams={setSvgPatternParams}
            setBackgroundPattern={setBackgroundPattern}
            setBackgroundType={setBackgroundType}
          />
        </div>
      </div>
    </div>
  );
};
