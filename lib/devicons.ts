"use client";
import { useEffect, useState } from "react";

/**
 * devicon 图标表。
 *
 * 原来是一份 11869 行的 `app/[locale]/devicon.jsx`，被右面板直接 import
 * —— 473 个图标的几百 KB 全压在首屏 bundle 里，源码树里还杵着一个
 * 万行文件。
 *
 * 现在拆成：
 *   public/devicon/devicons.json  ← 数据（构建时静态托管）
 *   本文件                        ← 类型 + 运行时按需拉取
 *
 * 拉过一次就缓存，失败不缓存（下次还能重试）。
 */

export interface DeviconEntry {
  name: string;
  altnames: string[];
  tags: string[];
  versions: {
    svg: string[];
    font: string[];
  };
  color?: string;
  aliases?: Record<string, string>;
}

const DEVICON_URL = "/devicon/devicons.json";

let cache: Promise<DeviconEntry[]> | null = null;

/** 拉图标表。全局只请求一次。 */
export function loadDevicons(): Promise<DeviconEntry[]> {
  if (!cache) {
    cache = fetch(DEVICON_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load the devicon list: ${response.status}`);
        }
        return response.json() as Promise<DeviconEntry[]>;
      })
      .catch((error) => {
        // 失败不缓存，否则一次网络抖动就再也拉不到了。
        cache = null;
        throw error;
      });
  }
  return cache;
}

/**
 * React hook：组件挂载时拉图标表。
 *
 * 返回值在数据到达前是空数组 —— 用它的组件要能处理「还没加载」这一档。
 */
export function useDevicons(): DeviconEntry[] {
  const [icons, setIcons] = useState<DeviconEntry[]>([]);

  useEffect(() => {
    let alive = true;
    loadDevicons()
      .then((data) => {
        if (alive) setIcons(data);
      })
      .catch(() => {
        // 图标拉不到不该把整页炸掉，图标选择器保持空列表即可。
      });
    return () => {
      alive = false;
    };
  }, []);

  return icons;
}
