"use client";
import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { toJpeg, toPng, toSvg } from "html-to-image";
import { useTranslations } from "next-intl";

/** 导出格式。 */
export type ExportFormat = "jpg" | "png" | "svg";

/** 父组件能拿到的句柄。 */
export interface ComponentToImgHandle {
  downloadImage: (format: ExportFormat) => void;
}

export interface ComponentToImgProps {
  children: React.ReactNode;
}

/** 导出时的放大倍率。 */
const EXPORT_SCALE = 1.6;

function fileNameWithTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `-${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`
  );
}

/**
 * 把包裹的 DOM 导出成图片。
 *
 * 用 html-to-image 把 DOM 序列化成 data URI 再触发下载。
 * 注意它依赖页面里已经加载好的字体和图片，所以要等资源就绪再导。
 */
export const ComponentToImg = forwardRef<
  ComponentToImgHandle,
  ComponentToImgProps
>(function ComponentToImg({ children }, ref) {
  const t = useTranslations("Export");
  const [loading, setLoading] = useState(false);
  // 用 useRef，不要用 React.createRef()：
  // createRef 写在 render body 里，每次渲染都会新建一个 ref 对象，
  // React 得反复解绑重绑，而且拿到的永远是「上一次渲染那一个」。
  const componentRef = useRef<HTMLDivElement>(null);

  const saveImage = (data: string) => {
    const a = document.createElement("a");
    a.href = data;
    a.download = fileNameWithTimestamp();
    document.body.appendChild(a);
    setLoading(false);
    a.click();
    document.body.removeChild(a);
  };

  const downloadImage = async (imgFormat: ExportFormat) => {
    const element = componentRef.current;
    if (!element) return;

    setLoading(true);

    const config = {
      height: element.offsetHeight * EXPORT_SCALE,
      width: element.offsetWidth * EXPORT_SCALE,
      style: {
        transform: `scale(${EXPORT_SCALE})`,
        transformOrigin: "top left",
        width: element.offsetWidth + "px",
        height: element.offsetHeight + "px",
      },
      quality: 0.92,
    };

    try {
      if (imgFormat === "jpg") {
        saveImage(await toJpeg(element, config));
      } else if (imgFormat === "png") {
        saveImage(await toPng(element, config));
      } else {
        saveImage(await toSvg(element, config));
      }
    } catch (err) {
      setLoading(false);
      console.error(t("failed"), err);
    }
  };

  // 暴露给父组件
  useImperativeHandle(ref, () => ({
    downloadImage: (format: ExportFormat) => {
      void downloadImage(format);
    },
  }));

  return (
    <div ref={componentRef} data-loading={loading || undefined}>
      {children}
    </div>
  );
});
