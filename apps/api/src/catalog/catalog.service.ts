import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type {
  GameCatalogResponse,
  GameDetail,
  GameSummary,
} from '@neogamelabs/contracts';
import type { Model, QueryFilter } from 'mongoose';

import type { CatalogQuery } from './catalog.query.js';
import { Game } from './game.schema.js';

type GameRecord = Game & { _id: unknown };

export function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class CatalogService {
  constructor(
    @InjectModel(Game.name) private readonly gameModel: Model<Game>,
  ) {}

  async findAll(query: CatalogQuery): Promise<GameCatalogResponse> {
    const filter = this.createPublishedFilter(query);
    const [games, total] = await Promise.all([
      this.gameModel
        .find(filter)
        .sort({ featured: -1, releasedAt: -1, title: 1 })
        .limit(query.limit)
        .lean<GameRecord[]>()
        .exec(),
      this.gameModel.countDocuments(filter).exec(),
    ]);

    return {
      games: games.map((game) => this.toSummary(game)),
      total,
    };
  }

  async findBySlug(slug: string): Promise<GameDetail> {
    const game = await this.gameModel
      .findOne({
        ...this.createPublishedFilter({ limit: 1 }),
        slug,
      })
      .lean<GameRecord>()
      .exec();

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return {
      ...this.toSummary(game),
      description: game.description,
      heroImageUrl: game.heroImageUrl,
    };
  }

  private createPublishedFilter(query: CatalogQuery): QueryFilter<Game> {
    const filter: QueryFilter<Game> = {
      $or: [
        { publishAt: { $exists: false } },
        { publishAt: null },
        { publishAt: { $lte: new Date() } },
      ],
      status: 'published',
    };

    if (query.featured !== undefined) {
      filter.featured = query.featured;
    }

    if (query.platform) {
      filter['platforms.kind'] = query.platform;
    }

    if (query.search) {
      const search = new RegExp(escapeRegularExpression(query.search), 'i');
      filter.$and = [{ $or: [{ title: search }, { tagline: search }] }];
    }

    return filter;
  }

  private toSummary(game: GameRecord): GameSummary {
    return {
      coverImageUrl: game.coverImageUrl,
      featured: game.featured,
      platforms: game.platforms.map((platform) => ({
        availability:
          platform.availability as GameSummary['platforms'][number]['availability'],
        kind: platform.kind as GameSummary['platforms'][number]['kind'],
        ...(platform.minimumRequirements
          ? { minimumRequirements: platform.minimumRequirements }
          : {}),
        ...(platform.storeUrl ? { storeUrl: platform.storeUrl } : {}),
      })),
      pointPrice: game.pointPrice,
      ...(game.releasedAt ? { releasedAt: game.releasedAt.toISOString() } : {}),
      slug: game.slug,
      tagline: game.tagline,
      title: game.title,
    };
  }
}
