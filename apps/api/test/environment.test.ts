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
});
