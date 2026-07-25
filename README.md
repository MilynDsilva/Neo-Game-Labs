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
pnpm --filter @neogamelabs/api seed:wallet
pnpm dev
```

The web application runs at `http://localhost:3000` and the API health endpoint
is available at `http://localhost:4000/v1/health`. The catalog and wallet seeds
are idempotent and can be rerun safely.

## Google sign-in

Google sign-in remains disabled until credentials are configured. Create a Web
application in Google Cloud, add
`http://localhost:4000/v1/auth/google/callback` as an authorized redirect URI,
and set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `apps/api/.env`.
Production and staging must use separate OAuth clients and HTTPS callback URLs.

## Stripe test checkout

Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in `apps/api/.env`. For
local webhook forwarding, run:

```bash
stripe listen --forward-to localhost:4000/v1/payments/stripe/webhook
```

Use the `whsec_...` value printed by the Stripe CLI as
`STRIPE_WEBHOOK_SECRET`, restart the API, and use Stripe test card
`4242 4242 4242 4242` with any future expiry and any three-digit CVC. Never
commit Stripe keys or webhook secrets.

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
