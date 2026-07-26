import 'reflect-metadata';

import { createConnection } from 'mongoose';

import { Game, GameSchema } from '../catalog/game.schema.js';
import { DownloadAsset, DownloadAssetSchema } from './download-asset.schema.js';

async function seedDownloads(): Promise<void> {
  const uri =
    process.env.MONGODB_URI ??
    'mongodb://localhost:27017/customer_dashboard?replicaSet=rs0';
  const connection = await createConnection(uri).asPromise();
  const gameModel = connection.model(Game.name, GameSchema);
  const assetModel = connection.model(DownloadAsset.name, DownloadAssetSchema);

  try {
    const game = await gameModel.findOne({ slug: 'orbit-breaker' });
    if (!game) {
      throw new Error('Seed the catalog before seeding downloads.');
    }
    await assetModel.updateOne(
      { gameId: game._id, platform: 'windows' },
      {
        $set: {
          active: true,
          fileName: 'orbit-breaker-demo.txt',
          sizeBytes: 215,
          storageKey: 'orbit-breaker-demo.txt',
          version: '0.1.0-demo',
        },
      },
      { upsert: true },
    );
    console.log('Seeded the Orbit Breaker Windows demo download.');
  } finally {
    await connection.close();
  }
}

void seedDownloads();
