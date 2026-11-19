import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * PicProse 主链回归。
 *
 * 一条链覆盖到底：选比例 → 调浓度 → 拖标题 → 导出 PNG。
 * 另外盯住几个曾经出过问题的点（浓度换算、拖拽位移、深色模式）。
 */

/** 画布容器：ImageEditor 根节点的第一个子节点，尺寸随比例变。 */
function canvas(page: Page): Locator {
  return page.locator(".rounded-3xl > div").first();
}

/** 遮罩层：盖在画布上、带 alpha 的那一层。 */
function maskOverlay(page: Page): Locator {
  return page.locator("div.absolute.top-0.right-0.left-0.rounded-md").first();
}

/** 标题元素的外层容器 —— 位移写在它的 transform 里。 */
function titleWrapper(page: Page): Locator {
  return page.locator("h1").first().locator("xpath=..");
}

/** 从 transform 里读出平移量。 */
async function translationOf(locator: Locator): Promise<{ x: number; y: number }> {
  return locator.evaluate((el) => {
    const style = el.getAttribute("style") ?? "";
    const matches = style.match(
      /translate\(\s*(-?[\d.]+)px\s*,\s*(-?[\d.]+)px\s*\)/
    );
    return {
      x: matches ? Number(matches[1]) : 0,
      y: matches ? Number(matches[2]) : 0,
    };
  });
}

/** 进入拖拽模式（工具条上的第一个按钮）。 */
async function enterDragMode(page: Page) {
  // HeroUI v3 走 React Aria，title 会被属性过滤丢掉，只认 aria-label。
  await page.locator("button[aria-label='Enter edit mode']").click();
}

/**
 * 一张假照片。
 *
 * 图片本身用内联 SVG data URI —— 不发任何外部请求，
 * 免得 CI 上因为图片域名不通而冒出「Failed to load resource」把用例带沟里。
 */
const FAKE_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600"><rect width="400" height="600" fill="#2f6ee7"/></svg>'
  );

function fakePhoto(id: string) {
  return {
    id,
    urls: { small: FAKE_IMAGE, regular: FAKE_IMAGE },
    alt_description: `fake ${id}`,
    width: 400,
    height: 600,
    user: {
      name: "PicProse",
      profile_image: { small: FAKE_IMAGE },
      links: { html: "https://unsplash.com/@fake" },
    },
    links: { download: `https://unsplash.com/photos/${id}/download` },
  };
}

/**
 * 把图库接口拦下来喂假数据。
 *
 * e2e 不该碰真实 Unsplash：网络不通会超时、密钥失效会 401、限流会 429 ——
 * 三种情况都会让用例变成随机失败，而且 CI 上根本没有可用密钥。
 */
async function mockUnsplash(page: Page) {
  await page.route("**/api/unsplash**", async (route) => {
    const url = route.request().url();
    const photos = [fakePhoto("a1"), fakePhoto("a2"), fakePhoto("a3")];
    const body = url.includes("query=")
      ? { type: "success", status: 200, response: { total: 3, total_pages: 1, results: photos } }
      : { type: "success", status: 200, response: photos };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
}

/** 让图库接口失败 —— 用来验证「出错时给提示，而不是一直转圈」。 */
async function mockUnsplashFailure(page: Page, body: unknown, status = 503) {
  await page.route("**/api/unsplash**", async (route) => {
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
}

test.describe("PicProse 主链", () => {
  test.beforeEach(async ({ page }) => {
    await mockUnsplash(page);
    await page.goto("/en");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("页面加载零 console 报错", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.reload();
    await expect(page.locator("h1").first()).toBeVisible();
    await page.waitForTimeout(800);

    expect(errors, `控制台报错：\n${errors.join("\n")}`).toEqual([]);
  });

  test("英文界面不出现中文", async ({ page }) => {
    const body = await page.locator("body").innerText();
    const chinese = body.match(/[一-龥]+/g) ?? [];
    expect(chinese, `英文界面里出现中文：${chinese.join(" / ")}`).toEqual([]);
  });

  test("切比例会改画布尺寸", async ({ page }) => {
    const before = await canvas(page).boundingBox();
    expect(before).not.toBeNull();

    // 打开尺寸面板
    await page.locator("text=/^\\d+\\s*:\\s*\\d+$/").first().click();
    await expect(page.getByText("Landscape", { exact: true })).toBeVisible();

    // 选 1 : 1
    await page.getByText("1 : 1", { exact: true }).click();
    await page.waitForTimeout(400);

    const after = await canvas(page).boundingBox();
    expect(after).not.toBeNull();
    expect(Math.abs(after!.width - after!.height)).toBeLessThanOrEqual(2);
  });

  test("遮罩浓度滑块：显示值与实际 alpha 一致", async ({ page }) => {
    const slider = page.locator("input[type=range]").first();
    await expect(slider).toBeVisible();

    // Home 归零，再按 13 次右键 = 65（step=5）
    await slider.focus();
    await page.keyboard.press("Home");
    for (let i = 0; i < 13; i++) {
      await page.keyboard.press("ArrowRight");
    }
    await page.waitForTimeout(300);

    const mask = await maskOverlay(page).getAttribute("style");
    const alpha = mask?.match(/rgba\([^)]*?,\s*([\d.]+)\s*\)/)?.[1];
    expect(Number(alpha), `遮罩层实际 alpha：${mask}`).toBeCloseTo(0.65, 2);
  });

  test("拖标题 60px 就走 60px（不放大）", async ({ page }) => {
    await enterDragMode(page);

    const wrapper = titleWrapper(page);
    const before = await translationOf(wrapper);
    const box = await wrapper.boundingBox();
    expect(box).not.toBeNull();

    // 分 12 小步共移动 60px —— 旧实现每步都取整，位移会被放大成 2 倍
    const startX = box!.x + box!.width / 2;
    const startY = box!.y + box!.height / 2;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    for (let i = 1; i <= 12; i++) {
      await page.mouse.move(startX + (60 / 12) * i, startY);
    }
    await page.mouse.up();
    await page.waitForTimeout(300);

    const after = await translationOf(wrapper);
    expect(after.x - before.x).toBeCloseTo(60, 0);
    expect(after.y - before.y).toBeCloseTo(0, 0);
  });

  test("导出 PNG 真的下载", async ({ page }) => {
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "PNG" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.png$/);
  });

  test("主题切换会翻转 <html>.dark", async ({ page }) => {
    const isDark = () =>
      page.evaluate(() => document.documentElement.classList.contains("dark"));

    expect(await isDark()).toBe(false);
    await page.locator("button[aria-label^='Theme']").click();
    await page.waitForTimeout(200);
    expect(await isDark()).toBe(true);

    await page.locator("button[aria-label^='Theme']").click();
    await page.waitForTimeout(200);
    expect(await isDark()).toBe(false);
  });

  test("图库拿不到图时给提示，不是一直转圈", async ({ page }) => {
    // 换成「接口报错」的假响应：以前这里会一直转圈，什么都不说。
    await mockUnsplashFailure(page, {
      error: "UNSPLASH_API_KEY is not configured",
      code: "missing_api_key",
    });
    await page.reload();
    await expect(page.locator("h1").first()).toBeVisible();

    await expect(page.getByText("Couldn't load images")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("UNSPLASH_API_KEY is not configured")).toBeVisible();
  });

  test("图库能渲染出照片", async ({ page }) => {
    await page.reload();
    await expect(page.locator("h1").first()).toBeVisible();
    const thumbs = page.locator("#scrollableDiv img");
    await expect(thumbs.first()).toBeVisible({ timeout: 15_000 });
    expect(await thumbs.count()).toBeGreaterThan(0);
  });
});
