'use client';

import { purchaseResponseSchema } from '@neogamelabs/contracts';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function PurchaseButton({
  gameSlug,
  pointPrice,
}: Readonly<{ gameSlug: string; pointPrice: number }>) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function purchase() {
    setError(undefined);
    setSubmitting(true);
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
      setError(body.message ?? 'Purchase could not be completed.');
      setSubmitting(false);
      return;
    }
    purchaseResponseSchema.parse(await response.json());
    router.push('/library');
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
