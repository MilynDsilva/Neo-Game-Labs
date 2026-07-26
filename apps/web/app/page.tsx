import type { GameSummary } from '@neogamelabs/contracts';
import Link from 'next/link';

import { CatalogGrid } from '../components/catalog-grid';
import { getCatalog } from '../lib/catalog-api';

export default async function Home() {
  let featuredGames: GameSummary[] = [];
  let latestGames: GameSummary[] = [];
  let catalogAvailable = true;

  try {
    const [featured, latest] = await Promise.all([
      getCatalog({ featured: true, limit: 3 }),
      getCatalog({ limit: 6 }),
    ]);
    featuredGames = featured.games;
    latestGames = latest.games;
  } catch {
    catalogAvailable = false;
  }

  return (
    <main>
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">Independent worlds. Unforgettable play.</p>
          <h1>Find your next obsession.</h1>
          <p className="hero-description">
            Discover original games from Neo Game Labs, built for desktop,
            mobile, and everywhere play takes you.
          </p>
          <Link className="primary-action" href="/games">
            Explore all games
          </Link>
        </div>
        <div aria-hidden="true" className="hero-orbit">
          <span className="hero-planet" />
          <span className="hero-moon" />
        </div>
      </section>
      <section aria-label="Why Neo Game Labs" className="home-values">
        <article>
          <span>01</span>
          <h2>Play your way</h2>
          <p>Find games for desktop, mobile, and the web in one catalog.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Keep your library</h2>
          <p>Sign in once to manage owned games and protected downloads.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Shape the worlds</h2>
          <p>Send private feedback directly to the team building each game.</p>
        </article>
      </section>
      {!catalogAvailable ? (
        <section className="content-section">
          <p className="notice">
            The catalog service is unavailable. Start the API and seed the
            catalog to preview games.
          </p>
        </section>
      ) : null}
      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Hand-picked</p>
            <h2>Featured games</h2>
          </div>
          <Link href="/games?featured=true">View featured</Link>
        </div>
        <CatalogGrid
          emptyMessage="Featured games are coming soon."
          games={featuredGames}
        />
      </section>
      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Fresh from the lab</p>
            <h2>Latest releases</h2>
          </div>
          <Link href="/games">Browse catalog</Link>
        </div>
        <CatalogGrid
          emptyMessage="New releases are being prepared."
          games={latestGames}
        />
      </section>
    </main>
  );
}
