import { describe, expect, it } from 'vitest';

import { healthResponseSchema } from './index.js';

describe('healthResponseSchema', () => {
  it('accepts the API health response', () => {
    const result = healthResponseSchema.safeParse({
      service: 'customer-api',
      status: 'ok',
      timestamp: new Date().toISOString(),
    });

    expect(result.success).toBe(true);
  });
});
