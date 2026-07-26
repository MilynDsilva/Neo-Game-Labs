# Architecture Decisions

## Database: MongoDB

MongoDB is the selected primary database for the initial platform. It will
store catalog content, customer accounts, payment records, point-ledger entries,
purchases, entitlements, and feedback.

Use MongoDB Atlas or an equivalently managed replica-set deployment in every
shared environment. A standalone MongoDB server is acceptable only for
non-transactional experimentation; application development and automated tests
must exercise replica-set transactions.

## Financial consistency requirements

Razorpay is the source of truth for whether an INR or USD payment succeeded.
MongoDB is the source of truth for internal points, purchases, and
entitlements. Razorpay does not replace the internal ledger.

Every balance-changing operation must:

- Run in a MongoDB multi-document transaction.
- Use snapshot read concern and majority, journaled write concern where
  supported by the deployment.
- Use a unique idempotency key enforced by a database index.
- Store payment amounts in integer minor units: paise for INR and cents for USD.
  Store points as integers and never use binary floating point values.
- Write immutable ledger entries; corrections use compensating entries.
- Update the cached account balance in the same transaction as its ledger
  entries.
- Prevent a debit when the available balance is insufficient.

Razorpay webhook handlers must verify the signature against the raw request body,
deduplicate event processing, and credit points only after checking the
authoritative payment state.

## Data-model approach

- Use separate collections for payments, ledger transactions, ledger entries,
  purchases, entitlements, and processed webhook events.
- Reference records by immutable identifiers rather than embedding an
  unbounded financial history in the customer document.
- Use schema validation and application-level typed schemas.
- Add unique compound indexes for business invariants such as one entitlement
  per customer and product.
- Treat a displayed balance as a cached projection that can be reconciled
  against immutable ledger entries.
- Keep catalog documents flexible, but version product price and terms used by
  each purchase.

## Currency and points

- Support only `INR` and `USD` at initial launch.
- Use fixed, versioned top-up packages for each currency rather than calculating
  points from a live exchange rate during checkout.
- Keep points currency-neutral after a successful top-up.
- Store the original currency, amount in minor units, applied conversion rule,
  and points granted on every top-up.
- Do not infer the customer's currency from a client-provided value alone.
- Refund through the original payment currency and gateway according to the
  approved refund policy.

## Scale strategy

Begin with a single replica set. Do not introduce sharding until measured scale
requires it. If sharding is introduced, keep all records for a balance-changing
transaction on a deliberate shard-key strategy and review cross-shard
transaction behavior before migration.

## References

- [MongoDB transactions](https://www.mongodb.com/docs/manual/core/transactions/)
- [MongoDB read concern](https://www.mongodb.com/docs/manual/reference/read-concern/)
- [MongoDB write concern](https://www.mongodb.com/docs/manual/reference/write-concern/)
- [MongoDB monetary data](https://www.mongodb.com/docs/manual/tutorial/model-monetary-data/)
- [Razorpay webhook handling](https://razorpay.com/docs/webhooks/)
