# Phase 4: Credits, Purchases, and Customer Library

## Goal

Allow signed-in customers to top up points with INR, spend points on Neo Game
Labs products, and securely access purchased games.

## Points rules

- Start with the proposed conversion of ₹1 = 1 point.
- Store points as whole integers and INR in paise.
- Do not allow customer-to-customer transfers or cash withdrawal.
- Allow points to be used only for products sold directly by Neo Game Labs.
- Publish clear terms for expiry, refunds, chargebacks, and account closure.
- Show purchased, promotional, refunded, expired, and available amounts
  separately if promotional points are introduced.

## Top-up flow

- Offer predefined or policy-compliant custom INR amounts.
- Create a server-side top-up order before hosted checkout.
- Verify the gateway's signed webhook and authoritative payment status.
- Process every webhook idempotently.
- Store Stripe event IDs behind a unique MongoDB index so concurrent or retried
  delivery cannot process the same event twice.
- Credit points exactly once after confirmed payment.
- Never credit points based only on the browser redirect or client response.
- Provide pending, successful, failed, and reversed top-up states.
- Issue the appropriate receipt or invoice.

## Ledger and balance integrity

- Use balanced debit and credit entries in an append-only ledger.
- Derive or reconcile displayed balances against the ledger.
- Require idempotency keys for every balance-changing operation.
- Execute ledger entries, cached balance changes, purchases, and entitlements
  in MongoDB multi-document transactions.
- Use transaction-level snapshot reads and majority, journaled writes for
  financial changes.
- Never edit or delete financial entries; post compensating transactions.
- Prevent negative available balances inside the database transaction.
- Record actor, reason, correlation ID, and related payment or purchase.
- Reconcile payment-gateway settlements and internal credits automatically.

## Purchase flow

- Read the authoritative point price from the backend.
- Atomically debit points, create the purchase, and grant entitlements.
- Return the existing purchase for a repeated idempotent request.
- Show insufficient-balance and top-up paths without partial purchases.
- Record the exact product, point price, and terms snapshot used at purchase.
- Support admin-approved refunds through compensating ledger entries.

## Customer library and downloads

- List purchased games and their supported releases.
- Show platform, version, release notes, file size, and system requirements.
- Generate a short-lived download URL only after an entitlement check.
- Record download history for convenience, abuse detection, and support.
- Use external App Store or Google Play purchase links when those stores control
  the transaction; do not attempt to replace their billing rules.

## Release security

- Keep binaries in private object storage.
- Publish checksums for downloadable builds.
- Scan uploaded artifacts for malware.
- Restrict release creation and publication to authorized admins.
- Audit release and publication changes.
- Define bandwidth limits and abuse alerts.

## Exit criteria

- Duplicate or delayed payment webhooks cannot credit points twice.
- Concurrent purchases cannot overspend a customer's balance.
- Ledger entries balance and reconciliation detects discrepancies.
- No client-provided top-up amount, payment status, or product price is trusted.
- A customer cannot download a paid game without an entitlement.
- Top-up, purchase, refund, chargeback, and download flows pass in staging.
