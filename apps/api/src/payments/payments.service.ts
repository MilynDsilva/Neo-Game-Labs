import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import Stripe from 'stripe';

import { TopUpPackage } from '../wallet/top-up-package.schema.js';
import type { TopUpPackageDocument } from '../wallet/top-up-package.schema.js';
import { WalletService } from '../wallet/wallet.service.js';
import { Payment } from './payment.schema.js';
import type { PaymentDocument } from './payment.schema.js';
import { ProcessedWebhookEvent } from './processed-event.schema.js';
import type { ProcessedWebhookEventDocument } from './processed-event.schema.js';

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
    if (payment.checkoutUrl) return { url: payment.checkoutUrl };
    if (payment.packageCode !== packageCode) {
      throw new BadRequestException('Checkout key already used');
    }

    const session = await this.stripe.checkout.sessions.create(
      {
        line_items: [
          {
            price_data: {
              currency: payment.currency.toLowerCase(),
              product_data: {
                name: `${payment.points} Neo Game Labs points`,
              },
              unit_amount: payment.amountMinor,
            },
            quantity: 1,
          },
        ],
        metadata: {
          customerId,
          packageCode: payment.packageCode,
          paymentId: payment._id.toString(),
        },
        mode: 'payment',
        payment_intent_data: {
          metadata: { paymentId: payment._id.toString() },
        },
        success_url: `${this.webOrigin}/wallet?checkout=success`,
        cancel_url: `${this.webOrigin}/wallet?checkout=cancelled`,
      },
      { idempotencyKey: `checkout:${checkoutRequestKey}` },
    );
    if (!session.url) {
      throw new ServiceUnavailableException('Stripe did not return checkout');
    }

    payment.checkoutUrl = session.url;
    payment.stripeCheckoutSessionId = session.id;
    await payment.save();
    return { url: session.url };
  }

  constructEvent(rawBody: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!webhookSecret) {
      throw new ServiceUnavailableException('Stripe is not configured');
    }
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );
  }

  async processEvent(event: Stripe.Event): Promise<void> {
    if (await this.eventModel.exists({ eventId: event.id })) return;
    if (
      event.type !== 'checkout.session.completed' &&
      event.type !== 'checkout.session.async_payment_succeeded' &&
      event.type !== 'checkout.session.async_payment_failed'
    ) {
      await this.markEventProcessed(event);
      return;
    }

    const eventSession = event.data.object;
    const session = await this.stripe.checkout.sessions.retrieve(
      eventSession.id,
    );
    const paymentId = session.metadata?.paymentId;
    if (!paymentId || !Types.ObjectId.isValid(paymentId)) {
      throw new BadRequestException('Checkout metadata is invalid');
    }
    const payment = await this.paymentModel.findById(paymentId);
    if (
      !payment ||
      payment.stripeCheckoutSessionId !== session.id ||
      session.metadata?.customerId !== payment.customerId.toString() ||
      session.metadata?.packageCode !== payment.packageCode ||
      session.amount_total !== payment.amountMinor ||
      session.currency?.toUpperCase() !== payment.currency
    ) {
      throw new BadRequestException('Checkout does not match local payment');
    }

    if (event.type === 'checkout.session.async_payment_failed') {
      payment.status = 'failed';
      await payment.save();
      await this.markEventProcessed(event);
      return;
    }
    if (session.payment_status !== 'paid') {
      await this.markEventProcessed(event);
      return;
    }

    await this.walletService.applyChange({
      customerId: payment.customerId.toString(),
      idempotencyKey: `stripe:${session.id}`,
      pointsDelta: payment.points,
      reference: session.id,
      type: 'top-up',
    });
    payment.status = 'succeeded';
    payment.stripePaymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id;
    await payment.save();
    await this.markEventProcessed(event);
  }

  private async markEventProcessed(event: Stripe.Event): Promise<void> {
    await this.eventModel.updateOne(
      { eventId: event.id },
      { $setOnInsert: { eventId: event.id, eventType: event.type } },
      { upsert: true },
    );
  }

  private get stripe(): Stripe {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new ServiceUnavailableException('Stripe is not configured');
    }
    return new Stripe(secretKey);
  }

  private get webOrigin(): string {
    return this.configService.getOrThrow('WEB_ORIGIN');
  }
}
