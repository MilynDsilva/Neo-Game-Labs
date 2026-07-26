# Staging Deployment

The repository produces vendor-neutral OCI images for the customer web
application, admin dashboard, and API. Choose a hosting provider only after
confirming its region, cost, managed TLS, private networking, health-probe,
secret-management, and rollback support.

## Images

Build from the repository root:

```bash
docker build -f apps/api/Dockerfile -t neogamelabs-api:staging .
docker build -f apps/admin/Dockerfile -t neogamelabs-admin:staging .
docker build \
  -f apps/web/Dockerfile \
  --build-arg API_URL=https://api-staging.neogamelabs.com \
  --build-arg NEXT_PUBLIC_API_URL=https://api-staging.neogamelabs.com \
  --build-arg NEXT_PUBLIC_SITE_URL=https://staging.neogamelabs.com \
  -t neogamelabs-web:staging .
```

All containers run as non-root users and expose Docker health checks. The web
and admin images are minimal Next.js standalone runtimes.

## Required staging services

- A MongoDB replica set, preferably a managed staging cluster with encrypted
  backups. Never share the production database.
- HTTPS hostnames for web and API.
- A staging-only Google OAuth client.
- Secret storage supplied by the host, never committed environment files.
- Persistent private object storage before testing real game builds. The API
  image contains only the harmless local demo artifact.

## API runtime environment

Required:

- `NODE_ENV=production`
- `PORT=4000` unless the host injects another value
- `WEB_ORIGIN=https://staging.neogamelabs.com`
- `ADMIN_ORIGIN=https://admin-staging.neogamelabs.com`
- `ADMIN_API_KEY=<staging-only-random-secret>`
- `MONGODB_URI=<staging replica-set URI>`
- `GOOGLE_CLIENT_ID=<staging client>`
- `GOOGLE_CLIENT_SECRET=<secret>`
- `GOOGLE_CALLBACK_URL=https://api-staging.neogamelabs.com/v1/auth/google/callback`
- `RAZORPAY_KEY_ID=<staging-test-key-id>` when testing top-ups
- `RAZORPAY_KEY_SECRET=<staging-test-key-secret>` when testing top-ups
- `RAZORPAY_WEBHOOK_SECRET=<staging-webhook-secret>` when testing top-ups

Safety defaults:

- `TOP_UPS_ENABLED=false`
- `POINT_PURCHASES_ENABLED=true`
- `DOWNLOADS_ENABLED=true` only while using approved staging artifacts

Leave Razorpay variables unset and `TOP_UPS_ENABLED=false` while payments are
paused. When staging top-ups are approved, use test-mode credentials, enable
automatic capture in Razorpay, and configure
`https://api-staging.neogamelabs.com/v1/payments/razorpay/webhook` for
`payment.captured` and `payment.failed`.

## Web build environment

The three web URLs are build-time inputs because browser-visible values and the
content security policy are compiled into the image:

- `API_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SITE_URL`

Rebuild the web image when any hostname changes.

## Admin runtime environment

- `API_URL=https://api-staging.neogamelabs.com`
- `ADMIN_API_KEY=<same-staging-only-random-secret-as-api>`
- `ADMIN_DASHBOARD_USERNAME=<staging-operator>`
- `ADMIN_DASHBOARD_PASSWORD=<strong-staging-only-password>`
- `ADMIN_ACTOR=<operator-or-service-name>`

Keep the admin hostname private or access-controlled at the hosting layer in
addition to the dashboard's built-in authentication.

## Acceptance

1. Confirm `/v1/health` and `/v1/health/ready`.
2. Confirm the web response contains the expected security headers.
3. Seed only approved staging catalog data.
4. Complete sign-in, catalog, purchase, library, download, and feedback smoke
   tests.
5. Record the image digests and exercise rollback to the previous digest.
6. Configure monitoring and complete the backup restoration exercise from the
   launch runbook before inviting external testers.
