"use client";
import React from "react";

/**
 * 左栏三个 tab 的图标。
 *
 * 原来这三个都写在 LeftResourcePanel.tsx 里，拆出来单独放。
 * LeftResourcePanel 仍然原样再导出一次，旧的 import 路径不会断。
 */

export const GalleryIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="24"
      role="presentation"
      viewBox="0 0 24 24"
      width="24"
      {...props}
    >
      <path
        d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M2.67004 18.9501L7.60004 15.6401C8.39004 15.1101 9.53004 15.1701 10.24 15.7801L10.57 16.0701C11.35 16.7401 12.61 16.7401 13.39 16.0701L17.55 12.5001C18.33 11.8301 19.59 11.8301 20.37 12.5001L22 13.9001"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
};

// Add color selection icon - rounded rectangle style
export const PaletteIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="24"
      role="presentation"
      viewBox="0 0 24 24"
      width="24"
      {...props}
    >
      {/* Rounded rectangle background */}
      <path
        d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      {/* Palette pattern */}
      <circle
        cx="8"
        cy="8"
        r="2"
        fill="currentColor"
        opacity="0.6"
      />
      <circle
        cx="16"
        cy="8"
        r="2"
        fill="currentColor"
        opacity="0.4"
      />
      <circle
        cx="8"
        cy="16"
        r="2"
        fill="currentColor"
        opacity="0.8"
      />
      <circle
        cx="16"
        cy="16"
        r="2"
        fill="currentColor"
        opacity="0.3"
      />
    </svg>
  );
};

// Add texture icon component - rounded rectangle style
export const SvgIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="24"
      role="presentation"
      viewBox="0 0 24 24"
      width="24"
      {...props}
    >
      {/* Rounded rectangle background */}
      <path
        d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      {/* Texture pattern - grid lines */}
      <path
        d="M6 6L18 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1"
        opacity="0.5"
      />
      <path
        d="M6 10L18 10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1"
        opacity="0.5"
      />
      <path
        d="M6 14L18 14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1"
        opacity="0.5"
      />
      <path
        d="M6 18L18 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1"
        opacity="0.5"
      />
      <path
        d="M10 6L10 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1"
        opacity="0.3"
      />
      <path
        d="M14 6L14 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1"
        opacity="0.3"
      />
    </svg>
  );
};
