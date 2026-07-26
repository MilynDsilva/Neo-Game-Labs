import { ConfigService } from '@nestjs/config';
import type { Connection, Model } from 'mongoose';
import { describe, expect, it } from 'vitest';

import { AuthService } from '../src/auth/auth.service.js';
import type { CustomerDocument } from '../src/auth/customer.schema.js';
import type { PointsAccountDocument } from '../src/auth/points-account.schema.js';
import type { CustomerSessionDocument } from '../src/auth/session.schema.js';
import type { SecurityEventDocument } from '../src/auth/security-event.schema.js';

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
