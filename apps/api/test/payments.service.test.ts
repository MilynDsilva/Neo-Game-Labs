import { ConfigService } from '@nestjs/config';
import { createHmac } from 'node:crypto';
import type { Model } from 'mongoose';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { TopUpPackageDocument } from '../src/wallet/top-up-package.schema.js';
import type { WalletService } from '../src/wallet/wallet.service.js';
import type { PaymentDocument } from '../src/payments/payment.schema.js';
import { PaymentsService } from '../src/payments/payments.service.js';
import type { ProcessedWebhookEventDocument } from '../src/payments/processed-event.schema.js';

const webhookSecret = 'razorpay-webhook-test-secret';
const payload = JSON.stringify({
  event: 'payment.captured',
  payload: {
    payment: {
      entity: {
        amount: 10_000,
        captured: true,
        currency: 'INR',
        id: 'pay_test_123',
        order_id: 'order_test_123',
        status: 'captured',
      },
    },
  },
});

function createService({
  paymentModel = {},
  walletService = {},
}: {
  paymentModel?: object;
  walletService?: object;
} = {}) {
  return new PaymentsService(
    new ConfigService({
      RAZORPAY_KEY_ID: 'rzp_test_example',
      RAZORPAY_KEY_SECRET: 'key-test-secret',
      RAZORPAY_WEBHOOK_SECRET: webhookSecret,
    }),
    walletService as WalletService,
    paymentModel as Model<PaymentDocument>,
    {} as Model<ProcessedWebhookEventDocument>,
    {} as Model<TopUpPackageDocument>,
  );
}

describe('PaymentsService Razorpay webhook verification', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('accepts a correctly signed raw payload', () => {
    const signature = createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    expect(
      createService().constructWebhook(Buffer.from(payload), signature).event,
    ).toBe('payment.captured');
  });

  it('rejects a payload with an invalid signature', () => {
    expect(() =>
      createService().constructWebhook(Buffer.from(payload), 'invalid'),
    ).toThrow('Invalid Razorpay signature');
  });

  it('credits points only after signature and captured-payment verification', async () => {
    const save = vi.fn();
    const payment = {
      amountMinor: 10_000,
      currency: 'INR',
      customerId: { toString: () => '507f1f77bcf86cd799439011' },
      points: 100,
      razorpayOrderId: 'order_test_123',
      save,
      status: 'pending',
    };
    const applyChange = vi.fn().mockResolvedValue({});
    const signature = createHmac('sha256', 'key-test-secret')
      .update('order_test_123|pay_test_123')
      .digest('hex');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            amount: 10_000,
            captured: true,
            currency: 'INR',
            id: 'pay_test_123',
            order_id: 'order_test_123',
            status: 'captured',
          }),
          { headers: { 'content-type': 'application/json' }, status: 200 },
        ),
      ),
    );
    const service = createService({
      paymentModel: {
        findOne: vi.fn().mockResolvedValue(payment),
      },
      walletService: { applyChange },
    });

    await expect(
      service.verifyCheckout('507f1f77bcf86cd799439011', {
        orderId: 'order_test_123',
        paymentId: 'pay_test_123',
        signature,
      }),
    ).resolves.toEqual({ credited: true });
    expect(applyChange).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: 'razorpay:order_test_123',
        pointsDelta: 100,
        type: 'top-up',
      }),
    );
    expect(payment.status).toBe('succeeded');
    expect(save).toHaveBeenCalled();
  });
});
