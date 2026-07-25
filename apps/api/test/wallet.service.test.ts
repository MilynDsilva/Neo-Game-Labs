import type { Connection, Model } from 'mongoose';
import { describe, expect, it } from 'vitest';

import type { PointsAccountDocument } from '../src/auth/points-account.schema.js';
import type { LedgerEntryDocument } from '../src/wallet/ledger-entry.schema.js';
import type { LedgerTransactionDocument } from '../src/wallet/ledger-transaction.schema.js';
import type { TopUpPackageDocument } from '../src/wallet/top-up-package.schema.js';
import { WalletService } from '../src/wallet/wallet.service.js';

describe('WalletService', () => {
  it('rejects a zero-value ledger change before accessing the database', async () => {
    const service = new WalletService(
      {} as Connection,
      {} as Model<PointsAccountDocument>,
      {} as Model<LedgerTransactionDocument>,
      {} as Model<LedgerEntryDocument>,
      {} as Model<TopUpPackageDocument>,
    );

    await expect(
      service.applyChange({
        customerId: '507f1f77bcf86cd799439011',
        idempotencyKey: 'test-change',
        pointsDelta: 0,
        type: 'adjustment',
      }),
    ).rejects.toThrow('Points delta must be a non-zero integer');
  });
});
