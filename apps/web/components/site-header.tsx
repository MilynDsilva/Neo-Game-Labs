import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <span className="brand-mark">N</span>
        <span>Neo Game Labs</span>
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/games">Games</Link>
        <Link href="/support">Support</Link>
        <Link href="/wallet">Wallet</Link>
        <Link href="/library">Library</Link>
        <Link href="/account">Sign in</Link>
      </nav>
    </header>
  );
}
