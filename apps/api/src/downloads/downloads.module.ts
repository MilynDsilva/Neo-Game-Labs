import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module.js';
import { Game, GameSchema } from '../catalog/game.schema.js';
import {
  Entitlement,
  EntitlementSchema,
} from '../purchases/entitlement.schema.js';
import { DownloadAsset, DownloadAssetSchema } from './download-asset.schema.js';
import { DownloadGrant, DownloadGrantSchema } from './download-grant.schema.js';
import { DownloadsController } from './downloads.controller.js';
import { DownloadsService } from './downloads.service.js';

@Module({
  controllers: [DownloadsController],
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Game.name, schema: GameSchema },
      { name: Entitlement.name, schema: EntitlementSchema },
      { name: DownloadAsset.name, schema: DownloadAssetSchema },
      { name: DownloadGrant.name, schema: DownloadGrantSchema },
    ]),
  ],
  providers: [DownloadsService],
})
export class DownloadsModule {}
