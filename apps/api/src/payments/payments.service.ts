import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { z } from 'zod';

import { TopUpPackage } from '../wallet/top-up-package.schema.js';
import type { TopUpPackageDocument } from '../wallet/top-up-package.schema.js';
import { WalletService } from '../wallet/wallet.service.js';
import { Payment } from './payment.schema.js';
import type { PaymentDocument } from './payment.schema.js';
import { ProcessedWebhookEvent } from './processed-event.schema.js';
import type { ProcessedWebhookEventDocument } from './processed-event.schema.js';

const razorpayOrderSchema = z.object({
  amount: z.number().int().positive(),
  currency: z.string().length(3),
  id: z.string().min(1),
  status: z.enum(['created', 'attempted', 'paid']),
});

const razorpayPaymentSchema = z.object({
  amount: z.number().int().positive(),
  captured: z.boolean(),
  currency: z.string().length(3),
  id: z.string().min(1),
  order_id: z.string().min(1),
  status: z.enum(['created', 'authorized', 'captured', 'refunded', 'failed']),
});

const razorpayWebhookSchema = z.object({
  event: z.string().min(1),
  payload: z
    .object({
      payment: z
        .object({
          entity: razorpayPaymentSchema,
        })
        .optional(),
    })
    .passthrough(),
});

export type RazorpayWebhook = z.infer<typeof razorpayWebhookSchema>;

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(WalletService)
    private readonly walletService: WalletService,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(ProcessedWebhookEvent.name)
    private readonly eventModel: Model<ProcessedWebhookEventDocument>,
    @InjectModel(TopUpPackage.name)
    private readonly packageModel: Model<TopUpPackageDocument>,
  ) {}

  async createCheckout(
    customerId: string,
    packageCode: string,
    checkoutRequestKey: string,
  ) {
    const topUpPackage = await this.packageModel
      .findOne({ active: true, code: packageCode })
      .lean();
    if (!topUpPackage) throw new BadRequestException('Unknown top-up package');

    const payment = await this.paymentModel.findOneAndUpdate(
      { checkoutRequestKey, customerId: new Types.ObjectId(customerId) },
      {
        $setOnInsert: {
          amountMinor: topUpPackage.amountMinor,
          checkoutRequestKey,
          currency: topUpPackage.currency,
          customerId: new Types.ObjectId(customerId),
          packageCode: topUpPackage.code,
          points: topUpPackage.points,
          status: 'pending',
        },
      },
      { new: true, upsert: true },
    );
    if (payment.packageCode !== packageCode) {
      throw new BadRequestException('Checkout key already used');
    }
    if (!payment.razorpayOrderId) {
      const order = await this.razorpayRequest(
        '/orders',
        {
          body: JSON.stringify({
            amount: payment.amountMinor,
            currency: payment.currency,
            notes: {
              customerId,
              packageCode: payment.packageCode,
              paymentId: payment._id.toString(),
            },
            receipt: `ngl_${payment._id.toString()}`,
          }),
          method: 'POST',
        },
        razorpayOrderSchema,
      );
      payment.razorpayOrderId = order.id;
      await payment.save();
    }

    return {
      amount: payment.amountMinor,
      currency: payment.currency,
      description: `${payment.points} Neo Game Labs points`,
      keyId: this.keyId,
      name: 'Neo Game Labs',
      orderId: payment.razorpayOrderId,
    };
  }

  async verifyCheckout(
    customerId: string,
    input: {
      orderId: string;
      paymentId: string;
      signature: string;
    },
  ) {
    const payment = await this.paymentModel.findOne({
      customerId: new Types.ObjectId(customerId),
      razorpayOrderId: input.orderId,
    });
    if (!payment) throw new BadRequestException('Payment order not found');

    this.assertSignature(
      `${payment.razorpayOrderId}|${input.paymentId}`,
      input.signature,
      this.keySecret,
    );
    const providerPayment = await this.razorpayRequest(
      `/payments/${encodeURIComponent(input.paymentId)}`,
      undefined,
      razorpayPaymentSchema,
    );
    await this.completeCapturedPayment(payment, providerPayment);
    const wallet = await this.walletService.getWallet(customerId);
    return {
      balance: wallet.balance,
      credited: true,
      points: payment.points,
    };
  }

  constructWebhook(rawBody: Buffer, signature: string): RazorpayWebhook {
    const webhookSecret = this.configService.get<string>(
      'RAZORPAY_WEBHOOK_SECRET',
    );
    if (!webhookSecret) {
      throw new ServiceUnavailableException(
        'Razorpay webhook is not configured',
      );
    }
    this.assertSignature(rawBody, signature, webhookSecret);
    let body: unknown;
    try {
      body = JSON.parse(rawBody.toString('utf8')) as unknown;
    } catch {
      throw new BadRequestException('Invalid Razorpay webhook');
    }
    const parsed = razorpayWebhookSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException('Invalid Razorpay webhook');
    }
    return parsed.data;
  }

  async processWebhook(
    eventId: string,
    webhook: RazorpayWebhook,
  ): Promise<void> {
    if (await this.eventModel.exists({ eventId })) return;

    const providerPayment = webhook.payload.payment?.entity;
    if (webhook.event === 'payment.captured' && providerPayment) {
      const payment = await this.paymentModel.findOne({
        razorpayOrderId: providerPayment.order_id,
      });
      if (!payment) throw new BadRequestException('Payment order not found');
      await this.completeCapturedPayment(payment, providerPayment);
    } else if (webhook.event === 'payment.failed' && providerPayment) {
      await this.paymentModel.updateOne(
        {
          razorpayOrderId: providerPayment.order_id,
          status: { $ne: 'succeeded' },
        },
        {
          $set: {
            razorpayPaymentId: providerPayment.id,
            status: 'failed',
          },
        },
      );
    }

    await this.eventModel.updateOne(
      { eventId },
      {
        $setOnInsert: {
          eventId,
          eventType: webhook.event,
        },
      },
      { upsert: true },
    );
  }

  private async completeCapturedPayment(
    payment: PaymentDocument,
    providerPayment: z.infer<typeof razorpayPaymentSchema>,
  ) {
    if (
      providerPayment.order_id !== payment.razorpayOrderId ||
      providerPayment.amount !== payment.amountMinor ||
      providerPayment.currency.toUpperCase() !== payment.currency ||
      providerPayment.status !== 'captured' ||
      !providerPayment.captured
    ) {
      throw new BadRequestException(
        'Razorpay payment does not match local order',
      );
    }

    await this.walletService.applyChange({
      customerId: payment.customerId.toString(),
      idempotencyKey: `razorpay:${providerPayment.order_id}`,
      pointsDelta: payment.points,
      reference: providerPayment.id,
      type: 'top-up',
    });
    payment.razorpayPaymentId = providerPayment.id;
    payment.status = 'succeeded';
    await payment.save();
  }

  private async razorpayRequest<T>(
    path: string,
    init: RequestInit | undefined,
    schema: z.ZodType<T>,
  ): Promise<T> {
    const authorization = Buffer.from(
      `${this.keyId}:${this.keySecret}`,
    ).toString('base64');
    const response = await fetch(`https://api.razorpay.com/v1${path}`, {
      ...init,
      headers: {
        authorization: `Basic ${authorization}`,
        'content-type': 'application/json',
        ...init?.headers,
      },
    });
    if (!response.ok) {
      throw new ServiceUnavailableException('Razorpay request failed');
    }
    const parsed = schema.safeParse(await response.json());
    if (!parsed.success) {
      throw new ServiceUnavailableException('Invalid Razorpay response');
    }
    return parsed.data;
  }

  private assertSignature(
    message: Buffer | string,
    received: string,
    secret: string,
  ) {
    const expected = createHmac('sha256', secret).update(message).digest('hex');
    const receivedBuffer = Buffer.from(received);
    const expectedBuffer = Buffer.from(expected);
    if (
      receivedBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(receivedBuffer, expectedBuffer)
    ) {
      throw new UnauthorizedException('Invalid Razorpay signature');
    }
  }

  private get keyId(): string {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    if (!keyId) {
      throw new ServiceUnavailableException('Razorpay is not configured');
    }
    return keyId;
  }

  private get keySecret(): string {
    const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    if (!secret) {
      throw new ServiceUnavailableException('Razorpay is not configured');
    }
    return secret;
  }
}
