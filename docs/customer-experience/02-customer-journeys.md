# Workstream 2: Customer Journey Consistency

## Account

- Separate profile, points, session security, data export, and account deletion
  into clearly labelled sections.
- Display success and failure feedback for session revocation, export, sign-out,
  and deletion requests.
- Show session dates in a readable format instead of only raw user-agent text.
- Require a stronger confirmation step for account deletion.

## Catalog and game detail

- Show ownership state on game cards and game detail pages for signed-in users.
- Replace the purchase button with **In your library** when already owned.
- Confirm successful free additions and purchases before navigation.
- Explain insufficient points with a direct Wallet action.
- Distinguish direct downloads, external stores, and coming-soon platforms
  visually.
- Add screenshots, gameplay media, release metadata, genre, and system
  requirements when product content becomes available.

## Wallet

- Treat `401`, API failure, and empty ledger as separate states.
- Hide or clearly disable top-up packages while top-ups are paused.
- Do not advertise active Stripe checkout when the kill switch is off.
- Explain INR/USD package behavior and that points are not cash.
- Add retry behavior for wallet loading and checkout failure.
- Refresh balance after successful provider confirmation.

## Library and downloads

- Use the shared auth state instead of rediscovering authentication.
- Present owned date, purchase price, platform, version, and download size.
- Format platform labels consistently (`Windows`, `macOS`, and so on).
- Explain one-time download link preparation and expiration.
- Distinguish disabled downloads, no build, expired grant, and network failure.
- Add retry actions and accessible progress/status announcements.

## Feedback

- Preselect a game when arriving from its detail or library page.
- Show remaining message characters and clearer validation.
- Preserve form content after recoverable submission failures.
- Provide a copy-reference action on success.
- Explain where customers can use the feedback reference.

## Shared states

Create reusable patterns for:

- loading skeleton;
- empty state;
- authentication required;
- feature paused;
- recoverable error with retry;
- destructive confirmation;
- inline success;
- toast or live-region announcement.

Every state must use specific language. Avoid messages that combine sign-in
failure, service outage, validation error, and feature pause.

## Suggested branches

1. `feat/ownership-ui`
2. `fix/wallet-states`
3. `feat/library-experience`
4. `feat/feedback-polish`
5. `feat/account-experience`
