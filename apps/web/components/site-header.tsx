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
        <span className="nav-muted">Library</span>
        <span className="nav-muted">Sign in</span>
      </nav>
    </header>
  );
}
