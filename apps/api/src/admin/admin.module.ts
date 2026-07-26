import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Customer, CustomerSchema } from '../auth/customer.schema.js';
import {
  PointsAccount,
  PointsAccountSchema,
} from '../auth/points-account.schema.js';
import { Game, GameSchema } from '../catalog/game.schema.js';
import { Feedback, FeedbackSchema } from '../feedback/feedback.schema.js';
import { Purchase, PurchaseSchema } from '../purchases/purchase.schema.js';
import { WalletModule } from '../wallet/wallet.module.js';
import {
  AdminAuditEvent,
  AdminAuditEventSchema,
} from './admin-audit.schema.js';
import { AdminController } from './admin.controller.js';
import { AdminGuard } from './admin.guard.js';
import { AdminService } from './admin.service.js';

@Module({
  controllers: [AdminController],
  imports: [
    WalletModule,
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: PointsAccount.name, schema: PointsAccountSchema },
      { name: Game.name, schema: GameSchema },
      { name: Feedback.name, schema: FeedbackSchema },
      { name: Purchase.name, schema: PurchaseSchema },
      { name: AdminAuditEvent.name, schema: AdminAuditEventSchema },
    ]),
  ],
  providers: [AdminGuard, AdminService],
})
export class AdminModule {}
