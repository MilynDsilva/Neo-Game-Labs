import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'game_comments', timestamps: true })
export class GameComment {
  createdAt!: Date;

  @Prop({ index: true, required: true, type: Types.ObjectId })
  gameId!: Types.ObjectId;

  @Prop({ index: true, required: true, type: Types.ObjectId })
  customerId!: Types.ObjectId;

  @Prop({ maxlength: 100, required: true, trim: true, type: String })
  authorDisplayName!: string;

  @Prop({ type: String })
  authorPictureUrl?: string;

  @Prop({
    maxlength: 500,
    minlength: 3,
    required: true,
    trim: true,
    type: String,
  })
  message!: string;

  @Prop({
    default: 'published',
    enum: ['published', 'hidden'],
    index: true,
    type: String,
  })
  status!: string;
}

export type GameCommentDocument = HydratedDocument<GameComment>;
export const GameCommentSchema = SchemaFactory.createForClass(GameComment);

GameCommentSchema.index({ gameId: 1, status: 1, createdAt: -1 });
