import { describe, expect, it } from 'vitest';

import {
  downloadGrantResponseSchema,
  downloadListResponseSchema,
  feedbackSubmissionResponseSchema,
  gameCommentSchema,
  topUpPackagesResponseSchema,
  gameDetailSchema,
  gamePlatformDetailsSchema,
  healthResponseSchema,
  libraryResponseSchema,
} from './index.js';

describe('feedbackSubmissionResponseSchema', () => {
  it('accepts a private support reference', () => {
    expect(
      feedbackSubmissionResponseSchema.safeParse({
        createdAt: new Date().toISOString(),
        reference: 'NGL-A1B2C3D4E5F6',
        status: 'new',
      }).success,
    ).toBe(true);
  });
});

describe('gameCommentSchema', () => {
  it('accepts a safe public comment shape', () => {
    expect(
      gameCommentSchema.safeParse({
        author: { displayName: 'Nova Player' },
        createdAt: '2026-07-26T10:00:00.000Z',
        id: 'comment-id',
        message: 'A thoughtful game comment.',
      }).success,
    ).toBe(true);
  });
});

describe('download contracts', () => {
  it('accepts available assets and an expiring grant', () => {
    expect(
      downloadListResponseSchema.parse({
        downloads: [
          {
            fileName: 'orbit-breaker-demo.txt',
            platform: 'windows',
            sizeBytes: 215,
            version: '0.1.0-demo',
          },
        ],
      }).downloads,
    ).toHaveLength(1);
    expect(
      downloadGrantResponseSchema.safeParse({
        expiresAt: new Date().toISOString(),
        url: `/v1/downloads/file/${'a'.repeat(43)}`,
      }).success,
    ).toBe(true);
  });
});

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

describe('libraryResponseSchema', () => {
  it('accepts an owned game with its purchase snapshot', () => {
    expect(
      libraryResponseSchema.safeParse({
        games: [
          {
            acquiredAt: new Date().toISOString(),
            coverImageUrl: '/games/orbit-breaker.svg',
            entitlementId: 'entitlement-id',
            platforms: [{ availability: 'direct', kind: 'windows' }],
            pointsPaid: 250,
            slug: 'orbit-breaker',
            title: 'Orbit Breaker',
          },
        ],
      }).success,
    ).toBe(true);
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
        topUpsEnabled: false,
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
