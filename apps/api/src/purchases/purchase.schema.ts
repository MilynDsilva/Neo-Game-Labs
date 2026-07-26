import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'purchases', timestamps: true })
export class Purchase {
  createdAt!: Date;

  @Prop({ index: true, required: true, type: Types.ObjectId })
  customerId!: Types.ObjectId;

  @Prop({ index: true, required: true, type: Types.ObjectId })
  gameId!: Types.ObjectId;

  @Prop({ required: true, type: String })
  gameSlug!: string;

  @Prop({ required: true, type: String })
  gameTitle!: string;

  @Prop({ min: 0, required: true, type: Number })
  pointsPaid!: number;

  @Prop({ default: 'completed', enum: ['completed'], type: String })
  status!: string;
}

export type PurchaseDocument = HydratedDocument<Purchase>;
export const PurchaseSchema = SchemaFactory.createForClass(Purchase);

PurchaseSchema.index({ customerId: 1, createdAt: -1 });
