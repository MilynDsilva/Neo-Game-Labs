# Launch Operations Runbook

This is the minimum operational checklist for staging and production. A public
launch must not proceed while an item marked **owner required** has no named
person.

## Service targets

- Customer web and catalog API: 99.9% monthly availability.
- Authenticated purchase and entitlement API: 99.9% monthly availability.
- API latency: 95% of catalog and authenticated reads below 500 ms.
- Alerts: readiness unavailable for 5 minutes, HTTP 5xx above 2% for 5 minutes,
  or payment webhook failures above zero for 10 minutes.

Health probes:

- Liveness: `GET /v1/health`
- Readiness, including MongoDB: `GET /v1/health/ready`

## Kill switches

The API reads these environment variables at startup:

- `TOP_UPS_ENABLED=false` blocks new checkout sessions. Keep it false until a
  compliant payment provider is approved.
- `POINT_PURCHASES_ENABLED=false` blocks new points purchases.
- `DOWNLOADS_ENABLED=false` blocks download listing, grants, and delivery.

Disabling checkout must not disable payment webhooks: outstanding provider
events still need reconciliation.

## Deployment and rollback

1. Deploy the immutable tested revision to staging.
2. Verify liveness, readiness, security headers, sign-in, catalog, purchase,
   library, download, and feedback journeys.
3. Record the release revision and database migration or index changes.
4. Deploy the same revision to production with top-ups disabled.
5. Watch error rate, latency, and readiness for at least 30 minutes.
6. Roll back application containers to the previous recorded revision if
   thresholds breach. Do not roll back financial database records.

## Backup and restoration

- **Owner required:** database operations.
- Configure encrypted MongoDB backups at least daily with a 30-day retention.
- Perform a quarterly restoration into an isolated environment.
- Record backup timestamp, restored record counts, duration, and reviewer.
- Never restore production customer data into developer laptops.

## Incident response

1. Disable the affected write path with its kill switch.
2. Preserve request IDs, deployment revision, provider event IDs, and relevant
   timestamps without copying secrets or full session tokens.
3. Assign an incident lead and customer-communications owner.
4. Reconcile wallet and payment records before re-enabling financial writes.
5. Publish an internal timeline and follow-up actions.

## Required owners before launch

- **Owner required:** security incidents
- **Owner required:** payments, reconciliation, refunds, and chargebacks
- **Owner required:** customer support and feedback triage
- **Owner required:** game releases and withdrawal
- **Owner required:** infrastructure, alerts, backups, and restoration

## External launch blockers

- Complete legal and tax review for points, privacy, cookies, terms, refunds,
  expiry, acceptable use, and India-specific payment requirements.
- Select and verify a compliant production payment provider.
- Configure DNS, TLS, production OAuth, transactional email authentication,
  monitoring, and encrypted artifact storage.
- Complete staging load, accessibility, browser/device, backup restoration, and
  incident-response rehearsals.
