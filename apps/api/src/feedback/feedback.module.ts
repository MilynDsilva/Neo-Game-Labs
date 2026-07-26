import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module.js';
import { Game, GameSchema } from '../catalog/game.schema.js';
import { Purchase, PurchaseSchema } from '../purchases/purchase.schema.js';
import { FeedbackController } from './feedback.controller.js';
import { Feedback, FeedbackSchema } from './feedback.schema.js';
import { FeedbackService } from './feedback.service.js';

@Module({
  controllers: [FeedbackController],
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Feedback.name, schema: FeedbackSchema },
      { name: Game.name, schema: GameSchema },
      { name: Purchase.name, schema: PurchaseSchema },
    ]),
  ],
  providers: [FeedbackService],
})
export class FeedbackModule {}
