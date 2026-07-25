# Phase 0: Product and Technical Decisions

## Goal

Remove decisions that could cause expensive rework during authentication,
release delivery, or deployment.

## Product decisions

- Identify launch countries, currencies, and languages.
- Choose the games available at launch and their supported platforms.
- Confirm that all first-release games are free of charge.
- Decide whether direct downloads are public or require Google sign-in.
- Define support, privacy, terms, and age requirements.
- Define whether feedback is private feedback, public reviews, ratings, or a
  combination.
- Define which tasks belong in the separate admin dashboard.

## Technical decisions

- Select the frontend, backend, database, and hosting stack.
- Select the Google OAuth implementation.
- Select object storage and CDN services for downloadable game builds.
- Decide whether downloads use public CDN URLs, expiring signed URLs, or
  external-store redirection.
- Define production, staging, and local environments.
- Define how the admin application authenticates and how admin roles are
  assigned.

## Recommended starting assumptions

- TypeScript across the frontend and backend.
- A React framework with server rendering for discoverability and SEO.
- PostgreSQL for customers, games, saved libraries, downloads, and feedback.
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

- Authentication, download delivery, and hosting providers are chosen.
- Launch regions and platform support are known.
- Customer and admin responsibilities are clearly separated.
- Legal and operational owners are identified.
