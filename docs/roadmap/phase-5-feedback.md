# Phase 5: Customer Feedback

## Goal

Collect useful feedback while protecting customers, staff, and the platform
from abuse.

## Recommended first version

Begin with private feedback rather than immediately publishing public reviews.
Customers can select a game and category, then submit a rating and written
feedback.

## Tasks

- Create feedback form and submission confirmation.
- Support categories such as bug, gameplay, download, and general.
- Associate the signed-in customer and optional game server-side.
- Add length limits, validation, rate limits, and spam protection.
- Avoid accepting arbitrary executable attachments.
- Add feedback status and internal admin notes.
- Expose protected admin endpoints for triage and status updates.
- Notify the appropriate support channel without exposing sensitive data.
- Define retention and deletion behavior.

## Optional public reviews

If public reviews are later required, add moderation states, reporting, spoiler
handling, edit history, and appeal rules before publishing customer content.

## Exit criteria

- Feedback cannot expose another customer's identity.
- Abuse controls and moderation workflows are operational.
- Customers receive a reference they can use for support.
- Admin actions are authorized and audited.
