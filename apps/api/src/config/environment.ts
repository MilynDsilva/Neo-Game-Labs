import { z } from 'zod';

const environmentSchema = z.object({
  MONGODB_URI: z
    .string()
    .min(1)
    .default('mongodb://localhost:27017/customer_dashboard?replicaSet=rs0'),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z.url().default('http://localhost:3000'),
});

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnvironment(
  input: Record<string, unknown>,
): Environment {
  return environmentSchema.parse(input);
}
