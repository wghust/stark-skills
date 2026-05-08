import path from 'node:path';

export const SUPPORTED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

/** Extensions we explicitly skip with a reason (not necessarily exhaustive). */
export const SKIP_EXTS = new Set([
  '.svg',
  '.gif',
  '.ico',
  '.bmp',
  '.tif',
  '.tiff',
  '.heic',
  '.heif',
]);

export function normalizeExt(filePath) {
  return path.extname(filePath).toLowerCase();
}

export function classifyPath(filePath) {
  const ext = normalizeExt(filePath);
  if (SUPPORTED_EXTS.has(ext)) return { kind: 'supported', ext };
  if (SKIP_EXTS.has(ext)) return { kind: 'skipped', ext, reason: 'unsupported format' };
  return { kind: 'skipped', ext, reason: 'unsupported format' };
}

/** Map sharp metadata.format / extension to normalized output key. */
export function sharpFormatToKey(fmt) {
  if (!fmt) return 'jpeg';
  if (fmt === 'jpeg') return 'jpeg';
  if (fmt === 'png' || fmt === 'webp' || fmt === 'avif') return fmt;
  return fmt;
}

export function extensionForFormatKey(key) {
  const k = key === 'jpeg' ? 'jpg' : key;
  return `.${k}`;
}

export function parseFormatArg(value) {
  if (!value || value === 'original') return 'original';
  const v = String(value).toLowerCase();
  if (v === 'jpg' || v === 'jpeg') return 'jpeg';
  if (v === 'png' || v === 'webp' || v === 'avif') return v;
  throw new Error(`Unsupported --format "${value}" (use jpg|jpeg|png|webp|avif|original)`);
}
