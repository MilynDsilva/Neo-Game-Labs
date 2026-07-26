# Admin Dashboard Operations

## Scope

`apps/admin` is a separately deployable operations console. It supports:

- platform metrics;
- catalog publication, featured placement, and point-price changes;
- private-feedback triage and internal notes;
- read-only customer and wallet visibility; and
- an audit trail for every catalog or feedback mutation.

It intentionally does not support direct balance editing, deleting customers,
or deleting ledger entries.

## Local configuration

Generate a long random key and place the same value in `apps/api/.env` and
`apps/admin/.env.local`:

```text
ADMIN_API_KEY=<long-random-secret>
```

Configure the admin application's browser authentication only in
`apps/admin/.env.local`:

```text
API_URL=http://localhost:4000
ADMIN_DASHBOARD_USERNAME=admin
ADMIN_DASHBOARD_PASSWORD=<strong-unique-password>
ADMIN_ACTOR=<operator-name>
```

Start MongoDB and the workspace, then open `http://localhost:3100`.

## Security model

- Browser access is protected with HTTP Basic authentication over the admin
  application's deployment boundary.
- Admin API authorization uses a separate server-only `x-admin-key`.
- The admin API key is never included in browser JavaScript.
- Customer Google sessions cannot authorize `/v1/admin/*`.
- Mutation requests record the configured actor, action, target, timestamp,
  and a non-sensitive change summary.
- Production must use HTTPS and separate secrets for each environment.
- Rotate both credentials immediately if either is disclosed.

## Rollback

The admin application can be disabled without affecting the customer site.
Remove `ADMIN_API_KEY` from the API environment to make every admin endpoint
return unavailable. Catalog and feedback changes remain in MongoDB and their
audit records remain available.
