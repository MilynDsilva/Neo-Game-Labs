import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'ledger_entries', timestamps: true })
export class LedgerEntry {
  @Prop({ index: true, required: true, type: Types.ObjectId })
  customerId!: Types.ObjectId;

  @Prop({ index: true, required: true, type: Types.ObjectId })
  transactionId!: Types.ObjectId;

  @Prop({ required: true, type: Number })
  pointsDelta!: number;

  @Prop({ min: 0, required: true, type: Number })
  balanceAfter!: number;
}

export type LedgerEntryDocument = HydratedDocument<LedgerEntry>;
export const LedgerEntrySchema = SchemaFactory.createForClass(LedgerEntry);

LedgerEntrySchema.index({ customerId: 1, createdAt: -1 });
