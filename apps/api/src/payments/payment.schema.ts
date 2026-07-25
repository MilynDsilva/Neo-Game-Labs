import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'payments', timestamps: true })
export class Payment {
  @Prop({ index: true, required: true, type: Types.ObjectId })
  customerId!: Types.ObjectId;

  @Prop({ required: true, type: String, unique: true })
  checkoutRequestKey!: string;

  @Prop({ required: true, type: String })
  packageCode!: string;

  @Prop({ enum: ['INR', 'USD'], required: true, type: String })
  currency!: string;

  @Prop({ min: 1, required: true, type: Number })
  amountMinor!: number;

  @Prop({ min: 1, required: true, type: Number })
  points!: number;

  @Prop({
    default: 'pending',
    enum: ['pending', 'succeeded', 'failed'],
    index: true,
    type: String,
  })
  status!: string;

  @Prop({ sparse: true, type: String, unique: true })
  stripeCheckoutSessionId?: string;

  @Prop({ type: String })
  stripePaymentIntentId?: string;

  @Prop({ type: String })
  checkoutUrl?: string;
}

export type PaymentDocument = HydratedDocument<Payment>;
export const PaymentSchema = SchemaFactory.createForClass(Payment);
