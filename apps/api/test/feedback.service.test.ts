import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { describe, expect, it, vi } from 'vitest';

import type { GameDocument } from '../src/catalog/game.schema.js';
import type { FeedbackDocument } from '../src/feedback/feedback.schema.js';
import { FeedbackService } from '../src/feedback/feedback.service.js';
import type { PurchaseDocument } from '../src/purchases/purchase.schema.js';

describe('FeedbackService', () => {
  it('associates only the signed-in customer purchase', async () => {
    const customerId = new Types.ObjectId();
    const gameId = new Types.ObjectId();
    const purchaseId = new Types.ObjectId();
    const feedbackModel = {
      create: vi.fn().mockImplementation((record) => ({
        ...record,
        createdAt: new Date('2026-07-26T00:00:00.000Z'),
      })),
    };
    const gameModel = {
      findOne: vi.fn().mockResolvedValue({ _id: gameId }),
    };
    const purchaseModel = {
      findOne: vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue({ _id: purchaseId }),
      }),
    };
    const service = new FeedbackService(
      feedbackModel as unknown as Model<FeedbackDocument>,
      gameModel as unknown as Model<GameDocument>,
      purchaseModel as unknown as Model<PurchaseDocument>,
    );

    const result = await service.submit(customerId.toString(), {
      category: 'gameplay',
      gameSlug: 'orbit-breaker',
      message: 'The final checkpoint feels especially rewarding.',
      rating: 5,
    });

    expect(purchaseModel.findOne).toHaveBeenCalledWith({
      customerId,
      gameId,
      status: 'completed',
    });
    expect(feedbackModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ customerId, gameId, purchaseId }),
    );
    expect(result.reference).toMatch(/^NGL-[A-F0-9]{12}$/);
  });
});
