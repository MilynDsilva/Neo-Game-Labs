import { getModelToken } from '@nestjs/mongoose';
import { NestFactory } from '@nestjs/core';
import type { Model } from 'mongoose';

import { AppModule } from '../app.module.js';
import { Customer } from '../auth/customer.schema.js';
import type { CustomerDocument } from '../auth/customer.schema.js';
import { WalletService } from './wallet.service.js';

async function seedDevelopmentCredit(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Development credits cannot run in production');
  }
  const email = process.env.CUSTOMER_EMAIL;
  const points = Number(process.env.POINTS);
  if (!email || !Number.isInteger(points) || points <= 0) {
    throw new Error('Set CUSTOMER_EMAIL and a positive integer POINTS value');
  }

  const application = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'],
  });
  try {
    const customerModel = application.get<Model<CustomerDocument>>(
      getModelToken(Customer.name),
    );
    const customer = await customerModel.findOne({ email }).lean();
    if (!customer) throw new Error('Customer was not found');

    await application.get(WalletService).applyChange({
      customerId: customer._id.toString(),
      idempotencyKey: `development-credit:${email}:${points}:v1`,
      pointsDelta: points,
      reference: 'local-development-seed',
      type: 'adjustment',
    });
  } finally {
    await application.close();
  }
}

void seedDevelopmentCredit();
