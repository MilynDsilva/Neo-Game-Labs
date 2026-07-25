import { z } from 'zod';

export const gamePlatformSchema = z.enum([
  'windows',
  'macos',
  'linux',
  'ios',
  'android',
  'web',
]);

export const gameAvailabilitySchema = z.enum([
  'direct',
  'external',
  'coming-soon',
]);

export const gamePlatformDetailsSchema = z
  .object({
    availability: gameAvailabilitySchema,
    kind: gamePlatformSchema,
    minimumRequirements: z.string().trim().min(1).optional(),
    storeUrl: z.url().optional(),
  })
  .superRefine((platform, context) => {
    if (platform.availability === 'external' && !platform.storeUrl) {
      context.addIssue({
        code: 'custom',
        message: 'External platforms require a store URL',
        path: ['storeUrl'],
      });
    }
  });

const assetUrlSchema = z.union([
  z.url(),
  z.string().regex(/^\/[a-zA-Z0-9/_-]+\.[a-zA-Z0-9]+$/),
]);

export const gameSummarySchema = z.object({
  coverImageUrl: assetUrlSchema,
  featured: z.boolean(),
  platforms: z.array(gamePlatformDetailsSchema),
  pointPrice: z.number().int().nonnegative(),
  releasedAt: z.iso.datetime().optional(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  tagline: z.string().trim().min(1),
  title: z.string().trim().min(1),
});

export const gameDetailSchema = gameSummarySchema.extend({
  description: z.string().trim().min(1),
  heroImageUrl: assetUrlSchema,
});

export const gameCatalogResponseSchema = z.object({
  games: z.array(gameSummarySchema),
  total: z.number().int().nonnegative(),
});

export const healthResponseSchema = z.object({
  service: z.literal('customer-api'),
  status: z.literal('ok'),
  timestamp: z.iso.datetime(),
});

export const customerProfileSchema = z.object({
  displayName: z.string().trim().min(1),
  email: z.email(),
  id: z.string().min(1),
  pictureUrl: z.url().optional(),
  pointsBalance: z.number().int().nonnegative(),
});

export const authStatusSchema = z.discriminatedUnion('authenticated', [
  z.object({ authenticated: z.literal(false) }),
  z.object({
    authenticated: z.literal(true),
    customer: customerProfileSchema,
  }),
]);

export type GameCatalogResponse = z.infer<typeof gameCatalogResponseSchema>;
export type GameDetail = z.infer<typeof gameDetailSchema>;
export type GamePlatform = z.infer<typeof gamePlatformSchema>;
export type GameSummary = z.infer<typeof gameSummarySchema>;
export type HealthResponse = z.infer<typeof healthResponseSchema>;
export type AuthStatus = z.infer<typeof authStatusSchema>;
export type CustomerProfile = z.infer<typeof customerProfileSchema>;
