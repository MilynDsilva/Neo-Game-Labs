import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module.js';
import { Game, GameSchema } from '../catalog/game.schema.js';
import { WalletModule } from '../wallet/wallet.module.js';
import { Entitlement, EntitlementSchema } from './entitlement.schema.js';
import { Purchase, PurchaseSchema } from './purchase.schema.js';
import { PurchasesController } from './purchases.controller.js';
import { PurchasesService } from './purchases.service.js';

@Module({
  controllers: [PurchasesController],
  imports: [
    AuthModule,
    WalletModule,
    MongooseModule.forFeature([
      { name: Game.name, schema: GameSchema },
      { name: Purchase.name, schema: PurchaseSchema },
      { name: Entitlement.name, schema: EntitlementSchema },
    ]),
  ],
  providers: [PurchasesService],
})
export class PurchasesModule {}
