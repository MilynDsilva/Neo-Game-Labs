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
  const popularGames =
    featuredGames.length > 0
      ? featuredGames.slice(0, 2)
      : latestGames.slice(0, 2);

  return (
    <main className="home-page">
      {!catalogAvailable ? (
        <p className="notice">
          The catalog service is unavailable. Start the API and seed the catalog
          to preview games.
        </p>
      ) : null}
      <section className="store-dashboard" aria-label="Game store">
        <div className="store-main">
          <div className="store-section-heading">
            <div>
              <p className="eyebrow">Store</p>
              <h1>Discover games</h1>
            </div>
            <Link href="/games">See all →</Link>
          </div>
          {spotlight ? (
            <Link
              aria-label={`Discover ${spotlight.title}`}
              className="store-feature"
              href={`/games/${spotlight.slug}`}
            >
              <img alt="" src={spotlight.coverImageUrl} />
              <span className="store-feature-shade" />
              <span className="store-feature-badge">Popular</span>
              <span className="store-feature-platforms">
                {spotlight.platforms
                  .map((platform) => platformLabels[platform.kind])
                  .join(' · ')}
              </span>
              <span className="store-feature-copy">
                <strong>{spotlight.title}</strong>
                <small>{spotlight.tagline}</small>
              </span>
            </Link>
          ) : (
            <div className="store-feature store-feature-empty">
              <strong>New worlds are loading</strong>
            </div>
          )}
          <div className="popular-heading">
            <h2>Popular Games</h2>
            <Link href="/games?featured=true">See all →</Link>
          </div>
          <CatalogGrid
            emptyMessage="Featured games are coming soon."
            games={popularGames}
          />
        </div>
        <aside className="store-inspector" aria-label="Featured game details">
          {spotlight ? (
            <>
              <div>
                <p className="eyebrow">Featured release</p>
                <h2>{spotlight.title}</h2>
                <p>{spotlight.tagline}</p>
              </div>
              <ul className="inspector-tags" aria-label="Available platforms">
                {spotlight.platforms.map((platform) => (
                  <li key={platform.kind}>{platformLabels[platform.kind]}</li>
                ))}
              </ul>
              <div className="spotlight-purchase">
                <span>
                  <small>Access</small>
                  <strong>
                    {spotlight.pointPrice === 0
                      ? 'Free'
                      : `${spotlight.pointPrice} pts`}
                  </strong>
                </span>
                <Link href={`/games/${spotlight.slug}`}>View game →</Link>
              </div>
              {latestGames.length > 1 ? (
                <div className="inspector-previews">
                  {latestGames.slice(1, 3).map((game) => (
                    <Link href={`/games/${game.slug}`} key={game.slug}>
                      <img alt="" src={game.coverImageUrl} />
                      <span>{game.title}</span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <p>Featured game details will appear here.</p>
          )}
        </aside>
      </section>
    </main>
  );
}
