import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'entitlements', timestamps: true })
export class Entitlement {
  createdAt!: Date;

  @Prop({ index: true, required: true, type: Types.ObjectId })
  customerId!: Types.ObjectId;

  @Prop({ index: true, required: true, type: Types.ObjectId })
  gameId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  purchaseId!: Types.ObjectId;

  @Prop({ default: 'active', enum: ['active', 'revoked'], type: String })
  status!: string;
}

export type EntitlementDocument = HydratedDocument<Entitlement>;
export const EntitlementSchema = SchemaFactory.createForClass(Entitlement);

EntitlementSchema.index({ customerId: 1, gameId: 1 }, { unique: true });
