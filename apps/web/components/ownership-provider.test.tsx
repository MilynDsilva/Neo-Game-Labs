import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { OwnershipProvider, useOwnership } from './ownership-provider';

let authenticated = true;

vi.mock('./auth-provider', () => ({
  useAuth: () => ({ authenticated, loading: false }),
}));

function OwnershipProbe() {
  const { isOwned, loading } = useOwnership();
  return (
    <span>
      {loading
        ? 'loading'
        : isOwned('orbit-breaker')
          ? 'orbit-owned'
          : 'orbit-not-owned'}
    </span>
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  authenticated = true;
});

describe('OwnershipProvider', () => {
  it('loads the signed-in customer library once', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          games: [
            {
              acquiredAt: new Date().toISOString(),
              coverImageUrl: '/games/orbit-breaker.svg',
              entitlementId: 'entitlement-id',
              platforms: [{ availability: 'direct', kind: 'windows' }],
              pointsPaid: 250,
              slug: 'orbit-breaker',
              title: 'Orbit Breaker',
            },
          ],
        }),
        { headers: { 'content-type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    render(
      <OwnershipProvider>
        <OwnershipProbe />
      </OwnershipProvider>,
    );

    expect(await screen.findByText('orbit-owned')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not request a library for guests', async () => {
    authenticated = false;
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(
      <OwnershipProvider>
        <OwnershipProbe />
      </OwnershipProvider>,
    );

    expect(await screen.findByText('orbit-not-owned')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
