import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'node:crypto';
import type { Model } from 'mongoose';
import { Types } from 'mongoose';

import { Game } from '../catalog/game.schema.js';
import type { GameDocument } from '../catalog/game.schema.js';
import { Purchase } from '../purchases/purchase.schema.js';
import type { PurchaseDocument } from '../purchases/purchase.schema.js';
import { Feedback } from './feedback.schema.js';
import type { FeedbackDocument } from './feedback.schema.js';

export interface SubmitFeedback {
  category: 'bug' | 'gameplay' | 'download' | 'general';
  gameSlug?: string;
  message: string;
  rating: number;
}

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name)
    private readonly feedbackModel: Model<FeedbackDocument>,
    @InjectModel(Game.name) private readonly gameModel: Model<GameDocument>,
    @InjectModel(Purchase.name)
    private readonly purchaseModel: Model<PurchaseDocument>,
  ) {}

  async submit(customerId: string, input: SubmitFeedback) {
    const customerObjectId = new Types.ObjectId(customerId);
    let gameId: Types.ObjectId | undefined;
    let purchaseId: Types.ObjectId | undefined;

    if (input.gameSlug) {
      const game = await this.gameModel.findOne({
        slug: input.gameSlug,
        status: 'published',
      });
      if (!game) throw new NotFoundException('Game was not found');
      gameId = game._id;
      const purchase = await this.purchaseModel
        .findOne({
          customerId: customerObjectId,
          gameId,
          status: 'completed',
        })
        .sort({ createdAt: -1 });
      purchaseId = purchase?._id;
    }

    const feedback = await this.feedbackModel.create({
      category: input.category,
      customerId: customerObjectId,
      ...(gameId ? { gameId } : {}),
      message: input.message,
      ...(purchaseId ? { purchaseId } : {}),
      rating: input.rating,
      reference: this.createReference(),
      status: 'new',
    });

    return {
      createdAt: feedback.createdAt.toISOString(),
      reference: feedback.reference,
      status: feedback.status,
    };
  }

  private createReference(): string {
    return `NGL-${randomBytes(6).toString('hex').toUpperCase()}`;
  }
}
