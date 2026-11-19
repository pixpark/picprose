"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import { useTranslations } from "next-intl";

/** 每页拉多少张。 */
const PHOTOS_PER_PAGE = 30;

/** 一次请求最多重试几次。 */
const MAX_RETRY_COUNT = 3;

/** 一个会话里最多留多少张照片。 */
export const MAX_PHOTOS = 300;

/** 去重之后一张都不剩 —— 换个条件重试前的等待时间。 */
const EMPTY_PAGE_RETRY_DELAY = 800;

/** 请求失败重试的等待时间。 */
const REQUEST_RETRY_DELAY = 1000;

/** 发起搜索前先歇一下。 */
const SEARCH_START_DELAY = 100;

/** 图库里的一张照片。 */
export interface FeedPhoto {
  src: string;
  url: string;
  key: string;
  alt: string;
  width: number;
  height: number;
  name: string;
  avatar: string;
  profile: string;
  downloadLink: string;
}

/** Unsplash 返回的一条原始数据。 */
interface UnsplashPhoto {
  id: string;
  urls: { small: string; regular: string };
  alt_description: string | null;
  width: number;
  height: number;
  user: { name: string; profile_image: { small: string }; links: { html: string } };
  links?: { download?: string };
}

/** 拉图的两条路径：搜索 / 随机。 */
export type FeedSource = "search" | "random";

export interface UsePhotoFeedOptions {
  /** 当前是不是图库 tab —— 只有图库 tab 才允许发请求。 */
  isActive: boolean;
  /** 选中某张照片时回调（索引 + 当时的照片列表）。 */
  onSelectPhoto?: (index: number, photos: FeedPhoto[]) => void;
}

export interface UsePhotoFeedResult {
  photos: FeedPhoto[]; // 已经拿到的照片
  loading: boolean; // 正在拉
  error: string | null; // 最近一次失败的原因
  hasMore: boolean; // 还有没有更多可以拉
  query: string; // 搜索词
  setQuery: (query: string) => void;
  search: () => void; // 用当前搜索词重新搜一遍
  loadMore: () => void; // 往下翻一页
  reset: () => void; // 清空结果并复位分页 / 去重 / 重试状态
  resumeGallery: () => void; // 切回图库 tab 时的处理
  retry: () => void; // 失败之后手动重来一次
  selectPhoto: (index: number) => void; // 选中第 n 张
  scrollContainerRef: RefObject<HTMLDivElement | null>; // 滚动容器
}

/**
 * 从接口返回里取出照片列表。
 *
 * 搜索返回 `{ type: "success", response: { results: [...] } }`，
 * 随机返回 `{ response: [...] }`（有时是单个对象）。返回 null 表示这一批没结果。
 */
function extractItems(source: FeedSource, result: any): UnsplashPhoto[] | null {
  if (source === "search") {
    return result.type === "success" ? result.response.results : null;
  }
  if (result && result.response) {
    return Array.isArray(result.response) ? result.response : [result.response];
  }
  return null;
}

/**
 * 左栏图库的数据源。搜索和随机两条路径走的是同一套流水线：
 * 校验 → 请求 → 解析 → 去重 → 翻页，失败或者返回格式不对时的重试也只写一份。
 *
 * 重试仍然靠 `setTimeout` 递归（原来就是这么做的），没有引入 AbortController ——
 * 切搜索词时旧请求仍然可能在飞，行为跟拆分前一致。
 */
export function usePhotoFeed({
  isActive,
  onSelectPhoto,
}: UsePhotoFeedOptions): UsePhotoFeedResult {
  const t = useTranslations("LeftResourcePanel");
  const [photos, setPhotos] = useState<FeedPhoto[]>([]);
  const [query, setQuery] = useState("");
  const [shouldFetchRandomPhotos, setShouldFetchRandomPhotos] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePhotos, setHasMorePhotos] = useState(true);
  const [hasSetInitialPhoto, setHasSetInitialPhoto] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 下面这几个 ref 是「请求逻辑」的权威值。
   *
   * 之前它们只是 state，而 fetchPhotos 是在 promise 回调里跑的 —— 闭包捕获的是
   * 发起请求那一刻的快照，于是：
   *   · retryCount 永远是 0 → 失败会一直重试，停不下来；
   *   · loadedPhotoIds 永远是空集 → 去重失效，同一张图反复出现；
   *   · photos.length / hasMorePhotos 也是快照 → 上限判断、翻页判断都不准。
   * 改成 ref 之后，回调里读到的永远是最新值；state 只负责渲染。
   */
  const retryCountRef = useRef(0);
  const loadedPhotoIdsRef = useRef<Set<string>>(new Set());
  const photoCountRef = useRef(0);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);
  const activeRef = useRef(isActive);
  const queryRef = useRef(query);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    activeRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  /** 改 loading —— state 和 ref 一起动。 */
  const setLoading = (value: boolean) => {
    loadingRef.current = value;
    setIsLoading(value);
  };

  /** 改「还有没有更多」—— state 和 ref 一起动。 */
  const setHasMore = (value: boolean) => {
    hasMoreRef.current = value;
    setHasMorePhotos(value);
  };

  /** 通知外面选中了一张照片。 */
  const notifySelect = (index: number, photoList: FeedPhoto[]) => {
    onSelectPhoto?.(index, photoList);
  };

  /** Unsplash 的一条结果 → 图库里的照片。 */
  const toPhoto = (item: UnsplashPhoto): FeedPhoto => ({
    src: item.urls.small,
    url: item.urls.regular,
    key: item.id,
    alt: item.alt_description ?? "",
    width: item.width,
    height: item.height,
    name: item.user.name,
    avatar: item.user.profile_image.small,
    profile: `${item.user.links.html}?utm_source=PicProse&utm_medium=referral`,
    downloadLink: item.links?.download || "",
  });

  /** 请求失败、或者返回格式不对时的重试。搜索重试同一页，随机再要一批。 */
  const scheduleRetry = (source: FeedSource, searchText: string, page: number) => {
    if (retryCountRef.current < MAX_RETRY_COUNT) {
      retryCountRef.current += 1;
      setTimeout(() => {
        setLoading(false);
        if (activeRef.current && hasMoreRef.current) {
          fetchPhotos(source, searchText, page);
        }
      }, REQUEST_RETRY_DELAY);
    } else {
      // 重试到头了 —— 别再无限重来，让错误留在界面上。
      setHasMore(false);
      setLoading(false);
    }
  };

  /**
   * 拉一批照片。两条路径只在三处不同：请求地址、结果怎么取、拿到之后怎么落状态；
   * 其余（校验、去重、翻页、重试）完全共用。
   */
  const fetchPhotos = (source: FeedSource, searchText: string, page: number) => {
    // 已经在拉了，或者没有更多了 —— 直接返回。
    if (loadingRef.current || !hasMoreRef.current) {
      return;
    }

    // Check photo count limit
    if (photoCountRef.current >= MAX_PHOTOS) {
      console.log(t("max_photos_reached", { count: MAX_PHOTOS }));
      setHasMore(false);
      return;
    }

    setLoading(true);

    // Add random parameter for random requests to get different image sets
    const url = source === "search"
      ? `/api/unsplash?query=${encodeURIComponent(searchText)}&page=${page}&perPage=${PHOTOS_PER_PAGE}`
      : `/api/unsplash?random=true&seed=${Math.floor(Math.random() * 10000)}`;

    fetch(url)
      .then(async response => {
        if (!response.ok) {
          // 服务端把原因写在 JSON 里（缺密钥就是 UNSPLASH_API_KEY is not configured），
          // 直接把它带上来 —— 光一个 500 用户是看不懂的。
          let detail = `HTTP ${response.status}`;
          try {
            const body = await response.json();
            if (body && typeof body.error === "string" && body.error) {
              detail = body.error;
            }
          } catch {
            // 不是 JSON —— 用状态码兜底。
          }
          throw new Error(detail);
        }
        return response.json();
      })
      .then(result => {
        const items = extractItems(source, result);

        if (items === null) {
          // API return is not success type / response format is incorrect
          scheduleRetry(source, searchText, page);
          return;
        }

        // Filter out already loaded image IDs
        const newPhotos = items
          .filter(item => !loadedPhotoIdsRef.current.has(item.id))
          .map(toPhoto);

        // If no new photos after filtering and retry chances remain, try next page
        if (newPhotos.length === 0) {
          if (retryCountRef.current < MAX_RETRY_COUNT) {
            retryCountRef.current += 1;
            setLoading(false);

            // If retry is needed, try next page
            if (retryCountRef.current < MAX_RETRY_COUNT) {
              setTimeout(() => {
                if (activeRef.current && hasMoreRef.current) {
                  fetchPhotos(source, searchText, source === "search" ? page + 1 : page);
                }
              }, EMPTY_PAGE_RETRY_DELAY);
            } else {
              setHasMore(false);
            }
          } else {
            // 重试用完了 —— 这里必须 return，否则下面那段会把 hasMore 又置回 true。
            setHasMore(false);
          }
          return;
        }

        // Update loaded image ID set
        const newIds = new Set(loadedPhotoIdsRef.current);
        newPhotos.forEach(photo => {
          newIds.add(photo.key);
        });
        loadedPhotoIdsRef.current = newIds;

        const isFullPage = newPhotos.length >= PHOTOS_PER_PAGE;

        // If no new photos after filtering or total less than requested, set no more photos
        if (source === "search" && !isFullPage) {
          setHasMore(false);
        } else {
          // Only reset retry count when photos are successfully obtained
          retryCountRef.current = 0;
          // Ensure hasMorePhotos is true
          setHasMore(true);
        }

        // Check if total photo count reaches limit
        const updatedPhotoCount =
          source === "search" && page === 1
            ? newPhotos.length
            : photoCountRef.current + newPhotos.length;
        if (updatedPhotoCount >= MAX_PHOTOS) {
          setHasMore(false);
        }

        if (source === "search" && page === 1) {
          photoCountRef.current = newPhotos.length;
          setPhotos(newPhotos);
          setTimeout(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop = 0;
            }
          }, 0);
        } else {
          photoCountRef.current += newPhotos.length;
          setPhotos(prevPhotos => {
            const updatedPhotos = [...prevPhotos, ...newPhotos];

            // Only set initial photo when getting photos for the first time and photos exist
            if (source === "random" && !hasSetInitialPhoto && updatedPhotos.length > 0) {
              setHasSetInitialPhoto(true);
              setTimeout(() => {
                const randomIndex = Math.floor(Math.random() * Math.min(20, updatedPhotos.length));
                notifySelect(randomIndex, updatedPhotos);
              }, 0);
            }

            return updatedPhotos;
          });

          if (source === "search") {
            setTimeout(() => {
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = scrollPositionRef.current;
              }
            }, 0);
          }
        }

        // 拿到了 —— 之前的错误作废。
        setError(null);

        // 两条路径都要把 loading 放下来。
        // 原来只在 random 分支放，搜索成功之后 isLoading 一直挂着 true ——
        // 无限滚动的 hasMore 是 `hasMore && !loading`，于是搜完只能看第一页。
        setLoading(false);
      })
      .catch(fetchError => {
        console.error(
          source === "search" ? t("search_failed") : t("random_failed"),
          fetchError,
        );
        setError(fetchError instanceof Error ? fetchError.message : String(fetchError));
        // Decide whether to continue trying based on retry count when error occurs
        scheduleRetry(source, searchText, page);
      });
  };

  /** 清空结果并复位分页 / 去重 / 重试状态（当前是搜索还是随机流不变）。 */
  const reset = () => {
    setHasMore(true);
    loadedPhotoIdsRef.current = new Set();
    retryCountRef.current = 0;
    setLoading(false); // 重置加载状态
    setCurrentPage(1);
    photoCountRef.current = 0;
    setPhotos([]);
    setError(null);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  /** 用当前搜索词重新搜一遍。 */
  const search = () => {
    if (query === "") {
      return;
    }

    reset();
    setShouldFetchRandomPhotos(false);

    // 设置短延迟后开始获取
    setTimeout(() => {
      fetchPhotos("search", query, 1);
    }, SEARCH_START_DELAY);
  };

  /** 失败之后手动重来一次 —— 重试计数和错误一起清掉。 */
  const retry = () => {
    retryCountRef.current = 0;
    setError(null);
    setHasMore(true);
    setLoading(false);
    if (shouldFetchRandomPhotos) {
      fetchPhotos("random", queryRef.current, 1);
    } else {
      setCurrentPage(1);
      fetchPhotos("search", queryRef.current, 1);
    }
  };

  /** 往下翻一页。 */
  const loadMore = () => {
    if (loadingRef.current || !hasMoreRef.current || !activeRef.current) {
      return;
    }

    // New: Stop loading if photo count reaches limit
    if (photoCountRef.current >= MAX_PHOTOS) {
      console.log(t("max_photos_reached", { count: MAX_PHOTOS }));
      setHasMore(false);
      return;
    }

    if (scrollContainerRef.current) {
      scrollPositionRef.current = scrollContainerRef.current.scrollTop;
    }

    if (shouldFetchRandomPhotos) {
      fetchPhotos("random", queryRef.current, 1);
    } else {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchPhotos("search", queryRef.current, nextPage);
    }
  };

  /** 切回图库 tab：一张照片都没有就重新拉随机图，有就把滚动位置复位。 */
  const resumeGallery = () => {
    // If no photos, fetch random photos
    if (photoCountRef.current === 0 && !loadingRef.current) {
      setHasMore(true);
      fetchPhotos("random", queryRef.current, 1);
    } else {
      // Reset scroll position
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
      }, 0);

      // Ensure hasMorePhotos state is correct
      if (photoCountRef.current < MAX_PHOTOS) {
        setHasMore(true);
      }
    }
  };

  // Only fetch random photos when component mounts and activeTab is "images"
  //
  // 依赖只有 isActive —— 之前还挂着 photos.length / isLoading，
  // 于是「拉失败 → isLoading 变 false」会再次触发这个 effect，
  // 变成一个自己喂自己的死循环（而且和重试定时器叠在一起，请求量翻倍）。
  useEffect(() => {
    if (isActive && photoCountRef.current === 0 && !loadingRef.current) {
      fetchPhotos("random", queryRef.current, 1);
      setHasMore(true); // Ensure more can be loaded
    }
  }, [isActive]);

  return {
    photos,
    loading: isLoading,
    error,
    hasMore: hasMorePhotos,
    query,
    setQuery,
    search,
    loadMore,
    reset,
    resumeGallery,
    retry,
    selectPhoto: (index: number) => notifySelect(index, photos),
    scrollContainerRef,
  };
}
