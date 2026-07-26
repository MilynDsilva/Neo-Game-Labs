import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { WalletPanel } from './wallet-panel';

let authenticated = true;
const refreshAccount = vi.fn().mockResolvedValue(undefined);

vi.mock('./auth-provider', () => ({
  useAuth: () => ({
    authenticated,
    loading: false,
    refresh: refreshAccount,
  }),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status,
  });
}

afterEach(() => {
  authenticated = true;
  refreshAccount.mockClear();
  vi.unstubAllGlobals();
  window.Razorpay = undefined;
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

  it('refreshes the shared account balance after a verified top-up', async () => {
    let completeCheckout:
      | ((result: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => void)
      | undefined;
    const packages = {
      packages: [
        {
          amountMinor: 50_000,
          code: 'inr-550-v1',
          currency: 'INR',
          points: 550,
        },
      ],
      topUpsEnabled: true,
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ balance: 100, transactions: [] }))
      .mockResolvedValueOnce(jsonResponse(packages))
      .mockResolvedValueOnce(
        jsonResponse({
          amount: 50_000,
          currency: 'INR',
          description: '550 Neo Game Labs points',
          keyId: 'rzp_test_key',
          name: 'Neo Game Labs',
          orderId: 'order_test',
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ balance: 650, credited: true, points: 550 }),
      )
      .mockResolvedValueOnce(jsonResponse({ balance: 650, transactions: [] }))
      .mockResolvedValueOnce(jsonResponse(packages));
    vi.stubGlobal('fetch', fetchMock);
    window.Razorpay = class {
      constructor(options: { handler: typeof completeCheckout }) {
        completeCheckout = options.handler;
      }

      open() {}
    };

    render(<WalletPanel />);

    fireEvent.click(
      await screen.findByRole('button', { name: /Continue to checkout/ }),
    );
    await waitFor(() => expect(completeCheckout).toBeDefined());
    completeCheckout?.({
      razorpay_order_id: 'order_test',
      razorpay_payment_id: 'payment_test',
      razorpay_signature: 'signature_test',
    });

    expect(
      await screen.findByRole('dialog', { name: 'Points acquired' }),
    ).toBeInTheDocument();
    expect(screen.getByText('+550')).toBeInTheDocument();
    await waitFor(() => expect(refreshAccount).toHaveBeenCalledOnce());
  });
});
