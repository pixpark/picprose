"use client";
import React, { type RefObject } from "react";
import { Button, Spinner } from "@heroui/react";
import PhotoAlbum from "react-photo-album";
import InfiniteScroll from "react-infinite-scroll-component";
import type { FeedPhoto } from "../usePhotoFeed";

const PHOTO_SPACING = 8;
const TARGET_ROW_HEIGHT = 110;
const ROW_CONSTRAINTS = { maxPhotos: 2 };

export interface PhotoGalleryProps {
  /** 已经拿到的照片。 */
  photos: FeedPhoto[];
  /** 正在拉下一批。 */
  loading: boolean;
  /** 最近一次失败的原因 —— null 表示没失败。 */
  error: string | null;
  /** 还有没有更多可以拉。 */
  hasMore: boolean;
  /** 当前是不是图库 tab。 */
  isActive: boolean;
  /** 滚动容器 —— 复位滚动位置要用。 */
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  /** 往下翻一页。 */
  onLoadMore: () => void;
  /** 失败之后手动重来。 */
  onRetry: () => void;
  /** 选中第 n 张。 */
  onSelectPhoto: (index: number) => void;
  /** 文案。 */
  t: (key: string) => string;
}

/**
 * 左栏的图库：网格 + 无限滚动。
 *
 * 数据来自 usePhotoFeed —— 这里只管画。
 */
export const PhotoGallery = ({
  photos,
  loading,
  error,
  hasMore,
  isActive,
  scrollContainerRef,
  onLoadMore,
  onRetry,
  onSelectPhoto,
  t,
}: PhotoGalleryProps) => (
  <div className="h-full relative flex flex-col min-h-0">
    <div
      id="scrollableDiv"
      ref={scrollContainerRef}
      /*
       * 高度跟着面板走（h-full + flex-1），别再用 windowHeight - 220 这种死算 ——
       * 那个 220 是按某一版布局估的，改一行高度就多一截空白，
       * 现在图库底部和搜索栏之间会空出来一块。
       */
      style={{ overflow: "auto" }}
      className="scrollbar-thin scrollbar-color-auto flex-1 min-h-0"
    >
      <InfiniteScroll
        dataLength={photos.length}
        next={onLoadMore}
        hasMore={hasMore && !loading && isActive}
        loader={
          <div className="grid justify-items-center">
            <Spinner className="my-4" />
          </div>
        }
        endMessage={
          photos.length > 0 ? (
            <div className="grid justify-items-center">
              <div className="my-4">{t("search_end")}</div>
            </div>
          ) : null
        }
        scrollableTarget="scrollableDiv"
        className="px-3"
        scrollThreshold={0.75}
        initialScrollY={0}
      >
        {photos.length > 0 ? (
          <>
            {/* 已经有图了、但又出错了 —— 顶部挂一条提示，别把已经拿到的图也藏掉。 */}
            {error && (
              <div className="mb-2 flex items-start gap-2 rounded-lg bg-pp-danger-bg px-3 py-2 text-xs text-pp-danger">
                <span className="flex-1 break-words">{error}</span>
                <Button size="sm" variant="ghost" onPress={onRetry}>
                  {t("feed_error_retry")}
                </Button>
              </div>
            )}
            <PhotoAlbum
              photos={photos}
              layout="rows"
              targetRowHeight={TARGET_ROW_HEIGHT}
              rowConstraints={ROW_CONSTRAINTS}
              spacing={PHOTO_SPACING}
              onClick={({ index }) => onSelectPhoto(index)}
            />
          </>
        ) : error ? (
          /* 一张都没拿到 —— 给一句说人话的话，别让用户对着转圈干等。 */
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
            <div className="text-sm font-medium text-pp-ink">{t("feed_error_title")}</div>
            <div className="text-xs break-words text-pp-muted">{error}</div>
            <div className="max-w-64 text-xs text-pp-faint">{t("feed_error_hint")}</div>
            <Button size="sm" variant="secondary" onPress={onRetry}>
              {t("feed_error_retry")}
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-40">
            <Spinner />
          </div>
        )}
      </InfiniteScroll>
    </div>
    <div className="absolute bottom-0 left-0 m-4 w-40 h-6 bg-pp-ink/65 rounded-xl">
      <div className="flex items-center ml-2">
        <span className="leading-6 text-xs text-white text-center">
          {t("powered_by")}
        </span>
        <a
          href="https://unsplash.com/?utm_source=PicProse&utm_medium=referral"
          target="_blank"
        >
          <img className="w-20 h-4" src="./Unsplash_Logo_Full.svg" />
        </a>
      </div>
    </div>
  </div>
);
