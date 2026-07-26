'use client';

import { purchaseResponseSchema } from '@neogamelabs/contracts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from './auth-provider';
import { useOwnership } from './ownership-provider';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function PurchaseButton({
  gameSlug,
  pointPrice,
}: Readonly<{ gameSlug: string; pointPrice: number }>) {
  const router = useRouter();
  const { authenticated, customer, refresh } = useAuth();
  const {
    isOwned,
    loading: ownershipLoading,
    refreshOwnership,
  } = useOwnership();
  const [error, setError] = useState<string>();
  const [purchased, setPurchased] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const owned = authenticated && (purchased || isOwned(gameSlug));
  const pointsNeeded = Math.max(0, pointPrice - (customer?.pointsBalance ?? 0));

  async function purchase() {
    if (!authenticated) {
      router.push('/account');
      return;
    }
    setError(undefined);
    setSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/v1/purchases`, {
        body: JSON.stringify({ gameSlug }),
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      });
      if (response.status === 401) {
        router.push('/account');
        return;
      }
      if (!response.ok) {
        const body = (await response.json()) as { message?: string };
        setError(
          response.status === 503
            ? 'Game purchases are temporarily paused.'
            : (body.message ?? 'Purchase could not be completed.'),
        );
        return;
      }
      purchaseResponseSchema.parse(await response.json());
      setPurchased(true);
      await Promise.all([refresh(), refreshOwnership()]);
    } catch {
      setError('Purchase could not be completed. Check your connection.');
    } finally {
      setSubmitting(false);
    }
  }

  if (ownershipLoading && authenticated) {
    return <span className="purchase-status">Checking your library…</span>;
  }

  if (owned) {
    return (
      <div className="purchase-owned" role={purchased ? 'status' : undefined}>
        <strong>
          {purchased ? 'Added to your library' : 'In your library'}
        </strong>
        <Link href="/library">Open library →</Link>
      </div>
    );
  }

  if (authenticated && pointsNeeded > 0) {
    return (
      <div className="purchase-owned">
        <span>You need {pointsNeeded} more points</span>
        <Link href="/wallet">Go to wallet →</Link>
      </div>
    );
  }

  return (
    <div className="purchase-action">
      <button
        disabled={submitting}
        onClick={() => void purchase()}
        type="button"
      >
        {submitting
          ? 'Processing…'
          : pointPrice === 0
            ? 'Add to library'
            : `Buy for ${pointPrice} points`}
      </button>
      {error ? (
        <small className="form-error" role="alert">
          {error}
        </small>
      ) : null}
    </div>
  );
}
