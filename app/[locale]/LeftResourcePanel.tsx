"use client";
import React from "react";
import {
  Input,
  ScrollShadow,
  Avatar,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Tabs,
  Tab,
} from "@heroui/react";
import { SearchIcon } from "./SearchIcon";
import {useTranslations} from 'next-intl';
import { usePicprose } from "./PicproseContext";
import { SVG_BACKGROUNDS, type SvgTemplateParams } from './svgBackgrounds';
import { usePhotoFeed, type FeedPhoto } from "./usePhotoFeed";
import { PhotoGallery } from "./resources/PhotoGallery";
import { ColorSection } from "./resources/ColorSection";
import { SvgSection } from "./resources/SvgSection";
import { GalleryIcon, PaletteIcon, SvgIcon } from "./resources/icons";

const KEY_CODE_ENTER = 13;

// 这三个图标原来是从本文件导出的，定义搬到 resources/icons.tsx 之后，
// 这里再原样导出一遍，旧的 import 路径不会断。
export { GalleryIcon, PaletteIcon, SvgIcon };

/**
 * 左栏：图库 / 颜色 / 图案 三个 tab。
 *
 * 这里只做编排 —— 状态在 usePhotoFeed 里，画图在 resources/ 下各 Section 里。
 */
export const LeftResourcePanel = () => {
  const t = useTranslations('LeftResourcePanel');
  const {
    setImageInfo,
    setBackgroundType,
    setBackgroundColor,
    setBackgroundPattern,
    setSelectedSvgIndex,
    setSvgPatternParams,
    setShowSvgPanel,
    selectedSvgIndex,
  } = usePicprose();

  // Add current tab state
  const [activeTab, setActiveTab] = React.useState("images");
  const [windowHeight, setWindowHeight] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSelectPhoto = (index: number, photoList: FeedPhoto[]) => {
    if (index >= 0 && index < photoList.length) {
      const selectedPhoto = photoList[index];
      setImageInfo({
        url: selectedPhoto.url,
        name: selectedPhoto.name || t("unknown_author"),
        avatar: selectedPhoto.avatar || "default-author.jpg",
        profile: selectedPhoto.profile || "#",
        downloadLink: selectedPhoto.downloadLink || "",
        width: selectedPhoto.width,
        height: selectedPhoto.height,
        key: selectedPhoto.key,
        alt: selectedPhoto.alt
      });
      setBackgroundType('image');
    }
  };

  const feed = usePhotoFeed({
    isActive: activeTab === "images",
    onSelectPhoto: handleSelectPhoto,
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = URL.createObjectURL(event.target.files[0]);
      setImageInfo({
        url: file,
        name: "PicProse",
        avatar: "default-author.jpg",
        profile: "default",
        downloadLink: "",
      });
      setBackgroundType('image'); // 设置背景类型为图片
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSelectColor = (color: string) => {
    setBackgroundType('color');
    setBackgroundColor(color);
  };

  const handleSelectSvgTemplate = (index: number) => {
    if (index < 0 || index >= SVG_BACKGROUNDS.length) return;

    const selectedSvg = SVG_BACKGROUNDS[index];

    // Clone default parameters to avoid reference issues
    const defaultParams = JSON.parse(
      JSON.stringify(selectedSvg.defaultParams),
    ) as SvgTemplateParams;

    // Set selected SVG index and default parameters
    setSelectedSvgIndex(index);
    setSvgPatternParams(defaultParams);
    setShowSvgPanel(true);

    try {
      // Apply SVG with default parameters
      const svgPattern = selectedSvg.svgTemplate(defaultParams);
      const encodedSvg = `url("data:image/svg+xml;utf8,${encodeURIComponent(svgPattern)}")`;
      setBackgroundType('svg');
      setBackgroundPattern(encodedSvg);
    } catch (error) {
    }
  };

  const handleTabChange = (key: string) => {
    const previousTab = activeTab;
    setActiveTab(key);

    // If switching from non-image tab to image tab
    if (key === "images" && previousTab !== "images") {
      feed.resumeGallery();
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.keyCode === KEY_CODE_ENTER) {
      feed.search();
    }
  };

  React.useEffect(() => {
    setWindowHeight(window.innerHeight);

    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const PicproseLogo = () => {
    return (
      <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
        <path
          clipRule="evenodd"
          d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
          fill="currentColor"
          fillRule="evenodd"
        />
      </svg>
    );
  };

  return (
    <div className="w-full flex flex-col h-screen">
      <div className="w-full flex-none">
        <Navbar
          classNames={{
            wrapper: "px-4",
          }}
        >
          <NavbarBrand>
            <PicproseLogo />
            <p className="font-bold text-inherit">PicProse</p>
          </NavbarBrand>
          <NavbarContent justify="end">
            <NavbarItem>
              <Avatar
                isBordered
                src="https://i.pravatar.cc/150?u=a04258114e29026302d"
              />
            </NavbarItem>
          </NavbarContent>
        </Navbar>
      </div>

      <div className="px-2 pt-2 flex-grow flex flex-col">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => handleTabChange(key as string)}
          color="default"
          variant="solid"
          fullWidth
          classNames={{
            base: "flex flex-col flex-grow",
            panel: "flex-grow overflow-hidden",
            tabList: "mb-0",
            tab: "py-2 px-2"
          }}
        >
          <Tab
            key="images"
            title={
              <div className="flex items-center gap-2">
                <GalleryIcon className="w-5 h-5" />
                <span className="text-sm">{t('images_tab')}</span>
              </div>
            }
          >
            <PhotoGallery
              photos={feed.photos}
              loading={feed.loading}
              hasMore={feed.hasMore}
              isActive={activeTab === "images"}
              windowHeight={windowHeight}
              scrollContainerRef={feed.scrollContainerRef}
              onLoadMore={feed.loadMore}
              onSelectPhoto={feed.selectPhoto}
              t={t}
            />
          </Tab>
          <Tab
            key="colors"
            title={
              <div className="flex items-center gap-2">
                <PaletteIcon className="w-5 h-5" />
                <span className="text-sm">{t('colors_tab')}</span>
              </div>
            }
          >
            <div className="flex-grow" style={{ height: windowHeight - 220 }}>
              <ScrollShadow className="h-full overflow-y-auto">
                <ColorSection onSelectColor={handleSelectColor} t={t} />
              </ScrollShadow>
            </div>
          </Tab>
          <Tab
            key="patterns"
            title={
              <div className="flex items-center gap-2">
                <SvgIcon className="w-5 h-5" />
                <span className="text-sm">{t('patterns_tab')}</span>
              </div>
            }
          >
            <div className="flex-grow" style={{ height: windowHeight - 220 }}>
              <ScrollShadow className="h-full overflow-y-auto">
                <SvgSection
                  selectedSvgIndex={selectedSvgIndex}
                  onSelectTemplate={handleSelectSvgTemplate}
                  t={t}
                />
              </ScrollShadow>
            </div>
          </Tab>
        </Tabs>
      </div>

      <div className="w-full flex-none mt-auto">
        <Navbar
          classNames={{
            wrapper: "px-4",
          }}
        >
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          <Button
            variant="flat"
            color="primary"
            isIconOnly
            onClick={handleButtonClick}
          >
            <svg
              className="w-5 h-5 text-pp-accent pointer-events-none flex-shrink-0"
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
          <Input
            type="search"
            placeholder={t('input_search')}
            value={feed.query}
            onValueChange={feed.setQuery}
            onKeyDown={(e) => handleSearchKeyDown(e)}
            isDisabled={activeTab !== "images"}
          />

          <NavbarContent justify="end">
            <NavbarItem>
              <Button
                isIconOnly
                variant="flat"
                color="primary"
                onClick={() => feed.search()}
                isDisabled={activeTab !== "images"}
              >
                <SearchIcon className="text-pp-accent mb-0.5 pointer-events-none flex-shrink-0" />
              </Button>
            </NavbarItem>
          </NavbarContent>
        </Navbar>
      </div>
    </div>
  );
};
