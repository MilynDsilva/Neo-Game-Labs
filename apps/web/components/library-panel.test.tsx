import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LibraryPanel } from './library-panel';

let authenticated = true;
let games: Array<Record<string, unknown>> = [];

vi.mock('./auth-provider', () => ({
  useAuth: () => ({ authenticated, loading: false }),
}));

vi.mock('./ownership-provider', () => ({
  useOwnership: () => ({
    games,
    isOwned: () => true,
    loading: false,
    refreshOwnership: vi.fn(),
  }),
}));

vi.mock('./download-actions', () => ({
  DownloadActions: ({ gameSlug }: { gameSlug: string }) => (
    <span>downloads-{gameSlug}</span>
  ),
}));

beforeEach(() => {
  authenticated = true;
  games = [];
});

describe('LibraryPanel', () => {
  it('uses shared ownership data and presents purchase metadata', () => {
    games = [
      {
        acquiredAt: '2026-07-26T00:00:00.000Z',
        coverImageUrl: '/games/orbit-breaker.svg',
        entitlementId: 'entitlement-id',
        platforms: [{ availability: 'direct', kind: 'windows' }],
        pointsPaid: 250,
        slug: 'orbit-breaker',
        title: 'Orbit Breaker',
      },
    ];

    render(<LibraryPanel />);

    expect(
      screen.getByRole('heading', { name: 'Orbit Breaker' }),
    ).toBeInTheDocument();
    expect(screen.getByText('250 points')).toBeInTheDocument();
    expect(screen.getByText('Windows')).toBeInTheDocument();
    expect(screen.getByText('downloads-orbit-breaker')).toBeInTheDocument();
  });

  it('shows a dedicated guest state', () => {
    authenticated = false;
    render(<LibraryPanel />);

    expect(screen.getByText(/to view your game library/)).toBeInTheDocument();
  });
});
