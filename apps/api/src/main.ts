import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

function normalizeOrigin(origin: string) {
  return origin.trim().replace(/\/+$/, '');
}

function parseCorsOrigins(raw: string | undefined, fallback: string[]) {
  const parsed = raw
    ? raw.split(',').map((origin) => normalizeOrigin(origin)).filter(Boolean)
    : [];
  return parsed.length > 0 ? parsed : fallback.map((origin) => normalizeOrigin(origin));
}

function parseTrustProxy(value?: string) {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const lowerValue = trimmed.toLowerCase();
  if (lowerValue === 'true') return true;
  if (lowerValue === 'false') return false;

  const parsedNumber = Number.parseInt(trimmed, 10);
  if (Number.isFinite(parsedNumber) && String(parsedNumber) === trimmed) {
    return parsedNumber;
  }

  return trimmed;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  const isProduction = config.get<string>('NODE_ENV') === 'production';
  const webPort = config.get<number>('WEB_PORT') ?? 3000;
  const adminPort = config.get<number>('ADMIN_PORT') ?? 3002;

  const defaultOrigins = [`http://localhost:${webPort}`, `http://localhost:${adminPort}`];
  const corsOrigins = parseCorsOrigins(config.get<string>('CORS_ORIGINS'), defaultOrigins);
  const allowedOrigins = new Set(corsOrigins);

  if (isProduction && allowedOrigins.has('*')) {
    throw new Error('CORS_ORIGINS cannot contain wildcard (*) when credentials are enabled');
  }

  const trustProxy = parseTrustProxy(config.get<string>('TRUST_PROXY'));
  if (typeof trustProxy !== 'undefined') {
    app.set('trust proxy', trustProxy);
  }

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'same-site' },
      hsts: isProduction
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
    }),
  );
  app.use(cookieParser());
  app.disable('x-powered-by');

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalized = normalizeOrigin(origin);
      if (allowedOrigins.has(normalized)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS origin not allowed: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'Origin', 'X-Requested-With'],
    maxAge: 86400,
  });

  const port = config.get<number>('API_PORT') ?? 3001;
  await app.listen(port);
}

bootstrap();
