"use client";
import React, { type RefObject } from "react";
import { Spinner } from "@heroui/react";
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
  /** 还有没有更多可以拉。 */
  hasMore: boolean;
  /** 当前是不是图库 tab。 */
  isActive: boolean;
  /** 视口高度，用来算滚动区域的高度。 */
  windowHeight: number;
  /** 滚动容器 —— 复位滚动位置要用。 */
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  /** 往下翻一页。 */
  onLoadMore: () => void;
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
  hasMore,
  isActive,
  windowHeight,
  scrollContainerRef,
  onLoadMore,
  onSelectPhoto,
  t,
}: PhotoGalleryProps) => (
  <div className="flex-grow relative">
    <div
      id="scrollableDiv"
      ref={scrollContainerRef}
      style={{ height: windowHeight - 220, overflow: "auto" }}
      className="scrollbar-thin scrollbar-color-auto"
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
          <PhotoAlbum
            photos={photos}
            layout="rows"
            targetRowHeight={TARGET_ROW_HEIGHT}
            rowConstraints={ROW_CONSTRAINTS}
            spacing={PHOTO_SPACING}
            onClick={({ index }) => onSelectPhoto(index)}
          />
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
