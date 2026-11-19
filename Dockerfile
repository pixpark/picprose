# ---- 构建阶段 ----
FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# 构建期只需要占位 key：api 路由在模块顶层就把 key 交给了 unsplash-js，
# 真实 key 由运行期的 -e UNSPLASH_API_KEY=... 注入，不会被烤进镜像。
ARG UNSPLASH_API_KEY=build-placeholder
ENV UNSPLASH_API_KEY=$UNSPLASH_API_KEY

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- 运行阶段 ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/package.json package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./

EXPOSE 3000
CMD ["npm", "run", "start"]
