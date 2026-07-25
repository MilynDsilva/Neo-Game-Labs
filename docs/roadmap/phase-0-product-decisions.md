# Phase 0: Product and Technical Decisions

## Goal

Remove decisions that could cause expensive rework during authentication,
commerce, release delivery, or deployment.

## Product decisions

- Identify launch countries, currencies, and languages.
- Choose the games available at launch and their supported platforms.
- Decide whether each game is free, paid once, or sold through an external
  store.
- Decide whether customers may check out as guests or must sign in first.
- Define refund, support, privacy, terms, and age requirements.
- Define whether feedback is private feedback, public reviews, ratings, or a
  combination.
- Define which tasks belong in the separate admin dashboard.

## Technical decisions

- Select the frontend, backend, database, and hosting stack.
- Select the Google OAuth implementation.
- Select a hosted payment provider and determine who handles sales tax/VAT.
- Select object storage and CDN services for downloadable game builds.
- Decide whether downloads require entitlements, expiring signed URLs, license
  keys, or external-store redirection.
- Define production, staging, and local environments.
- Define how the admin application authenticates and how admin roles are
  assigned.

## Recommended starting assumptions

- TypeScript across the frontend and backend.
- A React framework with server rendering for discoverability and SEO.
- PostgreSQL for customers, games, orders, entitlements, and feedback.
- Hosted checkout; card information never passes through Neo Game Labs servers.
- Private object storage with short-lived signed download URLs.
- Google OAuth using Authorization Code flow with secure server-side sessions.
- Role-based admin access with audit logs and no public admin registration.

These are recommendations, not final selections.

## Deliverables

- Approved launch scope
- Technology decision records
- Basic page map and user journeys
- Data retention and privacy requirements
- Initial game/platform/release inventory
- Agreed success metrics

## Exit criteria

- Payment, authentication, download delivery, and hosting providers are chosen.
- Launch regions, currencies, and platform support are known.
- Customer and admin responsibilities are clearly separated.
- Legal and operational owners are identified.
