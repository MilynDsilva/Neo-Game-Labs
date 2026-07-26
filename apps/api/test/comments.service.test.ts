import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { describe, expect, it, vi } from 'vitest';

import type { CustomerDocument } from '../src/auth/customer.schema.js';
import type { GameDocument } from '../src/catalog/game.schema.js';
import type { GameCommentDocument } from '../src/comments/comment.schema.js';
import { CommentsService } from '../src/comments/comments.service.js';

function leanQuery<T>(value: T) {
  return { exec: vi.fn().mockResolvedValue(value) };
}

describe('CommentsService', () => {
  it('creates a public comment without exposing customer email', async () => {
    const customerId = new Types.ObjectId();
    const gameId = new Types.ObjectId();
    const commentId = new Types.ObjectId();
    const gameModel = {
      findOne: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockReturnValue(leanQuery({ _id: gameId })),
        }),
      }),
    };
    const customerModel = {
      findById: vi.fn().mockReturnValue({
        lean: vi.fn().mockReturnValue(
          leanQuery({
            displayName: 'Nova Player',
            email: 'private@example.com',
            pictureUrl: 'https://example.com/avatar.png',
          }),
        ),
      }),
    };
    const commentModel = {
      create: vi.fn().mockImplementation((record) => ({
        ...record,
        _id: commentId,
        createdAt: new Date('2026-07-26T10:00:00.000Z'),
      })),
    };
    const service = new CommentsService(
      commentModel as unknown as Model<GameCommentDocument>,
      gameModel as unknown as Model<GameDocument>,
      customerModel as unknown as Model<CustomerDocument>,
    );

    const result = await service.create(
      'orbit-breaker',
      customerId.toString(),
      'The movement feels excellent.',
    );

    expect(commentModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        authorDisplayName: 'Nova Player',
        customerId,
        gameId,
        status: 'published',
      }),
    );
    expect(result).toEqual({
      author: {
        displayName: 'Nova Player',
        pictureUrl: 'https://example.com/avatar.png',
      },
      createdAt: '2026-07-26T10:00:00.000Z',
      id: commentId.toString(),
      message: 'The movement feels excellent.',
    });
    expect(result).not.toHaveProperty('email');
  });
});
