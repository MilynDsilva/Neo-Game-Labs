import {
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Req,
  Res,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import { AuthService, sessionCookieName } from '../auth/auth.service.js';
import { DownloadsService } from './downloads.service.js';

@Controller('downloads')
export class DownloadsController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(DownloadsService)
    private readonly downloadsService: DownloadsService,
  ) {}

  @Get(':gameSlug')
  async listDownloads(
    @Param('gameSlug') gameSlug: string,
    @Req() request: Request,
  ) {
    this.assertDownloadsEnabled();
    return this.downloadsService.listDownloads(
      await this.getCustomerId(request),
      gameSlug,
    );
  }

  @Post(':gameSlug/:platform/grant')
  async createGrant(
    @Param('gameSlug') gameSlug: string,
    @Param('platform') platform: string,
    @Req() request: Request,
  ) {
    this.assertDownloadsEnabled();
    this.assertTrustedOrigin(request);
    return this.downloadsService.createGrant(
      await this.getCustomerId(request),
      gameSlug,
      platform,
    );
  }

  @Get('file/:token')
  async downloadFile(@Param('token') token: string, @Res() response: Response) {
    this.assertDownloadsEnabled();
    const download = await this.downloadsService.consumeGrant(token);
    return response.download(download.filePath, download.fileName);
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

  private assertDownloadsEnabled(): void {
    if (!this.configService.getOrThrow<boolean>('DOWNLOADS_ENABLED')) {
      throw new ServiceUnavailableException('Game downloads are paused');
    }
  }
}
