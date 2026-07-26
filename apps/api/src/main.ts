import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module.js';
import { requestIdMiddleware } from './common/request-id.middleware.js';
import { securityHeadersMiddleware } from './common/security-headers.middleware.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('v1');
  app.use(cookieParser());
  app.use(requestIdMiddleware);
  app.use(securityHeadersMiddleware);
  app.enableCors({
    credentials: true,
    origin: [
      configService.getOrThrow<string>('WEB_ORIGIN'),
      configService.getOrThrow<string>('ADMIN_ORIGIN'),
    ],
  });
  app.enableShutdownHooks();

  await app.listen(configService.getOrThrow<number>('PORT'));
}

void bootstrap();
