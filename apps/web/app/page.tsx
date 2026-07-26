import type { GameSummary } from '@neogamelabs/contracts';
import Link from 'next/link';

import { CatalogGrid } from '../components/catalog-grid';
import { getCatalog } from '../lib/catalog-api';

const platformLabels = {
  android: 'Android',
  ios: 'iOS',
  linux: 'Linux',
  macos: 'macOS',
  web: 'Web',
  windows: 'Windows',
} as const;

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

  const spotlight = featuredGames[0] ?? latestGames[0];

  return (
    <main className="home-page">
      <section className="home-hero home-showcase">
        <div className="hero-copy">
          <p className="eyebrow">Independent games · Built with intent</p>
          <h1>
            Games worth
            <span> getting lost in.</span>
          </h1>
          <p className="hero-description">
            Strange worlds, sharp mechanics, and stories that stay with you.
            Discover original games from Neo Game Labs on desktop, mobile, and
            the web.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" href="/games">
              Explore the catalog
              <span aria-hidden="true">↗</span>
            </Link>
            <Link className="secondary-action" href="/about">
              Inside the lab
            </Link>
          </div>
          <dl className="hero-facts">
            <div>
              <dt>Original worlds</dt>
              <dd>Made independently</dd>
            </div>
            <div>
              <dt>Cross-platform</dt>
              <dd>Desktop & mobile</dd>
            </div>
            <div>
              <dt>Player-led</dt>
              <dd>Your feedback matters</dd>
            </div>
          </dl>
        </div>
        {spotlight ? (
          <Link
            aria-label={`Discover ${spotlight.title}`}
            className="hero-spotlight"
            href={`/games/${spotlight.slug}`}
          >
            <img alt="" src={spotlight.coverImageUrl} />
            <span className="hero-spotlight-shade" />
            <span className="spotlight-index">Featured / 01</span>
            <span className="spotlight-content">
              <span>
                {spotlight.platforms
                  .map((platform) => platformLabels[platform.kind])
                  .join(' · ')}
              </span>
              <strong>{spotlight.title}</strong>
              <small>{spotlight.tagline}</small>
            </span>
            <span className="spotlight-arrow" aria-hidden="true">
              ↗
            </span>
          </Link>
        ) : (
          <div aria-hidden="true" className="hero-spotlight hero-abstract">
            <span className="hero-planet" />
            <span className="hero-moon" />
          </div>
        )}
      </section>
      <section aria-label="Neo Game Labs promise" className="home-marquee">
        <p>
          <span>Discover.</span>
          <span>Play.</span>
          <span>Collect.</span>
          <span>Shape what comes next.</span>
        </p>
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
            <p className="eyebrow">The front row</p>
            <h2>Start somewhere unforgettable.</h2>
          </div>
          <Link href="/games?featured=true">See all featured ↗</Link>
        </div>
        <CatalogGrid
          emptyMessage="Featured games are coming soon."
          games={featuredGames}
        />
      </section>
      <section className="home-manifesto">
        <div>
          <p className="eyebrow">Made with players</p>
          <h2>The credits may roll. The conversation keeps going.</h2>
        </div>
        <div>
          <p>
            Every world gets better when players have a voice. Join game
            discussions, share private feedback, and help shape what leaves the
            lab next.
          </p>
          <Link className="secondary-action" href="/games">
            Find a world to explore
          </Link>
        </div>
      </section>
      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Fresh from the lab</p>
            <h2>New signals detected.</h2>
          </div>
          <Link href="/games">Browse everything ↗</Link>
        </div>
        <CatalogGrid
          emptyMessage="New releases are being prepared."
          games={latestGames}
        />
      </section>
      <section className="home-final-cta">
        <p className="eyebrow">Your next world is waiting</p>
        <h2>Ready when you are.</h2>
        <p>
          Explore the complete Neo Game Labs catalog and build a library that
          goes wherever you play.
        </p>
        <Link className="primary-action" href="/games">
          Enter the catalog
          <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}
