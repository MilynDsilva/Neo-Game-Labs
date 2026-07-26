import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'customer_sessions', timestamps: true })
export class CustomerSession {
  @Prop({ index: true, required: true, type: String, unique: true })
  tokenHash!: string;

  @Prop({ index: true, required: true, type: Types.ObjectId })
  customerId!: Types.ObjectId;

  @Prop({ expires: 0, required: true, type: Date })
  expiresAt!: Date;

  @Prop({ type: Date })
  lastUsedAt?: Date;

  @Prop({ type: String })
  ipAddress?: string;

  @Prop({ type: String })
  userAgent?: string;
}

export type CustomerSessionDocument = HydratedDocument<CustomerSession>;
export const CustomerSessionSchema =
  SchemaFactory.createForClass(CustomerSession);
