# PicProse - Better Cover Image Generator

[![GitHub stars](https://img.shields.io/github/stars/pixpark/picprose)](https://github.com/pixpark/picprose/stargazers)
[![License](https://img.shields.io/github/license/pixpark/picprose)](https://github.com/pixpark/picprose/blob/main/LICENSE) 

<a href="./README.md">English</a> | <a href="./README_CN.md">简体中文</a>

## Overview

PicProse is a powerful cover image generator designed for bloggers, content creators, developers, and designers. Create professional and stunning cover images in just a few steps for Medium, YouTube, BiliBili, personal blogs, and other platforms.

**Preview:** [picprose.pixpark.net](https://picprose.pixpark.net/)



![PicProse Preview](./doc/demo-1.jpg )

![PicProse Preview](./doc/demo-2.jpg )

![PicProse Preview](./doc/demo-3.jpg )

## ✨ Key Features

- 🖼️ **Rich Image Resources** - Access high-quality images directly through the Unsplash API
- 🎨 **Flexible Editing** - Customize titles, author info, fonts, colors, and transparency
- 📱 **Multiple Aspect Ratios** - Support for both landscape and portrait formats for different platforms
- 🔍 **Real-time Preview** - See all changes instantly with a WYSIWYG interface
- 🌈 **Developer Icons** - Built-in tech-related icons perfect for technical article covers
- 📥 **Multiple Export Formats** - Support for JPG, PNG, and SVG exports
- 🌐 **Multilingual Support** - Interface available in multiple languages
- 🎯 **Responsive Design** - Perfectly adapts to both desktop and mobile devices

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/pixpark/picprose.git

# Navigate to the project directory
cd picprose

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

```bash
UNSPLASH_API_KEY=your_unsplash_api_key
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id
```
Refer: [https://unsplash.com/documentation](https://unsplash.com/documentation)


## Development

```bash
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run check:ui   # UI 护栏：颜色 / 圆角 / 阴影 / dark: 变体
npm run lint
npm run build
npm run verify     # typecheck + check:ui + lint + build —— 提交前跑这条
npm run test:e2e   # Playwright 浏览器回归（会自己 build + 起服务）
```

浏览器回归需要 Chromium：`npx playwright install chromium`。

## Deploy to Vercel
You can start by creating your own PicProse site and deploying to Vercel by clicking the link:

<a className="mt-3 inline-flex"
  target="_blank"
  href="https://vercel.com/new/clone?s=https://github.com/pixpark/picprose&showOptionalTeamCreation=false">![](https://vercel.com/button)</a>

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 15 (App Router)
- **Types**: [TypeScript](https://www.typescriptlang.org/) (strict)
- **UI**: [HeroUI](https://heroui.com/) v2 + [Tailwind CSS](https://tailwindcss.com/) v3
- **Design tokens**: `app/[locale]/styles/tokens.css` + `npm run check:ui` guardrail
- **Images**: [Unsplash API](https://unsplash.com/developers)
- **i18n**: [next-intl](https://next-intl-docs.vercel.app/)
- **Testing**: [Playwright](https://playwright.dev/)

## Deploy with Docker

Build from this repository (the image is produced from the `Dockerfile` in this repo, not from a third-party image):

```sh
# 构建镜像
docker build -t picprose .

# 启动
docker run -d --name picprose -e UNSPLASH_API_KEY=xxx -p 3000:3000 picprose
```

## License
PicProse is open-source under the [MIT License](https://github.com/pixpark/picprose/blob/main/LICENSE).
