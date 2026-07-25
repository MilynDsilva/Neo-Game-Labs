import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

@Schema({ collection: 'processed_webhook_events', timestamps: true })
export class ProcessedWebhookEvent {
  @Prop({ required: true, type: String, unique: true })
  eventId!: string;

  @Prop({ required: true, type: String })
  eventType!: string;
}

export type ProcessedWebhookEventDocument =
  HydratedDocument<ProcessedWebhookEvent>;
export const ProcessedWebhookEventSchema = SchemaFactory.createForClass(
  ProcessedWebhookEvent,
);
