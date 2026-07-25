import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { Customer, CustomerSchema } from './customer.schema.js';
import { PointsAccount, PointsAccountSchema } from './points-account.schema.js';
import { CustomerSession, CustomerSessionSchema } from './session.schema.js';

@Module({
  controllers: [AuthController],
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: PointsAccount.name, schema: PointsAccountSchema },
      { name: CustomerSession.name, schema: CustomerSessionSchema },
    ]),
  ],
  providers: [AuthService],
})
export class AuthModule {}
