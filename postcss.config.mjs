/**
 * PostCSS 配置。
 *
 * Tailwind v4 不再是「postcss 插件 + JS 配置文件」那套：
 *  - 插件换成 @tailwindcss/postcss（Tailwind v4 自带前缀处理，autoprefixer 不再需要）
 *  - 配置写进 CSS（@theme / @source / @custom-variant），没有 tailwind.config.ts 了
 */
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
