import {
  BadRequestException,
  Controller,
  Get,
  Header,
  Inject,
  Param,
  Query,
} from '@nestjs/common';
import type { GameCatalogResponse, GameDetail } from '@neogamelabs/contracts';

import { catalogQuerySchema } from './catalog.query.js';
import { CatalogService } from './catalog.service.js';

@Controller('games')
export class CatalogController {
  constructor(
    @Inject(CatalogService) private readonly catalogService: CatalogService,
  ) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=60, s-maxage=300')
  async findAll(
    @Query() rawQuery: Record<string, string | undefined>,
  ): Promise<GameCatalogResponse> {
    const result = catalogQuerySchema.safeParse(rawQuery);

    if (!result.success) {
      throw new BadRequestException({
        error: 'Invalid catalog query',
        issues: result.error.issues,
      });
    }

    return this.catalogService.findAll(result.data);
  }

  @Get(':slug')
  @Header('Cache-Control', 'public, max-age=60, s-maxage=300')
  findBySlug(@Param('slug') slug: string): Promise<GameDetail> {
    return this.catalogService.findBySlug(slug);
  }
}
