import sharp from 'sharp';

export function userFacingImageError(err) {
  const msg = String(err?.message || err);
  if (/Vips|unsupported|load|open|corrupt|truncated|bad seek|invalid/i.test(msg)) {
    return 'invalid image input';
  }
  return msg;
}

export function sharpInstance(inputPath) {
  return sharp(inputPath, { failOn: 'warning' });
}

/**
 * @param {import('sharp').Sharp} pipeline
 * @param {'jpeg'|'png'|'webp'|'avif'} formatKey
 * @param {number} quality 1-100
 */
export function encodePipeline(pipeline, formatKey, quality) {
  const q = Math.min(100, Math.max(1, quality));
  if (formatKey === 'jpeg') return pipeline.jpeg({ quality: q, mozjpeg: true });
  if (formatKey === 'png') {
    const level = Math.max(0, Math.min(9, Math.round(9 - (q / 100) * 8)));
    return pipeline.png({ compressionLevel: level });
  }
  if (formatKey === 'webp') return pipeline.webp({ quality: q });
  if (formatKey === 'avif') return pipeline.avif({ quality: q, effort: 4 });
  throw new Error(`Unsupported internal format ${formatKey}`);
}
