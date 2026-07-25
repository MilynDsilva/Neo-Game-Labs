import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import type { Connection, Model } from 'mongoose';
import { Types } from 'mongoose';

import { PointsAccount } from '../auth/points-account.schema.js';
import type { PointsAccountDocument } from '../auth/points-account.schema.js';
import { LedgerEntry } from './ledger-entry.schema.js';
import type { LedgerEntryDocument } from './ledger-entry.schema.js';
import { LedgerTransaction } from './ledger-transaction.schema.js';
import type { LedgerTransactionDocument } from './ledger-transaction.schema.js';
import { TopUpPackage } from './top-up-package.schema.js';
import type { TopUpPackageDocument } from './top-up-package.schema.js';

export type LedgerChange = {
  customerId: string;
  idempotencyKey: string;
  pointsDelta: number;
  reference?: string;
  type: 'top-up' | 'purchase' | 'refund' | 'adjustment';
};

@Injectable()
export class WalletService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(PointsAccount.name)
    private readonly accountModel: Model<PointsAccountDocument>,
    @InjectModel(LedgerTransaction.name)
    private readonly transactionModel: Model<LedgerTransactionDocument>,
    @InjectModel(LedgerEntry.name)
    private readonly entryModel: Model<LedgerEntryDocument>,
    @InjectModel(TopUpPackage.name)
    private readonly packageModel: Model<TopUpPackageDocument>,
  ) {}

  async getWallet(customerId: string) {
    const objectId = new Types.ObjectId(customerId);
    const [account, transactions] = await Promise.all([
      this.accountModel.findOne({ customerId: objectId }).lean(),
      this.transactionModel
        .find({ customerId: objectId, status: 'committed' })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
    ]);
    if (!account) throw new BadRequestException('Points account not found');

    return {
      balance: account.balance,
      transactions: transactions.map((transaction) => ({
        createdAt: transaction.createdAt.toISOString(),
        id: transaction._id.toString(),
        pointsDelta: transaction.pointsDelta,
        reference: transaction.reference,
        type: transaction.type,
      })),
    };
  }

  async listTopUpPackages(currency?: 'INR' | 'USD') {
    const packages = await this.packageModel
      .find({ active: true, ...(currency ? { currency } : {}) })
      .sort({ currency: 1, amountMinor: 1 })
      .lean();

    return {
      packages: packages.map((item) => ({
        amountMinor: item.amountMinor,
        code: item.code,
        currency: item.currency,
        points: item.points,
      })),
    };
  }

  async applyChange(change: LedgerChange) {
    if (!Number.isInteger(change.pointsDelta) || change.pointsDelta === 0) {
      throw new BadRequestException('Points delta must be a non-zero integer');
    }

    const existing = await this.transactionModel
      .findOne({ idempotencyKey: change.idempotencyKey })
      .lean();
    if (existing) return existing;

    let result: LedgerTransactionDocument | undefined;
    try {
      await this.connection.transaction(
        async (databaseSession) => {
          const [transaction] = await this.transactionModel.create(
            [
              {
                customerId: new Types.ObjectId(change.customerId),
                idempotencyKey: change.idempotencyKey,
                pointsDelta: change.pointsDelta,
                reference: change.reference,
                type: change.type,
              },
            ],
            { session: databaseSession },
          );
          if (!transaction) throw new Error('Ledger transaction was not saved');

          const account = await this.accountModel.findOneAndUpdate(
            {
              customerId: transaction.customerId,
              ...(change.pointsDelta < 0
                ? { balance: { $gte: -change.pointsDelta } }
                : {}),
            },
            { $inc: { balance: change.pointsDelta } },
            { new: true, session: databaseSession },
          );
          if (!account) {
            throw new BadRequestException('Insufficient points balance');
          }

          await this.entryModel.create(
            [
              {
                balanceAfter: account.balance,
                customerId: transaction.customerId,
                pointsDelta: change.pointsDelta,
                transactionId: transaction._id,
              },
            ],
            { session: databaseSession },
          );
          result = transaction;
        },
        {
          readConcern: { level: 'snapshot' },
          writeConcern: { j: true, w: 'majority' },
        },
      );
    } catch (error: unknown) {
      const duplicate = await this.transactionModel
        .findOne({ idempotencyKey: change.idempotencyKey })
        .lean();
      if (duplicate) return duplicate;
      throw error;
    }

    if (!result) throw new Error('Ledger transaction failed');
    return result;
  }
}
