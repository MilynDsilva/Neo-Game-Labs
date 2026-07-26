import { ConfigService } from '@nestjs/config';
import type { Connection, Model } from 'mongoose';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../src/auth/auth.service.js';
import type { CustomerDocument } from '../src/auth/customer.schema.js';
import type { PointsAccountDocument } from '../src/auth/points-account.schema.js';
import type { CustomerSessionDocument } from '../src/auth/session.schema.js';
import type { SecurityEventDocument } from '../src/auth/security-event.schema.js';
import type { LedgerEntryDocument } from '../src/wallet/ledger-entry.schema.js';
import type { LedgerTransactionDocument } from '../src/wallet/ledger-transaction.schema.js';

function createService() {
  const config = new ConfigService({
    GOOGLE_CALLBACK_URL: 'http://localhost:4000/v1/auth/google/callback',
    GOOGLE_CLIENT_ID: 'test-client',
  });

  return new AuthService(
    config,
    {} as Connection,
    {} as Model<CustomerDocument>,
    {} as Model<PointsAccountDocument>,
    {} as Model<CustomerSessionDocument>,
    {} as Model<SecurityEventDocument>,
    {} as Model<LedgerTransactionDocument>,
    {} as Model<LedgerEntryDocument>,
  );
}

describe('AuthService OAuth state', () => {
  it('creates a Google authorization URL with unpredictable state', () => {
    const authorization = createService().createAuthorizationRequest();
    const url = new URL(authorization.url);

    expect(url.origin).toBe('https://accounts.google.com');
    expect(url.searchParams.get('client_id')).toBe('test-client');
    expect(url.searchParams.get('state')).toBe(authorization.state);
    expect(authorization.state.length).toBeGreaterThan(30);
  });

  it('rejects a mismatched state value', () => {
    expect(() => createService().verifyState('received', 'expected')).toThrow(
      'Invalid OAuth state',
    );
  });
});

describe('AuthService welcome credit', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('records 150 points when a points account is created', async () => {
    const databaseSession = {};
    const connection = {
      transaction: vi.fn(async (callback: (session: unknown) => unknown) =>
        callback(databaseSession),
      ),
    } as unknown as Connection;
    const customerModel = {
      findOneAndUpdate: vi.fn().mockResolvedValue({
        _id: { toString: () => '507f1f77bcf86cd799439011' },
      }),
    } as unknown as Model<CustomerDocument>;
    const accountModel = {
      updateOne: vi.fn().mockResolvedValue({ upsertedCount: 1 }),
    } as unknown as Model<PointsAccountDocument>;
    const sessionModel = {
      create: vi.fn().mockResolvedValue([]),
    } as unknown as Model<CustomerSessionDocument>;
    const securityModel = {
      create: vi.fn().mockResolvedValue([]),
    } as unknown as Model<SecurityEventDocument>;
    const transactionModel = {
      create: vi.fn().mockResolvedValue([{ _id: 'ledger-transaction' }]),
    } as unknown as Model<LedgerTransactionDocument>;
    const entryModel = {
      create: vi.fn().mockResolvedValue([]),
    } as unknown as Model<LedgerEntryDocument>;
    const config = new ConfigService({
      GOOGLE_CALLBACK_URL: 'http://localhost:4000/v1/auth/google/callback',
      GOOGLE_CLIENT_ID: 'test-client',
      GOOGLE_CLIENT_SECRET: 'test-secret',
    });
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ access_token: 'token' }),
          ok: true,
        })
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              email: 'new@example.com',
              email_verified: true,
              name: 'New Player',
              sub: 'google-subject',
            }),
          ok: true,
        }),
    );

    const service = new AuthService(
      config,
      connection,
      customerModel,
      accountModel,
      sessionModel,
      securityModel,
      transactionModel,
      entryModel,
    );
    await service.completeGoogleSignIn('oauth-code', {});

    expect(accountModel.updateOne).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        $setOnInsert: expect.objectContaining({ balance: 150 }),
      }),
      expect.objectContaining({ upsert: true }),
    );
    expect(transactionModel.create).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          pointsDelta: 150,
          reference: 'Welcome credit',
          type: 'adjustment',
        }),
      ],
      { session: databaseSession },
    );
    expect(entryModel.create).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          balanceAfter: 150,
          pointsDelta: 150,
        }),
      ],
      { session: databaseSession },
    );
  });
});
