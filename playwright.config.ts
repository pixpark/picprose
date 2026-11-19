import { defineConfig, devices } from "@playwright/test";

/**
 * PicProse 浏览器巡检。
 *
 * 端口跟 fb-platform 的两套前端分开（website 4321 / ops 4322 / picprose 3111），
 * 三个套件可以同时跑。
 *
 * 浏览器版本跟 fb-platform/ops 共用：@playwright/test 钉在 1.65.0，
 * 对应本地已装的 chromium-1254。装了新版本 playwright 就要
 * `npx playwright install chromium` 重新下浏览器，否则跑起来会报
 * 「Executable doesn't exist」。
 *
 * 注意：reuseExistingServer 为真时会跳过 build 直接复用旧端口上的服务，
 * 改完代码记得先释放 3111 端口，否则测的是上一次的产物。
 */
const PORT = Number(process.env.PORT ?? 3111);
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  workers: 1,
  reporter: "list",
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    locale: "en-US",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } },
    },
  ],
  webServer: {
    command: `npm run build && npx next start --port ${PORT}`,
    url: `${BASE_URL}/en`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      // 构建期用不到真 key（api 路由在运行期才用），给个占位防止炸。
      UNSPLASH_API_KEY: process.env.UNSPLASH_API_KEY ?? "playwright-dummy-key",
      NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: "",
    },
  },
});
