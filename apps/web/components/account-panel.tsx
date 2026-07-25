'use client';

import { authStatusSchema, type AuthStatus } from '@neogamelabs/contracts';
import { useEffect, useState } from 'react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function AccountPanel() {
  const [status, setStatus] = useState<AuthStatus>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    void fetch(`${apiUrl}/v1/auth/me`, { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Account request failed');
        setStatus(authStatusSchema.parse(await response.json()));
      })
      .catch(() => setFailed(true));
  }, []);

  async function signOut() {
    const response = await fetch(`${apiUrl}/v1/auth/sign-out`, {
      credentials: 'include',
      method: 'POST',
    });
    if (response.ok) setStatus({ authenticated: false });
  }

  if (failed) {
    return <p className="empty-state">Account services are unavailable.</p>;
  }
  if (!status) {
    return <p className="empty-state">Loading your account…</p>;
  }
  if (!status.authenticated) {
    return (
      <div className="account-card">
        <h2>Sign in to continue</h2>
        <p>
          Use your Google account to create your Neo Game Labs customer profile.
        </p>
        <a className="button-link" href={`${apiUrl}/v1/auth/google`}>
          Continue with Google
        </a>
      </div>
    );
  }

  return (
    <div className="account-card">
      <div className="account-identity">
        {status.customer.pictureUrl ? (
          <img alt="" src={status.customer.pictureUrl} />
        ) : null}
        <div>
          <h2>{status.customer.displayName}</h2>
          <p>{status.customer.email}</p>
        </div>
      </div>
      <div className="account-balance">
        <span>Points balance</span>
        <strong>{status.customer.pointsBalance}</strong>
      </div>
      <button onClick={() => void signOut()} type="button">
        Sign out
      </button>
    </div>
  );
}
