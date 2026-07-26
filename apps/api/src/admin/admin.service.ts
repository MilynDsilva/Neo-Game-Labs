import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'node:crypto';
import { isValidObjectId } from 'mongoose';
import type { ClientSession, Connection, Model } from 'mongoose';
import { z } from 'zod';

import { Customer } from '../auth/customer.schema.js';
import type { CustomerDocument } from '../auth/customer.schema.js';
import { PointsAccount } from '../auth/points-account.schema.js';
import type { PointsAccountDocument } from '../auth/points-account.schema.js';
import { Game } from '../catalog/game.schema.js';
import type { GameDocument } from '../catalog/game.schema.js';
import { Feedback } from '../feedback/feedback.schema.js';
import type { FeedbackDocument } from '../feedback/feedback.schema.js';
import { Purchase } from '../purchases/purchase.schema.js';
import type { PurchaseDocument } from '../purchases/purchase.schema.js';
import { WalletService } from '../wallet/wallet.service.js';
import { AdminAuditEvent } from './admin-audit.schema.js';
import type { AdminAuditEventDocument } from './admin-audit.schema.js';

const gameUpdateSchema = z
  .object({
    featured: z.boolean().optional(),
    pointPrice: z.number().int().min(0).optional(),
    status: z.enum(['draft', 'scheduled', 'published', 'archived']).optional(),
  })
  .refine((value) => Object.keys(value).length > 0);

const feedbackUpdateSchema = z
  .object({
    internalNotes: z.string().trim().max(4000).optional(),
    status: z.enum(['new', 'triaged', 'in-progress', 'resolved', 'closed']),
  })
  .strict();

const creditCustomerSchema = z
  .object({
    points: z.number().int().min(1).max(100_000),
    reason: z.string().trim().min(3).max(200),
  })
  .strict();

const customerQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  page: z.coerce.number().int().min(1).default(1),
  search: z.string().trim().max(120).default(''),
});

@Injectable()
export class AdminService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(PointsAccount.name)
    private readonly pointsAccountModel: Model<PointsAccountDocument>,
    @InjectModel(Game.name)
    private readonly gameModel: Model<GameDocument>,
    @InjectModel(Feedback.name)
    private readonly feedbackModel: Model<FeedbackDocument>,
    @InjectModel(Purchase.name)
    private readonly purchaseModel: Model<PurchaseDocument>,
    @InjectModel(AdminAuditEvent.name)
    private readonly auditModel: Model<AdminAuditEventDocument>,
    @Inject(WalletService) private readonly walletService: WalletService,
  ) {}

  async overview() {
    const [
      customers,
      games,
      publishedGames,
      openFeedback,
      purchases,
      points,
      recentFeedback,
    ] = await Promise.all([
      this.customerModel.countDocuments(),
      this.gameModel.countDocuments(),
      this.gameModel.countDocuments({ status: 'published' }),
      this.feedbackModel.countDocuments({
        status: { $in: ['new', 'triaged', 'in-progress'] },
      }),
      this.purchaseModel.countDocuments(),
      this.pointsAccountModel.aggregate<{ total: number }>([
        { $group: { _id: null, total: { $sum: '$balance' } } },
      ]),
      this.feedbackModel
        .find()
        .select('+internalNotes')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    return {
      metrics: {
        customers,
        games,
        openFeedback,
        pointsInWallets: points[0]?.total ?? 0,
        publishedGames,
        purchases,
      },
      recentFeedback: recentFeedback.map((item) => this.feedbackView(item)),
    };
  }

  async listGames() {
    const games = await this.gameModel.find().sort({ updatedAt: -1 }).lean();
    return {
      games: games.map((game) => ({
        featured: game.featured,
        id: game._id.toString(),
        platforms: game.platforms.map((platform) => platform.kind),
        pointPrice: game.pointPrice,
        slug: game.slug,
        status: game.status,
        title: game.title,
      })),
    };
  }

  async updateGame(id: string, input: unknown, actor: string) {
    this.assertObjectId(id);
    const update = this.parse(gameUpdateSchema, input);
    const game = await this.gameModel
      .findByIdAndUpdate(id, { $set: update }, { new: true })
      .lean();
    if (!game) throw new NotFoundException('Game not found');
    await this.audit('game.updated', actor, 'game', id, update);
    return {
      featured: game.featured,
      id: game._id.toString(),
      pointPrice: game.pointPrice,
      status: game.status,
      title: game.title,
    };
  }

  async listFeedback(status?: string) {
    const allowed = ['new', 'triaged', 'in-progress', 'resolved', 'closed'];
    if (status && !allowed.includes(status)) {
      throw new BadRequestException('Invalid feedback status');
    }
    const feedback = await this.feedbackModel
      .find(status ? { status } : {})
      .select('+internalNotes')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return { feedback: feedback.map((item) => this.feedbackView(item)) };
  }

  async updateFeedback(id: string, input: unknown, actor: string) {
    this.assertObjectId(id);
    const update = this.parse(feedbackUpdateSchema, input);
    const feedback = await this.feedbackModel
      .findByIdAndUpdate(id, { $set: update }, { new: true })
      .select('+internalNotes')
      .lean();
    if (!feedback) throw new NotFoundException('Feedback not found');
    await this.audit('feedback.updated', actor, 'feedback', id, {
      hasInternalNotes: Boolean(update.internalNotes),
      status: update.status,
    });
    return this.feedbackView(feedback);
  }

  async listCustomers(input: {
    limit?: number | string;
    page?: number | string;
    search?: string;
  }) {
    const query = this.parse(customerQuerySchema, input);
    const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const filter = query.search
      ? {
          $or: [
            { displayName: { $regex: escaped, $options: 'i' } },
            { email: { $regex: escaped, $options: 'i' } },
          ],
        }
      : {};
    const [customers, total] = await Promise.all([
      this.customerModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      this.customerModel.countDocuments(filter),
    ]);
    const ids = customers.map((customer) => customer._id);
    const accounts = await this.pointsAccountModel
      .find({ customerId: { $in: ids } })
      .lean();
    const balances = new Map(
      accounts.map((account) => [
        account.customerId.toString(),
        account.balance,
      ]),
    );
    return {
      customers: customers.map((customer) => ({
        deletionPending: Boolean(customer.deletionRequestedAt),
        displayName: customer.displayName,
        email: customer.email,
        id: customer._id.toString(),
        pointsBalance: balances.get(customer._id.toString()) ?? 0,
      })),
      pagination: {
        limit: query.limit,
        page: query.page,
        pages: Math.max(1, Math.ceil(total / query.limit)),
        total,
      },
    };
  }

  async listAudit() {
    const events = await this.auditModel
      .find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return {
      events: events.map((event) => ({
        action: event.action,
        actor: event.actor,
        changes: event.changes,
        createdAt: event.createdAt.toISOString(),
        id: event._id.toString(),
        targetId: event.targetId,
        targetType: event.targetType,
      })),
    };
  }

  async creditCustomer(id: string, input: unknown, actor: string) {
    this.assertObjectId(id);
    const credit = this.parse(creditCustomerSchema, input);
    const customer = await this.customerModel.findById(id).lean();
    if (!customer) throw new NotFoundException('Customer not found');

    let ledgerTransactionId: string | undefined;
    await this.connection.transaction(async (databaseSession) => {
      const transaction = await this.walletService.applyChangeWithinTransaction(
        {
          customerId: id,
          idempotencyKey: `admin-credit:${randomUUID()}`,
          pointsDelta: credit.points,
          reference: `Admin credit: ${credit.reason}`,
          type: 'adjustment',
        },
        databaseSession,
      );
      ledgerTransactionId = transaction._id.toString();
      await this.audit(
        'customer.points-credited',
        actor,
        'customer',
        id,
        {
          ledgerTransactionId,
          points: credit.points,
          reason: credit.reason,
        },
        databaseSession,
      );
    });
    if (!ledgerTransactionId) {
      throw new Error('Admin credit was not recorded');
    }

    const account = await this.pointsAccountModel
      .findOne({ customerId: customer._id })
      .lean();
    return {
      customerId: id,
      ledgerTransactionId,
      pointsBalance: account?.balance ?? 0,
    };
  }

  private feedbackView(feedback: {
    _id: { toString(): string };
    category: string;
    createdAt: Date;
    internalNotes?: string;
    message: string;
    rating: number;
    reference: string;
    status: string;
  }) {
    return {
      category: feedback.category,
      createdAt: feedback.createdAt.toISOString(),
      id: feedback._id.toString(),
      internalNotes: feedback.internalNotes ?? '',
      message: feedback.message,
      rating: feedback.rating,
      reference: feedback.reference,
      status: feedback.status,
    };
  }

  private async audit(
    action: string,
    actor: string,
    targetType: string,
    targetId: string,
    changes: Record<string, unknown>,
    session?: ClientSession,
  ) {
    await this.auditModel.create(
      [{ action, actor, changes, targetId, targetType }],
      session ? { session } : undefined,
    );
  }

  private assertObjectId(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid identifier');
    }
  }

  private parse<T>(schema: z.ZodType<T>, input: unknown): T {
    const result = schema.safeParse(input);
    if (!result.success) {
      throw new BadRequestException('Invalid admin update');
    }
    return result.data;
  }
}
