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
    const checkout = new URLSearchParams(window.location.search).get(
      'checkout',
    );
    if (checkout === 'success') {
      setCheckoutNotice(
        'Payment received. Your balance updates after provider confirmation.',
      );
    } else if (checkout === 'cancelled') {
      setCheckoutNotice('Checkout was cancelled. You were not charged.');
    }
  }, []);

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
        return;
      }
      const data = (await response.json()) as { url: string };
      window.location.assign(data.url);
    } catch {
      setCheckoutError('Checkout could not be started. Check your connection.');
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
                    ? 'Opening checkout…'
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
