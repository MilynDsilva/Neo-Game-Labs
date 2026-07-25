import {
  gameCatalogResponseSchema,
  gameDetailSchema,
  type GameCatalogResponse,
  type GameDetail,
  type GamePlatform,
} from '@neogamelabs/contracts';

const apiUrl = process.env.API_URL ?? 'http://localhost:4000';

export type CatalogFilters = {
  featured?: boolean;
  limit?: number;
  platform?: GamePlatform;
  search?: string;
};

export async function getCatalog(
  filters: CatalogFilters = {},
): Promise<GameCatalogResponse> {
  const searchParameters = new URLSearchParams();

  if (filters.featured !== undefined) {
    searchParameters.set('featured', String(filters.featured));
  }
  if (filters.limit) {
    searchParameters.set('limit', String(filters.limit));
  }
  if (filters.platform) {
    searchParameters.set('platform', filters.platform);
  }
  if (filters.search) {
    searchParameters.set('search', filters.search);
  }

  const response = await fetch(
    `${apiUrl}/v1/games?${searchParameters.toString()}`,
    { next: { revalidate: 60 } },
  );

  if (!response.ok) {
    throw new Error(`Catalog API responded with ${response.status}`);
  }

  return gameCatalogResponseSchema.parse(await response.json());
}

export async function getGame(slug: string): Promise<GameDetail | null> {
  const response = await fetch(
    `${apiUrl}/v1/games/${encodeURIComponent(slug)}`,
    {
      next: { revalidate: 60 },
    },
  );

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Catalog API responded with ${response.status}`);
  }

  return gameDetailSchema.parse(await response.json());
}
