# Project Delivery Status

This document is the canonical handoff record for Neo Game Labs customer
dashboard work. Every agent must read it before starting a task and update it
when a branch is merged, paused, superseded, or newly planned.

Last updated: 2026-07-26

## Status legend

- **Complete**: merged into `development` and verified.
- **Merged / paused**: implementation is merged, but activation or further work
  is intentionally blocked.
- **Ready for review**: branch is pushed but not present in `development`.
- **Not started**: planned work has no implementation branch yet.

## Merged work

| Phase      | Deliverable                                                                     | Source branch              | Development merge | Status          |
| ---------- | ------------------------------------------------------------------------------- | -------------------------- | ----------------- | --------------- |
| Repository | Agent contribution workflow                                                     | `docs/agent-workflow`      | `fdb1fb4`         | Complete        |
| 0          | Product roadmap and architecture decisions                                      | `docs/product-roadmap`     | `c86ea79`         | Complete        |
| 1          | pnpm/Turbo monorepo, Next.js web, NestJS API, MongoDB replica set, CI           | `chore/project-foundation` | `66db3fe`         | Complete        |
| 2          | Public game catalog, seed data, search, filters, detail pages, SEO              | `feat/game-catalog`        | `5c803b0`         | Complete        |
| 2          | About, support, legal pages, and catalog loading/error states                   | `feat/site-content`        | `fd1392c`         | Complete        |
| 3          | Google OAuth, customer records, secure server sessions, points-account creation | `feat/google-auth`         | `776a792`         | Complete        |
| 3          | Session controls, audit events, data export, deletion requests, rate limits     | `feat/account-security`    | `daefa9f`         | Complete        |
| 4          | Immutable points ledger, INR/USD packages, wallet APIs and UI                   | `feat/points-ledger`       | `52621ee`         | Complete        |
| 4          | Stripe Checkout, signed webhooks, payment deduplication, ledger crediting       | `feat/stripe-topups`       | `8268a25`         | Merged / paused |
| 4          | Points-based purchases, entitlements, and customer library                      | `feat/game-purchases`      | `bc5a28d`         | Complete        |

## Ready for review

| Phase | Deliverable                          | Branch                | Status           |
| ----- | ------------------------------------ | --------------------- | ---------------- |
| 4     | Entitlement-protected game downloads | `feat/game-downloads` | Ready for review |

## Paused decisions and blockers

### Stripe production activation

Stripe code is already merged, but real payment activation is paused.

- The business is based in India.
- Do not configure or activate a United States Stripe account unless the
  business genuinely has a qualifying US legal entity, tax details, address,
  and bank account.
- New Stripe India accounts are invite-only as of this update.
- Request a legitimate Stripe India invitation or select a compliant India
  payment provider before production payment testing.
- Never commit `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET`.
- Local code-level tests, signature tests, builds, and unauthenticated endpoint
  smoke tests passed. No real end-to-end Stripe charge was completed.

## Remaining roadmap

| Priority | Phase | Work                                                                 | Suggested branch               | Status                                |
| -------- | ----- | -------------------------------------------------------------------- | ------------------------------ | ------------------------------------- |
| 1        | 5     | Customer feedback submission and moderation-ready API                | `feat/game-feedback`           | Not started                           |
| 3        | 6     | Security, observability, accessibility, legal review, and deployment | Focused feature/chore branches | Not started                           |
| Paused   | 4     | Production payment-provider activation and live top-ups              | To be decided                  | Blocked on compliant provider account |

## Current local-development behavior

- Web: `http://localhost:3000`
- API: `http://localhost:4000`
- MongoDB: local Docker replica set
- Google sign-in: implemented; requires ignored values in `apps/api/.env`
- Catalog seed:
  `pnpm --filter @neogamelabs/api seed:catalog`
- Local download seed:
  `pnpm --filter @neogamelabs/api seed:downloads`
- Wallet package seed:
  `pnpm --filter @neogamelabs/api seed:wallet`
- Supported initial currencies: `INR` and `USD`
- Points package baseline includes ₹100 for 100 points.

## Next-agent handoff

1. Read `AGENTS.md`, this file, and the relevant phase document.
2. Confirm `development` contains the merge commits listed above.
3. Do not resume production payment activation without a compliant provider
   decision.
4. Merge `feat/game-downloads`; the recommended next implementation is
   `feat/game-feedback`.
5. Update this file in every feature branch when its status, scope, blocker, or
   next action changes.
