# Customer Experience Improvement Plan

This folder is the implementation plan for turning the working customer
dashboard into a coherent, polished product. It is based on an audit of the
current Next.js pages, client components, shared contracts, API behavior, and
responsive styles as of `development` commit `d7e429a`.

## Audit conclusion

The primary customer journeys exist, but the interface behaves like separate
feature demos rather than one signed-in product.

The highest-impact gap is global identity:

- Sign-out is implemented, but only inside `/account`.
- The site header is static and always displays **Sign in**, even after
  authentication.
- Customer name, avatar, and points balance do not appear outside `/account`.
- Each authenticated page independently discovers a `401`; there is no shared
  customer/session state.
- Navigation has no current-page state and no functional mobile menu.

Other important gaps:

- Wallet authentication failures and service failures share one vague state.
- Disabled top-ups are still presented as purchasable Stripe packages.
- Game pages do not show whether the signed-in customer already owns a game.
- Purchase completion jumps to the library without an explicit confirmation.
- Library, wallet, account, feedback, and downloads use inconsistent loading,
  error, empty, and success patterns.
- Most async actions do not protect against network exceptions or announce
  results consistently.
- The interface has no skip link and no explicit keyboard focus system.
- The mobile header attempts to fit every navigation link into one row.
- Motion does not respect `prefers-reduced-motion`.
- Automated web coverage contains only one page test and no authenticated
  journey tests.

## Delivery order

| Priority | Workstream                           | Plan file                        | Suggested branch           |
| -------- | ------------------------------------ | -------------------------------- | -------------------------- |
| P0       | Global authentication and navigation | `01-authenticated-shell.md`      | `feat/authenticated-shell` |
| P1       | Consistent customer journeys         | `02-customer-journeys.md`        | Focused feature branches   |
| P1       | Visual and responsive polish         | `03-visual-responsive-polish.md` | `feat/ui-polish`           |
| P1       | Accessibility                        | `04-accessibility.md`            | `fix/accessibility`        |
| P2       | Automated quality gates              | `05-quality-validation.md`       | `chore/web-quality`        |

Do not combine all workstreams into one large merge request. Complete the
authenticated shell first because every other customer page depends on it.

## Product-wide definition of done

- A signed-in customer is visibly signed in on every page.
- Account, wallet, library, feedback, and sign-out are reachable from global
  navigation on desktop and mobile.
- No page invites an already authenticated customer to sign in.
- Loading, empty, success, disabled, authentication-required, and failure
  states are deliberate and accessible.
- All interactive elements are keyboard operable with visible focus.
- Layouts work at 320, 375, 768, 1024, and 1440 CSS pixels.
- Critical authenticated and unauthenticated journeys have automated tests.
- The project tracker records each completed branch and the next handoff.
