"use client";
import type React from "react";

/** 背景类型 —— 和 PicproseContext 里的一致。 */
export type CanvasBackgroundType = "image" | "color" | "pattern" | "svg";

interface CanvasBackgroundProps {
  /** 背景类型。 */
  backgroundType: CanvasBackgroundType;
  /** 纯色背景的颜色。 */
  backgroundColor: string;
  /** 图案 / SVG 背景的内容。 */
  backgroundPattern: string;
  /** 图片背景的地址。 */
  imageUrl: string;
  /** 图片在画面里的纵向位置（-100 ~ 100）。 */
  imagePosition: number;
  /** 图片元素，用来挂 load 监听。 */
  imageRef: React.RefObject<HTMLImageElement | null>;
}

/**
 * 画布背景。
 *
 * 四种背景类型共用一块区域 —— 「背景是图片还是颜色还是图案」是同一个位置
 * 的四种画法，不该拆成四块 DOM。
 */
export const CanvasBackground = ({
  backgroundType,
  backgroundColor,
  backgroundPattern,
  imageUrl,
  imagePosition,
  imageRef,
}: CanvasBackgroundProps) => {
  switch (backgroundType) {
    case "image":
      return (
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Background"
          className="rounded-md"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: `center ${50 - imagePosition * 0.5}%`,
            transition: "object-position 0.1s ease-out",
          }}
          draggable={false}
        />
      );
    case "color":
      return (
        <div
          className="rounded-md w-full h-full"
          style={{
            background: backgroundColor,
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      );
    case "pattern":
      return (
        <div
          className="rounded-md w-full h-full"
          style={{
            background: backgroundPattern.split("|")[0],
            backgroundColor: backgroundPattern.split("|")[1] || "var(--pp-surface)",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      );
    case "svg":
      return (
        <div
          className="rounded-md w-full h-full"
          style={{
            backgroundImage: backgroundPattern,
            position: "absolute",
            top: 0,
            left: 0,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      );
    default:
      return null;
  }
};
