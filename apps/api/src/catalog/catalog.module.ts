import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CatalogController } from './catalog.controller.js';
import { CatalogService } from './catalog.service.js';
import { Game, GameSchema } from './game.schema.js';

@Module({
  controllers: [CatalogController],
  imports: [
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),
  ],
  providers: [CatalogService],
})
export class CatalogModule {}
