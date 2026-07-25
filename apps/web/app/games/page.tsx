import type { GamePlatform, GameSummary } from '@neogamelabs/contracts';

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
  let games: GameSummary[] = [];
  let total = 0;
  let unavailable = false;

  try {
    const catalog = await getCatalog({
      featured: parameters.featured === 'true' ? true : undefined,
      platform,
      search: parameters.search,
    });
    games = catalog.games;
    total = catalog.total;
  } catch {
    unavailable = true;
  }

  return (
    <main>
      <section className="page-heading">
        <p className="eyebrow">The catalog</p>
        <h1>Games for every kind of player.</h1>
        <p>Search the collection or filter by the platform you play on.</p>
      </section>
      <section className="catalog-layout">
        <form action="/games" className="catalog-filters">
          <label>
            <span>Search</span>
            <input
              defaultValue={parameters.search}
              name="search"
              placeholder="Search games"
              type="search"
            />
          </label>
          <label>
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
          <button type="submit">Apply filters</button>
        </form>
        <div className="catalog-results">
          <p className="result-count">
            {unavailable
              ? 'Catalog unavailable'
              : `${total} ${total === 1 ? 'game' : 'games'}`}
          </p>
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
