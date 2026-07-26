import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { z } from 'zod';

import { AuthService, sessionCookieName } from '../auth/auth.service.js';
import { FeedbackService } from './feedback.service.js';

const feedbackRequestSchema = z.object({
  category: z.enum(['bug', 'gameplay', 'download', 'general']),
  gameSlug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  message: z.string().trim().min(20).max(2000),
  rating: z.number().int().min(1).max(5),
  website: z.literal('').optional(),
});

@Controller('feedback')
export class FeedbackController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(FeedbackService)
    private readonly feedbackService: FeedbackService,
  ) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60 * 60_000 } })
  async submit(@Body() body: unknown, @Req() request: Request) {
    this.assertTrustedOrigin(request);
    const parsed = feedbackRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException('Invalid feedback');
    return this.feedbackService.submit(
      await this.authService.getAuthenticatedCustomerId(
        request.cookies[sessionCookieName] as string | undefined,
      ),
      parsed.data,
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
