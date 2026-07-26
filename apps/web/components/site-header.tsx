'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useAuth } from './auth-provider';

const primaryLinks = [
  { href: '/games', label: 'Games' },
  { href: '/support', label: 'Support' },
  { href: '/feedback', label: 'Feedback' },
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
  const accountContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAccountOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    function closeMenus(event: KeyboardEvent) {
      if (event.key === 'Escape') {
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

  const initials =
    customer?.displayName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() ?? 'N';

  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <span className="brand-mark">N</span>
        <span>Neo Game Labs</span>
      </Link>
      <nav aria-label="Main navigation" className="desktop-navigation">
        {primaryLinks.map((link) => (
          <Link
            aria-current={pathname.startsWith(link.href) ? 'page' : undefined}
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        ))}
      </nav>
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
              <span aria-hidden="true">⌄</span>
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
