import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module.js';
import { Customer, CustomerSchema } from '../auth/customer.schema.js';
import { Game, GameSchema } from '../catalog/game.schema.js';
import { GameComment, GameCommentSchema } from './comment.schema.js';
import { CommentsController } from './comments.controller.js';
import { CommentsService } from './comments.service.js';

@Module({
  controllers: [CommentsController],
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: GameComment.name, schema: GameCommentSchema },
      { name: Game.name, schema: GameSchema },
      { name: Customer.name, schema: CustomerSchema },
    ]),
  ],
  providers: [CommentsService],
})
export class CommentsModule {}
