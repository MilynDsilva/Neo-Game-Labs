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

export const topUpPackageSchema = z.object({
  amountMinor: z.number().int().positive(),
  code: z.string().min(1),
  currency: z.enum(['INR', 'USD']),
  points: z.number().int().positive(),
});

export const topUpPackagesResponseSchema = z.object({
  packages: z.array(topUpPackageSchema),
});

export const walletResponseSchema = z.object({
  balance: z.number().int().nonnegative(),
  transactions: z.array(
    z.object({
      createdAt: z.iso.datetime(),
      id: z.string().min(1),
      pointsDelta: z.number().int(),
      reference: z.string().optional(),
      type: z.enum(['top-up', 'purchase', 'refund', 'adjustment']),
    }),
  ),
});

export const purchaseResponseSchema = z.object({
  alreadyOwned: z.boolean(),
  entitlementId: z.string().min(1),
});

export const libraryResponseSchema = z.object({
  games: z.array(
    z.object({
      acquiredAt: z.iso.datetime(),
      coverImageUrl: assetUrlSchema,
      entitlementId: z.string().min(1),
      platforms: z.array(gamePlatformDetailsSchema),
      pointsPaid: z.number().int().nonnegative(),
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      title: z.string().min(1),
    }),
  ),
});

export const downloadListResponseSchema = z.object({
  downloads: z.array(
    z.object({
      fileName: z.string().regex(/^[a-zA-Z0-9._-]+$/),
      platform: z.enum(['windows', 'macos', 'linux', 'android']),
      version: z.string().trim().min(1),
    }),
  ),
});

export const downloadGrantResponseSchema = z.object({
  expiresAt: z.iso.datetime(),
  url: z.string().regex(/^\/v1\/downloads\/file\/[a-zA-Z0-9_-]+$/),
});

export type GameCatalogResponse = z.infer<typeof gameCatalogResponseSchema>;
export type GameDetail = z.infer<typeof gameDetailSchema>;
export type GamePlatform = z.infer<typeof gamePlatformSchema>;
export type GameSummary = z.infer<typeof gameSummarySchema>;
export type HealthResponse = z.infer<typeof healthResponseSchema>;
export type AuthStatus = z.infer<typeof authStatusSchema>;
export type CustomerProfile = z.infer<typeof customerProfileSchema>;
export type TopUpPackage = z.infer<typeof topUpPackageSchema>;
export type WalletResponse = z.infer<typeof walletResponseSchema>;
export type LibraryResponse = z.infer<typeof libraryResponseSchema>;
export type DownloadListResponse = z.infer<typeof downloadListResponseSchema>;
export type DownloadGrantResponse = z.infer<typeof downloadGrantResponseSchema>;
