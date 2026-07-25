import type { Metadata } from 'next';
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
          <p>© {new Date().getFullYear()} Neo Game Labs</p>
          <p>Built for players everywhere.</p>
        </footer>
      </body>
    </html>
  );
}
