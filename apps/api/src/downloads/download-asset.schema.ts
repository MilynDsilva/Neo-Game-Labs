import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'download_assets', timestamps: true })
export class DownloadAsset {
  @Prop({ index: true, required: true, type: Types.ObjectId })
  gameId!: Types.ObjectId;

  @Prop({
    enum: ['windows', 'macos', 'linux', 'android'],
    required: true,
    type: String,
  })
  platform!: string;

  @Prop({ required: true, type: String })
  version!: string;

  @Prop({ match: /^[a-zA-Z0-9._-]+$/, required: true, type: String })
  fileName!: string;

  @Prop({ match: /^[a-zA-Z0-9/_-]+$/, required: true, type: String })
  storageKey!: string;

  @Prop({ default: 0, min: 0, required: true, type: Number })
  sizeBytes!: number;

  @Prop({ default: true, index: true, type: Boolean })
  active!: boolean;
}

export type DownloadAssetDocument = HydratedDocument<DownloadAsset>;
export const DownloadAssetSchema = SchemaFactory.createForClass(DownloadAsset);

DownloadAssetSchema.index({ gameId: 1, platform: 1 }, { unique: true });
