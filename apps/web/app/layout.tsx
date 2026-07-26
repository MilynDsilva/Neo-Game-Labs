import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { SiteHeader } from '../components/site-header';
import './globals.css';

export const metadata: Metadata = {
  description: 'Discover and play games from Neo Game Labs.',
  title: 'Neo Game Labs',
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
        <footer className="site-footer">
          <div>
            <strong>Neo Game Labs</strong>
            <p>Games built for players everywhere.</p>
          </div>
          <nav aria-label="Footer navigation">
            <Link href="/about">About</Link>
            <Link href="/support">Support</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </nav>
          <p>© {new Date().getFullYear()} Neo Game Labs</p>
        </footer>
      </body>
    </html>
  );
}
