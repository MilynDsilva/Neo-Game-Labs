'use client';

import {
  topUpPackagesResponseSchema,
  walletResponseSchema,
  type TopUpPackage,
  type WalletResponse,
} from '@neogamelabs/contracts';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from './auth-provider';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const currencyFormatters = {
  INR: new Intl.NumberFormat('en-IN', { currency: 'INR', style: 'currency' }),
  USD: new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' }),
};

type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  amount: number;
  currency: string;
  description: string;
  handler: (response: RazorpaySuccess) => void;
  key: string;
  modal: { ondismiss: () => void };
  name: string;
  order_id: string;
  theme: { color: string };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

let razorpayScript: Promise<void> | undefined;

function loadRazorpayCheckout(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (razorpayScript) return razorpayScript;

  razorpayScript = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('Razorpay Checkout failed to load'));
    document.head.appendChild(script);
  });
  return razorpayScript;
}

export function WalletPanel() {
  const { authenticated, loading: authLoading } = useAuth();
  const [wallet, setWallet] = useState<WalletResponse>();
  const [packages, setPackages] = useState<TopUpPackage[]>([]);
  const [topUpsEnabled, setTopUpsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serviceError, setServiceError] = useState<string>();
  const [checkoutError, setCheckoutError] = useState<string>();
  const [checkoutPackage, setCheckoutPackage] = useState<string>();
  const [checkoutNotice, setCheckoutNotice] = useState<string>();
  const [reward, setReward] = useState<{
    balance: number;
    points: number;
  }>();

  const loadWallet = useCallback(async () => {
    if (!authenticated) return;
    setLoading(true);
    setServiceError(undefined);
    try {
      const [walletResponse, packagesResponse] = await Promise.all([
        fetch(`${apiUrl}/v1/wallet`, { credentials: 'include' }),
        fetch(`${apiUrl}/v1/wallet/top-up-packages`),
      ]);
      if (!walletResponse.ok || !packagesResponse.ok) {
        throw new Error('Wallet request failed');
      }
      const packageData = topUpPackagesResponseSchema.parse(
        await packagesResponse.json(),
      );
      setWallet(walletResponseSchema.parse(await walletResponse.json()));
      setPackages(packageData.packages);
      setTopUpsEnabled(packageData.topUpsEnabled);
    } catch {
      setServiceError('Your wallet could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [authenticated]);

  useEffect(() => {
    if (!authLoading && authenticated) void loadWallet();
  }, [authLoading, authenticated, loadWallet]);

  async function beginCheckout(packageCode: string) {
    setCheckoutError(undefined);
    setCheckoutPackage(packageCode);
    try {
      const response = await fetch(`${apiUrl}/v1/payments/checkout`, {
        body: JSON.stringify({
          checkoutRequestKey: crypto.randomUUID(),
          packageCode,
        }),
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      });
      if (!response.ok) {
        setCheckoutError(
          response.status === 503
            ? 'Point top-ups are currently paused.'
            : 'Checkout could not be started. Please try again.',
        );
        setCheckoutPackage(undefined);
        return;
      }
      const order = (await response.json()) as {
        amount: number;
        currency: string;
        description: string;
        keyId: string;
        name: string;
        orderId: string;
      };
      await loadRazorpayCheckout();
      if (!window.Razorpay) throw new Error('Razorpay Checkout unavailable');

      const checkout = new window.Razorpay({
        amount: order.amount,
        currency: order.currency,
        description: order.description,
        handler: (result) => {
          void verifyCheckout(result);
        },
        key: order.keyId,
        modal: {
          ondismiss: () => {
            setCheckoutPackage(undefined);
            setCheckoutNotice('Checkout was closed. No points were credited.');
          },
        },
        name: order.name,
        order_id: order.orderId,
        theme: { color: '#9b7cff' },
      });
      checkout.open();
    } catch {
      setCheckoutError('Checkout could not be started. Check your connection.');
      setCheckoutPackage(undefined);
    }
  }

  async function verifyCheckout(result: RazorpaySuccess) {
    try {
      const response = await fetch(`${apiUrl}/v1/payments/razorpay/verify`, {
        body: JSON.stringify({
          orderId: result.razorpay_order_id,
          paymentId: result.razorpay_payment_id,
          signature: result.razorpay_signature,
        }),
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Payment verification failed');
      }
      const confirmation = (await response.json()) as {
        balance: number;
        points: number;
      };
      setReward(confirmation);
      setCheckoutNotice(undefined);
      await loadWallet();
    } catch {
      setCheckoutError(
        'Payment was received but confirmation is pending. Do not retry yet.',
      );
    } finally {
      setCheckoutPackage(undefined);
    }
  }

  if (authLoading) {
    return (
      <p className="empty-state" role="status">
        Checking your account…
      </p>
    );
  }
  if (!authenticated) {
    return (
      <p className="empty-state">
        <Link className="text-link" href="/account">
          Sign in
        </Link>{' '}
        to view your points wallet.
      </p>
    );
  }
  if (loading && !wallet) {
    return (
      <p className="empty-state" role="status">
        Loading your wallet…
      </p>
    );
  }
  if (serviceError || !wallet) {
    return (
      <div className="empty-state" role="alert">
        <p>{serviceError ?? 'Your wallet is unavailable.'}</p>
        <button onClick={() => void loadWallet()} type="button">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-layout">
      {reward ? (
        <div
          aria-labelledby="reward-title"
          aria-modal="true"
          className="reward-overlay"
          onKeyDown={(event) => {
            if (event.key === 'Escape') setReward(undefined);
          }}
          role="dialog"
        >
          <div className="reward-dialog">
            <div aria-hidden="true" className="reward-glow" />
            <p className="eyebrow">Top-up complete</p>
            <div aria-hidden="true" className="reward-token">
              N
            </div>
            <h2 id="reward-title">Points acquired</h2>
            <strong className="reward-amount">+{reward.points}</strong>
            <p>
              Your new balance is <strong>{reward.balance} points</strong>.
            </p>
            <button
              autoFocus
              onClick={() => setReward(undefined)}
              type="button"
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}
      {checkoutNotice ? (
        <p className="checkout-notice" role="status">
          {checkoutNotice}
        </p>
      ) : null}
      <section className="wallet-balance">
        <span>Available balance</span>
        <strong>{wallet.balance} points</strong>
      </section>
      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Fixed packages</p>
            <h2>Top up points</h2>
          </div>
          <p>
            {topUpsEnabled
              ? 'Choose a fixed points package.'
              : 'Top-ups are not available during this preview.'}
          </p>
        </div>
        {!topUpsEnabled ? (
          <p className="feature-paused" role="status">
            Payments are paused while we select a compliant provider. You can
            still use points already in your wallet.
          </p>
        ) : null}
        {checkoutError ? (
          <p className="form-error" role="alert">
            {checkoutError}
          </p>
        ) : null}
        <div className="package-grid">
          {packages.map((item) => (
            <article key={item.code}>
              <strong>{item.points} points</strong>
              <span>
                {currencyFormatters[item.currency].format(
                  item.amountMinor / 100,
                )}
              </span>
              <button
                disabled={!topUpsEnabled || checkoutPackage !== undefined}
                onClick={() => void beginCheckout(item.code)}
                type="button"
              >
                {!topUpsEnabled
                  ? 'Currently unavailable'
                  : checkoutPackage === item.code
                    ? 'Checkout in progress…'
                    : 'Continue to checkout'}
              </button>
            </article>
          ))}
        </div>
        <p className="wallet-disclaimer">
          Points can be used only for eligible Neo Game Labs products. They are
          not cash and cannot be transferred between accounts.
        </p>
      </section>
      <section>
        <p className="eyebrow">Ledger</p>
        <h2>Transaction history</h2>
        {wallet.transactions.length === 0 ? (
          <p className="empty-state">
            No transactions yet. Credits and game purchases will appear here.
          </p>
        ) : (
          <ul className="transaction-list">
            {wallet.transactions.map((transaction) => (
              <li key={transaction.id}>
                <div>
                  <strong>{transaction.type}</strong>
                  <small>
                    {new Date(transaction.createdAt).toLocaleString()}
                  </small>
                </div>
                <strong>
                  {transaction.pointsDelta > 0 ? '+' : ''}
                  {transaction.pointsDelta}
                </strong>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
