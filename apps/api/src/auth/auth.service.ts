import {
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { Connection, Model } from 'mongoose';
import { z } from 'zod';

import { Customer } from './customer.schema.js';
import type { CustomerDocument } from './customer.schema.js';
import { PointsAccount } from './points-account.schema.js';
import type { PointsAccountDocument } from './points-account.schema.js';
import { CustomerSession } from './session.schema.js';
import type { CustomerSessionDocument } from './session.schema.js';

const googleTokenSchema = z.object({ access_token: z.string().min(1) });
const googleProfileSchema = z.object({
  email: z.email(),
  email_verified: z.boolean(),
  name: z.string().min(1),
  picture: z.url().optional(),
  sub: z.string().min(1),
});

export const sessionCookieName = 'neo_session';
export const oauthStateCookieName = 'neo_oauth_state';
const sessionLifetimeMilliseconds = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(PointsAccount.name)
    private readonly pointsAccountModel: Model<PointsAccountDocument>,
    @InjectModel(CustomerSession.name)
    private readonly sessionModel: Model<CustomerSessionDocument>,
  ) {}

  createAuthorizationRequest(): { state: string; url: string } {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new ServiceUnavailableException(
        'Google sign-in is not configured for this environment',
      );
    }

    const state = randomBytes(32).toString('base64url');
    const parameters = new URLSearchParams({
      access_type: 'online',
      client_id: clientId,
      include_granted_scopes: 'true',
      redirect_uri: this.configService.getOrThrow('GOOGLE_CALLBACK_URL'),
      response_type: 'code',
      scope: 'openid email profile',
      state,
    });

    return {
      state,
      url: `https://accounts.google.com/o/oauth2/v2/auth?${parameters}`,
    };
  }

  verifyState(received: string | undefined, expected: string | undefined) {
    if (!received || !expected) {
      throw new UnauthorizedException('Invalid OAuth state');
    }
    const receivedBuffer = Buffer.from(received);
    const expectedBuffer = Buffer.from(expected);
    if (
      receivedBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(receivedBuffer, expectedBuffer)
    ) {
      throw new UnauthorizedException('Invalid OAuth state');
    }
  }

  async completeGoogleSignIn(code: string): Promise<string> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      throw new ServiceUnavailableException('Google sign-in is not configured');
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.configService.getOrThrow('GOOGLE_CALLBACK_URL'),
      }),
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      method: 'POST',
    });
    if (!tokenResponse.ok) {
      throw new UnauthorizedException('Google authorization failed');
    }
    const token = googleTokenSchema.parse(await tokenResponse.json());
    const profileResponse = await fetch(
      'https://openidconnect.googleapis.com/v1/userinfo',
      { headers: { authorization: `Bearer ${token.access_token}` } },
    );
    if (!profileResponse.ok) {
      throw new UnauthorizedException('Google profile lookup failed');
    }
    const profile = googleProfileSchema.parse(await profileResponse.json());
    if (!profile.email_verified) {
      throw new UnauthorizedException('A verified Google email is required');
    }

    const rawSessionToken = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + sessionLifetimeMilliseconds);
    await this.connection.transaction(async (databaseSession) => {
      const customer = await this.customerModel.findOneAndUpdate(
        { googleSubject: profile.sub },
        {
          $set: {
            displayName: profile.name,
            email: profile.email,
            pictureUrl: profile.picture,
          },
          $setOnInsert: { googleSubject: profile.sub },
        },
        { new: true, session: databaseSession, upsert: true },
      );
      await this.pointsAccountModel.updateOne(
        { customerId: customer._id },
        { $setOnInsert: { balance: 0, customerId: customer._id } },
        { session: databaseSession, upsert: true },
      );
      await this.sessionModel.create(
        [
          {
            customerId: customer._id,
            expiresAt,
            tokenHash: this.hashToken(rawSessionToken),
          },
        ],
        { session: databaseSession },
      );
    });

    return rawSessionToken;
  }

  async getStatus(rawToken?: string) {
    if (!rawToken) return { authenticated: false as const };
    const session = await this.sessionModel
      .findOne({
        expiresAt: { $gt: new Date() },
        tokenHash: this.hashToken(rawToken),
      })
      .lean();
    if (!session) return { authenticated: false as const };

    const [customer, account] = await Promise.all([
      this.customerModel.findById(session.customerId).lean(),
      this.pointsAccountModel
        .findOne({ customerId: session.customerId })
        .lean(),
    ]);
    if (!customer || !account) return { authenticated: false as const };

    return {
      authenticated: true as const,
      customer: {
        displayName: customer.displayName,
        email: customer.email,
        id: customer._id.toString(),
        pictureUrl: customer.pictureUrl,
        pointsBalance: account.balance,
      },
    };
  }

  async revokeSession(rawToken?: string): Promise<void> {
    if (rawToken) {
      await this.sessionModel.deleteOne({
        tokenHash: this.hashToken(rawToken),
      });
    }
  }

  get sessionLifetime(): number {
    return sessionLifetimeMilliseconds;
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
