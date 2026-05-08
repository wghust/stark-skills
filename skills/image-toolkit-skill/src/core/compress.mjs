import path from 'node:path';
import { defaults } from '../config/defaults.mjs';
import { parseFormatArg, sharpFormatToKey, extensionForFormatKey } from '../utils/format.mjs';
import { parseQuality } from '../utils/validate.mjs';
import { buildOutputPath, pathExists, fileSize, ensureDir } from '../utils/file.mjs';
import { encodePipeline, sharpInstance, userFacingImageError } from './pipeline.mjs';
import { runWithReport } from './engine.mjs';

export async function runCompress(ctx) {
  const quality = parseQuality(ctx.quality, defaults.quality);
  const maxWidth = ctx.maxWidth !== undefined && ctx.maxWidth !== null ? Number(ctx.maxWidth) : defaults.maxWidth;
  const formatOpt = ctx.format ? String(ctx.format) : defaults.format;

  await runWithReport({
    operation: 'compress',
    input: ctx.input,
    output: ctx.output,
    ctx,
    runOne: async (abs, rel, outRoot) => {
      const beforeBytes = await fileSize(abs);
      try {
        const meta = await sharpInstance(abs).metadata();
        const srcKey = sharpFormatToKey(meta.format);
        const targetKey = formatOpt === 'original' ? srcKey : parseFormatArg(formatOpt);
        const ext = extensionForFormatKey(targetKey);
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
        let p = sharpInstance(abs).rotate();
        if (Number.isFinite(maxWidth) && maxWidth > 0) {
          p = p.resize({ width: maxWidth, fit: 'inside', withoutEnlargement: true });
        }
        p = encodePipeline(p, targetKey, quality);
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
