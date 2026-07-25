import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module.js';
import {
  PointsAccount,
  PointsAccountSchema,
} from '../auth/points-account.schema.js';
import { LedgerEntry, LedgerEntrySchema } from './ledger-entry.schema.js';
import {
  LedgerTransaction,
  LedgerTransactionSchema,
} from './ledger-transaction.schema.js';
import { TopUpPackage, TopUpPackageSchema } from './top-up-package.schema.js';
import { WalletController } from './wallet.controller.js';
import { WalletService } from './wallet.service.js';

@Module({
  controllers: [WalletController],
  exports: [WalletService],
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: PointsAccount.name, schema: PointsAccountSchema },
      { name: LedgerTransaction.name, schema: LedgerTransactionSchema },
      { name: LedgerEntry.name, schema: LedgerEntrySchema },
      { name: TopUpPackage.name, schema: TopUpPackageSchema },
    ]),
  ],
  providers: [WalletService],
})
export class WalletModule {}
