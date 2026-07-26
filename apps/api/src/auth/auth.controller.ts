import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';

import {
  AuthService,
  oauthStateCookieName,
  sessionCookieName,
} from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  startGoogleSignIn(@Res() response: Response) {
    const authorization = this.authService.createAuthorizationRequest();
    response.cookie(oauthStateCookieName, authorization.state, {
      httpOnly: true,
      maxAge: 10 * 60 * 1000,
      sameSite: 'lax',
      secure: this.isProduction,
    });
    return response.redirect(authorization.url);
  }

  @Get('google/callback')
  async finishGoogleSignIn(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    this.authService.verifyState(
      state,
      request.cookies[oauthStateCookieName] as string | undefined,
    );
    if (!code) throw new UnauthorizedException('Missing authorization code');

    const token = await this.authService.completeGoogleSignIn(code, {
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });
    response.clearCookie(oauthStateCookieName);
    response.cookie(sessionCookieName, token, {
      httpOnly: true,
      maxAge: this.authService.sessionLifetime,
      sameSite: 'lax',
      secure: this.isProduction,
    });
    return response.redirect(`${this.webOrigin}/account`);
  }

  @Get('me')
  getCurrentCustomer(@Req() request: Request) {
    return this.authService.getStatus(
      request.cookies[sessionCookieName] as string | undefined,
    );
  }

  @Post('sign-out')
  @HttpCode(204)
  async signOut(@Req() request: Request, @Res() response: Response) {
    this.assertTrustedOrigin(request);
    await this.authService.revokeSession(
      request.cookies[sessionCookieName] as string | undefined,
    );
    response.clearCookie(sessionCookieName);
    return response.status(204).send();
  }

  @Get('sessions')
  listSessions(@Req() request: Request) {
    return this.authService.listSessions(this.readSessionCookie(request));
  }

  @Delete('sessions/:id')
  @HttpCode(204)
  async revokeSession(@Param('id') sessionId: string, @Req() request: Request) {
    this.assertTrustedOrigin(request);
    await this.authService.revokeSessionById(
      this.readSessionCookie(request),
      sessionId,
    );
  }

  @Get('export')
  exportCustomerData(@Req() request: Request) {
    return this.authService.exportCustomerData(this.readSessionCookie(request));
  }

  @Post('deletion-request')
  @HttpCode(204)
  async requestAccountDeletion(
    @Req() request: Request,
    @Res() response: Response,
  ) {
    this.assertTrustedOrigin(request);
    await this.authService.requestAccountDeletion(
      this.readSessionCookie(request),
    );
    response.clearCookie(sessionCookieName);
    return response.status(204).send();
  }

  private get isProduction(): boolean {
    return this.configService.get('NODE_ENV') === 'production';
  }

  private get webOrigin(): string {
    return this.configService.getOrThrow('WEB_ORIGIN');
  }

  private assertTrustedOrigin(request: Request): void {
    if (request.headers.origin !== this.webOrigin) {
      throw new UnauthorizedException('Invalid request origin');
    }
  }

  private readSessionCookie(request: Request): string | undefined {
    return request.cookies[sessionCookieName] as string | undefined;
  }
}
