import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { extname, join } from 'path';
import { Repository } from 'typeorm';
import { UploadAsset } from '../entities/upload-asset.entity';
import { ensureUploadDirs, getUploadsRoot } from './uploads-path';

const DB_MAX_BYTES = 40 * 1024 * 1024;

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.m4v': 'video/x-m4v',
  '.ogg': 'video/ogg',
  '.pdf': 'application/pdf',
};

export type StoredFile = {
  absolutePath: string;
  mime: string;
};

@Injectable()
export class UploadService {
  private uploadsRoot = getUploadsRoot();

  constructor(
    @InjectRepository(UploadAsset)
    private readonly assetRepo: Repository<UploadAsset>,
  ) {
    this.uploadsRoot = ensureUploadDirs();
  }

  private mimeFor(name: string, fallback?: string) {
    return MIME[extname(name).toLowerCase()] || fallback || 'application/octet-stream';
  }

  private async persist(relativePath: string, buffer: Buffer, mime: string) {
    if (buffer.length > DB_MAX_BYTES) return;
    await this.assetRepo.save(
      this.assetRepo.create({
        path: relativePath.replace(/^\/+/, ''),
        mime,
        size: buffer.length,
        data: buffer,
      }),
    );
  }

  async saveFile(
    file: Express.Multer.File,
    folder: string,
    prefix = 'file',
  ): Promise<string> {
    const dir = join(this.uploadsRoot, folder);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const name = `${prefix}_${Date.now()}_${safe}`;
    const relativePath = `${folder}/${name}`;
    writeFileSync(join(dir, name), file.buffer);
    const mime = this.mimeFor(name, file.mimetype);
    try {
      await this.persist(relativePath, file.buffer, mime);
    } catch (err) {
      console.error('Failed to persist upload in database:', err);
    }
    return `/uploads/${relativePath}`;
  }

  async saveDiskFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ filename: string; path: string; url: string }> {
    const dir = join(this.uploadsRoot, folder);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const filename =
      Date.now() +
      '-' +
      file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fullPath = join(dir, filename);
    writeFileSync(fullPath, file.buffer);
    const relativePath = `${folder}/${filename}`;
    try {
      await this.persist(relativePath, file.buffer, this.mimeFor(filename, file.mimetype));
    } catch (err) {
      console.error('Failed to persist upload in database:', err);
    }
    return {
      filename,
      path: fullPath,
      url: `/uploads/${relativePath}`,
    };
  }

  async resolveStoredFile(relativePath: string): Promise<StoredFile | null> {
    const clean = relativePath.replace(/^\/+/, '');
    const absolutePath = join(this.uploadsRoot, clean);
    const mime = this.mimeFor(clean);

    if (existsSync(absolutePath)) {
      return { absolutePath, mime };
    }

    const row = await this.assetRepo.findOne({ where: { path: clean } });
    if (!row?.data) return null;

    const dir = join(this.uploadsRoot, ...clean.split('/').slice(0, -1));
    if (dir && !existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(absolutePath, row.data);
    return { absolutePath, mime: row.mime || mime };
  }

  readDiskFile(relativePath: string) {
    const absolutePath = join(this.uploadsRoot, relativePath.replace(/^\/+/, ''));
    if (!existsSync(absolutePath)) return null;
    return readFileSync(absolutePath);
  }

  absoluteUrl(reqHost: string, relativePath: string): string {
    if (!relativePath) return relativePath;
    if (relativePath.startsWith('http')) return relativePath;
    return `${reqHost}${relativePath}`;
  }
}
