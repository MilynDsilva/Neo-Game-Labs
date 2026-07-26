# Workstream 4: Accessibility

Target WCAG 2.2 AA for customer-facing journeys.

## Current risks

- No skip-to-content link or stable main-content target.
- No explicit global `:focus-visible` treatment.
- Current navigation state is not announced.
- The mobile navigation design is not implemented.
- Loading text and many async results do not consistently use live regions.
- Animated loading and smooth scrolling ignore reduced-motion preference.
- Several image `alt` decisions need review as real game art replaces
  placeholders.
- Error messages are not consistently associated with their controls.

## Tasks

- Add a skip link and `id="main-content"` convention.
- Add high-contrast `:focus-visible` styles for links, buttons, inputs, selects,
  textareas, and menu items.
- Add `aria-current`, menu expanded state, accessible names, and logical focus
  management.
- Associate form descriptions and errors with `aria-describedby`.
- Move focus to confirmation or error summaries when appropriate.
- Use `role="status"` for non-urgent async results and `role="alert"` for
  blocking errors.
- Add `prefers-reduced-motion` overrides for smooth scrolling, loading pulse,
  and future transitions.
- Verify heading hierarchy, landmarks, list semantics, dialog confirmation, and
  external-link context.
- Verify contrast for muted text, borders, danger actions, disabled controls,
  and focus indicators.
- Avoid conveying platform, ownership, success, or errors by color alone.

## Validation

- Automated axe checks on all page templates.
- Keyboard-only walkthrough for all customer journeys.
- Screen-reader smoke checks with VoiceOver/Safari and NVDA/Firefox or Chrome.
- 200% zoom and 320 CSS pixel reflow checks.
- Reduced-motion and forced-colors checks.

Accessibility failures that block authentication, purchase, download, account
security, or feedback submission are release blockers.
