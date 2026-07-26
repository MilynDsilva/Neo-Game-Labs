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

  it('returns no more than ten recent comments per page', async () => {
    const gameId = new Types.ObjectId();
    const skip = vi.fn().mockReturnThis();
    const limit = vi.fn().mockReturnThis();
    const exec = vi.fn().mockResolvedValue([]);
    const gameModel = {
      findOne: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockReturnValue(leanQuery({ _id: gameId })),
        }),
      }),
    };
    const commentModel = {
      countDocuments: vi.fn().mockReturnValue(leanQuery(24)),
      find: vi.fn().mockReturnValue({
        exec,
        lean: vi.fn().mockReturnValue({ exec }),
        limit,
        skip,
        sort: vi.fn().mockReturnThis(),
      }),
    };
    const service = new CommentsService(
      commentModel as unknown as Model<GameCommentDocument>,
      gameModel as unknown as Model<GameDocument>,
      {} as Model<CustomerDocument>,
    );

    const result = await service.findForGame('orbit-breaker', 2);

    expect(skip).toHaveBeenCalledWith(10);
    expect(limit).toHaveBeenCalledWith(10);
    expect(result).toEqual({
      comments: [],
      page: 2,
      pageSize: 10,
      total: 24,
      totalPages: 3,
    });
  });
});
