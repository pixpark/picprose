import { NextResponse } from "next/server";
import { createApi } from "unsplash-js";
import { NextRequest } from "next/server";

/**
 * 走代理的开关。
 *
 * api.unsplash.com 在国内直连不通（连接超时），只能走 Clash / Surge 这类系统代理。
 * Node 的 fetch 默认无视 macOS 的「系统代理」设置 —— 它只看 HTTPS_PROXY / HTTP_PROXY
 * 这两个环境变量，而且还要 NODE_USE_ENV_PROXY=1 才生效。
 *
 * 这段必须写在模块顶层、第一次 fetch 之前 —— 全局 dispatcher 是懒创建的，
 * 第一次发请求时才会看这个开关。
 *
 * 没配代理变量时等于什么都不做：生产环境（Vercel）直连 Unsplash，行为不变。
 */
if (!process.env.NODE_USE_ENV_PROXY) {
  const proxy =
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy;
  if (proxy) {
    process.env.NODE_USE_ENV_PROXY = "1";
  }
}

/** unsplash-js 的响应信封：成功是 success，失败是 error（注意：不抛异常）。 */
interface UnsplashEnvelope {
  type: "success" | "error";
  status?: number;
  errors?: string[];
}

/**
 * 把上游的报错翻译成用户看得懂的一句话。
 *
 * 前端会把这句直接显示在图库面板上 —— 「fetch failed」「401」谁也看不懂。
 */
function describeUpstreamError(status: number, reason: string): string {
  if (status === 401 || status === 403) {
    return "Unsplash 拒绝了请求：UNSPLASH_API_KEY 无效或已过期";
  }
  if (status === 429) {
    return "Unsplash 限流了：请求太频繁，稍后重试";
  }
  if (/fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|timeout/i.test(reason)) {
    return "连不上 Unsplash：网络不通，或需要配置代理（HTTPS_PROXY）";
  }
  return `Failed to fetch photos (${status}): ${reason}`;
}

export async function GET(request: NextRequest) {
  // 密钥在模块顶层就被交给了 unsplash-js —— 缺 key 时整个路由直接炸，
  // 而且前端只能拿到一个没有原因的 500。改成进处理器再取：
  // 缺 key 时给一条说人话的报错，其余异常把原因带上。
  const accessKey = process.env.UNSPLASH_API_KEY;
  if (!accessKey) {
    // 503 = 服务本身没配好（不是图片本身的问题），前端据此给出「去配密钥」的提示。
    return NextResponse.json(
      {
        error: "UNSPLASH_API_KEY is not configured",
        code: "missing_api_key",
      },
      { status: 503 }
    );
  }

  const unsplashApi = createApi({ accessKey });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const page = searchParams.get("page") || "1";
  const perPage = searchParams.get("perPage") || "30";

  try {
    let result: UnsplashEnvelope;
    if (query) {
      result = (await unsplashApi.search.getPhotos({
        query,
        page: parseInt(page),
        perPage: parseInt(perPage)
      })) as unknown as UnsplashEnvelope;
    } else {
      result = (await unsplashApi.photos.getRandom({
        count: parseInt(perPage)
      })) as unknown as UnsplashEnvelope;
    }

    /**
     * 关键：unsplash-js 遇到 4xx / 5xx **不抛异常**，
     * 而是返回 `{ type: "error", status, errors }`。
     *
     * 不拦这一层的话，密钥失效 / 被限流时接口照样回 200，
     * 前端解析不出照片 —— 表现就是「一直转圈，什么提示都没有」。
     */
    if (result?.type === "error") {
      const status = result.status ?? 502;
      const reason = Array.isArray(result.errors)
        ? result.errors.join("; ")
        : String(result.errors ?? "unknown error");
      return NextResponse.json(
        {
          error: describeUpstreamError(status, reason),
          reason,
          status,
          code: "upstream_error",
        },
        { status }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    // 网络层挂掉（DNS / 超时 / 代理不通）—— 502 比 500 更准：
    // 我们这层是好的，是到 Unsplash 那头的路断了。
    return NextResponse.json(
      {
        error: describeUpstreamError(502, reason),
        reason,
        code: "network_error",
      },
      { status: 502 }
    );
  }
}
