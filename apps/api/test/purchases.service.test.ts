import type { Connection, Model } from 'mongoose';
import { Types } from 'mongoose';
import { describe, expect, it, vi } from 'vitest';

import type { GameDocument } from '../src/catalog/game.schema.js';
import type { EntitlementDocument } from '../src/purchases/entitlement.schema.js';
import type { PurchaseDocument } from '../src/purchases/purchase.schema.js';
import { PurchasesService } from '../src/purchases/purchases.service.js';
import type { WalletService } from '../src/wallet/wallet.service.js';

describe('PurchasesService', () => {
  it('returns an existing entitlement without debiting points again', async () => {
    const gameId = new Types.ObjectId();
    const entitlementId = new Types.ObjectId();
    const gameModel = {
      findOne: vi.fn().mockResolvedValue({
        _id: gameId,
        pointPrice: 250,
        slug: 'orbit-breaker',
        title: 'Orbit Breaker',
      }),
    };
    const entitlementModel = {
      findOne: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({ _id: entitlementId }),
      }),
    };
    const walletService = {
      applyChangeWithinTransaction: vi.fn(),
    };
    const service = new PurchasesService(
      {} as Connection,
      gameModel as unknown as Model<GameDocument>,
      {} as Model<PurchaseDocument>,
      entitlementModel as unknown as Model<EntitlementDocument>,
      walletService as unknown as WalletService,
    );

    await expect(
      service.purchaseGame(new Types.ObjectId().toString(), 'orbit-breaker'),
    ).resolves.toEqual({
      alreadyOwned: true,
      entitlementId: entitlementId.toString(),
    });
    expect(walletService.applyChangeWithinTransaction).not.toHaveBeenCalled();
  });
});
