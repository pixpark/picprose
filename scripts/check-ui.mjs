/**
 * PicProse UI 护栏。
 *
 * 为什么要有这一层：颜色一旦写成裸色号或者 Tailwind 调色板色类
 * （bg-gray-100、text-gray-500 这类），暗色模式下就不会跟着翻，
 * 页面会「浅色正常、深色瞎」。这种问题在浏览器里一眼能看出来，
 * 但在 code review 里极容易漏过去。
 *
 * 这里锁六件事：
 *  1. 裸色号只允许出现在 token 文件和内容预设里（品牌图形资产除外）。
 *  2. Tailwind 调色板色类一律不许用，颜色只走 --pp-* token 或组件库语义类。
 *  3. dark: 变体一律不许用 —— 深色靠 <html>.dark 翻转整套 token，
 *     组件里再写 dark: 等于把颜色钉死，深浅两套会漂。
 *  4. 圆角 / 阴影 / 图标尺寸只允许用刻度里的档位。
 *  5. 旧 token 名（--bg / --panel / --border…）不许复活。
 *  6. token 文件必须定义圆角刻度：Tailwind 的 borderRadius 映射全靠它，
 *     少这一行所有 rounded-* 会静默失效。
 *
 * 规则集与 fb-platform/ops/scripts/check-ui.mjs 同源（同一个品牌、同一套约束），
 * 按 PicProse 的目录结构与 Tailwind v3 的接线方式做了适配。
 *
 *   npm run check:ui
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/** 扫描根目录。 */
const ROOTS = ["app", "lib"];

/** token 源：色号只允许定义在这里。 */
const TOKEN_FILE = "app/[locale]/styles/tokens.css";

/**
 * 裸色号豁免：这些文件里的 hex 不是界面配色。
 *  - 内容色板：用户挑的背景色 / 遮罩色，本来就是任意色
 *  - 品牌图形资产：devicon 是整套字体图标，不是界面颜色
 *  - SVG 模板：模板参数里的颜色是画出来的内容
 *  - 浏览器外壳：favicon、theme-color
 */
const HEX_EXEMPT = [
  TOKEN_FILE,
  "app/[locale]/data/colors.ts",
  "app/[locale]/devicon.jsx",
  "app/[locale]/devicon.min.css",
  "app/[locale]/layout.tsx",
  "config/index.ts",
];

/** 目录级豁免：整目录都是内容 / 品牌资产。 */
const HEX_EXEMPT_DIRS = [
  "app/[locale]/svgBackgrounds",
];

/** Tailwind 调色板色类：暗色模式下不会翻转，等于把颜色写死。 */
const PALETTE_CLASS =
  /\b(?:bg|text|border|ring|fill|stroke|from|to|via|decoration|divide|outline|shadow|accent|caret)-(?:zinc|slate|gray|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/;

/** 任意值写法里的裸色号：text-[#2F6EE7] 这类。 */
const HEX = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/;

/**
 * dark: 变体：深色模式靠 token 翻转，不靠组件里打补丁。
 *
 * 只认 class 前缀的 dark:（后面紧跟小写字母），
 * 否则 `dark: "Dark"` 这种对象键会被误判。
 */
const DARK_VARIANT = /(^|[\s"'`])dark:[a-z]/;

/** 旧 token 名：语义变了，不能靠旧名复活。 */
const OLD_TOKEN =
  /var\(--(?:bg|panel|border|text|muted|soft|accent|brand|brand-hover|brand-soft|danger|warn)(?:-|\))/;

/** 刻度档位。 */
const RADIUS = new Set(["none", "full", "sm", "md", "lg", "xl", "2xl", "3xl"]);
const ICON_SIZE = new Set(["3", "4", "5", "6", "7", "8"]);
const SHADOW = new Set(["none", "xs", "sm", "card", "pop", "ring"]);

/** 方向前缀（rounded-t-lg → lg）。 */
const DIRECTION = new Set(["t", "r", "b", "l", "tl", "tr", "bl", "br"]);

/** 圆角 / 阴影类：连任意值写法一起抓（rounded-[13px] 同样不在刻度内）。 */
const ROUNDED_TOKEN = /\brounded(?:-[a-z0-9]+)*(?:-?\[[^\]]+\])?/g;
const SHADOW_TOKEN = /\bshadow(?:-[a-z0-9]+)*(?:-?\[[^\]]+\])?/g;

function baseOf(value) {
  const parts = value.split("-").slice(1);
  while (parts.length && DIRECTION.has(parts[0])) parts.shift();
  return parts.join("-");
}

/**
 * 扫之前先剥掉注释（保留换行，行号不变）。
 *
 * 不剥的话，代码里一句「// rounded rectangle style」会被圆角规则当成一个
 * rounded 类报出来 —— 护栏误报多了就没人看了。
 */
function stripComments(text) {
  const chars = text.split("");
  let quote = null;
  let i = 0;

  while (i < text.length) {
    const ch = chars[i];
    const next = chars[i + 1];

    if (quote) {
      if (ch === "\\") { i += 2; continue; }
      if (ch === quote) quote = null;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { quote = ch; i++; continue; }
    if (ch === "/" && next === "/") {
      while (i < text.length && chars[i] !== "\n") { chars[i] = " "; i++; }
      continue;
    }
    if (ch === "/" && next === "*") {
      chars[i] = " ";
      chars[i + 1] = " ";
      i += 2;
      while (i < text.length && !(chars[i] === "*" && chars[i + 1] === "/")) {
        if (chars[i] !== "\n") chars[i] = " ";
        i++;
      }
      if (i < text.length) { chars[i] = " "; chars[i + 1] = " "; i += 2; }
      continue;
    }
    i++;
  }
  return chars.join("");
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(tsx|ts|css)$/.test(name)) out.push(full);
  }
  return out;
}

const files = ROOTS.flatMap((root) => walk(root));
const issues = [];

for (const file of files) {
  const rel = relative(".", file);
  const isToken = rel === TOKEN_FILE;
  const hexExempt =
    HEX_EXEMPT.includes(rel) ||
    HEX_EXEMPT_DIRS.some((dir) => rel.startsWith(`${dir}/`));
  const text = stripComments(readFileSync(file, "utf8"));

  text.split("\n").forEach((line, i) => {
    const at = `${rel}:${i + 1}`;

    if (isToken) return;

    if (PALETTE_CLASS.test(line)) {
      issues.push({ at, kind: "调色板色类", line: line.trim() });
    }
    if (!hexExempt && HEX.test(line)) {
      issues.push({ at, kind: "裸色号", line: line.trim() });
    }
    if (DARK_VARIANT.test(line)) {
      issues.push({ at, kind: "dark: 变体", line: line.trim() });
    }
    if (OLD_TOKEN.test(line)) {
      issues.push({ at, kind: "旧 token 名", line: line.trim() });
    }
    for (const token of line.match(ROUNDED_TOKEN) ?? []) {
      if (!RADIUS.has(baseOf(token))) {
        issues.push({ at, kind: "圆角不在刻度内", line: token });
      }
    }
    for (const token of line.match(/\bsize-[\d.]+\b/g) ?? []) {
      if (!ICON_SIZE.has(token.slice(5))) {
        issues.push({ at, kind: "图标尺寸不在刻度内", line: token });
      }
    }
    for (const token of line.match(SHADOW_TOKEN) ?? []) {
      const base = baseOf(token);
      if (base && !SHADOW.has(base)) {
        issues.push({ at, kind: "阴影不在刻度内", line: token });
      }
    }
  });
}

/**
 * 圆角刻度必须齐 —— Tailwind 的 borderRadius 映射（tailwind.config.ts）
 * 全部指向这几个变量，少一个 rounded-* 就会退回默认值。
 */
const tokenText = readFileSync(TOKEN_FILE, "utf8");
for (const name of ["--pp-radius-sm", "--pp-radius-md", "--pp-radius-lg"]) {
  if (!new RegExp(`^\\s*${name}:\\s*[^;]+;`, "m").test(tokenText)) {
    issues.push({
      at: TOKEN_FILE,
      kind: "缺圆角刻度",
      line: `${name} 没定义，tailwind.config.ts 的 borderRadius 映射会落空`,
    });
  }
}

if (issues.length) {
  console.error(`\n❌ UI 护栏未通过（${issues.length} 处）：\n`);
  for (const issue of issues) {
    console.error(`  ${issue.at}  ${issue.kind}`);
    console.error(`    ${issue.line}\n`);
  }
  console.error(
    "  颜色只走 --pp-* token 或组件库语义类（default-/foreground-）；\n" +
      "  深色模式靠 <html>.dark 翻转 token，不要写 dark: 变体。\n",
  );
  process.exit(1);
}

console.log(
  `✅ UI 护栏通过：${files.length} 个文件，颜色走 token / 语义类，圆角与阴影都在刻度内。`,
);
