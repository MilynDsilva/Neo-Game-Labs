# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS builder
WORKDIR /workspace
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/contracts/package.json packages/contracts/package.json
RUN pnpm install --frozen-lockfile

COPY apps/api apps/api
COPY packages/contracts packages/contracts
RUN pnpm --filter @neogamelabs/contracts build \
  && pnpm --filter @neogamelabs/api build \
  && pnpm deploy --filter @neogamelabs/api --prod --legacy /release

FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 api
COPY --from=builder --chown=api:nodejs /release ./
COPY --from=builder --chown=api:nodejs /workspace/apps/api/dist ./dist
COPY --from=builder --chown=api:nodejs /workspace/apps/api/storage ./storage
USER api
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --quiet --spider "http://127.0.0.1:${PORT:-4000}/v1/health/ready" || exit 1
CMD ["node", "dist/main.js"]
