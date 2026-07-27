'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useAuth } from './auth-provider';

const primaryLinks = [
  { href: '/', icon: '⌂', label: 'Home' },
  { href: '/games', icon: '◇', label: 'Store' },
  { href: '/library', icon: '▤', label: 'Library' },
  { href: '/wallet', icon: '▣', label: 'Wallet' },
  { href: '/feedback', icon: '✦', label: 'Feedback' },
  { href: '/support', icon: '?', label: 'Support' },
];

const customerLinks = [
  { href: '/account', label: 'Account' },
  { href: '/wallet', label: 'Wallet' },
  { href: '/library', label: 'Library' },
  { href: '/feedback', label: 'Send feedback' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { authenticated, customer, error, loading, signOut } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const accountContainer = useRef<HTMLDivElement>(null);
  const accountTrigger = useRef<HTMLButtonElement>(null);
  const mobileNavigation = useRef<HTMLElement>(null);
  const mobileTrigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setAccountOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    setTheme(
      document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
    );
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    function closeMenus(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (accountContainer.current?.contains(document.activeElement)) {
          accountTrigger.current?.focus();
        }
        if (mobileNavigation.current?.contains(document.activeElement)) {
          mobileTrigger.current?.focus();
        }
        setAccountOpen(false);
        setMobileOpen(false);
      }
    }
    function closeAccount(event: MouseEvent) {
      if (!accountContainer.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener('keydown', closeMenus);
    document.addEventListener('mousedown', closeAccount);
    return () => {
      document.removeEventListener('keydown', closeMenus);
      document.removeEventListener('mousedown', closeAccount);
    };
  }, []);

  useEffect(() => {
    if (accountOpen) {
      accountContainer.current
        ?.querySelector<HTMLElement>('[role="menuitem"]')
        ?.focus();
    }
  }, [accountOpen]);

  useEffect(() => {
    if (mobileOpen) {
      mobileNavigation.current
        ?.querySelector<HTMLElement>('a, button')
        ?.focus();
    }
  }, [mobileOpen]);

  async function handleSignOut() {
    setSigningOut(true);
    if (await signOut()) {
      setAccountOpen(false);
      setMobileOpen(false);
      router.push('/');
      router.refresh();
    }
    setSigningOut(false);
  }

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    localStorage.setItem('neo-theme', nextTheme);
    setTheme(nextTheme);
  }

  const initials =
    customer?.displayName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() ?? 'N';

  return (
    <header className="site-header">
      <div className="sidebar-navigation">
        <Link className="brand" href="/">
          <span className="brand-mark">N</span>
          <span>
            <strong>Neo</strong> Game Labs
          </span>
        </Link>
        <nav aria-label="Main navigation" className="desktop-navigation">
          {primaryLinks.map((link) => (
            <Link
              aria-current={
                link.href === '/'
                  ? pathname === '/'
                    ? 'page'
                    : undefined
                  : pathname.startsWith(link.href)
                    ? 'page'
                    : undefined
              }
              href={link.href}
              key={link.href}
            >
              <span aria-hidden="true">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-theme">
          <span>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
          <button
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            aria-pressed={theme === 'light'}
            className="theme-toggle"
            onClick={toggleTheme}
            type="button"
          >
            <span aria-hidden="true">☀</span>
            <span aria-hidden="true">☾</span>
          </button>
        </div>
      </div>
      <div className="utility-copy">
        <p>Good day, {customer?.displayName.split(/\s+/)[0] ?? 'Player'}!</p>
        <span>Discover your next world</span>
      </div>
      <div className="header-customer">
        {loading ? (
          <span
            aria-label="Loading account"
            className="header-account-skeleton"
          />
        ) : authenticated && customer ? (
          <div className="account-menu-container" ref={accountContainer}>
            <button
              aria-expanded={accountOpen}
              aria-haspopup="menu"
              className="profile-trigger"
              onClick={() => setAccountOpen((open) => !open)}
              ref={accountTrigger}
              type="button"
            >
              {customer.pictureUrl ? (
                <img alt="" src={customer.pictureUrl} />
              ) : (
                <span aria-hidden="true" className="profile-initials">
                  {initials}
                </span>
              )}
              <span className="profile-summary">
                <strong>{customer.displayName}</strong>
                <small>{customer.pointsBalance} points</small>
              </span>
              <span aria-hidden="true" className="profile-chevron" />
            </button>
            {accountOpen ? (
              <div className="account-menu" role="menu">
                {customerLinks.map((link) => (
                  <Link href={link.href} key={link.href} role="menuitem">
                    {link.label}
                  </Link>
                ))}
                <button
                  disabled={signingOut}
                  onClick={() => void handleSignOut()}
                  role="menuitem"
                  type="button"
                >
                  {signingOut ? 'Signing out…' : 'Sign out'}
                </button>
                {error ? <small role="alert">{error}</small> : null}
              </div>
            ) : null}
          </div>
        ) : (
          <Link className="header-sign-in" href="/account">
            Sign in
          </Link>
        )}
        <button
          aria-controls="mobile-navigation"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          className="mobile-menu-trigger"
          onClick={() => setMobileOpen((open) => !open)}
          ref={mobileTrigger}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      {mobileOpen ? (
        <nav
          aria-label="Mobile navigation"
          className="mobile-navigation"
          id="mobile-navigation"
          ref={mobileNavigation}
        >
          {[
            ...(authenticated
              ? primaryLinks.filter((link) => link.href !== '/feedback')
              : primaryLinks),
            ...(authenticated ? customerLinks : []),
          ].map((link, index) => (
            <Link
              aria-current={pathname.startsWith(link.href) ? 'page' : undefined}
              href={link.href}
              key={`${link.href}-${index}`}
            >
              {link.label}
            </Link>
          ))}
          {authenticated ? (
            <button
              disabled={signingOut}
              onClick={() => void handleSignOut()}
              type="button"
            >
              {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          ) : (
            <Link href="/account">Sign in</Link>
          )}
          {error ? <small role="alert">{error}</small> : null}
        </nav>
      ) : null}
    </header>
  );
}
