import { z } from 'zod';

const DEV_JWT_SECRET = 'dev_jwt_secret_change_in_prod_32chars';
const DEV_MEILI_MASTER_KEY = 'dev_master_key';
const DEV_SEED_ADMIN_PASSWORD = 'ChangeMe123!';

const booleanFromEnv = z.preprocess((value) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}, z.boolean().optional());

function parseOrigins(raw?: string) {
  if (!raw) return [];
  return raw
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

function isLoopbackOrigin(origin: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d{1,5})?$/i.test(origin);
}

function isValidOrigin(origin: string) {
  return /^https?:\/\/[a-z0-9.-]+(?::\d{1,5})?$/i.test(origin);
}

function isPrivateIpv4Host(host: string) {
  return (
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host) ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(host)
  );
}

function isInternalServiceHost(host?: string) {
  if (!host) return false;

  const normalized = host.trim().toLowerCase();
  if (!normalized) return false;

  return (
    normalized === 'localhost' ||
    normalized === '127.0.0.1' ||
    normalized === '0.0.0.0' ||
    normalized.endsWith('.internal') ||
    normalized.endsWith('.local') ||
    !normalized.includes('.') ||
    isPrivateIpv4Host(normalized)
  );
}

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PORT: z.coerce.number().default(3001),
  ADMIN_PORT: z.coerce.number().default(3002),
  WEB_PORT: z.coerce.number().default(3000),
  TRUST_PROXY: z.string().optional(),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),

  MINIO_ENDPOINT: z.string().optional(),
  MINIO_PORT: z.coerce.number().optional(),
  MINIO_ACCESS_KEY: z.string().optional(),
  MINIO_SECRET_KEY: z.string().optional(),
  MINIO_BUCKET: z.string().optional(),
  MINIO_USE_SSL: booleanFromEnv,

  MEILI_HOST: z.string().optional(),
  MEILI_MASTER_KEY: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),

  MAILJET_API_KEY: z.string().optional(),
  MAILJET_SECRET_KEY: z.string().optional(),
  MAILJET_SENDER_EMAIL: z.string().email().optional(),
  MAILJET_SENDER_NAME: z.string().optional(),

  HCAPTCHA_ENABLED: booleanFromEnv,
  HCAPTCHA_SECRET_KEY: z.string().optional(),
  CORS_ORIGINS: z.string().optional(),
  PUBLIC_REGISTRATION_ENABLED: z.preprocess((value) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  }, z.boolean().default(false)),
  PUBLIC_REGISTRATION_TOKEN: z.string().optional(),

  RETENTION_FORMS_DAYS: z.coerce.number().optional(),
  RETENTION_RESERVATIONS_DAYS: z.coerce.number().optional(),
  RETENTION_NEWSLETTER_DAYS: z.coerce.number().optional(),
  SEED_ADMIN_PASSWORD: z.string().optional(),
}).superRefine((env, ctx) => {
  if (env.NODE_ENV !== 'production') return;

  if (env.JWT_SECRET === DEV_JWT_SECRET) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['JWT_SECRET'],
      message: 'must not use the development default in production',
    });
  }

  const origins = parseOrigins(env.CORS_ORIGINS);
  if (origins.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['CORS_ORIGINS'],
      message: 'must be set in production',
    });
  }

  for (const origin of origins) {
    if (origin === '*') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CORS_ORIGINS'],
        message: 'wildcard origin is forbidden in production',
      });
      continue;
    }

    if (!isValidOrigin(origin)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CORS_ORIGINS'],
        message: `invalid origin format: ${origin}`,
      });
      continue;
    }

    if (isLoopbackOrigin(origin)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CORS_ORIGINS'],
        message: `loopback origin not allowed in production: ${origin}`,
      });
    }
  }

  if (env.PUBLIC_REGISTRATION_ENABLED && !env.PUBLIC_REGISTRATION_TOKEN) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['PUBLIC_REGISTRATION_TOKEN'],
      message: 'required when public registration is enabled in production',
    });
  }

  if (env.HCAPTCHA_ENABLED && !env.HCAPTCHA_SECRET_KEY) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['HCAPTCHA_SECRET_KEY'],
      message: 'required when hCaptcha is enabled in production',
    });
  }

  if (env.MEILI_HOST && (!env.MEILI_MASTER_KEY || env.MEILI_MASTER_KEY === DEV_MEILI_MASTER_KEY)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['MEILI_MASTER_KEY'],
      message: 'must be set to a strong non-default value in production',
    });
  }

  const hasMinioConfig = Boolean(
    env.MINIO_ENDPOINT ||
      env.MINIO_PORT ||
      env.MINIO_ACCESS_KEY ||
      env.MINIO_SECRET_KEY ||
      env.MINIO_BUCKET,
  );
  if (hasMinioConfig) {
    if (!env.MINIO_ENDPOINT || !env.MINIO_ACCESS_KEY || !env.MINIO_SECRET_KEY || !env.MINIO_BUCKET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['MINIO_ENDPOINT'],
        message: 'MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY and MINIO_BUCKET are required in production',
      });
    }

    if (typeof env.MINIO_USE_SSL === 'undefined') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['MINIO_USE_SSL'],
        message: 'must be explicitly set in production',
      });
    } else if (env.MINIO_USE_SSL !== true && !isInternalServiceHost(env.MINIO_ENDPOINT)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['MINIO_USE_SSL'],
        message: 'must be true in production unless MINIO_ENDPOINT is internal-only',
      });
    }
  }

  if (env.SEED_ADMIN_PASSWORD && env.SEED_ADMIN_PASSWORD === DEV_SEED_ADMIN_PASSWORD) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['SEED_ADMIN_PASSWORD'],
      message: 'must not use default seed password in production',
    });
  }
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Invalid environment variables:\n${issues.join('\n')}`);
  }
  return parsed.data;
}
