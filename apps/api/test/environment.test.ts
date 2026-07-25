import { describe, expect, it } from 'vitest';

import { validateEnvironment } from '../src/config/environment.js';

describe('validateEnvironment', () => {
  it('uses local development defaults', () => {
    const environment = validateEnvironment({});

    expect(environment).toMatchObject({
      MONGODB_URI:
        'mongodb://localhost:27017/customer_dashboard?replicaSet=rs0',
      NODE_ENV: 'development',
      PORT: 4000,
      WEB_ORIGIN: 'http://localhost:3000',
    });
  });

  it('uses the local MongoDB URI when the variable is undefined', () => {
    const environment = validateEnvironment({ MONGODB_URI: undefined });

    expect(environment.MONGODB_URI).toBe(
      'mongodb://localhost:27017/customer_dashboard?replicaSet=rs0',
    );
  });

  it('rejects incomplete Google OAuth credentials', () => {
    expect(() =>
      validateEnvironment({ GOOGLE_CLIENT_ID: 'client-id' }),
    ).toThrow();
  });

  it('rejects incomplete Stripe credentials', () => {
    expect(() =>
      validateEnvironment({ STRIPE_SECRET_KEY: 'sk_test_example' }),
    ).toThrow();
  });
});
