import path from 'node:path';
import { defaults } from '../config/defaults.mjs';
import { sharpFormatToKey, extensionForFormatKey } from '../utils/format.mjs';
import { parseQuality, parseAngle } from '../utils/validate.mjs';
import { buildOutputPath, pathExists, fileSize, ensureDir } from '../utils/file.mjs';
import { encodePipeline, sharpInstance, userFacingImageError } from './pipeline.mjs';
import { runWithReport } from './engine.mjs';

export async function runRotate(ctx) {
  const quality = parseQuality(ctx.quality, defaults.quality);
  const angle = parseAngle(ctx.angle);

  await runWithReport({
    operation: 'rotate',
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

        let p = sharpInstance(abs);
        p = angle === 'auto' ? p.rotate() : p.rotate(angle);
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
