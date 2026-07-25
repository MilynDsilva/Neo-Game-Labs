import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { isValidObjectId } from 'mongoose';
import type { Connection, Model } from 'mongoose';
import { z } from 'zod';

import { Customer } from './customer.schema.js';
import type { CustomerDocument } from './customer.schema.js';
import { PointsAccount } from './points-account.schema.js';
import type { PointsAccountDocument } from './points-account.schema.js';
import { CustomerSession } from './session.schema.js';
import type { CustomerSessionDocument } from './session.schema.js';
import { SecurityEvent } from './security-event.schema.js';
import type { SecurityEventDocument } from './security-event.schema.js';

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
    @InjectModel(SecurityEvent.name)
    private readonly securityEventModel: Model<SecurityEventDocument>,
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

  async completeGoogleSignIn(
    code: string,
    context: { ipAddress?: string; userAgent?: string },
  ): Promise<string> {
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
      if (customer.deletionRequestedAt) {
        throw new UnauthorizedException('Account deletion is pending');
      }
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
            ipAddress: context.ipAddress,
            lastUsedAt: new Date(),
            tokenHash: this.hashToken(rawSessionToken),
            userAgent: context.userAgent,
          },
        ],
        { session: databaseSession },
      );
      await this.securityEventModel.create(
        [
          {
            customerId: customer._id,
            ipAddress: context.ipAddress,
            type: 'sign-in',
            userAgent: context.userAgent,
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

  async listSessions(rawToken?: string) {
    const current = await this.requireSession(rawToken);
    const sessions = await this.sessionModel
      .find({
        customerId: current.customerId,
        expiresAt: { $gt: new Date() },
      })
      .sort({ lastUsedAt: -1 })
      .lean();

    return {
      sessions: sessions.map((session) => ({
        current: session._id.equals(current._id),
        expiresAt: session.expiresAt.toISOString(),
        id: session._id.toString(),
        lastUsedAt: session.lastUsedAt?.toISOString(),
        userAgent: session.userAgent ?? 'Unknown device',
      })),
    };
  }

  async revokeSessionById(
    rawToken: string | undefined,
    sessionId: string,
  ): Promise<void> {
    const current = await this.requireSession(rawToken);
    if (!isValidObjectId(sessionId)) {
      throw new BadRequestException('Invalid session identifier');
    }
    await this.sessionModel.deleteOne({
      _id: sessionId,
      customerId: current.customerId,
    });
    await this.recordEvent(current.customerId, 'session-revoked');
  }

  async exportCustomerData(rawToken?: string) {
    const current = await this.requireSession(rawToken);
    const [customer, account, events] = await Promise.all([
      this.customerModel.findById(current.customerId).lean(),
      this.pointsAccountModel
        .findOne({ customerId: current.customerId })
        .lean(),
      this.securityEventModel
        .find({ customerId: current.customerId })
        .select({ _id: 0, createdAt: 1, type: 1 })
        .lean(),
    ]);
    if (!customer || !account) throw new UnauthorizedException();

    return {
      account: {
        displayName: customer.displayName,
        email: customer.email,
        pointsBalance: account.balance,
      },
      generatedAt: new Date().toISOString(),
      securityEvents: events,
    };
  }

  async requestAccountDeletion(rawToken?: string): Promise<void> {
    const current = await this.requireSession(rawToken);
    await this.connection.transaction(async (databaseSession) => {
      await this.customerModel.updateOne(
        { _id: current.customerId },
        { $set: { deletionRequestedAt: new Date() } },
        { session: databaseSession },
      );
      await this.securityEventModel.create(
        [{ customerId: current.customerId, type: 'deletion-requested' }],
        { session: databaseSession },
      );
      await this.sessionModel.deleteMany(
        { customerId: current.customerId },
        { session: databaseSession },
      );
    });
  }

  async getAuthenticatedCustomerId(rawToken?: string): Promise<string> {
    const session = await this.requireSession(rawToken);
    return session.customerId.toString();
  }

  get sessionLifetime(): number {
    return sessionLifetimeMilliseconds;
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async requireSession(rawToken?: string) {
    if (!rawToken) throw new UnauthorizedException('Sign-in required');
    const session = await this.sessionModel.findOneAndUpdate(
      {
        expiresAt: { $gt: new Date() },
        tokenHash: this.hashToken(rawToken),
      },
      { $set: { lastUsedAt: new Date() } },
      { new: true },
    );
    if (!session) throw new UnauthorizedException('Sign-in required');
    return session;
  }

  private async recordEvent(
    customerId: CustomerSessionDocument['customerId'],
    type: string,
  ): Promise<void> {
    await this.securityEventModel.create({ customerId, type });
  }
}
