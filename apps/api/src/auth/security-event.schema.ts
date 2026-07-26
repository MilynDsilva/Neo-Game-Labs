import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'security_events', timestamps: true })
export class SecurityEvent {
  @Prop({ index: true, required: true, type: Types.ObjectId })
  customerId!: Types.ObjectId;

  @Prop({ required: true, type: String })
  type!: string;

  @Prop({ type: String })
  ipAddress?: string;

  @Prop({ type: String })
  userAgent?: string;
}

export type SecurityEventDocument = HydratedDocument<SecurityEvent>;
export const SecurityEventSchema = SchemaFactory.createForClass(SecurityEvent);
