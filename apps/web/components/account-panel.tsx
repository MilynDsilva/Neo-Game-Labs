'use client';

import { authStatusSchema, type AuthStatus } from '@neogamelabs/contracts';
import { useEffect, useState } from 'react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type CustomerSession = {
  current: boolean;
  expiresAt: string;
  id: string;
  lastUsedAt?: string;
  userAgent: string;
};

export function AccountPanel() {
  const [status, setStatus] = useState<AuthStatus>();
  const [sessions, setSessions] = useState<CustomerSession[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    void fetch(`${apiUrl}/v1/auth/me`, { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Account request failed');
        const nextStatus = authStatusSchema.parse(await response.json());
        setStatus(nextStatus);
        if (nextStatus.authenticated) {
          const sessionResponse = await fetch(`${apiUrl}/v1/auth/sessions`, {
            credentials: 'include',
          });
          if (sessionResponse.ok) {
            const data = (await sessionResponse.json()) as {
              sessions: CustomerSession[];
            };
            setSessions(data.sessions);
          }
        }
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

  async function revokeSession(session: CustomerSession) {
    const response = await fetch(
      `${apiUrl}/v1/auth/sessions/${encodeURIComponent(session.id)}`,
      { credentials: 'include', method: 'DELETE' },
    );
    if (!response.ok) return;
    if (session.current) {
      setStatus({ authenticated: false });
    } else {
      setSessions((current) =>
        current.filter((item) => item.id !== session.id),
      );
    }
  }

  async function exportData() {
    const response = await fetch(`${apiUrl}/v1/auth/export`, {
      credentials: 'include',
    });
    if (!response.ok) return;
    const blob = new Blob([JSON.stringify(await response.json(), null, 2)], {
      type: 'application/json',
    });
    const link = document.createElement('a');
    link.download = 'neo-game-labs-account.json';
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function requestDeletion() {
    if (
      !window.confirm(
        'Request account deletion? You will be signed out immediately.',
      )
    ) {
      return;
    }
    const response = await fetch(`${apiUrl}/v1/auth/deletion-request`, {
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
      <section className="session-section">
        <h3>Active sessions</h3>
        {sessions.map((session) => (
          <div className="session-row" key={session.id}>
            <div>
              <strong>
                {session.current ? 'This device' : 'Other device'}
              </strong>
              <small>{session.userAgent}</small>
            </div>
            <button onClick={() => void revokeSession(session)} type="button">
              Revoke
            </button>
          </div>
        ))}
      </section>
      <div className="account-actions">
        <button onClick={() => void exportData()} type="button">
          Export my data
        </button>
        <button
          className="danger-button"
          onClick={() => void requestDeletion()}
          type="button"
        >
          Request account deletion
        </button>
      </div>
      <button onClick={() => void signOut()} type="button">
        Sign out
      </button>
    </div>
  );
}
