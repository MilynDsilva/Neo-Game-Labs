import { healthResponseSchema } from '@neogamelabs/contracts';
import { describe, expect, it } from 'vitest';

import { HealthController } from '../src/health/health.controller.js';

describe('HealthController', () => {
  it('reports the API as healthy', () => {
    const health = new HealthController().getHealth();

    expect(health).toMatchObject({
      service: 'customer-api',
      status: 'ok',
    });
    expect(healthResponseSchema.safeParse(health).success).toBe(true);
  });
});
