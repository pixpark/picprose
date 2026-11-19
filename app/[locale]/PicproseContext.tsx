"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { config } from "@/config";
import { useLocale } from "next-intl";
import { percentToHexAlpha } from "@/lib/alpha";
import type { SvgTemplateParams } from "./svgBackgrounds";
import type { ExportFormat } from "./ComponentToImg";

// Define image information interface
interface ImageInfo {
  url: string;
  name: string;
  avatar: string;
  profile: string;
  downloadLink: string;
  width?: number;
  height?: number;
  key?: string;
  alt?: string;
  src?: string;
}

// Define property interface
interface PropertyInfo {
  font: string;
  fontSizeValue: number | string;
  authorFontSizeValue: number | string;
  title: string;
  subTitle: string;
  author: string;
  icon: string;
  devicon: string;
  color: string;
  aspect: string;
  blur: string;
  blurTrans: string;
  logoPosition: string;
  customWidth: number;
  customHeight: number;
  isCustomAspect: boolean;
  titleWidthValue?: number | string;
  selectedValue?: string;
}

// Define background type
type BackgroundType = 'image' | 'color' | 'pattern' | 'svg';


// Define Context type
interface PicproseContextType {
  // Image information
  imageInfo: ImageInfo;
  setImageInfo: (info: ImageInfo) => void;
  
  // Property information
  propertyInfo: PropertyInfo;
  updateProperty: <K extends keyof PropertyInfo>(key: K, value: PropertyInfo[K]) => void;
  
  // Download image
  downloadImage: (format: ExportFormat) => void;
  
  // Background type and color
  backgroundType: BackgroundType;
  setBackgroundType: (type: BackgroundType) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  
  // Add texture background related properties
  backgroundPattern: string;
  setBackgroundPattern: (pattern: string) => void;
  
  // Image position state
  imagePosition: number;
  setImagePosition: (position: number) => void;
  
  // Add SVG related properties
  selectedSvgIndex: number | null;
  setSelectedSvgIndex: (index: number | null) => void;
  svgPatternParams: SvgTemplateParams;
  setSvgPatternParams: (params: SvgTemplateParams) => void;
  showSvgPanel: boolean;
  setShowSvgPanel: (show: boolean) => void;
  
}

// Create default image information
const defaultImageInfo: ImageInfo = {
  url: "stacked-waves.svg",
  name: "PicProse",
  avatar: "default-author.jpg",
  profile: "default",
  downloadLink: "",
};

// Create default property information
const defaultPropertyInfo: PropertyInfo = {
  font: config.font,
  fontSizeValue: config.fontSize,
  authorFontSizeValue: config.authorFontSize,
  title: config.titles.en[0],
  subTitle: config.subTitle,
  author: config.author,
  icon: config.icon,
  devicon: config.deviconValue[0] || "",
  color: config.backColor,
  aspect: config.aspect,
  blur: "backdrop-blur-none",
  blurTrans: percentToHexAlpha(config.blurTrans),
  logoPosition: config.logoPosition,
  customWidth: 1920,
  customHeight: 1080,
  isCustomAspect: false,
  titleWidthValue: 100,
  selectedValue: "horizontal-16x9-aspect-[16/9]",
};


// Create Context
const PicproseContext = createContext<PicproseContextType | undefined>(undefined);

// Context Provider component
export function PicproseProvider({ 
  children, 
  onDownload 
}: { 
  children: React.ReactNode, 
  onDownload: (format: ExportFormat) => void 
}) {
  const [imageInfo, setImageInfo] = useState<ImageInfo>(defaultImageInfo);
  const [propertyInfo, setPropertyInfo] = useState<PropertyInfo>(defaultPropertyInfo);
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('image');
  const [backgroundColor, setBackgroundColor] = useState<string>(config.backColor);
  const [backgroundPattern, setBackgroundPattern] = useState<string>("");
  
  // Add mask opacity for three states
  // 每种背景各记一份遮罩浓度，切回来时能还原。
  // 装在一个对象里，不拆成三个 useState —— 拆开就得手工同步，
  // 而同步会读到旧值（见下面 handleBackgroundTypeChange 的注释）。
  const [blurTransByType, setBlurTransByType] = useState<
    Record<BackgroundType, string>
  >({
    image: percentToHexAlpha(config.blurTrans),
    color: "00", // Color mode default transparent
    pattern: "99", // Pattern mode default 60% opacity (153/255 ≈ 0.6 = 60%)
    svg: "99", // SVG mode default 60% opacity
  });

  // Image position state (range: -300 to 300)
  const [imagePosition, setImagePosition] = useState<number>(0);

  // Add SVG related states
  const [selectedSvgIndex, setSelectedSvgIndex] = useState<number | null>(null);
  const [svgPatternParams, setSvgPatternParams] = useState<SvgTemplateParams>({});
  const [showSvgPanel, setShowSvgPanel] = useState(false);


  // 随机换一句示例标题，只在客户端执行。
  // 标题按语言取 —— 英文界面下不能蹦出中文诗句。
  const locale = useLocale();
  useEffect(() => {
    const titles = config.titles[locale as "zh" | "en"] ?? config.titles.en;
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    setPropertyInfo(prev => ({
      ...prev,
      title: randomTitle
    }));
  }, [locale]);

  // Update single property
  const updateProperty = <K extends keyof PropertyInfo>(key: K, value: PropertyInfo[K]) => {
    setPropertyInfo(prev => ({
      ...prev,
      [key]: value
    }));

    // 用户改了遮罩透明度，就记到「当前背景类型」自己的那一份里。
    if (key === "blurTrans" && typeof value === "string") {
      setBlurTransByType(prev => ({ ...prev, [backgroundType]: value }));
    }
  };

  // Modify background type setting function, when switching background type, also switch corresponding mask transparency
  const handleBackgroundTypeChange = (type: BackgroundType) => {
    // Update background type
    setBackgroundType(type);

    // Apply corresponding mask transparency based on new background type
    //
    // 这里不能走 updateProperty：它会把值写进「当前类型」的桶，
    // 而当前类型此刻还是旧的 —— 那样新类型的浓度会写进旧类型的桶，
    // 来回切几次浓度就串了。直接按目标类型取。
    setPropertyInfo(prev => ({ ...prev, blurTrans: blurTransByType[type] }));
  };

  // Download image
  const downloadImage = (format: ExportFormat) => {
    if (onDownload) {
      onDownload(format);
    }
  };

  return (
    <PicproseContext.Provider 
      value={{ 
        imageInfo, 
        setImageInfo, 
        propertyInfo, 
        updateProperty,
        downloadImage,
        backgroundType,
        setBackgroundType: handleBackgroundTypeChange,
        backgroundColor,
        setBackgroundColor,
        backgroundPattern,
        setBackgroundPattern,
        imagePosition,
        setImagePosition,
        selectedSvgIndex,
        setSelectedSvgIndex,
        svgPatternParams,
        setSvgPatternParams,
        showSvgPanel,
        setShowSvgPanel,
      }}
    >
      {children}
    </PicproseContext.Provider>
  );
}

// Custom Hook for accessing Context
export function usePicprose() {
  const context = useContext(PicproseContext);
  if (context === undefined) {
    throw new Error("usePicprose must be used within a PicproseProvider");
  }
  return context;
}