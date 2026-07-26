# Phase 2: Public Website and Game Catalog

## Goal

Let visitors discover Neo Game Labs and understand where and how each game is
available.

## Customer experience

- Home page with featured and newly released games
- Games listing with platform and availability filters
- Search by title
- Game detail page with description, media, requirements, supported platforms,
  point price, and release status
- Correct calls to action for:
  - Buying a game with points
  - Downloading an owned or free game
  - Opening the Apple App Store
  - Opening Google Play
  - Opening another external store
- About, support, privacy, terms, and contact pages
- Responsive navigation and accessible interaction
- Search-engine metadata, sitemap, robots configuration, and social preview
  metadata

## Backend capabilities

- Public, cacheable catalog endpoints
- Draft, scheduled, published, and archived game states
- Platform-specific point prices, links, requirements, and release metadata
- Media metadata with optimized delivery
- Protected admin endpoints for catalog and release management

The separate admin dashboard will provide the UI for protected endpoints.

## Exit criteria

- Only published games and releases appear publicly.
- Prices shown by the frontend match authoritative backend product prices.
- Store links are validated and platform-specific calls to action are correct.
- Catalog pages meet agreed accessibility, SEO, and performance targets.
- Empty, loading, error, and unavailable-game states are implemented.
