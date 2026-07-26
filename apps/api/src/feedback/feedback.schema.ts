import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'feedback', timestamps: true })
export class Feedback {
  createdAt!: Date;

  @Prop({ index: true, required: true, type: Types.ObjectId })
  customerId!: Types.ObjectId;

  @Prop({ index: true, type: Types.ObjectId })
  gameId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  purchaseId?: Types.ObjectId;

  @Prop({
    enum: ['bug', 'gameplay', 'download', 'general'],
    required: true,
    type: String,
  })
  category!: string;

  @Prop({ max: 5, min: 1, required: true, type: Number })
  rating!: number;

  @Prop({ maxlength: 2000, minlength: 20, required: true, type: String })
  message!: string;

  @Prop({
    default: 'new',
    enum: ['new', 'triaged', 'in-progress', 'resolved', 'closed'],
    index: true,
    type: String,
  })
  status!: string;

  @Prop({ maxlength: 4000, select: false, type: String })
  internalNotes?: string;

  @Prop({ index: true, required: true, type: String, unique: true })
  reference!: string;

  @Prop({
    default: () => new Date(Date.now() + 730 * 24 * 60 * 60 * 1000),
    expires: 0,
    type: Date,
  })
  expiresAt!: Date;
}

export type FeedbackDocument = HydratedDocument<Feedback>;
export const FeedbackSchema = SchemaFactory.createForClass(Feedback);

FeedbackSchema.index({ customerId: 1, createdAt: -1 });
