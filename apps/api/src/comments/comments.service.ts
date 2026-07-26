import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  GameComment as GameCommentResponse,
  GameCommentsResponse,
} from '@neogamelabs/contracts';
import type { Model } from 'mongoose';
import { Types } from 'mongoose';

import { Customer } from '../auth/customer.schema.js';
import { Game } from '../catalog/game.schema.js';
import { GameComment } from './comment.schema.js';

type CommentRecord = GameComment & { _id: Types.ObjectId };
const pageSize = 10;

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(GameComment.name)
    private readonly commentModel: Model<GameComment>,
    @InjectModel(Game.name) private readonly gameModel: Model<Game>,
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
  ) {}

  async findForGame(slug: string, page: number): Promise<GameCommentsResponse> {
    const game = await this.findPublishedGame(slug);
    const filter = { gameId: game._id, status: 'published' };
    const [comments, total] = await Promise.all([
      this.commentModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean<CommentRecord[]>()
        .exec(),
      this.commentModel.countDocuments(filter).exec(),
    ]);

    return {
      comments: comments.map((comment) => this.toResponse(comment)),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async create(
    slug: string,
    customerId: string,
    message: string,
  ): Promise<GameCommentResponse> {
    const [game, customer] = await Promise.all([
      this.findPublishedGame(slug),
      this.customerModel.findById(customerId).lean<Customer>().exec(),
    ]);
    if (!customer) throw new NotFoundException('Customer not found');

    const comment = await this.commentModel.create({
      authorDisplayName: customer.displayName,
      ...(customer.pictureUrl ? { authorPictureUrl: customer.pictureUrl } : {}),
      customerId: new Types.ObjectId(customerId),
      gameId: game._id,
      message,
      status: 'published',
    });

    return this.toResponse(comment as GameComment & { _id: Types.ObjectId });
  }

  private async findPublishedGame(
    slug: string,
  ): Promise<{ _id: Types.ObjectId }> {
    const game = await this.gameModel
      .findOne({
        $or: [
          { publishAt: { $exists: false } },
          { publishAt: null },
          { publishAt: { $lte: new Date() } },
        ],
        slug,
        status: 'published',
      })
      .select({ _id: 1 })
      .lean<{ _id: Types.ObjectId }>()
      .exec();
    if (!game) throw new NotFoundException('Game not found');
    return game;
  }

  private toResponse(comment: CommentRecord): GameCommentResponse {
    return {
      author: {
        displayName: comment.authorDisplayName,
        ...(comment.authorPictureUrl
          ? { pictureUrl: comment.authorPictureUrl }
          : {}),
      },
      createdAt: comment.createdAt.toISOString(),
      id: comment._id.toString(),
      message: comment.message,
    };
  }
}
