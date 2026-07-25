import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'points_accounts', timestamps: true })
export class PointsAccount {
  @Prop({ index: true, required: true, type: Types.ObjectId, unique: true })
  customerId!: Types.ObjectId;

  @Prop({ default: 0, min: 0, required: true, type: Number })
  balance!: number;
}

export type PointsAccountDocument = HydratedDocument<PointsAccount>;
export const PointsAccountSchema = SchemaFactory.createForClass(PointsAccount);
