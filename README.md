# Neo Game Labs Customer Dashboard

Customer-facing game catalog, points wallet, purchase library, and feedback
platform for `neogamelabs.com`.

## Applications

- `apps/web`: Next.js customer website
- `apps/api`: NestJS API
- `packages/contracts`: Shared API schemas and TypeScript types

## Prerequisites

- Node.js 22 or newer
- pnpm 10
- Docker with Compose

## Local setup

```bash
npm install --global pnpm@10.17.0
pnpm install
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local
docker compose up -d
pnpm --filter @neogamelabs/api seed:catalog
pnpm dev
```

The web application runs at `http://localhost:3000` and the API health endpoint
is available at `http://localhost:4000/v1/health`. The catalog seed is
idempotent and can be rerun safely.

## Validation

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

See [the product roadmap](docs/roadmap/README.md) for delivery phases and
[the architecture decisions](docs/roadmap/architecture-decisions.md) for the
database and financial consistency design.
