import { z } from 'zod';

const environmentSchema = z
  .object({
    MONGODB_URI: z
      .string()
      .min(1)
      .default('mongodb://localhost:27017/customer_dashboard?replicaSet=rs0'),
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    GOOGLE_CALLBACK_URL: z
      .url()
      .default('http://localhost:4000/v1/auth/google/callback'),
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    WEB_ORIGIN: z.url().default('http://localhost:3000'),
  })
  .refine(
    (environment) =>
      Boolean(environment.GOOGLE_CLIENT_ID) ===
      Boolean(environment.GOOGLE_CLIENT_SECRET),
    {
      message:
        'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured together',
      path: ['GOOGLE_CLIENT_ID'],
    },
  );

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnvironment(
  input: Record<string, unknown>,
): Environment {
  return environmentSchema.parse(input);
}
