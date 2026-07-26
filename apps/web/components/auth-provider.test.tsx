import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider, useAuth } from './auth-provider';

function AuthProbe() {
  const { authenticated, customer, error, loading, signOut } = useAuth();
  return (
    <div>
      <span>
        {loading ? 'loading' : authenticated ? customer?.displayName : 'guest'}
      </span>
      {error ? <span>{error}</span> : null}
      <button onClick={() => void signOut()} type="button">
        Sign out
      </button>
    </div>
  );
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status,
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AuthProvider', () => {
  it('loads a signed-in customer and clears them after sign-out', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          authenticated: true,
          customer: {
            displayName: 'Neo Player',
            email: 'player@example.com',
            id: 'customer-id',
            pointsBalance: 420,
          },
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    expect(screen.getByText('loading')).toBeInTheDocument();
    expect(await screen.findByText('Neo Player')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(await screen.findByText('guest')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining('/v1/auth/sign-out'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('represents a guest or expired session without an error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ authenticated: false })),
    );

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    expect(await screen.findByText('guest')).toBeInTheDocument();
  });

  it('retains the customer and reports a failed sign-out', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          jsonResponse({
            authenticated: true,
            customer: {
              displayName: 'Neo Player',
              email: 'player@example.com',
              id: 'customer-id',
              pointsBalance: 420,
            },
          }),
        )
        .mockResolvedValueOnce(jsonResponse({ message: 'failed' }, 500)),
    );

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Sign out' }));
    await waitFor(() =>
      expect(
        screen.getByText('Sign out failed. Please try again.'),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText('Neo Player')).toBeInTheDocument();
  });
});
