import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

@Schema({ collection: 'top_up_packages', timestamps: true })
export class TopUpPackage {
  @Prop({ required: true, type: String, unique: true })
  code!: string;

  @Prop({ enum: ['INR', 'USD'], index: true, required: true, type: String })
  currency!: string;

  @Prop({ min: 1, required: true, type: Number })
  amountMinor!: number;

  @Prop({ min: 1, required: true, type: Number })
  points!: number;

  @Prop({ default: true, index: true, type: Boolean })
  active!: boolean;
}

export type TopUpPackageDocument = HydratedDocument<TopUpPackage>;
export const TopUpPackageSchema = SchemaFactory.createForClass(TopUpPackage);
