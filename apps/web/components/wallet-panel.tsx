'use client';

import {
  topUpPackagesResponseSchema,
  walletResponseSchema,
  type TopUpPackage,
  type WalletResponse,
} from '@neogamelabs/contracts';
import { useEffect, useState } from 'react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const currencyFormatters = {
  INR: new Intl.NumberFormat('en-IN', { currency: 'INR', style: 'currency' }),
  USD: new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' }),
};

export function WalletPanel() {
  const [wallet, setWallet] = useState<WalletResponse>();
  const [packages, setPackages] = useState<TopUpPackage[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    void Promise.all([
      fetch(`${apiUrl}/v1/wallet`, { credentials: 'include' }),
      fetch(`${apiUrl}/v1/wallet/top-up-packages`),
    ])
      .then(async ([walletResponse, packagesResponse]) => {
        if (!walletResponse.ok || !packagesResponse.ok) {
          throw new Error('Wallet request failed');
        }
        setWallet(walletResponseSchema.parse(await walletResponse.json()));
        setPackages(
          topUpPackagesResponseSchema.parse(await packagesResponse.json())
            .packages,
        );
      })
      .catch(() => setFailed(true));
  }, []);

  if (failed) {
    return (
      <p className="empty-state">
        Sign in to view your wallet, or try again later.
      </p>
    );
  }
  if (!wallet) return <p className="empty-state">Loading your wallet…</p>;

  return (
    <div className="wallet-layout">
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
          <p>Stripe checkout is coming next.</p>
        </div>
        <div className="package-grid">
          {packages.map((item) => (
            <article key={item.code}>
              <strong>{item.points} points</strong>
              <span>
                {currencyFormatters[item.currency].format(
                  item.amountMinor / 100,
                )}
              </span>
              <button disabled type="button">
                Checkout coming soon
              </button>
            </article>
          ))}
        </div>
      </section>
      <section>
        <p className="eyebrow">Ledger</p>
        <h2>Transaction history</h2>
        {wallet.transactions.length === 0 ? (
          <p className="empty-state">No points transactions yet.</p>
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
