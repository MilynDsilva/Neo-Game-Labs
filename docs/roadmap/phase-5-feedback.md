# Phase 5: Customer Feedback

## Goal

Collect useful feedback while protecting customers, staff, and the platform
from abuse.

## Recommended first version

Begin with private feedback rather than immediately publishing public reviews.
Customers can select a game, category, and optional purchase, then submit a
rating and written feedback.

## Tasks

- Create feedback form and submission confirmation.
- Support categories such as bug, gameplay, download, and general.
- Associate the signed-in customer and optional game or purchase server-side.
- Add length limits, validation, rate limits, and spam protection.
- Avoid accepting arbitrary executable attachments.
- Add feedback status and internal admin notes.
- Expose protected admin endpoints for triage and status updates.
- Notify the appropriate support channel without exposing sensitive data.
- Define retention and deletion behavior.

## Optional public reviews

If public reviews are later required, add moderation states, reporting, spoiler
handling, edit history, and appeal rules before publishing customer content.

## Customer-dashboard implementation boundary

- This repository accepts private, authenticated submissions and stores
  moderation status plus non-customer-visible internal notes.
- Feedback expires automatically after 730 days. Account-deletion processing
  must remove or irreversibly anonymize associated feedback sooner.
- Moderation endpoints, staff authorization, and audit actions belong to the
  independently deployable `apps/admin` application and protected API module.
  They must never be exposed through customer session authorization.
- No attachments are accepted. Public reviews remain out of scope.

## Exit criteria

- Feedback cannot expose another customer's identity or purchases.
- Abuse controls and moderation workflows are operational.
- Customers receive a reference they can use for support.
- Admin actions are authorized and audited.
