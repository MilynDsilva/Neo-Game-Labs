# Phase 0: Product and Technical Decisions

## Goal

Remove decisions that could cause expensive rework during authentication,
payments, points accounting, release delivery, or deployment.

## Product decisions

- Identify launch countries, currencies, and languages.
- Choose the games available at launch and their supported platforms.
- Confirm the conversion rule, initially proposed as ₹1 = 1 point.
- Define minimum and maximum top-up amounts and account balance limits.
- Confirm whether points can be spent only on products sold directly by Neo
  Game Labs.
- Confirm that points cannot be transferred between customers or withdrawn as
  cash.
- Decide whether bonus/promotional points will exist and whether their rules
  differ from purchased points.
- Define refund, cancellation, expiry, chargeback, support, privacy, terms, tax,
  and age requirements.
- Define whether feedback is private feedback, public reviews, ratings, or a
  combination.
- Define which tasks belong in the separate admin dashboard.

## Technical decisions

- Select the frontend, backend, and hosting stack around the approved MongoDB
  database.
- Select the Google OAuth implementation.
- Select an Indian payment gateway supporting hosted checkout and signed
  webhooks.
- Select object storage and CDN services for downloadable game builds.
- Use entitlement-checked, expiring download URLs for purchased desktop games.
- Define production, staging, and local environments.
- Define how the admin application authenticates and how admin roles are
  assigned.
- Commission Indian legal and tax review of the proposed points model before
  launch.

## Recommended starting assumptions

- TypeScript across the frontend and backend.
- A React framework with server rendering for discoverability and SEO.
- MongoDB for customers, products, payments, the points ledger, purchases,
  entitlements, downloads, and feedback.
- MongoDB Atlas or an equivalent replica-set deployment; financial workflows
  must never depend on a standalone MongoDB server.
- Points are closed-loop: usable only for products sold by Neo Game Labs, not
  transferable, and not withdrawable as cash.
- INR is stored in minor units and points are stored as integers; floating
  point numbers are never used for monetary accounting.
- A double-entry, append-only MongoDB ledger is the source of truth for point
  balances.
- Hosted payment checkout; card or UPI credentials never pass through Neo Game
  Labs servers.
- Private object storage with short-lived signed download URLs.
- Google OAuth using Authorization Code flow with secure server-side sessions.
- Role-based admin access with audit logs and no public admin registration.

These are recommendations, not final selections.

## Regulatory boundary

The working model is a closed-loop points system: points are accepted only for
goods and services sold by Neo Game Labs, cannot be transferred to another
customer, and cannot be withdrawn as cash. Selling third-party merchants'
products, enabling transfers, or enabling cash withdrawal changes this boundary
and requires a fresh legal and regulatory assessment.

Reference:
[RBI Master Directions on Prepaid Payment Instruments](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12156)

This roadmap is an engineering plan, not legal or tax advice. Obtain qualified
Indian legal and tax review before accepting customer funds.

## Deliverables

- Approved launch scope
- Technology decision records
- Basic page map and user journeys
- Data retention and privacy requirements
- Initial game/platform/release inventory
- Agreed success metrics

## Exit criteria

- Payment, authentication, download delivery, and hosting providers are chosen.
- Launch regions, currency, tax treatment, and platform support are known.
- The points terms, refund rules, and chargeback behavior are approved.
- Legal review confirms the launch model or identifies required changes.
- Customer and admin responsibilities are clearly separated.
- Legal and operational owners are identified.
