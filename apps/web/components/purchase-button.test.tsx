import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PurchaseButton } from './purchase-button';

const push = vi.fn();
const refresh = vi.fn();
const refreshOwnership = vi.fn();
let authenticated = true;
let balance = 500;
let owned = false;

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('./auth-provider', () => ({
  useAuth: () => ({
    authenticated,
    customer: authenticated ? { pointsBalance: balance } : undefined,
    refresh,
  }),
}));

vi.mock('./ownership-provider', () => ({
  useOwnership: () => ({
    isOwned: () => owned,
    loading: false,
    refreshOwnership,
  }),
}));

beforeEach(() => {
  authenticated = true;
  balance = 500;
  owned = false;
  push.mockReset();
  refresh.mockReset();
  refreshOwnership.mockReset();
});

describe('PurchaseButton', () => {
  it('links owned games to the library', () => {
    owned = true;
    render(<PurchaseButton gameSlug="orbit-breaker" pointPrice={250} />);

    expect(screen.getByText('In your library')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Open library →' }),
    ).toHaveAttribute('href', '/library');
  });

  it('explains an insufficient balance and links to the wallet', () => {
    balance = 100;
    render(<PurchaseButton gameSlug="orbit-breaker" pointPrice={250} />);

    expect(screen.getByText('You need 150 more points')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Go to wallet →' }),
    ).toHaveAttribute('href', '/wallet');
  });

  it('directs a guest to sign in before purchasing', () => {
    authenticated = false;
    render(<PurchaseButton gameSlug="orbit-breaker" pointPrice={250} />);

    fireEvent.click(screen.getByRole('button', { name: 'Buy for 250 points' }));
    expect(push).toHaveBeenCalledWith('/account');
  });
});
