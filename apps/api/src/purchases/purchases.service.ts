import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import type { Connection, Model } from 'mongoose';
import { Types } from 'mongoose';

import { Game } from '../catalog/game.schema.js';
import type { GameDocument } from '../catalog/game.schema.js';
import { WalletService } from '../wallet/wallet.service.js';
import { Entitlement } from './entitlement.schema.js';
import type { EntitlementDocument } from './entitlement.schema.js';
import { Purchase } from './purchase.schema.js';
import type { PurchaseDocument } from './purchase.schema.js';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Game.name) private readonly gameModel: Model<GameDocument>,
    @InjectModel(Purchase.name)
    private readonly purchaseModel: Model<PurchaseDocument>,
    @InjectModel(Entitlement.name)
    private readonly entitlementModel: Model<EntitlementDocument>,
    @Inject(WalletService) private readonly walletService: WalletService,
  ) {}

  async purchaseGame(customerId: string, gameSlug: string) {
    const game = await this.gameModel.findOne({
      slug: gameSlug,
      status: 'published',
      $or: [
        { publishAt: { $exists: false } },
        { publishAt: null },
        { publishAt: { $lte: new Date() } },
      ],
    });
    if (!game) throw new BadRequestException('Game is not available');

    const customerObjectId = new Types.ObjectId(customerId);
    const existing = await this.entitlementModel
      .findOne({
        customerId: customerObjectId,
        gameId: game._id,
        status: 'active',
      })
      .lean();
    if (existing) {
      return { alreadyOwned: true, entitlementId: existing._id.toString() };
    }

    let entitlementId: string | undefined;
    try {
      await this.connection.transaction(
        async (databaseSession) => {
          const [purchase] = await this.purchaseModel.create(
            [
              {
                customerId: customerObjectId,
                gameId: game._id,
                gameSlug: game.slug,
                gameTitle: game.title,
                pointsPaid: game.pointPrice,
              },
            ],
            { session: databaseSession },
          );
          if (!purchase) throw new Error('Purchase was not saved');

          if (game.pointPrice > 0) {
            await this.walletService.applyChangeWithinTransaction(
              {
                customerId,
                idempotencyKey: `purchase:${customerId}:${game._id.toString()}`,
                pointsDelta: -game.pointPrice,
                reference: purchase._id.toString(),
                type: 'purchase',
              },
              databaseSession,
            );
          }

          const [entitlement] = await this.entitlementModel.create(
            [
              {
                customerId: customerObjectId,
                gameId: game._id,
                purchaseId: purchase._id,
              },
            ],
            { session: databaseSession },
          );
          if (!entitlement) throw new Error('Entitlement was not saved');
          entitlementId = entitlement._id.toString();
        },
        {
          readConcern: { level: 'snapshot' },
          writeConcern: { j: true, w: 'majority' },
        },
      );
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11_000
      ) {
        const entitlement = await this.entitlementModel
          .findOne({ customerId: customerObjectId, gameId: game._id })
          .lean();
        if (entitlement) {
          return {
            alreadyOwned: true,
            entitlementId: entitlement._id.toString(),
          };
        }
      }
      throw error;
    }

    if (!entitlementId) throw new Error('Purchase transaction failed');
    return { alreadyOwned: false, entitlementId };
  }

  async getLibrary(customerId: string) {
    const customerObjectId = new Types.ObjectId(customerId);
    const entitlements = await this.entitlementModel
      .find({ customerId: customerObjectId, status: 'active' })
      .sort({ createdAt: -1 })
      .lean();
    const gameIds = entitlements.map((item) => item.gameId);
    const purchaseIds = entitlements.map((item) => item.purchaseId);
    const [games, purchases] = await Promise.all([
      this.gameModel.find({ _id: { $in: gameIds } }).lean(),
      this.purchaseModel.find({ _id: { $in: purchaseIds } }).lean(),
    ]);
    const gamesById = new Map(games.map((game) => [game._id.toString(), game]));
    const purchasesById = new Map(
      purchases.map((purchase) => [purchase._id.toString(), purchase]),
    );

    return {
      games: entitlements.flatMap((entitlement) => {
        const game = gamesById.get(entitlement.gameId.toString());
        const purchase = purchasesById.get(entitlement.purchaseId.toString());
        if (!game || !purchase) return [];
        return [
          {
            acquiredAt: entitlement.createdAt.toISOString(),
            coverImageUrl: game.coverImageUrl,
            entitlementId: entitlement._id.toString(),
            platforms: game.platforms,
            pointsPaid: purchase.pointsPaid,
            slug: game.slug,
            title: game.title,
          },
        ];
      }),
    };
  }
}
