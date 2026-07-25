import { describe, expect, it } from 'vitest';

import {
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
