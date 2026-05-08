import path from 'node:path';
import { defaults } from '../config/defaults.mjs';
import { sharpFormatToKey, extensionForFormatKey } from '../utils/format.mjs';
import { parseQuality, parseRatio } from '../utils/validate.mjs';
import { buildOutputPath, pathExists, fileSize, ensureDir } from '../utils/file.mjs';
import { encodePipeline, sharpInstance, userFacingImageError } from './pipeline.mjs';
import { runWithReport } from './engine.mjs';

export async function runCrop(ctx) {
  const quality = parseQuality(ctx.quality, defaults.quality);
  const hasBox =
    ctx.left !== undefined &&
    ctx.top !== undefined &&
    ctx.cropWidth !== undefined &&
    ctx.cropHeight !== undefined;
  const hasRatio = !!ctx.ratio;

  if (!hasBox && !hasRatio) {
    throw new Error('crop requires --ratio (e.g. 16:9) or --left --top --cropWidth --cropHeight');
  }

  await runWithReport({
    operation: 'crop',
    input: ctx.input,
    output: ctx.output,
    ctx,
    runOne: async (abs, rel, outRoot) => {
      const beforeBytes = await fileSize(abs);
      try {
        const meta = await sharpInstance(abs).metadata();
        const iw = meta.width ?? 0;
        const ih = meta.height ?? 0;
        if (!iw || !ih) {
          return { status: 'failed', inLabel: rel, message: 'could not read image dimensions', beforeBytes };
        }

        let left;
        let top;
        let cw;
        let ch;

        if (hasRatio) {
          const { w: rw, h: rh } = parseRatio(ctx.ratio);
          const target = rw / rh;
          const cur = iw / ih;
          if (cur > target) {
            ch = ih;
            cw = Math.round(ih * target);
            left = Math.round((iw - cw) / 2);
            top = 0;
          } else {
            cw = iw;
            ch = Math.round(iw / target);
            left = 0;
            top = Math.round((ih - ch) / 2);
          }
        } else {
          left = Number(ctx.left);
          top = Number(ctx.top);
          cw = Number(ctx.cropWidth);
          ch = Number(ctx.cropHeight);
          if (![left, top, cw, ch].every((n) => Number.isFinite(n))) {
            return { status: 'failed', inLabel: rel, message: 'invalid crop box numbers', beforeBytes };
          }
          if (cw <= 0 || ch <= 0 || left < 0 || top < 0) {
            return { status: 'failed', inLabel: rel, message: 'invalid crop box', beforeBytes };
          }
          if (left + cw > iw || top + ch > ih) {
            return {
              status: 'failed',
              inLabel: rel,
              message: `crop region exceeds image bounds (${iw}x${ih})`,
              beforeBytes,
            };
          }
        }

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

        let p = sharpInstance(abs).rotate().extract({ left, top, width: cw, height: ch });
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
