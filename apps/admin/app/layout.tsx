import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  description: 'Protected operations workspace for Neo Game Labs.',
  robots: { follow: false, index: false },
  title: 'Admin | Neo Game Labs',
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to dashboard
        </a>
        <aside className="sidebar">
          <a className="brand" href="#overview">
            <span>N</span>
            <strong>Neo Game Labs</strong>
          </a>
          <p>Operations console</p>
          <nav aria-label="Admin sections">
            <a href="#overview">Overview</a>
            <a href="#catalog">Catalog</a>
            <a href="#feedback">Feedback</a>
            <a href="#customers">Customers</a>
            <a href="#audit">Audit log</a>
          </nav>
          <small>Protected workspace</small>
        </aside>
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
