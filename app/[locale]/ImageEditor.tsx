"use client";
import React, { useEffect, useRef } from "react";
import "./devicon.min.css";
import { Spinner } from "@heroui/react";
import { usePicprose } from "./PicproseContext";
import { config } from "@/config";
import type { EditorElements } from "./types";
import { CanvasBackground } from "./canvas/CanvasBackground";
import { CanvasGrid } from "./canvas/CanvasGrid";
import { DraggableElements } from "./canvas/DraggableElements";
import { useElementDrag } from "./canvas/useElementDrag";

// Type definitions
interface ImageEditorProps {
  isDragMode: boolean;
  elements: EditorElements;
  setElements: React.Dispatch<React.SetStateAction<EditorElements>>;
  saveHistory: (elements: EditorElements) => void;
  handleResetLayout: () => void;
}

/**
 * 画布。
 *
 * 拼装三块：背景 / 对齐参考线 / 可拖动元素。
 * 具体的渲染都在 `canvas/` 下面，这里只管编排。
 */
export const ImageEditor = ({
  isDragMode,
  elements,
  setElements,
  saveHistory,
  handleResetLayout,
}: ImageEditorProps) => {
  // Get configuration from Context
  const {
    propertyInfo,
    imageInfo,
    backgroundType,
    backgroundColor,
    backgroundPattern,
    imagePosition,
  } = usePicprose();

  // Destructure properties
  const {
    aspect,
    blur,
    blurTrans,
    title,
    author,
    icon,
    devicon,
    font,
    fontSizeValue,
    authorFontSizeValue,
    color,
    logoPosition,
    titleWidthValue,
  } = propertyInfo;

  // State definitions
  const [isLoading, setIsLoading] = React.useState(false);

  // References
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 拖拽逻辑在 hook 里，见 canvas/useElementDrag.ts
  const { draggingElement, startDrag } = useElementDrag({
    isDragMode,
    elements,
    setElements,
    saveHistory,
  });

  // Image loading
  useEffect(() => {
    if (imageInfo.url) {
      setIsLoading(true);
    }
  }, [imageInfo.url]);

  // Handle image loading
  useEffect(() => {
    const handleImageLoad = () => {
      setIsLoading(false);
    };

    const imgElement = imageRef.current;
    if (imgElement) {
      imgElement.addEventListener("load", handleImageLoad);
      // If image is already loaded, handle immediately
      if (imgElement.complete) {
        handleImageLoad();
      }
    }

    return () => {
      if (imgElement) {
        imgElement.removeEventListener("load", handleImageLoad);
      }
    };
  }, [imageInfo.url]);

  // Calculate aspect ratio
  const calculateAspectRatio = () => {
    if (!aspect || !aspect.includes("/")) {
      return { width: "90vh", height: "90vh" };
    }

    try {
      const ratioStr = aspect.replace("aspect-[", "").replace("]", "");
      const [w, h] = ratioStr.split("/").map((n) => parseFloat(n.trim()));

      if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
        return { width: "90vh", height: "90vh" };
      }

      if (Math.abs(w - h) < 0.01) {
        return { width: "90vh", height: "90vh" };
      } else if (h > w) {
        return { width: `${(90 * w) / h}vh`, height: "90vh" };
      } else {
        return { width: "90vh", height: `${(90 * h) / w}vh` };
      }
    } catch (e) {
      return { width: "90vh", height: "90vh" };
    }
  };

  // Calculate container dimensions
  const aspectRatio = calculateAspectRatio();

  // Auto reset layout after component mount
  useEffect(() => {
    // Call reset layout method after component mount
    handleResetLayout();
    // Execute only once when component mounts
  }, []);

  return (
    <div className="max-h-screen relative flex group rounded-3xl">
      <div
        ref={containerRef}
        style={{
          maxHeight: "90vh",
          minHeight: "50vh",
          overflow: "hidden",
          position: "relative",
          pointerEvents: "auto",
          width: aspectRatio.width,
          height: aspectRatio.height,
        }}
        className="rounded-md"
      >
        {/* Background */}
        <CanvasBackground
          backgroundType={backgroundType}
          backgroundColor={backgroundColor}
          backgroundPattern={backgroundPattern}
          imageUrl={imageInfo.url}
          imagePosition={imagePosition}
          imageRef={imageRef}
        />

        {/* Grid guides */}
        <CanvasGrid isDragMode={isDragMode} containerRef={containerRef} />
      </div>

      {/* Overlay and content layer */}
      <div
        style={{
          backgroundColor: (color || config.backColor) + blurTrans,
          pointerEvents: isDragMode ? "none" : "auto",
          zIndex: 1,
        }}
        className={`absolute top-0 right-0 left-0 rounded-md h-full ${blur}`}
      >
        {/* Draggable elements */}
        <DraggableElements
          isDragMode={isDragMode}
          draggingElement={draggingElement}
          elements={elements}
          onDragStart={startDrag}
          title={title}
          fontSizeValue={fontSizeValue}
          titleWidthValue={titleWidthValue}
          author={author}
          authorFontSizeValue={authorFontSizeValue}
          font={font}
          devicon={devicon}
          icon={icon}
          logoPosition={logoPosition}
        />

        {/* Loading indicator */}
        {isLoading && <Spinner className="absolute bottom-8 left-8" />}
      </div>

      {/* Image author information */}
      {backgroundType === "image" && (
        <div className="absolute bottom-4 right-4 opacity-80">
          <div className="group-hover:flex hidden items-center">
            <span className="text-sm text-white mx-2">Photo by</span>
            <a
              href={imageInfo.profile}
              target="_blank"
              rel="noreferrer"
              className="cursor-pointer flex items-center bg-surface-tertiary rounded-full text-sm"
            >
              <img
                src={imageInfo.avatar}
                alt={imageInfo.name}
                className="h-6 w-6 rounded-full mr-2"
              />
              <span className="pr-2">{imageInfo.name}</span>
            </a>
            <a
              href="https://unsplash.com/?utm_source=PicProse&utm_medium=referral"
              target="_blank"
              className="text-sm text-white mx-2"
            >
              Unsplash
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
