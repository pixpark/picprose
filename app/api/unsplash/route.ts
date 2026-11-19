import { NextResponse } from "next/server";
import { createApi } from "unsplash-js";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // 密钥在模块顶层就被交给了 unsplash-js —— 缺 key 时整个路由直接炸，
  // 而且前端只能拿到一个没有原因的 500。改成进处理器再取：
  // 缺 key 时给一条说人话的报错，其余异常把原因带上。
  const accessKey = process.env.UNSPLASH_API_KEY;
  if (!accessKey) {
    return NextResponse.json(
      { error: "UNSPLASH_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const unsplashApi = createApi({ accessKey });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const page = searchParams.get("page") || "1";
  const perPage = searchParams.get("perPage") || "30";

  try {
    let result;
    if (query) {
      result = await unsplashApi.search.getPhotos({
        query,
        page: parseInt(page),
        perPage: parseInt(perPage)
      });
    } else {
      result = await unsplashApi.photos.getRandom({
        count: parseInt(perPage)
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch photos", reason },
      { status: 500 }
    );
  }
}
