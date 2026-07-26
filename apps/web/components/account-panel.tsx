'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from './auth-provider';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type CustomerSession = {
  current: boolean;
  expiresAt: string;
  id: string;
  lastUsedAt?: string;
  userAgent: string;
};

type Notice = {
  message: string;
  tone: 'error' | 'success';
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function AccountPanel() {
  const { authenticated, customer, error, loading, refresh, signOut } =
    useAuth();
  const [sessions, setSessions] = useState<CustomerSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string>();
  const [busyAction, setBusyAction] = useState<string>();
  const [notice, setNotice] = useState<Notice>();
  const [deletionOpen, setDeletionOpen] = useState(false);
  const [deletionConfirmation, setDeletionConfirmation] = useState('');

  const loadSessions = useCallback(async () => {
    setSessionsError(undefined);
    setSessionsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/v1/auth/sessions`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Session request failed');
      const data = (await response.json()) as {
        sessions: CustomerSession[];
      };
      setSessions(data.sessions);
    } catch {
      setSessionsError('Active sessions could not be loaded.');
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authenticated) {
      setSessions([]);
      return;
    }
    void loadSessions();
  }, [authenticated, loadSessions]);

  async function revokeSession(session: CustomerSession) {
    setNotice(undefined);
    setBusyAction(`session-${session.id}`);
    try {
      const response = await fetch(
        `${apiUrl}/v1/auth/sessions/${encodeURIComponent(session.id)}`,
        { credentials: 'include', method: 'DELETE' },
      );
      if (!response.ok) throw new Error('Session revocation failed');

      if (session.current) {
        setNotice({
          message: 'This device has been signed out.',
          tone: 'success',
        });
        await refresh();
      } else {
        setSessions((current) =>
          current.filter((item) => item.id !== session.id),
        );
        setNotice({
          message: 'The selected session has been revoked.',
          tone: 'success',
        });
      }
    } catch {
      setNotice({
        message: 'That session could not be revoked. Please try again.',
        tone: 'error',
      });
    } finally {
      setBusyAction(undefined);
    }
  }

  async function exportData() {
    setNotice(undefined);
    setBusyAction('export');
    try {
      const response = await fetch(`${apiUrl}/v1/auth/export`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = new Blob([JSON.stringify(await response.json(), null, 2)], {
        type: 'application/json',
      });
      const link = document.createElement('a');
      link.download = 'neo-game-labs-account.json';
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
      setNotice({
        message: 'Your account-data download has started.',
        tone: 'success',
      });
    } catch {
      setNotice({
        message: 'Your account data could not be exported. Please try again.',
        tone: 'error',
      });
    } finally {
      setBusyAction(undefined);
    }
  }

  async function requestDeletion() {
    if (deletionConfirmation !== 'DELETE') return;

    setNotice(undefined);
    setBusyAction('delete');
    try {
      const response = await fetch(`${apiUrl}/v1/auth/deletion-request`, {
        credentials: 'include',
        method: 'POST',
      });
      if (!response.ok) throw new Error('Deletion request failed');
      setNotice({
        message: 'Your account deletion request has been accepted.',
        tone: 'success',
      });
      await refresh();
    } catch {
      setNotice({
        message: 'Account deletion could not be requested. Please try again.',
        tone: 'error',
      });
    } finally {
      setBusyAction(undefined);
    }
  }

  async function handleSignOut() {
    setNotice(undefined);
    setBusyAction('sign-out');
    if (await signOut()) {
      setNotice({ message: 'You have been signed out.', tone: 'success' });
    } else {
      setNotice({
        message: 'Sign out failed. Please try again.',
        tone: 'error',
      });
    }
    setBusyAction(undefined);
  }

  if (error) {
    return (
      <div className="empty-state" role="alert">
        <p>{error}</p>
        <button onClick={() => void refresh()} type="button">
          Try again
        </button>
      </div>
    );
  }
  if (loading) {
    return <p className="empty-state">Loading your account…</p>;
  }
  if (!authenticated || !customer) {
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
    <div className="account-sections">
      {notice ? (
        <p
          className={
            notice.tone === 'success' ? 'account-notice' : 'form-error'
          }
          role={notice.tone === 'error' ? 'alert' : 'status'}
        >
          {notice.message}
        </p>
      ) : null}

      <section className="account-card" aria-labelledby="profile-heading">
        <div>
          <p className="eyebrow">Profile</p>
          <h2 id="profile-heading">Your player identity</h2>
        </div>
        <div className="account-identity">
          {customer.pictureUrl ? (
            <img alt="" src={customer.pictureUrl} />
          ) : null}
          <div>
            <strong>{customer.displayName}</strong>
            <p>{customer.email}</p>
          </div>
        </div>
      </section>

      <section className="account-card" aria-labelledby="points-heading">
        <div className="account-balance">
          <div>
            <p className="eyebrow">Points</p>
            <h2 id="points-heading">Wallet balance</h2>
          </div>
          <strong>{customer.pointsBalance}</strong>
        </div>
        <p>
          Use points to add paid games to your library.{' '}
          <Link className="text-link" href="/wallet">
            View wallet activity
          </Link>
        </p>
      </section>

      <section
        className="account-card session-section"
        aria-labelledby="sessions-heading"
      >
        <div>
          <p className="eyebrow">Security</p>
          <h2 id="sessions-heading">Active sessions</h2>
          <p>
            Review devices signed in to your account and revoke any you do not
            recognise.
          </p>
        </div>
        {sessionsLoading ? <p>Loading active sessions…</p> : null}
        {sessionsError ? (
          <div className="inline-error" role="alert">
            <p>{sessionsError}</p>
            <button onClick={() => void loadSessions()} type="button">
              Try again
            </button>
          </div>
        ) : null}
        {!sessionsLoading && !sessionsError && sessions.length === 0 ? (
          <p>No active sessions were found.</p>
        ) : null}
        {sessions.map((session) => (
          <div className="session-row" key={session.id}>
            <div>
              <strong>
                {session.current ? 'This device' : 'Other device'}
              </strong>
              <small>{session.userAgent}</small>
              <small>
                Last used {formatDate(session.lastUsedAt ?? session.expiresAt)}
                {' · '}Expires {formatDate(session.expiresAt)}
              </small>
            </div>
            <button
              disabled={busyAction === `session-${session.id}`}
              onClick={() => void revokeSession(session)}
              type="button"
            >
              {busyAction === `session-${session.id}`
                ? 'Revoking…'
                : session.current
                  ? 'Sign out device'
                  : 'Revoke'}
            </button>
          </div>
        ))}
      </section>

      <section className="account-card" aria-labelledby="data-heading">
        <div>
          <p className="eyebrow">Your data</p>
          <h2 id="data-heading">Download account data</h2>
          <p>Save a JSON copy of your profile and account activity.</p>
        </div>
        <div className="account-actions">
          <button
            disabled={busyAction === 'export'}
            onClick={() => void exportData()}
            type="button"
          >
            {busyAction === 'export' ? 'Preparing export…' : 'Export my data'}
          </button>
        </div>
      </section>

      <section
        className="account-card danger-zone"
        aria-labelledby="deletion-heading"
      >
        <div>
          <p className="eyebrow">Danger zone</p>
          <h2 id="deletion-heading">Delete account</h2>
          <p>
            Request permanent account deletion. You will be signed out
            immediately while the request is processed.
          </p>
        </div>
        {deletionOpen ? (
          <div className="deletion-confirmation">
            <label htmlFor="deletion-confirmation">
              Type <strong>DELETE</strong> to confirm
            </label>
            <input
              autoComplete="off"
              id="deletion-confirmation"
              onChange={(event) => setDeletionConfirmation(event.target.value)}
              value={deletionConfirmation}
            />
            <div className="account-actions">
              <button
                className="danger-button"
                disabled={
                  deletionConfirmation !== 'DELETE' || busyAction === 'delete'
                }
                onClick={() => void requestDeletion()}
                type="button"
              >
                {busyAction === 'delete'
                  ? 'Requesting deletion…'
                  : 'Permanently delete my account'}
              </button>
              <button
                onClick={() => {
                  setDeletionOpen(false);
                  setDeletionConfirmation('');
                }}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className="danger-button"
            onClick={() => setDeletionOpen(true)}
            type="button"
          >
            Request account deletion
          </button>
        )}
      </section>

      <button
        className="account-sign-out"
        disabled={busyAction === 'sign-out'}
        onClick={() => void handleSignOut()}
        type="button"
      >
        {busyAction === 'sign-out' ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  );
}
