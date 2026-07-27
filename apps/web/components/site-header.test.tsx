import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SiteHeader } from './site-header';

const push = vi.fn();
const refresh = vi.fn();
const signOut = vi.fn();
let authenticated = true;

vi.mock('next/navigation', () => ({
  usePathname: () => '/library',
  useRouter: () => ({ push, refresh }),
}));

vi.mock('./auth-provider', () => ({
  useAuth: () => ({
    authenticated,
    customer: authenticated
      ? {
          displayName: 'Neo Player',
          email: 'player@example.com',
          id: 'customer-id',
          pointsBalance: 420,
        }
      : undefined,
    loading: false,
    refresh: vi.fn(),
    signOut,
  }),
}));

beforeEach(() => {
  authenticated = true;
  document.documentElement.dataset.theme = 'dark';
  localStorage.clear();
  push.mockReset();
  refresh.mockReset();
  signOut.mockReset();
});

describe('SiteHeader', () => {
  it('shows global customer identity and account actions', () => {
    render(<SiteHeader />);

    expect(screen.getByText('Neo Player')).toBeInTheDocument();
    expect(screen.getByText('420 points')).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: /Neo Player 420 points/i }),
    );
    expect(screen.getByRole('menuitem', { name: 'Account' })).toHaveFocus();
    expect(
      screen.getByRole('menuitem', { name: 'Sign out' }),
    ).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(
      screen.getByRole('button', { name: /Neo Player 420 points/i }),
    ).toHaveFocus();
  });

  it('shows guest sign-in and opens mobile navigation', () => {
    authenticated = false;
    render(<SiteHeader />);

    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(
      screen.getByRole('navigation', { name: 'Mobile navigation' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Home' })[1]).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(
      screen.getByRole('button', { name: 'Open navigation' }),
    ).toHaveFocus();
  });

  it('persists the selected color theme', () => {
    render(<SiteHeader />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Switch to light theme' }),
    );

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('neo-theme')).toBe('light');
    expect(
      screen.getByRole('button', { name: 'Switch to dark theme' }),
    ).toBeInTheDocument();
  });
});
