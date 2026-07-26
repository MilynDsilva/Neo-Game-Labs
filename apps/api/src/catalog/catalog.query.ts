import { z } from 'zod';

export const catalogQuerySchema = z.object({
  featured: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  limit: z.coerce.number().int().min(1).max(50).default(24),
  platform: z
    .enum(['windows', 'macos', 'linux', 'ios', 'android', 'web'])
    .optional(),
  search: z.string().trim().max(80).optional(),
});

export type CatalogQuery = z.infer<typeof catalogQuerySchema>;
