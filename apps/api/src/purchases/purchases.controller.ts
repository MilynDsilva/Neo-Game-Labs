import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { z } from 'zod';

import { AuthService, sessionCookieName } from '../auth/auth.service.js';
import { PurchasesService } from './purchases.service.js';

const purchaseRequestSchema = z.object({
  gameSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

@Controller('purchases')
export class PurchasesController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(PurchasesService)
    private readonly purchasesService: PurchasesService,
  ) {}

  @Post()
  async purchaseGame(@Body() body: unknown, @Req() request: Request) {
    this.assertTrustedOrigin(request);
    const parsed = purchaseRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException('Invalid game purchase');
    const customerId = await this.getCustomerId(request);
    return this.purchasesService.purchaseGame(customerId, parsed.data.gameSlug);
  }

  @Get('library')
  async getLibrary(@Req() request: Request) {
    return this.purchasesService.getLibrary(await this.getCustomerId(request));
  }

  private getCustomerId(request: Request): Promise<string> {
    return this.authService.getAuthenticatedCustomerId(
      request.cookies[sessionCookieName] as string | undefined,
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
