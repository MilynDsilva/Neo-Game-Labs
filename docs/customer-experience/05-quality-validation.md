# Workstream 5: Web Quality Validation

## Component and integration tests

- Auth provider and signed-in header states.
- Mobile navigation keyboard and focus behavior.
- Account actions and shared sign-out.
- Guest, owned, insufficient-points, successful-purchase, and already-owned
  states.
- Wallet authentication, paused checkout, empty ledger, and API failure.
- Library download availability, grant failure, and success.
- Feedback validation, throttling, authentication, and confirmation.

Mock at the network boundary and validate shared response contracts.

## End-to-end journeys

Add browser tests for:

1. Guest browses catalog and game detail.
2. Guest purchase attempt is directed to sign-in.
3. Signed-in identity appears globally.
4. Signed-in customer buys/adds a game and sees ownership.
5. Customer opens library and requests an entitled download.
6. Customer submits feedback and receives a reference.
7. Customer signs out from global navigation.
8. Expired or revoked session returns the whole UI to guest state.
9. Paused top-ups, purchases, or downloads show the correct product message.

## Performance

- Record Lighthouse baselines for home, catalog, game detail, account, wallet,
  library, and feedback.
- Set budgets for JavaScript, images, Largest Contentful Paint, Cumulative
  Layout Shift, and Interaction to Next Paint.
- Replace raw `<img>` elements where image optimization materially helps.
- Avoid duplicate auth and catalog requests.
- Validate cache behavior without caching customer-specific responses publicly.

## Browser and device matrix

- Current and previous Chrome, Safari, Firefox, and Edge.
- iOS Safari and Android Chrome.
- Keyboard, touch, high-DPI, slow network, and offline/failure behavior.

## CI gates

- Keep formatting, lint, type checks, unit tests, build, dependency audit, SAST,
  secret detection, and container builds.
- Add accessibility tests and critical browser journeys after the authenticated
  shell lands.
- Store failure screenshots and traces as short-lived CI artifacts.
- Do not make flaky tests optional; fix or quarantine them with a tracked owner
  and deadline.
