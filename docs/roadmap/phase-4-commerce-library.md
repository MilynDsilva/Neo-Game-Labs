# Phase 4: Commerce, Entitlements, and Downloads

## Goal

Allow customers to purchase games and securely access the products they own.

## Purchase flow

- Display localized price and tax behavior clearly.
- Create checkout sessions on the backend using authoritative product prices.
- Redirect customers to hosted checkout.
- Verify signed payment webhooks.
- Process webhooks idempotently.
- Record orders and grant entitlements only after confirmed payment.
- Provide success, cancellation, pending-payment, and failed-payment states.
- Send transactional purchase receipts.
- Support refunds and revoke or retain entitlements according to policy.

## Customer library

- List owned games and their supported releases.
- Show platform, version, release notes, file size, and system requirements.
- Generate short-lived signed download URLs only after entitlement checks.
- Record download events for security and support without excessive tracking.
- Provide external App Store and Google Play links where direct downloads do
  not apply.

## Release security

- Keep binaries in private object storage.
- Publish checksums for downloadable builds.
- Scan uploaded artifacts for malware.
- Restrict release creation and publication to authorized admins.
- Audit release and entitlement changes.
- Define bandwidth limits and abuse alerts.

## Exit criteria

- No client-provided price can change the charged amount.
- Duplicate or delayed webhooks cannot create duplicate orders or entitlements.
- Users cannot download paid games they do not own.
- Payment and download recovery paths are documented and tested.
- Test purchases, refunds, and download authorization work in staging.
