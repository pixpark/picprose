# PicProse 重构方案

> 分析日期：2026-11-19 · 分析对象：`main` 分支 @ `58fdde0`
> 结论先行：**不要重写，做分阶段重构。** 理由见 §2。
>
> **进度（2026-11-19）**：阶段 0 / 2 / 3 / 4 已完成，阶段 1（状态模型换血）留到下一轮。
> 每一阶段的验收结果都写在对应小节里。

---

## 1. 现状盘点

| 维度 | 现状 |
|---|---|
| 规模 | 115 个文件，5532 行（去掉 `package-lock`）；TS/TSX 源码约 4100 行 |
| 栈 | Next.js 15.5.23 (App Router) · React 19.2.8 · Tailwind 3.4 · @nextui-org/react 2.6.11 |
| 历史 | 47 个提交，2024-03-15 → 2026-08-11 |
| 测试 | **无** |
| CI | **无**（没有 `.github/`） |
| 类型 | `tsconfig` 写着 `strict: true`，但 `next.config.mjs` 里 `ignoreBuildErrors: true` → **实际 10 个 TS 错误被静默吞掉** |
| 体积 | 单文件最大 1453 行；`devicon.jsx` 11869 行、`devicon.min.css` 103KB |
| 死代码 | 约 400+ 行（含一个 219 行的影子文件） |

核心代码（`app/[locale]/`）：

```
RightPropertyPanel.tsx   1453   右栏：属性 / SVG 参数 / 比例 / 导出
LeftResourcePanel.tsx    1205   左栏：图库 / 颜色 / 纹理
ImageEditor.tsx           563   画布渲染 + 拖拽 + 网格
PicproseContext.tsx       405   全局状态（Context）
ImageEditorToolbar.tsx    185   工具条（撤销/重做/重置）
page.tsx                  127   顶层编排 + 历史记录
```

---

## 2. 为什么是「重构」而不是「重写」

**产品逻辑是活的，而且能用。** 实测（`next start` + Playwright 驱动真实页面）：

- 切比例正常：16:9 → 855×481，1:1 → 855×855，9:16 → 481×855 ✓
- 导出正常：点 PNG 真的下载了 `2026-11-19-12-55-51.png`，无报错 ✓
- 页面渲染无 console error ✓

也就是说「计算比例 → 渲染 → 导出」这条主链是通的，剩下的都是**结构问题**，不是能力问题。重写等于把这些已经调好的细节（比例的 vh 数学、SVG 模板的参数协议、dom-to-image 的导出配置）全部重新调一遍，收益远小于风险。

真正的问题不是「代码写得烂」，而是**没有地基**：没有类型、没有护栏、没有约定、没有测试。补地基的收益远大于重写。

> 唯一的例外：如果目标是让 PicProse 跟 fb-platform 的品牌体系（同一套 token / 深色模式 / 组件层）完全统一，那「UI 层重写」是有道理的 —— 但即便如此也应该是**保留纯函数层、重写 UI 层**，而不是从零开始。见 §7。

---

## 3. 问题清单

标 ✅ 的是**浏览器实测确认**的；标 📖 的是读代码可证的。

### P0 — 让人没法改代码

#### P0-1 ✅ 类型检查被整个关掉了

`next.config.mjs`：

```js
const nextConfig = {
  typescript: { ignoreBuildErrors: true },   // ← 10 个 TS 错误被吞掉
  reactStrictMode: false,                    // ← 双渲染 bug 也看不见
};
```

`tsconfig.json` 写着 `"strict": true`，但它从来没真正跑过。这是「一坨」的根因：**改代码没有任何反馈**。

实测 `npx tsc --noEmit` → 10 个 `error TS`。

#### P0-2 类型系统被大面积绕开

| 位置 | 问题 |
|---|---|
| `ComponentToImg.js` | 整个导出链路是纯 JS（`allowJs: true`），零类型 |
| `SvgTemplateParams` | `{ [key: string]: any }` —— SVG 参数系统零类型 |
| `RightPropertyPanel` | `handleSvgParamChange(param: string, value: any)` |
| `ImageEditorToolbar` | `history: any[]`、`setElements: (elements: any) => void` |
| `LeftResourcePanel` | `photos: any[]`、`photoList: any[]`、`item: any` 到处都是 |
| `config/index.ts` | `blur: 0`（number）但 `PropertyInfo.blur` 声明成 `string` |

### P1 — 影响正确性

#### P1-1 ✅ 遮罩浓度滑块：数值全是错的　→　**阶段 0 已修**

`RightPropertyPanel.tsx:146`

```js
const handleBlurTransChange = (value: SliderValue) => {
  updateProperty("blurTrans", typeof value === "number" ? value.toString() : value[0].toString());
};
```

写进去的是**十进制字符串**，但两个消费方都按**十六进制**读：

- 显示值：`Number(parseInt(propertyInfo.blurTrans, 16) / 2.55)`（`RightPropertyPanel:993`）
- 实际渲染：`backgroundColor: color + blurTrans`（`ImageEditor:504`）

实测：初始「浓度 60」→ 遮罩 0.6 ✓；按一下右键（60→65）→

```
显示: 浓度 40        ← 期望 65
实际: rgba(31,41,55,0.396)   ← 期望 0.65
```

`"65"` 被当成 hex `0x65` = 101，101/255 = 39.6%。**用户拖到 65% 实际拿到 39.6%，界面还显示 40%。**

`PicproseContext` 里那个本该做 number→hex 转换的 effect 是死代码：

```js
useEffect(() => {
  if (typeof propertyInfo.blurTrans === "number") { ... }   // ← 值永远是 string
}, [propertyInfo.blurTrans]);
```

#### P1-2 ✅ 「角落」SVG 模板是半残的

`svgBackgrounds.tsx` 里**只有 1 个模板**（「波浪」），「角落」是 `LeftResourcePanel` 里临时补的。而 `RightPropertyPanel` 的守卫：

```js
if (selectedSvgIndex === null || !SVG_BACKGROUNDS[selectedSvgIndex]) return null;
```

实测：选「波浪」→ 右面板有振幅/频率/速度控件 ✓；选「角落」→ **一个控件都没有** ✗。

而且 `RightPropertyPanel` 里所有 SVG 参数逻辑都写死「波浪」（`randomizeHeazyWave` 判断 `currentSvg.name !== "波浪"` 就 return）。

#### P1-3 ✅ 切背景类型时，遮罩浓度会串档　→　**阶段 0 已修**

`PicproseContext.tsx`

```js
const updateProperty = (key, value) => {
  setPropertyInfo(...);
  if (key === "blurTrans") {
    if (backgroundType === 'image') setImageBlurTrans(value);   // ← 闭包里的旧值
    ...
  }
};

const handleBackgroundTypeChange = (type) => {
  setBackgroundType(type);                        // ← 异步
  updateProperty("blurTrans", colorBlurTrans);   // ← updateProperty 看到的还是旧 backgroundType
};
```

从「图片」切到「颜色」时，颜色档的浓度被写进了**图片**档。之后来回切，浓度就串了。

### P2 — 架构债

#### P2-1 影子文件：`svgBackgrounds.ts` 是死代码

`app/[locale]/` 下同时存在 `svgBackgrounds.ts`（219 行）和 `svgBackgrounds.tsx`（135 行），**都导出 `SVG_BACKGROUNDS`**。webpack 解析时 `.tsx` 胜出。

已用构建产物验证：bundle 里有 `.tsx` 的 `heazy-wave-gradient` 特征，没有 `.ts` 的 `M0,100 Q200,180` 特征 → **`.ts` 那 219 行从未生效过**。

这类文件最坏：改错文件，改完没效果，还以为自己没改对。

#### P2-2 死代码清单

| 位置 | 内容 |
|---|---|
| `svgBackgrounds.ts` | 219 行，整个文件 |
| `LeftResourcePanel:66` | `PATTERN_BACKGROUNDS` 18 个图案预设（约 100 行），定义了没人用 |
| `LeftResourcePanel:50` | `GRADIENT_COLORS` 里 12 条渐变，`bgColor` 字段无人读 |
| `page.tsx:19` | `import { users } from "./data"` —— 全仓库没人用 |
| `PicproseContext:298,317` | `randomizeSvgParams` / `randomizeHeazyWave` 没暴露 → 死代码；同样的逻辑在 `RightPropertyPanel` 又抄了一遍，已经漂移 |
| `RightPropertyPanel:338` | `randomizeSvgParams` 定义了没人调（按钮调的是 `randomizeHeazyWave`） |
| `RightPropertyPanel:122` | `handleAspectChange` 定义了没人用 |
| `RightPropertyPanel:134` | `handleBlurLevelChange` 定义了没人用 → **「模糊」功能其实没有 UI**，`blur` 永远是 `backdrop-blur-none` |
| `ImageEditor:550` | `declare global { Window.ImageEditorState }` 没人用 |
| `PicproseContext:132` | `setElementsLayout` 从没被调用 → locales 里 5 个布局预设 + 「布局」tab 的 i18n 键**全是空壳** |

#### P2-3 状态管理：多处「两份真相」

| 状态 | 现状 | 问题 |
|---|---|---|
| 元素布局 | `elements`（page.tsx）+ `elementsLayout`（context） | 同一件事存两份，靠 `ImageEditor` 里的 useEffect 同步 |
| 遮罩浓度 | `imageBlurTrans` / `colorBlurTrans` / `patternBlurTrans` + `propertyInfo.blurTrans` | **四份**，还要手工同步（见 P1-3） |
| 背景 | `backgroundType` + `backgroundColor` + `backgroundPattern` 三个独立 state | 应该是判别联合，现在可以同时存在互相矛盾的值 |
| 比例 | `aspect`（存 Tailwind class 字符串）+ `selectedValue`（存选项 value）+ `customWidth/Height` | 三份，渲染时 `replace('aspect-[','').replace(']','')` 把 class 字符串再解析回数字 |
| 图案背景 | `backgroundPattern` 用 `\|` 拼字符串 | `backgroundPattern.split('|')[0]` 是图案、`[1]` 是底色 —— 一个字段塞两个值 |

**一句话：现在的状态模型是「一堆平行的字符串 + 数字」，没有一个类型描述「一份海报长什么样」。**

#### P2-4 没有样式体系

- 颜色全是硬编码 hex，散在 4 个文件：`SOLID_COLORS` 32 个、`GRADIENT_COLORS` 12 个、`PATTERN_BACKGROUNDS` 18 个、`config.backColor`、以及各处 `bg-gray-100` / `border-gray-300` / `dark:bg-gray-800`
- 没有 token 层、没有圆角刻度、没有字号刻度、没有间距刻度
- 深色模式靠零散的 `dark:` 变体打补丁，没有统一主题
- 同一套视觉在三个地方各写一遍

#### P2-5 ✅ 网格吸附双重取整　→　**已修（2026-11-19）**

`ImageEditor.tsx`（现已抽到 `canvas/useElementDrag.ts`）

```js
const deltaX = snapToGrid(e.clientX - dragStart.x);   // 先取整
...
x: snapToGrid(newElements[elementKey].x + deltaX)     // 再取整
```

delta 和位置各取整一次，小步移动时误差逐步累积。

**实测数据（修前）**：鼠标移动 60px
- 一次性移动 → 元素位移 60px ✓
- 分 12 小步共 60px → 元素位移 **120px（2 倍）** ✗

**根因比报告里写的还多一层**：除了「delta 和位置各取整一次」，
`dragStart` 每来一次 mousemove 还会被**重置到当前鼠标位置**。
于是每次 5px 的小步，`snapToGrid(5)` = 10px —— 位移被整整放大一倍。

**修法**：mousedown 时记一次原点（鼠标落点 + 元素落点），
之后所有位移都相对原点算，只在「原点 + 总偏移」上取整一次。

**验收（Playwright 回归 `tests/e2e/editor.spec.ts`）**：
分 12 小步移动 60px → 元素位移 60px ✓（修前 120px）

#### P2-6 📖 ref 放在依赖数组里

`ImageEditor.tsx:129`

```js
useEffect(() => { ... }, [isDragMode, containerRef.current?.clientWidth, containerRef.current?.clientHeight]);
```

ref 变化不触发重渲染 → 网格线不会随窗口尺寸更新。

#### P2-7 📖 拖拽监听反复重订阅

每次 `dragStart` 变化都 remove/add 一遍 `document` 的 mousemove/mouseup。

#### P2-8 📖 左栏数据获取大量重复

`fetchPhotosBySearch` 和 `fetchRandomPhotos` 各约 140 行，重试 / 去重 / 分页逻辑几乎逐字复制，且用 `setTimeout` 递归做重试。

### P3 — 体验与工程化

#### P3-1 i18n 只做了一半

locales 有 128 个键、3 个分组，但以下全是硬编码中文（`en` 语言下用户会看到）：

- 18 个图案名（"点状图案"、"棋盘格"、"霓虹斑点"…）
- SVG 错误提示（"SVG不可用"、"模板无效"、"渲染错误"、"未找到SVG效果…"）
- 字体名、比例名（"微信公众号"、"BiliBili"、"Full HD"、"MacBook"…）
- SVG 模板名（"波浪"、"角落"）

#### P3-2 依赖已经过时

| 包 | 状态 |
|---|---|
| `@nextui-org/react` 2.6.11 | 2024 年已改名 **`@heroui/react`**，NextUI 停止维护 |
| `react-color` | 2020 年后无更新，React 19 下有 peer 警告 |
| `dom-to-image` | 2019 年后无更新；它把 DOM 转成 SVG data URI，外链字体/图片经常丢 |
| `react-photo-album` / `react-infinite-scroll-component` | 引了但基本没用（自己写的滚动） |

#### P3-3 ✅ 字体授权　→　**已确认（2026-11-19）**

仓库里直接带了 4 个 TTF：

- `AlibabaPuHuiTi-3-55-Regular.ttf`（阿里巴巴普惠体）
- `DingTalk JinBuTi.ttf`（钉钉进步体）
- `Kingsoft_Cloud_Font.ttf`（金山云字体）
- `ZiTiQuanXinYiGuanHeiTi.ttf`

**作者已确认这 4 个字体免费可商用**，不再是风险项。

#### P3-4 工程化缺失

- 没有测试、没有 CI
- `.eslintrc.json` 只有一行 `extends`，没有自定义规则
- 提交信息：`update` / `UPDATE README` / `udapte` / `bugfix`（没说明修了什么）
- `reactStrictMode: false` 掩盖问题
- README 里 Vercel 段落还写着 "Nextra site"（模板没删干净），GitHub 徽章指向原作者 `jaaronkot/picprose`
- `.env` 被 gitignore 了，但没有 `.env.example`（README 里写了要建 `.env.local`，格式还是 `KEY = value` 带空格）

#### P3-5 📖 API 路由

`app/api/unsplash/route.ts`

- `createApi({ accessKey: process.env.UNSPLASH_API_KEY! })` 在**模块顶层**执行 —— 缺 key 时构建/启动直接炸
- 错误响应只有 `500 {error}`，前端拿不到原因
- 前端没有超时、没有取消（切搜索词时旧请求仍在飞）

---

## 4. 目标架构

```
picprose/
├── src/
│   ├── app/                    # 只放路由、layout、page（薄）
│   │   ├── [locale]/
│   │   └── api/unsplash/
│   ├── components/             # 纯展示组件，不含业务逻辑
│   │   └── ui/                 # 基础件：Button / Slider / Panel / Field
│   ├── features/               # 按领域切
│   │   ├── canvas/             # 画布渲染 + 拖拽
│   │   │   ├── Canvas.tsx
│   │   │   ├── draggable.ts    # 拖拽逻辑（纯函数 + hook）
│   │   │   └── useElementDrag.ts
│   │   ├── background/         # 背景：image / color / pattern / svg
│   │   │   ├── types.ts        # 判别联合
│   │   │   ├── templates/      # 一模板一文件
│   │   │   │   ├── wave.ts
│   │   │   │   └── corner.ts
│   │   │   └── BackgroundPicker.tsx
│   │   ├── typography/         # 标题 / 作者 / 字体
│   │   ├── layout/             # 元素位置 + 布局预设
│   │   └── export/             # 导出
│   ├── lib/                    # 纯函数，必须能单测
│   │   ├── aspect.ts           # 比例 ↔ 尺寸
│   │   ├── svg.ts              # SVG 模板 → data URI
│   │   ├── color.ts            # hex ↔ alpha ↔ hsl
│   │   └── download.ts
│   ├── store/                  # 唯一真相
│   │   ├── editorStore.ts
│   │   └── types.ts
│   ├── data/                   # 预设数据
│   │   ├── colors.ts
│   │   ├── patterns.ts
│   │   └── fonts.ts
│   ├── styles/
│   │   ├── tokens.css          # 设计 token
│   │   └── globals.css
│   └── i18n/
├── scripts/
│   ├── check-ui.mjs            # UI 护栏
│   └── check-assets.mjs
└── tests/
```

### 4.1 状态模型（关键）

现在是一堆平行的字符串和数字。改成**一个描述「一份海报」的判别联合**：

```ts
// features/background/types.ts
export type Background =
  | { kind: "image";  src: string; author?: Author; position: number }
  | { kind: "color";  color: string; alpha: number }        // alpha: 0..1
  | { kind: "pattern"; css: string; base: string }
  | { kind: "svg";    templateId: string; params: SvgParams };

// store/types.ts
export interface EditorState {
  background: Background;
  aspect: { w: number; h: number };        // ← 数字，不是 class 字符串
  mask: { color: string; alpha: number };  // ← 一个，不是四份
  typography: {
    title: { text: string; font: string; size: number; width: number };
    author: { text: string; font: string; size: number };
  };
  icon: { kind: "devicon" | "image" | "none"; value: string };
  layout: Record<"title" | "author" | "icon", { x: number; y: number; visible: boolean }>;
}
```

这样：

- 「切背景类型串档」不可能发生 —— alpha 只有一份
- 「浓度滑块十进制/十六进制混用」不可能发生 —— alpha 是 `0..1` 的 number，渲染时才转 hex
- 「比例存 class 字符串再解析回来」不可能发生 —— `aspect` 是数字
- 「pattern 用 `|` 拼字符串」不可能发生 —— `css` 和 `base` 分开

### 4.2 SVG 模板协议

现在每个模板自己带 `defaultParams`（`any`），参数面板又写死「波浪」。改成：

```ts
// features/background/templates/types.ts
export interface SvgTemplate<P> {
  id: string;
  name: string;
  schema: ParamSpec<P>;              // 参数的类型化描述
  defaultParams: P;
  render: (params: P) => string;
}

// 参数面板由 schema 自动生成 —— 加一个模板不用改 UI
```

`ParamSpec` 描述每个参数的 key / 标签 / 类型 / 范围 / 默认值，右面板的滑块和颜色选择器按 schema 自动渲染。这样「角落」这类模板自动就有控件。

---

## 5. 分阶段路线图

每个阶段都能独立交付、独立验收，不需要停下来等下一步。

### 阶段 0：止血（1–2 天，零用户可见变化）✅ **已完成 2026-11-19**

**目标：让「改代码有反馈」成立。**

- [x] 删死代码：`svgBackgrounds.ts`（影子文件 220 行）、`svgBackgrounds.tsx`（并入目录）、`PATTERN_BACKGROUNDS`（106 行）、`data.tsx`（183 行）、两处 `randomizeSvg*`、`handleAspectChange`、`handleBlurLevelChange`、`declare global Window.ImageEditorState`、没被调用的 `forceUpdate`
- [x] SVG 模板目录化：`app/[locale]/svgBackgrounds/{index,types,wave}.ts`，一模板一文件，类型从 3 份收敛到 1 份
- [x] `next.config.mjs` → `ignoreBuildErrors: false`、`reactStrictMode: true`
- [x] 10 个 TS 错误全部修掉（`tsc --noEmit` 现在 0 错误）
- [x] `ComponentToImg.js` → `ComponentToImg.tsx`，补类型；顺手修掉 render body 里 `React.createRef()` 的写法（改 `useRef`）
- [x] 修 P1-1 遮罩浓度滑块（十进制/十六进制混用）
- [x] 修 P1-3 切背景类型时浓度串档
- [x] 补 `.env.example`、`AGENTS.md`、README 的模板残留（"Nextra site"、env 变量写法、本地开发命令）
- [x] `npm run typecheck` / `npm run verify` 脚本

**净变化：+145 / −1096 行**

**验收结果**

| 项 | 结果 |
|---|---|
| `npm run verify` | exit 0（typecheck 0 错 + lint 0 错 + build 通过） |
| 浓度滑块 | 拖到 65 → 界面显示 65，实际遮罩 alpha 0.65 ✓（修前：显示 40、实际 0.396） |
| 背景类型往返 | 图片档 65 → 切颜色档 0 → 颜色档 40 → 切回图片档 65 ✓（修前：串档） |
| 比例切换 | 16:9 → 855×481、1:1 → 855×855、9:16 → 481×855 ✓ |
| 导出 | PNG / JPG / SVG 三种格式都真的下载 ✓ |
| 控制台 | StrictMode 开着，零报错 ✓ |

**阶段 0 留下的**

- **P2-5 拖拽吸附过度位移**：实测鼠标移动 60px，元素位移 120px（2 倍）。
  原因是 delta 和位置各取整一次，小步移动时误差逐步累积。
  **这是核心交互问题，建议在阶段 1 抽 `useElementDrag` 时一并修掉**
  —— 修法是记录拖拽起点、用原始偏移累加，只在起点+总偏移上取整一次。
- 「角落」模板没有参数控件（P1-2）、布局预设是空壳（P2-2）：属阶段 1。
- 颜色/尺寸刻度与 UI 护栏：属阶段 2。


### 阶段 1：立骨架（3–5 天）

**目标：把纯逻辑抽出来，建立可测试的地基。**

- [ ] 建 `src/` 分层目录，把 `app/[locale]/` 下的东西按 §4 归位
- [ ] 抽 `lib/` 纯函数：`aspect.ts`、`svg.ts`、`color.ts`、`download.ts`
- [ ] 引入 Vitest，给 `lib/` 写单测（比例换算、hex↔alpha、SVG 编码）
- [ ] 引入 zustand（或 context + reducer），建唯一 `editorStore`
- [ ] 按 §4.1 把状态改成判别联合（这一步会一次性修掉 P1-1 / P1-3 / P2-3）
- [ ] SVG 模板改成 `SvgTemplate<P>` + `ParamSpec`，参数面板按 schema 自动渲染（顺手修好 P1-2「角落」）

**验收**：`npm test` 绿；`lib/` 覆盖率 > 80%；应用行为与阶段 0 一致（用截图对比）。

### 阶段 2：视觉体系　✅ **已完成 2026-11-19**

**目标：把「拼凑的样式」变成一套有刻度的体系。**

- [x] 建 `app/[locale]/styles/tokens.css` —— 抄 `fb-platform/ops/src/styles/tokens.css` 的色板与刻度（同一个品牌），按 Tailwind v3 的接线方式落到 `tailwind.config.ts`
- [x] 颜色：canvas / surface / side / soft / chip / line / ink / muted / accent / brand / 语义色（ok / warn / danger / info）
- [x] 刻度：按钮高 24/32/40/48、输入框 40、圆角 6/8/12、字号 12/14/16/20/24、阴影 card/pop/ring
- [x] `SOLID_COLORS` / `GRADIENT_COLORS` 移到 `app/[locale]/data/colors.ts`（它们是**内容**色板，不是界面配色）
- [x] 深色模式改成 token 翻转 + `<html>.dark`（`ThemeProvider.tsx` + `ThemeToggle.tsx`），组件里不再写 `dark:` 变体
- [x] 建 `scripts/check-ui.mjs` 护栏（抄 `fb-platform/ops/scripts/check-ui.mjs`）：禁裸 hex、禁 Tailwind 调色板色类、**禁 `dark:` 变体**、禁刻度外的圆角/阴影/图标尺寸
- [x] 接进 `npm run verify`

**实际改了 107 处违规**：50 处 Tailwind 调色板色类、19 处 `dark:` 变体、96 处裸 hex
（减去内容色板与品牌资产的豁免）。

**验收**

| 项 | 结果 |
|---|---|
| `npm run check:ui` | ✅ 通过（52 个文件） |
| 注入违规能否被抓出来 | ✅ 能（护栏逐行报位置） |
| 深浅两套截图 | ✅ 两套都正常，`<html>.dark` 翻转整套 token |
| `npm run verify` | ✅ exit 0 |

**比报告多做的两件事**

1. **护栏会剥注释再扫**。ops 那版逐行扫，`// rounded rectangle style` 这种注释
   会被当成一个 rounded 类报出来 —— 护栏误报多了就没人看了。
2. **`dark:` 变体也纳入护栏**。报告里只提了「禁裸 hex、禁调色板色类」，
   但 `dark:` 才是「浅色正常、深色瞎」的真正来源。

### 阶段 3：拆大文件　✅ **已完成 2026-11-19**

**目标：单文件回到能一眼读完的规模。**

- [x] `RightPropertyPanel`（1378 行）→ **219 行**，拆出 `properties/` 下 13 个文件
- [x] `LeftResourcePanel`（1015 行）→ **327 行**，拆出 `resources/` 下 4 个文件
- [x] `ImageEditor`（563 行）→ **231 行**，拆出 `canvas/` 下 4 个文件（含 `useElementDrag`）
- [x] 左栏的图片获取逻辑抽成 `usePhotoFeed` hook（两份 140 行的重复 → 140 + 9 + 14）
- [x] `devicon.jsx`（11869 行）→ `public/devicon/devicons.json`，运行时按需拉取（`lib/devicons.ts`）
- [x] i18n 补齐：源码里硬编码中文 **25 条 → 0 条**
- [x] 撤销/重做：抽成 `useHistory` hook，修掉 `saveHistory` 用闭包 `historyIndex` 的问题
- [x] 顺手干掉 `elementsLayout` 这份重复真相（`setElementsLayout` 从没被调用过）

**验收**

| 项 | 结果 |
|---|---|
| 任何源文件 ≤ 400 行 | ✅ 最大 392 行（`usePhotoFeed.ts`） |
| 源码里硬编码中文 | ✅ 0 条（`en` 界面下不再出现中文，Playwright 有回归） |
| `npm run verify` | ✅ exit 0 |
| 拆分是否改变行为 | ✅ 两个面板都做了 DOM 逐字节比对，7 个状态下输出一致 |

**SVG 模板的 id 化**：`SvgTemplate` 原来只有 `name`（"波浪"/"角落"），
右面板拿它做逻辑判断（`name !== "波浪"`）—— 拿显示名做判断，
一改文案就失效。现在拆成 `id`（逻辑用）+ `nameKey`（i18n 显示用）。

### 阶段 4：工程化　✅ **主体完成 2026-11-19**

- [x] Playwright 端到端：7 条用例，覆盖选比例 → 调浓度 → 拖标题 → 导出 PNG 一整条主链，外加「英文界面不出现中文」「主题切换翻转 `.dark`」两条回归
- [x] GitHub Actions：`.github/workflows/ci.yml`，两个 job（verify / e2e），本地等价 `npm run verify && npm run test:e2e`
- [x] 依赖升级：`@nextui-org/react` → `@heroui/react@2.8.10`（**不是 v3** —— v3 要 Tailwind 4，本项目还在 v3）、`react-color` → `@uiw/react-color`、`dom-to-image` → `html-to-image`
- [x] Dockerfile 改成多阶段生产构建（原来跑的是 `npm run dev`）
- [x] `next.config.mjs` 加 `outputFileTracingRoot`（否则 Next 会把 `/Users/admin/package-lock.json` 误当项目根）
- [x] README / README_CN / AGENTS.md 同步新栈与新命令
- [ ] 提交信息规范（Conventional Commits）—— 需要 `commitlint` 配置，尚未做
- [ ] 架构文档（`doc/architecture.md`）—— 尚未做
- [x] **字体授权确认**（见 P3-3）—— 作者已确认免费可商用 ✓

**验收**

| 项 | 结果 |
|---|---|
| `npm run test:e2e` | ✅ 7/7 通过 |
| `npm run verify` | ✅ exit 0 |
| 首屏 JS | 234 kB → **202 kB**（devicon 图标表不再进 bundle） |
| 深浅两套截图 | ✅ 两套都正常 |

**依赖升级踩到的坑**

- HeroUI v3 的 peer 是 `tailwindcss >= 4`，装 v3 会把 Tailwind v4 一起拖进来。
  本项目 Tailwind 是 3.4，所以用 **HeroUI v2.8.10**（插件本身用的还是 v3 的 API）。
- HeroUI v2 的插件**类型**是按 Tailwind v4 写的，跟本项目的 Tailwind v3 类型对不上，
  `tailwind.config.ts` 里有一处 `as unknown as PluginCreator` 的类型放行。
- `SelectItem` 的 `value` prop 在 HeroUI 里被移除了（item 的 key 就是 value），
  字体下拉那个 `value={font.value}` 直接删掉 —— key 本来就等于 value。
- `@uiw/react-color` v2 没有 Twitter 版取色器，`TwitterPicker` 换成了 `Chrome`
  （饱和度方块 + 色相条 + 色号输入），`CirclePicker` 换成 `Circle`（用法几乎一样）。
  两个库的回调名也不同：`onChangeComplete` → `onChange`。

---

## 6. 可以立刻复用的现成资产

`fb-platform` 里已经有成熟的东西，不用重造：

| 资产 | 位置 | 用途 |
|---|---|---|
| 设计 token 层 | `fb-platform/ops/src/styles/tokens.css` | 阶段 2 的 `tokens.css` 直接抄 |
| UI 护栏脚本 | `fb-platform/ops/scripts/check-ui.mjs` | 阶段 2 的 `check-ui.mjs` 直接抄 |
| 护栏接法 | `fb-platform/ops/package.json` | `verify` 脚本串法 |
| 浏览器巡检 | `fb-platform/ops/tests/` + `playwright.config.ts` | 阶段 4 的 Playwright 骨架 |
| 深色模式 | `fb-platform/ops/src/components/ThemePicker.tsx` | 三档主题切换 |

---

## 7. 什么时候该考虑重写

满足**任意一条**时，重写（或重写 UI 层）才划算：

1. **要让 PicProse 完全并进 fb-platform 的品牌体系** —— 那 token 层、组件层、深色模式都要换，UI 层重写比重构划算。但保留 `lib/` 纯函数层和导出链路。
2. **产品形态要变** —— 比如从「三栏编辑器」变成别的交互，那布局层不值得留。
3. **要支持的不只是封面图** —— 现在的状态模型硬编码了「标题 / 作者 / 图标」三个元素。要做通用海报/海报模板，`EditorState` 得重写成元素数组（`elements: Element[]`），那确实接近重写。
4. **维护成本已经超过重写成本** —— 现在的状态是「一个文件改完另一个文件就坏」的话，越晚越贵。

目前看是**第 1 条**的概率最高 —— 因为你已经把 fb-platform 的 token 体系、护栏、Playwright 都建好了，PicProse 直接复用这套就是最省力的路。

---

## 8. 一页纸行动清单

```
✅ 阶段 0  删死代码 + 开类型检查 + 建 AGENTS.md
✅ 阶段 2  抄 fb-platform 的 tokens + check-ui 护栏 + 深色模式
✅ 阶段 3  拆三个大面板 + 抽 usePhotoFeed / useHistory / useElementDrag
            + devicon 运行时加载 + i18n 清零
✅ 阶段 4  Playwright + CI + 依赖升级（HeroUI / react-color / dom-to-image）
⏳ 阶段 1  src/ 分层 + zustand 单一 store + 判别联合状态   ← 唯一没做的一段
⏳ 收尾    提交信息规范 + 架构文档
```

**每一项都能独立验证，不需要停下来等下一步。**

**阶段 1 为什么没做**：它要把状态模型整个换成判别联合
（`{kind:"image", …} | {kind:"color", …}`），改动面覆盖所有面板。
本轮先把「地基」补齐（类型、护栏、测试、拆分、CI），
状态模型的换血留到下一轮 —— 那时有了护栏和 e2e 兜底，改起来才敢。**
