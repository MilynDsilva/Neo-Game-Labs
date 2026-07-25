import {
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

    const token = await this.authService.completeGoogleSignIn(code);
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
  async signOut(@Req() request: Request, @Res() response: Response) {
    if (request.headers.origin !== this.webOrigin) {
      throw new UnauthorizedException('Invalid request origin');
    }
    await this.authService.revokeSession(
      request.cookies[sessionCookieName] as string | undefined,
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
}
