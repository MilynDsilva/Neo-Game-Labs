# Razorpay Operations

## Integration

Neo Game Labs uses Razorpay Standard Checkout with server-created Orders.
Amounts and currencies come only from active, versioned top-up packages stored
in MongoDB.

The customer flow is:

1. The API creates a Razorpay Order for an authenticated customer.
2. The browser opens Standard Checkout with that server-issued Order ID.
3. Checkout returns the payment ID, order ID, and signature.
4. The API verifies the HMAC signature using the locally stored Order ID.
5. The API fetches the payment from Razorpay and requires the exact order,
   amount, currency, and `captured` state.
6. The immutable wallet ledger credits points with an idempotency key based on
   the Razorpay Order ID.
7. A signed `payment.captured` webhook provides asynchronous recovery when the
   browser callback is lost or capture is delayed.

## Test setup

Configure these only in ignored environment files or deployment secret
storage:

```text
RAZORPAY_KEY_ID=<test-key-id>
RAZORPAY_KEY_SECRET=<test-key-secret>
RAZORPAY_WEBHOOK_SECRET=<separate-random-webhook-secret>
TOP_UPS_ENABLED=true
```

In the Razorpay test-mode dashboard:

- enable automatic payment capture;
- set the webhook URL to
  `https://<public-api-host>/v1/payments/razorpay/webhook`;
- use the exact `RAZORPAY_WEBHOOK_SECRET` value configured on the API; and
- subscribe to `payment.captured` and `payment.failed`.

Razorpay webhooks require a public HTTPS endpoint. Browser callback
verification can be exercised on localhost, but webhook recovery requires a
staging endpoint or an approved HTTPS tunnel.

To copy the locally generated webhook secret to the clipboard on macOS without
printing it:

```bash
awk -F= '/^RAZORPAY_WEBHOOK_SECRET=/{print substr($0,index($0,"=")+1)}' \
  apps/api/.env | pbcopy
```

## Security and reconciliation

- Never trust a client-provided amount, currency, package price, or payment
  status.
- Never credit an `authorized` payment; require `captured`.
- Verify checkout and webhook signatures with constant-time comparison.
- Use `x-razorpay-event-id` to deduplicate webhook delivery.
- Use the Razorpay Order ID as the ledger idempotency boundary.
- Keep `TOP_UPS_ENABLED=false` during incidents. Webhooks must remain enabled
  so already-started payments can complete safely.
- Reconcile successful Razorpay Orders against succeeded local payments and
  committed `top-up` ledger transactions.

## Rotation and launch

Rotate any key secret exposed in chat, logs, screenshots, or source control.
Test keys cannot process live payments. Before production:

1. Complete Razorpay business verification and settlement setup.
2. Generate separate live credentials in secret storage.
3. Configure a unique production webhook secret.
4. Complete India-specific legal, tax, refund, and points-term review.
5. Run successful, failed, delayed-capture, duplicate-webhook, and callback-loss
   tests.
