import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ensureUploadDirs, getUploadsRoot } from './uploads-path';

@Injectable()
export class UploadService {
  private uploadsRoot = getUploadsRoot();

  constructor() {
    this.uploadsRoot = ensureUploadDirs();
  }

  saveFile(
    file: Express.Multer.File,
    folder: string,
    prefix = 'file',
  ): string {
    const dir = join(this.uploadsRoot, folder);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const name = `${prefix}_${Date.now()}_${safe}`;
    writeFileSync(join(dir, name), file.buffer);
    return `/uploads/${folder}/${name}`;
  }

  saveDiskFile(
    file: Express.Multer.File,
    folder: string,
  ): { filename: string; path: string; url: string } {
    const dir = join(this.uploadsRoot, folder);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const filename =
      Date.now() +
      '-' +
      file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fullPath = join(dir, filename);
    writeFileSync(fullPath, file.buffer);
    return {
      filename,
      path: fullPath,
      url: `/uploads/${folder}/${filename}`,
    };
  }

  absoluteUrl(reqHost: string, relativePath: string): string {
    if (!relativePath) return relativePath;
    if (relativePath.startsWith('http')) return relativePath;
    return `${reqHost}${relativePath}`;
  }
}
