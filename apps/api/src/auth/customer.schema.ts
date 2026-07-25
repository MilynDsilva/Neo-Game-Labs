import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

@Schema({ collection: 'customers', timestamps: true })
export class Customer {
  @Prop({ index: true, required: true, type: String, unique: true })
  googleSubject!: string;

  @Prop({ required: true, type: String })
  email!: string;

  @Prop({ required: true, type: String })
  displayName!: string;

  @Prop({ type: String })
  pictureUrl?: string;

  @Prop({ index: true, type: Date })
  deletionRequestedAt?: Date;
}

export type CustomerDocument = HydratedDocument<Customer>;
export const CustomerSchema = SchemaFactory.createForClass(Customer);
