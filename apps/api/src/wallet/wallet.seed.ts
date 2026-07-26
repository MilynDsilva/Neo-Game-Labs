import mongoose from 'mongoose';

import { TopUpPackage, TopUpPackageSchema } from './top-up-package.schema.js';

const packages = [
  { amountMinor: 10_000, code: 'inr-100-v1', currency: 'INR', points: 100 },
  { amountMinor: 50_000, code: 'inr-500-v1', currency: 'INR', points: 550 },
  { amountMinor: 200, code: 'usd-2-v1', currency: 'USD', points: 100 },
  { amountMinor: 1_000, code: 'usd-10-v1', currency: 'USD', points: 550 },
] as const;

async function seedWallet(): Promise<void> {
  await mongoose.connect(
    process.env.MONGODB_URI ??
      'mongodb://localhost:27017/customer_dashboard?replicaSet=rs0',
  );
  const packageModel =
    mongoose.models[TopUpPackage.name] ??
    mongoose.model(TopUpPackage.name, TopUpPackageSchema);

  for (const item of packages) {
    await packageModel.updateOne(
      { code: item.code },
      { $set: { ...item, active: true } },
      { upsert: true },
    );
  }
  await mongoose.disconnect();
}

void seedWallet();
