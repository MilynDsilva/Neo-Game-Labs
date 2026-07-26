import type { GamePlatform, GameSummary } from '@neogamelabs/contracts';
import Link from 'next/link';

import { CatalogGrid } from '../../components/catalog-grid';
import { getCatalog } from '../../lib/catalog-api';

const supportedPlatforms = new Set([
  'windows',
  'macos',
  'linux',
  'ios',
  'android',
  'web',
]);
const platformLabels: Partial<Record<GamePlatform, string>> = {
  android: 'Android',
  ios: 'iOS',
  linux: 'Linux',
  macos: 'macOS',
  web: 'Web',
  windows: 'Windows',
};

type GamesPageProperties = {
  searchParams: Promise<{
    featured?: string;
    platform?: string;
    search?: string;
  }>;
};

export const metadata = {
  description: 'Browse games available from Neo Game Labs.',
  title: 'Games | Neo Game Labs',
};

export default async function GamesPage({ searchParams }: GamesPageProperties) {
  const parameters = await searchParams;
  const platform = supportedPlatforms.has(parameters.platform ?? '')
    ? (parameters.platform as GamePlatform)
    : undefined;
  const search = parameters.search?.trim() || undefined;
  const featured = parameters.featured === 'true';
  const filtersActive = Boolean(platform || search || featured);
  let games: GameSummary[] = [];
  let total = 0;
  let unavailable = false;

  try {
    const catalog = await getCatalog({
      featured: parameters.featured === 'true' ? true : undefined,
      platform,
      search,
    });
    games = catalog.games;
    total = catalog.total;
  } catch {
    unavailable = true;
  }

  return (
    <main className="catalog-page">
      <section className="page-heading catalog-heading">
        <p className="eyebrow">Discover</p>
        <h1>Browse games</h1>
        <p>Original worlds, built to stay with you.</p>
      </section>
      <nav aria-label="Browse by platform" className="catalog-quick-links">
        <Link aria-current={!platform ? 'page' : undefined} href="/games">
          All games
        </Link>
        {(
          [
            ['windows', 'Windows'],
            ['macos', 'macOS'],
            ['linux', 'Linux'],
            ['android', 'Android'],
            ['ios', 'iOS'],
            ['web', 'Web'],
          ] as const
        ).map(([value, label]) => (
          <Link
            aria-current={platform === value ? 'page' : undefined}
            href={`/games?platform=${value}`}
            key={value}
          >
            {label}
          </Link>
        ))}
      </nav>
      <section className="catalog-layout">
        <form action="/games" className="catalog-filters">
          <div className="catalog-filter-intro">
            <strong>Filters</strong>
            {filtersActive ? (
              <Link className="filter-reset" href="/games">
                Reset
              </Link>
            ) : null}
          </div>
          <label className="filter-control filter-search">
            <span>Search</span>
            <input
              defaultValue={search}
              name="search"
              placeholder="Search games"
              type="search"
            />
          </label>
          <label className="filter-control">
            <span>Platform</span>
            <select defaultValue={platform ?? ''} name="platform">
              <option value="">All platforms</option>
              <option value="windows">Windows</option>
              <option value="macos">macOS</option>
              <option value="linux">Linux</option>
              <option value="ios">iOS</option>
              <option value="android">Android</option>
              <option value="web">Web</option>
            </select>
          </label>
          <div className="catalog-filter-actions">
            <button type="submit">Apply filters</button>
          </div>
        </form>
        <div className="catalog-results">
          <div className="catalog-result-heading">
            <p className="result-count">
              {unavailable
                ? 'Catalog unavailable'
                : `${total} ${total === 1 ? 'game' : 'games'}`}
            </p>
            <span className="catalog-sort-label">Newest releases</span>
            {filtersActive ? (
              <div aria-label="Active filters" className="active-filters">
                {search ? <span>Search: “{search}”</span> : null}
                {platform ? (
                  <span>Platform: {platformLabels[platform]}</span>
                ) : null}
                {featured ? <span>Featured</span> : null}
              </div>
            ) : null}
          </div>
          <CatalogGrid
            emptyMessage={
              unavailable
                ? 'Start the catalog API and try again.'
                : 'No games match these filters.'
            }
            games={games}
          />
        </div>
      </section>
    </main>
  );
}
