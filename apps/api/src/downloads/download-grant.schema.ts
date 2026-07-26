import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'download_grants', timestamps: true })
export class DownloadGrant {
  @Prop({ index: true, required: true, type: Types.ObjectId })
  customerId!: Types.ObjectId;

  @Prop({ index: true, required: true, type: Types.ObjectId })
  assetId!: Types.ObjectId;

  @Prop({ required: true, type: String, unique: true })
  tokenHash!: string;

  @Prop({ expires: 0, required: true, type: Date })
  expiresAt!: Date;

  @Prop({ type: Date })
  usedAt?: Date;
}

export type DownloadGrantDocument = HydratedDocument<DownloadGrant>;
export const DownloadGrantSchema = SchemaFactory.createForClass(DownloadGrant);
