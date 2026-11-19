# PicProse

封面图生成器。Next.js 15 (App Router) · React 19 · Tailwind 4 · HeroUI v3 · next-intl。

架构与重构路线见 [`doc/refactor-plan.md`](doc/refactor-plan.md)。

## 命令

```bash
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit（快，改完先跑这个）
npm run check:ui   # UI 护栏：颜色 / 圆角 / 阴影 / dark: 变体
npm run lint
npm run build
npm run verify     # typecheck + check:ui + lint + build —— 提交前跑这条
npm run test:e2e   # Playwright 浏览器回归（会自己 build + 起服务）
```

**改完必须跑 `npm run verify`。**

## 硬规矩

### 类型错误不许被吞

`next.config.mjs` 里 `typescript.ignoreBuildErrors` 必须是 `false`。
之前它开着，10 个 TS 错误被静默吞掉，`tsconfig` 写着 `strict: true` 却从来没真跑过 ——
改代码没有任何反馈，这是这个仓库最贵的债。

新增类型（第三方库没有声明的）写 `types/*.d.ts`，别用 `any` 糊过去。

### 状态只有一份

现在有四份遮罩浓度、两种布局、比例存成 Tailwind class 字符串 —— 不要再加第五份。

改状态前先问：**这个值有唯一的存放点吗？** 没有就把它合并掉。

### 颜色和尺寸走 token

界面颜色只走两条路：

- `--pp-*` token（`app/[locale]/styles/tokens.css`）→ 类名 `bg-pp-canvas` / `text-pp-ink` / `border-pp-line`
- 组件库语义类 → `bg-surface-secondary` / `text-foreground` / `border-border`
  （HeroUI v3 的语义色是扁平的：`default` / `surface` / `overlay` / `accent` / `muted`，
  **没有** v2 那种 `default-100` / `primary-500` 的数字档）

**不许**出现裸 hex（`#1F2937`）、Tailwind 调色板色类（`bg-gray-100`）、`dark:` 变体、
HeroUI v2 遗留色类（`bg-default-100` / `bg-primary-100` —— v3 里这些类已经不存在，
写上去不报错也不生效，等于静默失效）。
`npm run check:ui` 会拦这四样，例外只有 `app/[locale]/data/`（内容色板）、
`app/[locale]/svgBackgrounds/`（SVG 模板）、`config/` 和 devicon 品牌资产。

深色模式靠 `<html>` 上的 `.dark` 类翻转整套 token（见 `ThemeProvider.tsx`），
组件里**不写** `dark:` —— 写一个漏一个，页面就「浅色正常、深色瞎」。

圆角 / 阴影 / 图标尺寸用刻度内的值，不要写 `rounded-[13px]`、`shadow-lg` 这种刻度外的。

### Tailwind v4 + HeroUI v3

现在是 **Tailwind 4 + HeroUI v3**，两者的接线方式都变了，写代码前先记住这几条：

- **没有 `tailwind.config.ts` 了**。配置写进 CSS：`app/[locale]/globals.css` 负责
  `@import` 顺序和 `@custom-variant`，`app/[locale]/styles/tokens.css` 顶部的
  `@theme inline` 负责 token → 工具类的映射。
- **`@theme` 必须用 `inline`**。非 inline 会多一层 `:root` 上的 `--color-pp-*`，
  深色模式下不会跟着 `<html>.dark` 翻。
- **HeroUI v3 不需要 Provider**（`HeroUIProvider` 已删），**也不再需要 framer-motion**。
- **组件是复合结构**：`Select.Trigger` / `Select.Value` / `Select.Popover` + `ListBox.Item`、
  `Slider.Track` / `Slider.Fill` / `Slider.Thumb`、`Tabs.List` / `Tabs.Tab` / `Tabs.Panel`。
  v2 的 `SelectItem` / `Tab title=` / `Slider label=` 都没有了。
- **选项用 `id` 不用 `key`**：`ListBox.Item id="..."`。
- **事件用 `onPress` 不用 `onClick`**（React Aria）。`onClick` 在类型上就过不去。
- **`title` 属性会被 React Aria 丢掉**（`filterDOMProps` 不放行），
  图标按钮一律用 `aria-label`。
- **Navbar / NavbarBrand / NavbarContent / NavbarItem 已删** —— 用原生 `header` / `footer` 顶上。
- **Divider → Separator**；**CheckboxIcon 没了**，画个 SVG 对勾。
- **取色器不要塞进 Dropdown 的菜单项**（点色块会顺手把菜单点了），用 `Popover`。
- 按钮语义变体：v2 的 `color="primary" variant="flat"` → v3 的 `variant="secondary"`；
  `variant="bordered"` → `variant="outline"`；`variant="light"` → `variant="ghost"`；
  真正的主操作（导出按钮）用 `variant="primary"`。
- 图标颜色交给按钮自己的前景色 token（`--button-fg`），别再硬写 `text-accent` —— 组件库
  换主题时才不会脱节。

### 数值转换走统一函数

百分比 ↔ hex ↔ 透明度这类换算必须有一个入口。
反面教材（已修）：遮罩浓度滑块写进去的是十进制，读的时候按十六进制读，
拖一次滑块界面显示和实际遮罩就全对不上。

现在这类换算放在 `lib/` 下的小工具文件里（见 `lib/alpha.ts`）。

### 大文件不许再长回来

任何源文件不超过 400 行。超了就拆：右面板在 `app/[locale]/properties/`，
左面板在 `app/[locale]/resources/`，纯函数在 `lib/`。

## 目录

```
app/[locale]/          路由段：页面、面板、画布、Context
  properties/          右面板按功能域拆开的块
  resources/           左面板按功能域拆开的块
  canvas/              画布：背景 / 参考线 / 可拖元素 / 拖拽 hook
  svgBackgrounds/      SVG 背景模板（一模板一文件，index.ts 登记）
  icons/               线性图标
  styles/tokens.css    设计 token（颜色 / 圆角 / 尺寸 / 字号）+ @theme inline 映射
  data/                内容预设（色板等，不是界面配色）
app/api/unsplash/      Unsplash 代理（服务端，密钥不外泄）
lib/                   纯函数工具 + 运行时数据加载
config/                默认配置
locales/               i18n 文案
scripts/check-ui.mjs   UI 护栏
public/devicon/        图标字体与图标表（运行时按需取）
types/                 第三方库的类型声明
doc/                   文档
tests/e2e/             Playwright 用例
```

## i18n

界面文案走 `locales/{zh,en}.json`（用 `useTranslations`）。
新增文案一律进 locales，别再硬编码。

## 已知问题

- **「角落」SVG 模板的参数控件跟「波浪」共用一套**：模板已进登记表（`svgBackgrounds/index.ts`），
  下标对得上了，但右面板的控件还是写死「波浪」的。阶段 1 解决。
- **布局预设是空壳**：`locales` 里有布局预设的文案，但 UI 里没有这个 tab。
- **`config.blur` / `config.backBlurLevel` 没有 UI 入口**，`blur` 永远是 `backdrop-blur-none`。
- **字体已确认免费可商用**（阿里普惠体、钉钉进步体、金山云字体、自有字体）。
- **i18n 只做了一半**：英文界面里仍有中文（图案名、SVG 错误提示、字体名、比例名）。

## 其他

- API 密钥只放服务端：`UNSPLASH_API_KEY` 不要加 `NEXT_PUBLIC_` 前缀。
- **`.env` 和 `.env.local` 都要在 gitignore 里**（`.env` 历史上漏过，
  一旦提交上去密钥就跟着进仓库了）。
- **本地跑不动 Unsplash 时的排查顺序**：
  1. `.env.local` 里有没有 `UNSPLASH_API_KEY`；
  2. 直连 `api.unsplash.com` 通不通（`curl -I https://api.unsplash.com`）；
  3. 通不了就走代理 —— 路由认 `HTTPS_PROXY` / `HTTP_PROXY`，
     看到就自动开 `NODE_USE_ENV_PROXY`（Node 的 `fetch` 不认系统代理设置）。
- **unsplash-js 遇到 4xx/5xx 不抛异常**，只返回 `{type:"error", status, errors}`。
  路由里必须拦这一层，否则密钥失效 / 被限流时接口照样回 200，
  前端一张图都拿不到，表现就是「一直转圈，没有任何提示」。
- e2e 不碰真实 Unsplash：`tests/e2e/editor.spec.ts` 里用 `page.route` 拦接口喂假数据，
  免得 CI 上因为没密钥 / 限流 / 网络不通而随机失败。
- 提交信息写清楚「改了什么」，不要用 `update` / `fix bug`。
- 删文件用 `mavis-trash`，别用 `rm`。
