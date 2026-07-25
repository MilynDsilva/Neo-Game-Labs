import { describe, expect, it } from 'vitest';

import {
  topUpPackagesResponseSchema,
  gameDetailSchema,
  gamePlatformDetailsSchema,
  healthResponseSchema,
} from './index.js';

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

describe('topUpPackagesResponseSchema', () => {
  it('accepts integer minor-unit prices for supported currencies', () => {
    expect(
      topUpPackagesResponseSchema.parse({
        packages: [
          {
            amountMinor: 10_000,
            code: 'inr-100-v1',
            currency: 'INR',
            points: 100,
          },
        ],
      }).packages[0]?.points,
    ).toBe(100);
  });
});

describe('gamePlatformDetailsSchema', () => {
  it('requires a store link for external platforms', () => {
    const result = gamePlatformDetailsSchema.safeParse({
      availability: 'external',
      kind: 'ios',
    });

    expect(result.success).toBe(false);
  });
});

describe('gameDetailSchema', () => {
  it('accepts a published game representation', () => {
    const result = gameDetailSchema.safeParse({
      coverImageUrl: 'https://images.example.com/orbit-cover.jpg',
      description: 'Race across a collapsing orbital station.',
      featured: true,
      heroImageUrl: 'https://images.example.com/orbit-hero.jpg',
      platforms: [{ availability: 'direct', kind: 'windows' }],
      pointPrice: 250,
      releasedAt: new Date().toISOString(),
      slug: 'orbit-breaker',
      tagline: 'Outrun the end of the world.',
      title: 'Orbit Breaker',
    });

    expect(result.success).toBe(true);
  });
});
