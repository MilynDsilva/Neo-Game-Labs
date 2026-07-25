import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type GameDocument = HydratedDocument<Game>;

@Schema({ _id: false })
export class PlatformDetails {
  @Prop({
    enum: ['windows', 'macos', 'linux', 'ios', 'android', 'web'],
    required: true,
    type: String,
  })
  kind!: string;

  @Prop({
    enum: ['direct', 'external', 'coming-soon'],
    required: true,
    type: String,
  })
  availability!: string;

  @Prop({ type: String })
  storeUrl?: string;

  @Prop({ type: String })
  minimumRequirements?: string;
}

export const PlatformDetailsSchema =
  SchemaFactory.createForClass(PlatformDetails);

@Schema({ collection: 'games', timestamps: true })
export class Game {
  @Prop({ index: true, required: true, trim: true, type: String })
  title!: string;

  @Prop({ required: true, trim: true, type: String, unique: true })
  slug!: string;

  @Prop({ required: true, trim: true, type: String })
  tagline!: string;

  @Prop({ required: true, trim: true, type: String })
  description!: string;

  @Prop({ required: true, type: String })
  coverImageUrl!: string;

  @Prop({ required: true, type: String })
  heroImageUrl!: string;

  @Prop({ default: false, index: true, type: Boolean })
  featured!: boolean;

  @Prop({ min: 0, required: true, type: Number })
  pointPrice!: number;

  @Prop({
    enum: ['draft', 'scheduled', 'published', 'archived'],
    index: true,
    required: true,
    type: String,
  })
  status!: string;

  @Prop({ index: true, type: Date })
  publishAt?: Date;

  @Prop({ index: true, type: Date })
  releasedAt?: Date;

  @Prop({ required: true, type: [PlatformDetailsSchema] })
  platforms!: PlatformDetails[];
}

export const GameSchema = SchemaFactory.createForClass(Game);

GameSchema.index({ status: 1, releasedAt: -1 });
GameSchema.index({ title: 'text', tagline: 'text' });
