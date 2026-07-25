import type { MetadataRoute } from 'next';

import { getCatalog } from '../lib/catalog-api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl },
    { url: `${siteUrl}/games` },
    { url: `${siteUrl}/about` },
    { url: `${siteUrl}/support` },
    { url: `${siteUrl}/contact` },
    { url: `${siteUrl}/privacy` },
    { url: `${siteUrl}/terms` },
  ];

  try {
    const catalog = await getCatalog({ limit: 50 });
    return [
      ...staticRoutes,
      ...catalog.games.map((game) => ({
        lastModified: game.releasedAt,
        url: `${siteUrl}/games/${game.slug}`,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
