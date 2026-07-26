# Workstream 1: Authenticated Application Shell

## Goal

Make authentication status and customer controls consistent across the entire
website.

## Current behavior

- `SiteHeader` is a server component containing fixed links and a fixed
  **Sign in** label.
- `AccountPanel` calls `GET /v1/auth/me` independently and owns the only visible
  sign-out control.
- Wallet, library, feedback, purchase, and download components each handle
  authentication separately.
- Signing out updates only local Account-page state. Other mounted components
  have no shared notification.

## Tasks

### Shared auth state

- Add a client-side `AuthProvider` at the root layout.
- Load and validate `GET /v1/auth/me` once per application session.
- Expose `customer`, `authenticated`, `loading`, `refresh`, and `signOut`.
- Deduplicate concurrent auth requests and avoid repeated header/page fetches.
- Clear shared state after `401`, sign-out, current-session revocation, or
  deletion request.
- Do not store session tokens or customer records in `localStorage`.

### Signed-in header

- Replace the fixed **Sign in** link with:
  - avatar or initials;
  - display name on larger screens;
  - current points balance;
  - an accessible account menu.
- Account menu actions: Account, Wallet, Library, Send feedback, and Sign out.
- Keep a clear **Sign in** action for guests.
- Show a non-jumping skeleton while auth status loads.
- Refresh the visible points balance after a purchase or wallet change.

### Navigation

- Add current-page indication using `aria-current="page"`.
- Build a keyboard-accessible mobile menu with a labelled toggle.
- Close the menu after navigation, Escape, sign-out, and outside interaction.
- Prevent background scrolling while the mobile menu is open.
- Keep primary discovery links separate from customer-account actions.

### Sign-out behavior

- Make sign-out available globally.
- Show pending state and prevent duplicate requests.
- On success, clear shared identity and navigate to the home page.
- On failure, retain the session UI and display an actionable error.
- Preserve the Account-page sign-out action by routing it through the same
  shared method.

## Acceptance criteria

- Guest header shows **Sign in** on every route.
- Signed-in header shows the correct customer on every route without a reload.
- Sign-out works from any route and immediately updates all mounted UI.
- Revoking the current session or requesting deletion produces the same global
  signed-out state.
- Desktop and mobile menus are operable by keyboard and screen reader.
- Tests cover loading, guest, signed-in, sign-out success, sign-out failure, and
  expired-session behavior.
