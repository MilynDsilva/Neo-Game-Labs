import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module.js';
import {
  TopUpPackage,
  TopUpPackageSchema,
} from '../wallet/top-up-package.schema.js';
import { WalletModule } from '../wallet/wallet.module.js';
import { Payment, PaymentSchema } from './payment.schema.js';
import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';
import {
  ProcessedWebhookEvent,
  ProcessedWebhookEventSchema,
} from './processed-event.schema.js';

@Module({
  controllers: [PaymentsController],
  imports: [
    AuthModule,
    WalletModule,
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: ProcessedWebhookEvent.name, schema: ProcessedWebhookEventSchema },
      { name: TopUpPackage.name, schema: TopUpPackageSchema },
    ]),
  ],
  providers: [PaymentsService],
})
export class PaymentsModule {}
