import { z } from 'zod';

const optionalSecret = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().min(1).optional(),
);

const booleanFlag = (defaultValue: boolean) =>
  z
    .enum(['true', 'false'])
    .default(defaultValue ? 'true' : 'false')
    .transform((value) => value === 'true');

const environmentSchema = z
  .object({
    MONGODB_URI: z
      .string()
      .min(1)
      .default('mongodb://localhost:27017/customer_dashboard?replicaSet=rs0'),
    GOOGLE_CLIENT_ID: optionalSecret,
    GOOGLE_CLIENT_SECRET: optionalSecret,
    GOOGLE_CALLBACK_URL: z
      .url()
      .default('http://localhost:4000/v1/auth/google/callback'),
    STRIPE_SECRET_KEY: optionalSecret,
    STRIPE_WEBHOOK_SECRET: optionalSecret,
    DOWNLOADS_ENABLED: booleanFlag(true),
    POINT_PURCHASES_ENABLED: booleanFlag(true),
    TOP_UPS_ENABLED: booleanFlag(false),
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
  )
  .refine(
    (environment) =>
      Boolean(environment.STRIPE_SECRET_KEY) ===
      Boolean(environment.STRIPE_WEBHOOK_SECRET),
    {
      message:
        'STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET must be configured together',
      path: ['STRIPE_SECRET_KEY'],
    },
  );

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnvironment(
  input: Record<string, unknown>,
): Environment {
  return environmentSchema.parse(input);
}
