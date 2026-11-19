"use client";
import React from "react";
import {
  Avatar,
  Button,
  Input,
  ScrollShadow,
  Tabs,
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
 *
 * HeroUI v3 删掉了 Navbar —— 顶部品牌栏和底部搜索栏改用原生 header / footer，
 * 布局和 v2 的 Navbar 一致。
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
        <header className="w-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PicproseLogo />
            <p className="font-bold">PicProse</p>
          </div>
          <Avatar className="ring-1 ring-border" size="sm">
            <Avatar.Image src="https://i.pravatar.cc/150?u=a04258114e29026302d" />
            <Avatar.Fallback>P</Avatar.Fallback>
          </Avatar>
        </header>
      </div>

      <div className="px-2 pt-2 flex-grow flex flex-col">
        <Tabs
          className="flex flex-col flex-grow"
          selectedKey={activeTab}
          onSelectionChange={(key) => handleTabChange(String(key))}
        >
          <Tabs.ListContainer className="mb-0">
            <Tabs.List>
              <Tabs.Tab id="images" className="py-2 px-2">
                <div className="flex items-center gap-2">
                  <GalleryIcon className="w-5 h-5" />
                  <span className="text-sm">{t('images_tab')}</span>
                </div>
              </Tabs.Tab>
              <Tabs.Tab id="colors" className="py-2 px-2">
                <div className="flex items-center gap-2">
                  <PaletteIcon className="w-5 h-5" />
                  <span className="text-sm">{t('colors_tab')}</span>
                </div>
              </Tabs.Tab>
              <Tabs.Tab id="patterns" className="py-2 px-2">
                <div className="flex items-center gap-2">
                  <SvgIcon className="w-5 h-5" />
                  <span className="text-sm">{t('patterns_tab')}</span>
                </div>
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>

          <Tabs.Panel id="images" className="flex-grow overflow-hidden p-0">
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
          </Tabs.Panel>
          <Tabs.Panel id="colors" className="flex-grow overflow-hidden p-0">
            <div className="flex-grow" style={{ height: windowHeight - 220 }}>
              <ScrollShadow className="h-full overflow-y-auto" variant="fade">
                <ColorSection onSelectColor={handleSelectColor} t={t} />
              </ScrollShadow>
            </div>
          </Tabs.Panel>
          <Tabs.Panel id="patterns" className="flex-grow overflow-hidden p-0">
            <div className="flex-grow" style={{ height: windowHeight - 220 }}>
              <ScrollShadow className="h-full overflow-y-auto" variant="fade">
                <SvgSection
                  selectedSvgIndex={selectedSvgIndex}
                  onSelectTemplate={handleSelectSvgTemplate}
                  t={t}
                />
              </ScrollShadow>
            </div>
          </Tabs.Panel>
        </Tabs>
      </div>

      <div className="w-full flex-none mt-auto">
        <footer className="w-full px-4 flex items-center gap-2">
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          <Button
            variant="secondary"
            isIconOnly
            onPress={handleButtonClick}
          >
            <svg
              className="w-5 h-5 pointer-events-none flex-shrink-0"
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
          <div className="flex-1">
            <Input
              className="w-full"
              type="search"
              placeholder={t('input_search')}
              value={feed.query}
              onChange={(e) => feed.setQuery(e.target.value)}
              onKeyDown={(e) => handleSearchKeyDown(e)}
              disabled={activeTab !== "images"}
            />
          </div>
          <Button
            isIconOnly
            variant="secondary"
            onPress={() => feed.search()}
            isDisabled={activeTab !== "images"}
          >
            <SearchIcon className="mb-0.5 pointer-events-none flex-shrink-0" />
          </Button>
        </footer>
      </div>
    </div>
  );
};
