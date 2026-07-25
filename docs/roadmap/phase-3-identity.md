# Phase 3: Customer Identity

## Goal

Allow customers to authenticate safely with Google and manage a minimal
account.

## Tasks

- Configure separate Google OAuth clients for local, staging, and production.
- Implement sign-in, callback, sign-out, and session refresh flows.
- Store the provider account identifier; do not treat an email address alone as
  identity proof.
- Use secure, HTTP-only, same-site cookies and protect state-changing requests.
- Implement customer profile and account settings pages.
- Add account deletion and personal-data export workflows.
- Add session revocation and security-event audit records.
- Define account merging behavior before adding another identity provider.
- Add rate limiting and abuse protection to authentication endpoints.

## Admin boundary

- Customer Google sign-in must not automatically grant admin access.
- Admin authorization must be based on server-side roles.
- Changes to admin roles must be audited.

## Exit criteria

- Authentication flows pass security and failure-path tests.
- A signed-out user cannot access customer-only endpoints.
- A customer cannot call admin endpoints.
- Account deletion and data export follow the approved retention policy.
