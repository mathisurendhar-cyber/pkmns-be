import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app =
    await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(json({ limit: '50mb' }));

  app.use(
    urlencoded({
      extended: true,
      limit: '50mb',
    }),
  );

  app.useStaticAssets(
    join(process.cwd(), 'uploads'),
    {
      prefix: '/uploads',
    },
  );

  app.useStaticAssets(
    join(process.cwd(), 'public', 'img'),
    {
      prefix: '/img',
    },
  );

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',

      'https://pkmns.com',
      'https://www.pkmns.com',

      'https://pkmns-fe-seven.vercel.app',
    ],

    methods: [
      'GET',
      'HEAD',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
    ],

    credentials: true,

    optionsSuccessStatus: 204,
  });

  const port = process.env.PORT || 5000;

  await app.listen(port, '0.0.0.0');

  console.log(
    `🚀 NestJS running on port ${port}`,
  );
}

bootstrap();