import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { WalletPanel } from './wallet-panel';

let authenticated = true;

vi.mock('./auth-provider', () => ({
  useAuth: () => ({ authenticated, loading: false }),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status,
  });
}

afterEach(() => {
  authenticated = true;
  vi.unstubAllGlobals();
});

describe('WalletPanel', () => {
  it('shows a dedicated sign-in state without requesting wallet data', () => {
    authenticated = false;
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(<WalletPanel />);

    expect(screen.getByText(/to view your points wallet/)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('clearly presents paused top-ups and an empty ledger', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse({ balance: 100, transactions: [] }))
        .mockResolvedValueOnce(
          jsonResponse({
            packages: [
              {
                amountMinor: 10_000,
                code: 'inr-100-v1',
                currency: 'INR',
                points: 100,
              },
            ],
            topUpsEnabled: false,
          }),
        ),
    );

    render(<WalletPanel />);

    expect(await screen.findAllByText('100 points')).toHaveLength(2);
    expect(
      screen.getByText(/Payments are paused while we select/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Currently unavailable' }),
    ).toBeDisabled();
    expect(screen.getByText(/No transactions yet/)).toBeInTheDocument();
  });

  it('separates service failure from authentication state', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ message: 'failed' }, 500)),
    );

    render(<WalletPanel />);

    expect(
      await screen.findByText('Your wallet could not be loaded.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Try again' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Sign in to view/)).not.toBeInTheDocument();
  });
});
