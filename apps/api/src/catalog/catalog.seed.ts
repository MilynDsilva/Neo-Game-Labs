import 'reflect-metadata';

import { createConnection } from 'mongoose';

import { Game, GameSchema } from './game.schema.js';

const catalog: Game[] = [
  {
    coverImageUrl: '/games/orbit-breaker.svg',
    description:
      'A high-speed survival racer set on a failing orbital station. Chain impossible turns, outrun the collapse, and find a route back to open space.',
    featured: true,
    heroImageUrl: '/games/orbit-breaker.svg',
    platforms: [
      {
        availability: 'direct',
        kind: 'windows',
        minimumRequirements: 'Windows 10, 8 GB RAM, DirectX 12',
      },
      {
        availability: 'coming-soon',
        kind: 'macos',
      },
    ],
    pointPrice: 250,
    publishAt: new Date('2026-01-10T00:00:00.000Z'),
    releasedAt: new Date('2026-02-14T00:00:00.000Z'),
    slug: 'orbit-breaker',
    status: 'published',
    tagline: 'Outrun the end of the world.',
    title: 'Orbit Breaker',
  },
  {
    coverImageUrl: '/games/neon-drift.svg',
    description:
      'Build momentum through a luminous megacity in a precision arcade racer where every corner changes the music and every shortcut carries a risk.',
    featured: true,
    heroImageUrl: '/games/neon-drift.svg',
    platforms: [
      {
        availability: 'direct',
        kind: 'windows',
        minimumRequirements: 'Windows 10, 8 GB RAM, DirectX 11',
      },
      {
        availability: 'external',
        kind: 'android',
        storeUrl: 'https://play.google.com/store',
      },
    ],
    pointPrice: 180,
    publishAt: new Date('2026-01-20T00:00:00.000Z'),
    releasedAt: new Date('2026-03-08T00:00:00.000Z'),
    slug: 'neon-drift',
    status: 'published',
    tagline: 'Find the rhythm. Own the road.',
    title: 'Neon Drift',
  },
  {
    coverImageUrl: '/games/last-signal.svg',
    description:
      'Decode a transmission from beneath an alien ocean. Explore abandoned research decks, redirect failing power, and decide what should reach the surface.',
    featured: false,
    heroImageUrl: '/games/last-signal.svg',
    platforms: [
      {
        availability: 'direct',
        kind: 'windows',
        minimumRequirements: 'Windows 10, 12 GB RAM, DirectX 12',
      },
      {
        availability: 'direct',
        kind: 'linux',
        minimumRequirements: 'Ubuntu 22.04, 12 GB RAM, Vulkan',
      },
    ],
    pointPrice: 320,
    publishAt: new Date('2026-02-01T00:00:00.000Z'),
    releasedAt: new Date('2026-04-21T00:00:00.000Z'),
    slug: 'last-signal',
    status: 'published',
    tagline: 'Some messages should stay buried.',
    title: 'The Last Signal',
  },
];

async function seedCatalog(): Promise<void> {
  const uri =
    process.env.MONGODB_URI ??
    'mongodb://localhost:27017/customer_dashboard?replicaSet=rs0';
  const connection = await createConnection(uri).asPromise();
  const gameModel = connection.model(Game.name, GameSchema);

  try {
    await gameModel.bulkWrite(
      catalog.map((game) => ({
        updateOne: {
          filter: { slug: game.slug },
          update: { $set: game },
          upsert: true,
        },
      })),
    );
    console.log(`Seeded ${catalog.length} catalog games.`);
  } finally {
    await connection.close();
  }
}

void seedCatalog();
