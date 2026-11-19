"use client";
import type React from "react";
import type { EditorElements } from "../types";
import type { DraggableElement } from "./useElementDrag";

interface DraggableElementsProps {
  /** 是否处于拖拽模式。 */
  isDragMode: boolean;
  /** 当前正在拖的元素。 */
  draggingElement: DraggableElement | null;
  /** 元素位置。 */
  elements: EditorElements;
  /** 开始拖拽。 */
  onDragStart: (element: DraggableElement, event: React.MouseEvent) => void;
  /** 标题文字。 */
  title: string;
  /** 标题字号。 */
  fontSizeValue: number | string;
  /** 标题宽度百分比。 */
  titleWidthValue?: number | string;
  /** 作者文字。 */
  author: string;
  /** 作者字号。 */
  authorFontSizeValue: number | string;
  /** 字体类名。 */
  font: string;
  /** devicon 图标名（为空表示用上传的图片）。 */
  devicon: string;
  /** 上传的自定义图标地址。 */
  icon: string;
  /** 图标的位置模式。 */
  logoPosition: string;
}

/**
 * 画布上可拖动的三个元素：标题、作者、图标。
 *
 * 三者的定位方式一样（绝对定位 + translate 位移），只有内容不同，
 * 所以放在一起 —— 拆成三个文件反而要把一堆 props 传来传去。
 */
export const DraggableElements = ({
  isDragMode,
  draggingElement,
  elements,
  onDragStart,
  title,
  fontSizeValue,
  titleWidthValue,
  author,
  authorFontSizeValue,
  font,
  devicon,
  icon,
  logoPosition,
}: DraggableElementsProps) => {
  /** 图标本体：devicon 字体图标优先，其次是上传的图片。 */
  const renderIcon = () => {
    if (devicon.length !== 0) {
      return (
        <div
          className={`m-4 items-center justify-center flex ${isDragMode ? "cursor-move" : ""}`}
          onMouseDown={(e) => onDragStart("icon", e)}
        >
          <i className={`devicon-${devicon} text-white dev-icon text-4xl`}></i>
        </div>
      );
    }
    if (icon.length > 0) {
      return (
        <div
          className={`${isDragMode ? "cursor-move" : ""}`}
          onMouseDown={(e) => onDragStart("icon", e)}
        >
          <img src={icon} alt="img" className="w-12 h-12 m-2 rounded-full" />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
      {/* Title element */}
      <div
        className={`absolute ${isDragMode ? "cursor-move border border-dashed border-white/30" : ""}`}
        style={{
          left: "50%",
          top: "40%",
          transform: `translate(-50%, -50%) translate(${elements.title.x}px, ${elements.title.y}px)`,
          transition:
            draggingElement === "title" ? "none" : "transform 0.1s ease-out",
          padding: isDragMode ? "8px" : "0",
          pointerEvents: isDragMode ? "auto" : "none",
          visibility: elements.title.visible ? "visible" : "hidden",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        onMouseDown={(e) => onDragStart("title", e)}
      >
        <h1
          className={`leading-tight text-center text-5xl font-bold text-white ${font}`}
          style={{
            fontSize: `${fontSizeValue}px`,
            width: titleWidthValue ? `${titleWidthValue}%` : "auto",
            wordWrap: "break-word",
          }}
        >
          {title}
        </h1>
      </div>

      {/* Author element */}
      <div
        className={`absolute ${isDragMode ? "cursor-move border border-dashed border-white/30" : ""}`}
        style={{
          left: "50%",
          top: "60%",
          transform: `translate(-50%, -50%) translate(${elements.author.x}px, ${elements.author.y}px)`,
          transition:
            draggingElement === "author" ? "none" : "transform 0.1s ease-out",
          padding: isDragMode ? "8px" : "0",
          pointerEvents: isDragMode ? "auto" : "none",
          visibility: elements.author.visible ? "visible" : "hidden",
        }}
        onMouseDown={(e) => onDragStart("author", e)}
      >
        <h2
          className={`text-xl font-semibold text-center text-white ${font}`}
          style={{ fontSize: `${authorFontSizeValue}px` }}
        >
          {author}
        </h2>
      </div>

      {/* Icon container */}
      {(devicon.length > 0 || icon.length > 0) && (
        <div
          className={`absolute ${isDragMode ? "cursor-move border border-dashed border-white/30" : ""}`}
          style={{
            left: logoPosition === "default" ? "50%" : "0",
            top: logoPosition === "default" ? "70%" : "0",
            transform: `translate(${logoPosition === "default" ? "-50%, -50%" : "0, 0"}) translate(${elements.icon.x}px, ${elements.icon.y}px)`,
            transition:
              draggingElement === "icon" ? "none" : "transform 0.1s ease-out",
            padding: isDragMode ? "8px" : "0",
            pointerEvents: isDragMode ? "auto" : "none",
            visibility: elements.icon.visible ? "visible" : "hidden",
          }}
          onMouseDown={(e) => onDragStart("icon", e)}
        >
          {renderIcon()}
        </div>
      )}
    </div>
  );
};
