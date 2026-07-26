# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS builder
WORKDIR /workspace
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/admin/package.json apps/admin/package.json
RUN pnpm install --frozen-lockfile

COPY apps/admin apps/admin
RUN pnpm --filter @neogamelabs/admin build

FROM node:22-alpine AS runner
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production
ENV PORT=3100
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/admin/.next/static ./apps/admin/.next/static
USER nextjs
EXPOSE 3100
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --quiet --spider "http://127.0.0.1:${PORT:-3100}/" || exit 1
CMD ["node", "apps/admin/server.js"]
