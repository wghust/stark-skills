import path from 'node:path';
import { defaults } from '../config/defaults.mjs';
import { sharpFormatToKey, extensionForFormatKey } from '../utils/format.mjs';
import { parseQuality, parsePosition } from '../utils/validate.mjs';
import { buildOutputPath, pathExists, fileSize, ensureDir } from '../utils/file.mjs';
import { encodePipeline, sharpInstance, userFacingImageError } from './pipeline.mjs';
import { runWithReport } from './engine.mjs';

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;');
}

function gravityFor(position) {
  switch (position) {
    case 'top-left':
      return 'northwest';
    case 'top-right':
      return 'northeast';
    case 'bottom-left':
      return 'southwest';
    case 'bottom-right':
      return 'southeast';
    case 'center':
      return 'center';
    default:
      return 'southeast';
  }
}

function textSvg({ width, height, text, position, margin, opacity }) {
  const fontSize = Math.max(14, Math.round(Math.min(width, height) * 0.035));
  const op = Math.min(1, Math.max(0, opacity));
  let anchor = 'start';
  let baseline = 'alphabetic';
  let x = margin;
  let y = margin + fontSize;
  if (position === 'top-right') {
    anchor = 'end';
    x = width - margin;
    y = margin + fontSize;
  } else if (position === 'bottom-left') {
    anchor = 'start';
    x = margin;
    y = height - margin;
  } else if (position === 'bottom-right') {
    anchor = 'end';
    x = width - margin;
    y = height - margin;
  } else if (position === 'center') {
    anchor = 'middle';
    x = width / 2;
    y = height / 2;
    baseline = 'middle';
  }
  return Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .w { font: ${fontSize}px sans-serif; fill: rgba(255,255,255,${op});
         stroke: rgba(0,0,0,${Math.min(op, 0.4)}); stroke-width: 1px; paint-order: stroke fill; }
  </style>
  <text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="${baseline}" class="w">${escapeXml(text)}</text>
</svg>`,
  );
}

export async function runWatermark(ctx) {
  const quality = parseQuality(ctx.quality, defaults.quality);
  const position = parsePosition(ctx.position, defaults.position);
  const opacity = ctx.opacity !== undefined ? Number(ctx.opacity) : defaults.opacity;
  const margin = ctx.margin !== undefined ? Number(ctx.margin) : defaults.margin;

  if (!ctx.text && !ctx.watermarkPath) {
    throw new Error('watermark requires --text and/or --watermark <image-path>');
  }
  if (ctx.watermarkPath && !(await pathExists(path.resolve(ctx.watermarkPath)))) {
    throw new Error(`Watermark image not found: ${ctx.watermarkPath}`);
  }

  await runWithReport({
    operation: 'watermark',
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

        let base = sharpInstance(abs).rotate();

        const composites = [];
        if (ctx.watermarkPath) {
          const wmAbs = path.resolve(ctx.watermarkPath);
          const wmBuf = await sharpInstance(wmAbs)
            .resize({ width: Math.max(32, Math.round(iw * 0.22)) })
            .png()
            .toBuffer();
          composites.push({
            input: wmBuf,
            gravity: gravityFor(position),
            blend: 'over',
          });
        }
        if (ctx.text) {
          composites.push({
            input: textSvg({
              width: iw,
              height: ih,
              text: ctx.text,
              position,
              margin,
              opacity,
            }),
            blend: 'over',
          });
        }

        let p = base.composite(composites);
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
