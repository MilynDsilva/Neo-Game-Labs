import { z } from 'zod';

export const healthResponseSchema = z.object({
  service: z.literal('customer-api'),
  status: z.literal('ok'),
  timestamp: z.iso.datetime(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
