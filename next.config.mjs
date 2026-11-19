/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig = {
  // 显式指定 workspace root。
  // 不写的话 Next 会往上找 lockfile —— 这台机器上 /Users/admin/package-lock.json
  // 会被误当成项目根，构建产物追踪就跟着跑偏了。
  outputFileTracingRoot: import.meta.dirname,

  // 类型错误必须挡住构建。
  // 之前这里开着 ignoreBuildErrors，10 个 TS 错误被静默吞掉 ——
  // tsconfig 写着 strict: true 却从来没真跑过，改代码没有任何反馈。
  typescript: {
    ignoreBuildErrors: false,
  },
  // 开着 StrictMode 会多渲染一次，能提前暴露副作用 / 清理没写对的地方。
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
