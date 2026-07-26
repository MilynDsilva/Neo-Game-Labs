import { ConfigService } from '@nestjs/config';
import type { Model } from 'mongoose';
import Stripe from 'stripe';
import { describe, expect, it } from 'vitest';

import type { TopUpPackageDocument } from '../src/wallet/top-up-package.schema.js';
import type { WalletService } from '../src/wallet/wallet.service.js';
import type { PaymentDocument } from '../src/payments/payment.schema.js';
import { PaymentsService } from '../src/payments/payments.service.js';
import type { ProcessedWebhookEventDocument } from '../src/payments/processed-event.schema.js';

const webhookSecret = 'whsec_test_secret';
const payload = JSON.stringify({
  created: 1_700_000_000,
  data: { object: { id: 'cs_test_123', object: 'checkout.session' } },
  id: 'evt_test_123',
  livemode: false,
  object: 'event',
  pending_webhooks: 1,
  request: null,
  type: 'checkout.session.completed',
});

function createService() {
  return new PaymentsService(
    new ConfigService({
      STRIPE_SECRET_KEY: 'sk_test_example',
      STRIPE_WEBHOOK_SECRET: webhookSecret,
      WEB_ORIGIN: 'http://localhost:3000',
    }),
    {} as WalletService,
    {} as Model<PaymentDocument>,
    {} as Model<ProcessedWebhookEventDocument>,
    {} as Model<TopUpPackageDocument>,
  );
}

describe('PaymentsService webhook verification', () => {
  it('accepts a correctly signed raw payload', () => {
    const signature = Stripe.webhooks.generateTestHeaderString({
      payload,
      secret: webhookSecret,
    });

    expect(
      createService().constructEvent(Buffer.from(payload), signature).id,
    ).toBe('evt_test_123');
  });

  it('rejects a payload with an invalid signature', () => {
    expect(() =>
      createService().constructEvent(Buffer.from(payload), 'invalid'),
    ).toThrow();
  });
});
