import { existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

export const UPLOAD_FOLDERS = [
  'events',
  'members',
  'news',
  'office_bearers',
  'contact',
] as const;

export function getUploadsRoot() {
  return resolve(process.env.UPLOADS_DIR || join(process.cwd(), 'uploads'));
}

export function ensureUploadDirs() {
  const root = getUploadsRoot();
  if (!existsSync(root)) mkdirSync(root, { recursive: true });
  for (const folder of UPLOAD_FOLDERS) {
    const dir = join(root, folder);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }
  return root;
}
