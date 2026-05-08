import path from 'node:path';
import { defaults } from '../config/defaults.mjs';
import { parseFormatArg, extensionForFormatKey } from '../utils/format.mjs';
import { parseQuality } from '../utils/validate.mjs';
import { buildOutputPath, pathExists, fileSize, ensureDir } from '../utils/file.mjs';
import { encodePipeline, sharpInstance, userFacingImageError } from './pipeline.mjs';
import { runWithReport } from './engine.mjs';

export async function runConvert(ctx) {
  const quality = parseQuality(ctx.quality, defaults.quality);
  if (!ctx.format || ctx.format === 'original') {
    throw new Error('convert requires --format (webp|avif|jpg|png|jpeg)');
  }
  const targetKey = parseFormatArg(ctx.format);
  const ext = extensionForFormatKey(targetKey);

  await runWithReport({
    operation: 'convert',
    input: ctx.input,
    output: ctx.output,
    ctx,
    runOne: async (abs, rel, outRoot) => {
      const beforeBytes = await fileSize(abs);
      try {
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
        const p = encodePipeline(sharpInstance(abs).rotate(), targetKey, quality);
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
