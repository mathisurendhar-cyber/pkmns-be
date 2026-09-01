import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { existsSync, statSync } from 'fs';
import { join, relative, resolve, sep } from 'path';
import { AppModule } from './app.module';
import { ensureUploadDirs, getUploadsRoot } from './common/uploads-path';

function serveUploads(req: Request, res: Response, next: NextFunction) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next();
  }

  const remainder = decodeURIComponent((req.path || req.url || '').split('?')[0]);
  const relativePath = remainder.replace(/^\/+/, '');
  if (!relativePath) {
    return res.status(404).json({ success: false, message: 'File not found' });
  }

  const root = getUploadsRoot();
  const absolutePath = resolve(root, relativePath);
  const inside = relative(root, absolutePath);
  if (!inside || inside.startsWith('..') || inside.includes(`..${sep}`)) {
    return res.status(400).json({ success: false, message: 'Invalid path' });
  }

  if (!existsSync(absolutePath) || !statSync(absolutePath).isFile()) {
    return res.status(404).json({ success: false, message: 'File not found' });
  }

  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  return res.sendFile(absolutePath);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  ensureUploadDirs();
  app.use('/uploads', serveUploads);
  app.useStaticAssets(join(process.cwd(), 'public', 'img'), { prefix: '/img' });

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://pkmns.com',
      'https://www.pkmns.com',
      'https://pkmns-fe-seven.vercel.app',
      /^https:\/\/.*\.vercel\.app$/,
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 NestJS running on port ${port}`);
}
bootstrap();
