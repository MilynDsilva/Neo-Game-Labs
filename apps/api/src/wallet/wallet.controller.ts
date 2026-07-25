import { Controller, Get, Inject, Query, Req } from '@nestjs/common';
import type { Request } from 'express';

import { AuthService, sessionCookieName } from '../auth/auth.service.js';
import { WalletService } from './wallet.service.js';

@Controller('wallet')
export class WalletController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(WalletService) private readonly walletService: WalletService,
  ) {}

  @Get()
  async getWallet(@Req() request: Request) {
    const customerId = await this.authService.getAuthenticatedCustomerId(
      this.readSessionCookie(request),
    );
    return this.walletService.getWallet(customerId);
  }

  @Get('top-up-packages')
  listTopUpPackages(@Query('currency') currency?: string) {
    return this.walletService.listTopUpPackages(
      currency === 'INR' || currency === 'USD' ? currency : undefined,
    );
  }

  private readSessionCookie(request: Request): string | undefined {
    return request.cookies[sessionCookieName] as string | undefined;
  }
}
