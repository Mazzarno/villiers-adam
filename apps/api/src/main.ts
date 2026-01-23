import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const webPort = config.get<number>('WEB_PORT') ?? 3000;
  const adminPort = config.get<number>('ADMIN_PORT') ?? 3002;

  app.enableCors({
    origin: [`http://localhost:${webPort}`, `http://localhost:${adminPort}`],
    credentials: true,
  });

  const port = config.get<number>('API_PORT') ?? 3001;
  await app.listen(port);
}

bootstrap();
