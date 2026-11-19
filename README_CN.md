# PicProse - 更好的封面图片生成工具

[![GitHub stars](https://img.shields.io/github/stars/pixpark/picprose)](https://github.com/pixpark/picprose/stargazers)
[![License](https://img.shields.io/github/license/pixpark/picprose)](https://github.com/pixpark/picprose/blob/main/LICENSE)

## 项目简介

PicProse 是一款强大的封面图片生成工具，专为博客作者、内容创作者、开发者和设计师打造。只需几步操作，即可创建专业精美的封面图片，适用于 Medium、YouTube、BiliBili、个人博客等多种平台。

**在线体验：** [picprose.pixpark.net](https://picprose.pixpark.net/)


![PicProse Preview](./doc/demo-1.jpg )

![PicProse Preview](./doc/demo-2.jpg )

![PicProse Preview](./doc/demo-3.jpg )

## ✨ 主要特点

- 🖼️ **丰富的图片资源** - 通过 Unsplash API 直接访问海量高质量图片
- 🎨 **灵活的编辑功能** - 自定义标题、作者信息、字体、颜色和透明度
- 📱 **多种比例支持** - 包含横屏和竖屏多种规格，适应不同平台需求
- 🔍 **实时预览** - 所有修改即时可见，所见即所得
- 🌈 **开发者图标集成** - 内置开发技术相关图标，适合技术文章封面
- 📥 **多格式导出** - 支持 JPG、PNG、SVG 格式导出
- 🇨🇳 **多语言支持** - 支持不同语言界面
- 🎯 **响应式设计** - 完美适配桌面端和移动端

## 🚀 快速开始

### 安装

```bash
# 克隆仓库
git clone https://github.com/pixpark/picprose.git

# 进入项目目录
cd picprose

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 环境变量配置

复制 `.env.example` 为 `.env.local` 并填入对应值：

```bash
cp .env.example .env.local
```

```
UNSPLASH_API_KEY=你的Unsplash访问密钥
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=你的GA追踪ID
```

#### Unsplash 直连不通时

部分网络（比如国内）直连 `api.unsplash.com` 会一直超时。

取图走的是服务端路由，而 Node 的 `fetch` **不认系统的代理设置** —— 它只看
`HTTPS_PROXY` / `HTTP_PROXY` 这两个环境变量，还要 `NODE_USE_ENV_PROXY=1` 才生效。

路由里已经写好了：只要看到代理变量就自动打开这个开关。所以本地只要指一下代理：

```bash
# .env.local
HTTPS_PROXY=http://127.0.0.1:7890
```

（图片本身走 `images.unsplash.com`，一般能直连，只有接口那头需要代理。）

密钥缺失或网络不通时，图库现在会直接把原因显示出来，不会一直转圈。

### 本地开发

```bash
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run check:ui   # UI 护栏：颜色 / 圆角 / 阴影 / dark: 变体
npm run lint
npm run build
npm run verify     # 类型 + 护栏 + lint + 构建 —— 提交前跑这条
npm run test:e2e   # Playwright 浏览器回归（会自己 build + 起服务）
```

浏览器回归需要 Chromium：`npx playwright install chromium`。

## 🐳 Docker 部署

镜像由本仓库的 `Dockerfile` 构建，不依赖第三方镜像：

```sh
# 构建镜像
docker build -t picprose .

# 启动
docker run -d --name picprose -e UNSPLASH_API_KEY=xxx -p 3000:3000 picprose
```

## 🔧 使用指南

1. **选择图片** - 从左侧面板浏览或搜索图片，点击选择
2. **调整布局** - 选择适合您需求的宽高比
3. **添加元素** - 添加标题、作者信息和图标
4. **自定义样式** - 调整颜色、透明度、字体大小等
5. **导出成品** - 点击底部导出按钮，选择所需格式

## 🧰 技术栈

- **前端框架**: [Next.js](https://nextjs.org/)
- **类型系统**: [TypeScript](https://www.typescriptlang.org/)
- **UI组件**: [HeroUI](https://heroui.com/) v3（React Aria）
- **样式**: [Tailwind CSS](https://tailwindcss.com/) v4
- **图片源**: [Unsplash API](https://unsplash.com/developers)
- **国际化**: [next-intl](https://next-intl-docs.vercel.app/)
- **字体**: [Google Fonts](https://fonts.google.com/) 和本地字体

## 📦 项目结构

```
picprose/
├── app/            # Next.js 应用目录
│   ├── [locale]/   # 多语言路由
│   ├── api/        # 服务端路由（Unsplash 代理）
│   ├── globals.css # 全局样式
├── lib/            # 纯函数（可单测）
├── config/         # 默认配置
├── types/          # TypeScript 类型定义
├── locales/        # i18n 文案
├── doc/            # 项目文档与重构方案
├── public/         # 静态资源
└── README.md       # 项目说明
```

## 🤝 贡献指南

我们欢迎所有形式的贡献，无论是新功能、错误修复还是文档改进。请参考以下步骤：

1. Fork 仓库
2. 创建新分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add some amazing feature'`
4. 推送到分支: `git push origin feature/amazing-feature`
5. 提交 Pull Request

## 📄 许可证

本项目采用 [MIT 许可证](https://github.com/pixpark/picprose/blob/main/LICENSE)。

## 🙏 鸣谢

- [Unsplash](https://unsplash.com/) 提供高质量图片
- [Next.js](https://nextjs.org/) 提供强大的前端框架
- [HeroUI](https://heroui.com/) 提供精美的UI组件
- 所有开源项目的贡献者们

## 📬 联系我们

如有任何问题或建议，欢迎通过以下方式联系我们：

- GitHub Issues: [提交问题](https://github.com/pixpark/picprose/issues)
- Email: your.email@example.com

---

**PicProse** - 让您的封面图片更专业、更吸引人！💪