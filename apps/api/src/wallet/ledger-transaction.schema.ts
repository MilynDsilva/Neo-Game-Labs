import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'ledger_transactions', timestamps: true })
export class LedgerTransaction {
  createdAt!: Date;

  @Prop({ index: true, required: true, type: Types.ObjectId })
  customerId!: Types.ObjectId;

  @Prop({ required: true, type: String, unique: true })
  idempotencyKey!: string;

  @Prop({
    enum: ['top-up', 'purchase', 'refund', 'adjustment'],
    required: true,
    type: String,
  })
  type!: string;

  @Prop({ required: true, type: Number })
  pointsDelta!: number;

  @Prop({ default: 'committed', enum: ['committed'], type: String })
  status!: string;

  @Prop({ type: String })
  reference?: string;
}

export type LedgerTransactionDocument = HydratedDocument<LedgerTransaction>;
export const LedgerTransactionSchema =
  SchemaFactory.createForClass(LedgerTransaction);
