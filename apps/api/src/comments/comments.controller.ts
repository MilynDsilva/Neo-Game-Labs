import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { z } from 'zod';

import { AuthService, sessionCookieName } from '../auth/auth.service.js';
import { CommentsService } from './comments.service.js';

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const commentRequestSchema = z.object({
  message: z.string().trim().min(3).max(500),
});
const pageSchema = z.coerce.number().int().positive().max(10_000).default(1);

@Controller('games/:slug/comments')
export class CommentsController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(CommentsService)
    private readonly commentsService: CommentsService,
  ) {}

  @Get()
  findAll(@Param('slug') slug: string, @Query('page') page: unknown) {
    const parsedSlug = slugSchema.safeParse(slug);
    const parsedPage = pageSchema.safeParse(page);
    if (!parsedSlug.success || !parsedPage.success) {
      throw new BadRequestException('Invalid comment query');
    }
    return this.commentsService.findForGame(parsedSlug.data, parsedPage.data);
  }

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60 * 60_000 } })
  async create(
    @Param('slug') slug: string,
    @Body() body: unknown,
    @Req() request: Request,
  ) {
    this.assertTrustedOrigin(request);
    const parsedSlug = slugSchema.safeParse(slug);
    const parsedBody = commentRequestSchema.safeParse(body);
    if (!parsedSlug.success || !parsedBody.success) {
      throw new BadRequestException('Invalid comment');
    }

    return this.commentsService.create(
      parsedSlug.data,
      await this.authService.getAuthenticatedCustomerId(
        request.cookies[sessionCookieName] as string | undefined,
      ),
      parsedBody.data.message,
    );
  }

  private assertTrustedOrigin(request: Request): void {
    if (
      request.headers.origin !==
      this.configService.getOrThrow<string>('WEB_ORIGIN')
    ) {
      throw new UnauthorizedException('Invalid request origin');
    }
  }
}
