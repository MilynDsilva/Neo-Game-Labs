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

| Phase      | Deliverable                                                                     | Source branch                    | Development merge | Status          |
| ---------- | ------------------------------------------------------------------------------- | -------------------------------- | ----------------- | --------------- |
| Repository | Agent contribution workflow                                                     | `docs/agent-workflow`            | `fdb1fb4`         | Complete        |
| 0          | Product roadmap and architecture decisions                                      | `docs/product-roadmap`           | `c86ea79`         | Complete        |
| 1          | pnpm/Turbo monorepo, Next.js web, NestJS API, MongoDB replica set, CI           | `chore/project-foundation`       | `66db3fe`         | Complete        |
| 2          | Public game catalog, seed data, search, filters, detail pages, SEO              | `feat/game-catalog`              | `5c803b0`         | Complete        |
| 2          | About, support, legal pages, and catalog loading/error states                   | `feat/site-content`              | `fd1392c`         | Complete        |
| 3          | Google OAuth, customer records, secure server sessions, points-account creation | `feat/google-auth`               | `776a792`         | Complete        |
| 3          | Session controls, audit events, data export, deletion requests, rate limits     | `feat/account-security`          | `daefa9f`         | Complete        |
| 4          | Immutable points ledger, INR/USD packages, wallet APIs and UI                   | `feat/points-ledger`             | `52621ee`         | Complete        |
| 4          | Stripe Checkout, signed webhooks, payment deduplication, ledger crediting       | `feat/stripe-topups`             | `8268a25`         | Merged / paused |
| 4          | Points-based purchases, entitlements, and customer library                      | `feat/game-purchases`            | `bc5a28d`         | Complete        |
| 4          | Entitlement-protected game downloads                                            | `feat/game-downloads`            | `bdb21df`         | Complete        |
| 5          | Private feedback and moderation-ready data storage                              | `feat/game-feedback`             | `3aacd3d`         | Complete        |
| 6          | Security headers, kill switches, readiness, and launch runbook                  | `chore/launch-readiness`         | `6da133d`         | Complete        |
| 6          | Vendor-neutral staging containers and deployment CI                             | `chore/staging-containers`       | `d7e429a`         | Complete        |
| Product    | Customer-experience audit and polish work plan                                  | `docs/customer-experience-audit` | `4efeacf`         | Complete        |
| Product    | Shared authentication, profile navigation, and sign-out                         | `feat/authenticated-shell`       | `fc80880`         | Complete        |
| Product    | Shared ownership, purchase states, and confirmations                            | `feat/ownership-ui`              | `ecbeb9c`         | Complete        |
| Product    | Explicit wallet, top-up, retry, and empty states                                | `fix/wallet-states`              | `0c6e1b5`         | Complete        |

## Ready for review

| Phase   | Deliverable                                          | Branch                    | Status           |
| ------- | ---------------------------------------------------- | ------------------------- | ---------------- |
| Product | Shared library data and detailed download experience | `feat/library-experience` | Ready for review |

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

| Priority | Phase   | Work                                                       | Suggested branch           | Status                                |
| -------- | ------- | ---------------------------------------------------------- | -------------------------- | ------------------------------------- |
| 1        | Product | Customer journey and visual/responsive polish              | Focused feature branches   | Not started                           |
| 2        | Product | Accessibility and automated browser quality                | Focused fix/chore branches | Not started                           |
| 4        | 6       | Configure monitoring, backups, and restoration rehearsal   | Focused chore branches     | Not started                           |
| 5        | 6       | Legal, tax, privacy, refunds, and acceptable-use review    | External review            | Not started                           |
| Last     | 6       | Select host, deploy staging, then configure domain/DNS/TLS | Host-specific chore branch | Deferred until product polish         |
| Paused   | 4       | Production payment-provider activation and live top-ups    | To be decided              | Blocked on compliant provider account |

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
4. Merge `feat/library-experience`; then continue with feedback form polish in
   `feat/feedback-polish`.
5. Per product-owner direction, hosting, domain, DNS, and deployment remain last
   until the customer experience is working and visually approved.
6. Update this file in every feature branch when its status, scope, blocker, or
   next action changes.
