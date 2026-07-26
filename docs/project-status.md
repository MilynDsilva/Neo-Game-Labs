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

| Phase      | Deliverable                                                                     | Source branch                    | Development merge | Status     |
| ---------- | ------------------------------------------------------------------------------- | -------------------------------- | ----------------- | ---------- |
| Repository | Agent contribution workflow                                                     | `docs/agent-workflow`            | `fdb1fb4`         | Complete   |
| 0          | Product roadmap and architecture decisions                                      | `docs/product-roadmap`           | `c86ea79`         | Complete   |
| 1          | pnpm/Turbo monorepo, Next.js web, NestJS API, MongoDB replica set, CI           | `chore/project-foundation`       | `66db3fe`         | Complete   |
| 2          | Public game catalog, seed data, search, filters, detail pages, SEO              | `feat/game-catalog`              | `5c803b0`         | Complete   |
| 2          | About, support, legal pages, and catalog loading/error states                   | `feat/site-content`              | `fd1392c`         | Complete   |
| 3          | Google OAuth, customer records, secure server sessions, points-account creation | `feat/google-auth`               | `776a792`         | Complete   |
| 3          | Session controls, audit events, data export, deletion requests, rate limits     | `feat/account-security`          | `daefa9f`         | Complete   |
| 4          | Immutable points ledger, INR/USD packages, wallet APIs and UI                   | `feat/points-ledger`             | `52621ee`         | Complete   |
| 4          | Legacy Stripe checkout implementation (superseded by Razorpay work)             | `feat/stripe-topups`             | `8268a25`         | Superseded |
| 4          | Points-based purchases, entitlements, and customer library                      | `feat/game-purchases`            | `bc5a28d`         | Complete   |
| 4          | Entitlement-protected game downloads                                            | `feat/game-downloads`            | `bdb21df`         | Complete   |
| 5          | Private feedback and moderation-ready data storage                              | `feat/game-feedback`             | `3aacd3d`         | Complete   |
| 6          | Security headers, kill switches, readiness, and launch runbook                  | `chore/launch-readiness`         | `6da133d`         | Complete   |
| 6          | Vendor-neutral staging containers and deployment CI                             | `chore/staging-containers`       | `d7e429a`         | Complete   |
| Product    | Customer-experience audit and polish work plan                                  | `docs/customer-experience-audit` | `4efeacf`         | Complete   |
| Product    | Shared authentication, profile navigation, and sign-out                         | `feat/authenticated-shell`       | `fc80880`         | Complete   |
| Product    | Shared ownership, purchase states, and confirmations                            | `feat/ownership-ui`              | `ecbeb9c`         | Complete   |
| Product    | Explicit wallet, top-up, retry, and empty states                                | `fix/wallet-states`              | `0c6e1b5`         | Complete   |
| Product    | Shared library data and detailed download experience                            | `feat/library-experience`        | `9bf19a7`         | Complete   |
| Product    | Private feedback context, validation, and confirmation                          | `feat/feedback-polish`           | `8ef5701`         | Complete   |
| Product    | Clear account sections, action feedback, and deletion safeguards                | `feat/account-experience`        | `31d082a`         | Complete   |
| Product    | Visual system, catalog clarity, and responsive layouts                          | `feat/visual-responsive-polish`  | `121107e`         | Complete   |
| Product    | Accessibility semantics, keyboard focus, and automated checks                   | `fix/accessibility-quality`      | `9a4da6d`         | Complete   |
| Product    | Public game comments with authenticated posting and pagination                  | `feat/game-comments`             | `e907b75`         | Complete   |
| Admin      | Protected API, operations dashboard, welcome and admin credits                  | `feat/admin-dashboard`           | `3aa1ea8`         | Complete   |

## Ready for review

| Phase   | Deliverable                                                     | Branch                   | Status           |
| ------- | --------------------------------------------------------------- | ------------------------ | ---------------- |
| Product | Premium homepage showcase and discovery experience              | `feat/homepage-showcase` | Ready for review |
| 4       | Razorpay checkout, verification, webhooks, and ledger crediting | `feat/razorpay-topups`   | Ready for review |

## Paused decisions and blockers

### Razorpay production activation

Razorpay test-mode integration is ready for review, but live payment activation
remains a separate launch decision.

- Rotate the test key secret disclosed during development.
- Complete Razorpay business verification and settlement configuration before
  requesting live keys.
- Configure automatic capture and signed webhooks for `payment.captured` and
  `payment.failed`.
- Never commit `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET`.
- Test-mode checkout does not authorize live charges or production launch.

## Remaining roadmap

| Priority | Phase   | Work                                                       | Suggested branch           | Status                                |
| -------- | ------- | ---------------------------------------------------------- | -------------------------- | ------------------------------------- |
| 1        | Product | Customer journey and visual/responsive polish              | Focused feature branches   | Complete                              |
| 2        | Product | Accessibility and automated browser quality                | Focused fix/chore branches | Complete                              |
| 4        | 6       | Configure monitoring, backups, and restoration rehearsal   | Focused chore branches     | Deferred by product owner             |
| 5        | 6       | Legal, tax, privacy, refunds, and acceptable-use review    | External review            | Deferred by product owner             |
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
4. Review `feat/razorpay-topups`, including captured-payment verification and
   production credential handling.
5. Browser automation, operations, legal
   review, payments, hosting, and domain work are intentionally deferred by the
   product owner.
6. Per product-owner direction, hosting, domain, DNS, and deployment remain last
   until the customer experience is working and visually approved.
7. Update this file in every feature branch when its status, scope, blocker, or
   next action changes.
