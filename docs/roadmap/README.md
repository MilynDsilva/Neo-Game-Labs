# Neo Game Labs Customer Platform Roadmap

## Product goal

Build `neogamelabs.com` as the customer-facing home for Neo Game Labs. Visitors
can discover games and platform availability. Signed-in customers can purchase
games, access owned downloads, and submit feedback.

The admin dashboard will be built in a separate repository. It will use
authenticated admin endpoints exposed by the same backend API.

## Recommended repository shape

Start as a monorepo so the customer frontend, backend, shared contracts, and
infrastructure evolve together:

```text
apps/
  web/          Customer website
  api/          Customer and protected admin API
packages/
  contracts/    Shared API schemas and types
  config/       Shared linting and TypeScript configuration
infrastructure/
docs/
```

The applications should remain independently deployable. The separate admin
repository should consume versioned API contracts and must not share customer
frontend code directly.

## Delivery phases

| Phase | Outcome | Depends on |
| --- | --- | --- |
| [0. Product decisions](phase-0-product-decisions.md) | Scope and technical decisions are approved | None |
| [1. Foundation](phase-1-foundation.md) | Deployable frontend and API skeleton | Phase 0 |
| [2. Catalog](phase-2-catalog.md) | Visitors can discover games and platforms | Phase 1 |
| [3. Identity](phase-3-identity.md) | Customers can securely sign in with Google | Phase 1 |
| [4. Commerce and library](phase-4-commerce-library.md) | Customers can purchase and access owned games | Phases 2–3 |
| [5. Feedback](phase-5-feedback.md) | Customers can submit moderated game feedback | Phases 2–3 |
| [6. Launch](phase-6-launch.md) | Production is secure, observable, and supportable | Phases 2–5 |

Phases 2 and 3 can be developed in parallel once the foundation is stable.
Feedback can be postponed until after the first commercial launch if schedule
pressure requires it.

## Initial release boundary

The first production release should include:

- Responsive public home page and game catalog
- Game detail pages with Windows/macOS/Linux downloads where applicable
- iOS App Store and Google Play links where applicable
- Google sign-in and a customer profile
- Checkout through a hosted payment provider
- Customer library with secure access to purchased downloads
- Basic feedback submission
- Separate, protected admin API capabilities for catalog, releases, orders, and
  feedback
- Legal pages, monitoring, backups, and support procedures

The first release should not include social networking, chat, achievements,
game launchers, subscriptions, wishlists, or native mobile applications unless
they become explicit business requirements.

## Global completion rules

Every phase must include:

- Automated tests for important user and security flows
- Accessibility checks for customer-facing UI
- Mobile, tablet, and desktop layouts
- Structured logging without secrets or personal data
- API authorization tests
- Updated API and operational documentation
- A migration and rollback plan for database changes

## Open decisions

Phase 0 contains the questions that must be answered before implementation.
Work can begin with documented assumptions, but payments, tax handling, download
delivery, and supported regions must be confirmed before commerce development.
