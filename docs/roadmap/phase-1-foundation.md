# Phase 1: Engineering Foundation

## Goal

Create a secure, testable skeleton that can be deployed before product features
are added.

## Tasks

- Create the monorepo workspace and the `web`, `api`, and shared contract
  packages.
- Add formatting, linting, type checking, unit tests, and build commands.
- Add environment-variable validation and committed example configuration.
- Create local MongoDB replica-set setup and a versioned data migration
  workflow.
- Establish API conventions, validation, error responses, and request IDs.
- Add continuous integration for every merge request.
- Create isolated development, staging, and production configurations.
- Deploy a placeholder frontend and API health endpoint to staging.
- Add error tracking, structured logs, uptime checks, and basic metrics.
- Add dependency and secret scanning.

## Initial collections

- `users`
- `auth_accounts`
- `sessions`
- `games`
- `game_platforms`
- `game_releases`
- `products`
- `point_accounts`
- `ledger_transactions`
- `ledger_entries`
- `top_up_orders`
- `payment_events`
- `purchases`
- `purchase_items`
- `entitlements`
- `download_events`
- `feedback`
- `admin_roles`
- `audit_events`

Exact fields, schema validation, indexes, and transaction boundaries should be
designed before migrations are written.

## Exit criteria

- A merge request cannot merge when required checks fail.
- Staging deploys from an approved branch or release process.
- The frontend can call the API and the API can reach the database.
- Secrets are stored outside source control.
- Logs can trace a request across the frontend and API.
