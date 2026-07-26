import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

@Schema({ collection: 'admin_audit_events', timestamps: true })
export class AdminAuditEvent {
  createdAt!: Date;

  @Prop({ index: true, required: true, type: String })
  action!: string;

  @Prop({ required: true, type: String })
  actor!: string;

  @Prop({ required: true, type: String })
  targetId!: string;

  @Prop({ required: true, type: String })
  targetType!: string;

  @Prop({ type: Object })
  changes?: Record<string, unknown>;
}

export type AdminAuditEventDocument = HydratedDocument<AdminAuditEvent>;
export const AdminAuditEventSchema =
  SchemaFactory.createForClass(AdminAuditEvent);
