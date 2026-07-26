import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AccountPanel } from './account-panel';

const refresh = vi.fn();
const signOut = vi.fn();

vi.mock('./auth-provider', () => ({
  useAuth: () => ({
    authenticated: true,
    customer: {
      displayName: 'Nova Player',
      email: 'nova@example.com',
      id: 'customer-id',
      pointsBalance: 150,
    },
    loading: false,
    refresh,
    signOut,
  }),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status,
  });
}

const sessionsResponse = {
  sessions: [
    {
      current: true,
      expiresAt: '2026-08-26T08:30:00.000Z',
      id: 'current-session',
      lastUsedAt: '2026-07-26T08:30:00.000Z',
      userAgent: 'Chrome on macOS',
    },
    {
      current: false,
      expiresAt: '2026-08-20T10:00:00.000Z',
      id: 'other-session',
      lastUsedAt: '2026-07-20T10:00:00.000Z',
      userAgent: 'Safari on iPhone',
    },
  ],
};

beforeEach(() => {
  refresh.mockReset();
  signOut.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AccountPanel', () => {
  it('separates account areas and presents readable session details', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(sessionsResponse)),
    );

    render(<AccountPanel />);

    expect(
      screen.getByRole('heading', { name: 'Your player identity' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Wallet balance' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Active sessions' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Chrome on macOS')).toBeInTheDocument();
    expect(screen.getAllByText(/Last used/)).toHaveLength(2);
  });

  it('reports session revocation success and removes the revoked device', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(sessionsResponse))
      .mockResolvedValueOnce(jsonResponse({ success: true }));
    vi.stubGlobal('fetch', fetchMock);

    render(<AccountPanel />);
    await screen.findByText('Safari on iPhone');
    fireEvent.click(screen.getByRole('button', { name: 'Revoke' }));

    expect(
      await screen.findByText('The selected session has been revoked.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Safari on iPhone')).not.toBeInTheDocument();
  });

  it('requires the exact deletion confirmation and reports API failure', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ sessions: [] }))
      .mockResolvedValueOnce(jsonResponse({ message: 'failed' }, 500));
    vi.stubGlobal('fetch', fetchMock);

    render(<AccountPanel />);
    await screen.findByText('No active sessions were found.');
    fireEvent.click(
      screen.getByRole('button', { name: 'Request account deletion' }),
    );

    const confirmButton = screen.getByRole('button', {
      name: 'Permanently delete my account',
    });
    expect(confirmButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/Type DELETE to confirm/), {
      target: { value: 'DELETE' },
    });
    expect(confirmButton).toBeEnabled();
    fireEvent.click(confirmButton);

    expect(
      await screen.findByText(
        'Account deletion could not be requested. Please try again.',
      ),
    ).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });
});
