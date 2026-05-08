import path from 'node:path';
import { sharpFormatToKey, extensionForFormatKey } from '../utils/format.mjs';
import { parseQuality } from '../utils/validate.mjs';
import { defaults } from '../config/defaults.mjs';
import { buildOutputPath, pathExists, fileSize, ensureDir } from '../utils/file.mjs';
import { encodePipeline, sharpInstance, userFacingImageError } from './pipeline.mjs';
import { runWithReport } from './engine.mjs';

export async function runResize(ctx) {
  const quality = parseQuality(ctx.quality, defaults.quality);
  const width = ctx.width !== undefined ? Number(ctx.width) : undefined;
  const height = ctx.height !== undefined ? Number(ctx.height) : undefined;
  const maxWidth = ctx.maxWidth !== undefined ? Number(ctx.maxWidth) : undefined;
  const maxHeight = ctx.maxHeight !== undefined ? Number(ctx.maxHeight) : undefined;
  const withoutEnlargement = ctx.withoutEnlargement !== false;

  let w =
    Number.isFinite(width) && width > 0 ? width : undefined;
  let h =
    Number.isFinite(height) && height > 0 ? height : undefined;
  if (w === undefined && Number.isFinite(maxWidth) && maxWidth > 0) w = maxWidth;
  if (h === undefined && Number.isFinite(maxHeight) && maxHeight > 0) h = maxHeight;
  if (w === undefined && h === undefined) {
    throw new Error('resize requires one of --width, --height, --maxWidth, --maxHeight');
  }

  await runWithReport({
    operation: 'resize',
    input: ctx.input,
    output: ctx.output,
    ctx,
    runOne: async (abs, rel, outRoot) => {
      const beforeBytes = await fileSize(abs);
      try {
        const meta = await sharpInstance(abs).metadata();
        const srcKey = sharpFormatToKey(meta.format);
        const ext = extensionForFormatKey(srcKey);
        const outPath = buildOutputPath(outRoot, rel, ext);
        await ensureDir(path.dirname(outPath));
        if ((await pathExists(outPath)) && !ctx.overwrite) {
          return {
            status: 'skipped',
            inLabel: rel,
            outLabel: path.relative(process.cwd(), outPath),
            message: 'output exists (use --overwrite)',
            beforeBytes,
          };
        }

        const resizeOpts = {
          fit: 'inside',
          withoutEnlargement,
        };
        if (w !== undefined) resizeOpts.width = w;
        if (h !== undefined) resizeOpts.height = h;

        let p = sharpInstance(abs).rotate().resize(resizeOpts);
        p = encodePipeline(p, srcKey, quality);
        await p.toFile(outPath);
        const afterBytes = await fileSize(outPath);
        return {
          status: 'success',
          inLabel: rel,
          outLabel: path.relative(process.cwd(), outPath),
          beforeBytes,
          afterBytes,
        };
      } catch (e) {
        return { status: 'failed', inLabel: rel, message: userFacingImageError(e), beforeBytes };
      }
    },
  });
}
