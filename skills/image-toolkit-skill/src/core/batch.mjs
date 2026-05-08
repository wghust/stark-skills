import path from 'node:path';
import fs from 'node:fs/promises';
import { defaults } from '../config/defaults.mjs';
import { parseFormatArg, sharpFormatToKey, extensionForFormatKey } from '../utils/format.mjs';
import { parseQuality } from '../utils/validate.mjs';
import {
  buildOutputPath,
  pathExists,
  fileSize,
  ensureDir,
  assertWritableDir,
  listInputEntries,
} from '../utils/file.mjs';
import { encodePipeline, sharpInstance, userFacingImageError } from './pipeline.mjs';
import { createReport } from '../utils/report.mjs';

function assertStep(step, i) {
  if (!step || typeof step !== 'object' || !step.type) {
    throw new Error(`Invalid operations[${i}]: missing type`);
  }
  const t = String(step.type);
  if (!['resize', 'convert', 'compress', 'rotate', 'flip', 'crop'].includes(t)) {
    throw new Error(
      `Invalid operations[${i}].type "${t}" (supported: resize, convert, compress, rotate, flip, crop)`,
    );
  }
}

export async function runBatchFromConfig(ctx, configPath) {
  const absConfig = path.resolve(configPath);
  const raw = await fs.readFile(absConfig, 'utf8');
  let cfg;
  try {
    cfg = JSON.parse(raw);
  } catch (e) {
    throw new Error(`batch config JSON invalid: ${e.message}`);
  }
  if (!cfg.input || !cfg.output || !Array.isArray(cfg.operations)) {
    throw new Error('batch config requires input, output, and operations[]');
  }
  cfg.operations.forEach((s, i) => assertStep(s, i));

  const merged = {
    ...ctx,
    input: cfg.input,
    output: cfg.output,
    recursive: cfg.recursive ?? ctx.recursive ?? defaults.recursive,
    strict: cfg.strict ?? ctx.strict ?? defaults.strict,
    overwrite: cfg.overwrite ?? ctx.overwrite ?? defaults.overwrite,
    quality: cfg.quality,
    format: cfg.format,
  };

  const inputAbs = path.resolve(merged.input);
  const outputAbs = path.resolve(merged.output);
  if (!(await pathExists(inputAbs))) {
    throw new Error(`Input not found: ${inputAbs}`);
  }
  await assertWritableDir(outputAbs);

  const entries = await listInputEntries(inputAbs, outputAbs, merged.recursive);
  const report = createReport('batch', merged.input, merged.output);

  for (const ent of entries) {
    if (ent.kind === 'skipped') {
      report.add({
        status: 'skipped',
        inLabel: ent.rel,
        outLabel: '',
        message: ent.reason ?? 'unsupported format',
        beforeBytes: await fileSize(ent.abs).catch(() => undefined),
      });
      // eslint-disable-next-line no-continue
      continue;
    }

    const beforeBytes = await fileSize(ent.abs);
    try {
      let targetKey = null;
      let lastQuality = defaults.quality;

      let p = sharpInstance(ent.abs).rotate();

      // eslint-disable-next-line no-restricted-syntax
      for (const step of cfg.operations) {
        if (step.type === 'resize') {
          const mw = step.maxWidth ?? step.width;
          const mh = step.maxHeight ?? step.height;
          const wo = step.withoutEnlargement !== false;
          const resizeOpts = { fit: 'inside', withoutEnlargement: wo };
          if (mw) resizeOpts.width = Number(mw);
          if (mh) resizeOpts.height = Number(mh);
          if (!resizeOpts.width && !resizeOpts.height) {
            throw new Error('resize step needs maxWidth/width/maxHeight/height');
          }
          p = p.resize(resizeOpts);
        } else if (step.type === 'rotate') {
          const a = step.angle ?? 'auto';
          p = a === 'auto' ? p.rotate() : p.rotate(Number(a));
        } else if (step.type === 'flip') {
          const d = String(step.direction || 'horizontal').toLowerCase();
          p = d === 'vertical' ? p.flip() : p.flop();
        } else if (step.type === 'crop') {
          const meta = await p.metadata();
          const iw = meta.width ?? 0;
          const ih = meta.height ?? 0;
          if (!iw || !ih) throw new Error('crop step: missing dimensions');
          let left;
          let top;
          let cw;
          let ch;
          if (step.ratio) {
            const m = /^(\d+)\s*:\s*(\d+)$/.exec(String(step.ratio).trim());
            if (!m) throw new Error(`Invalid crop ratio "${step.ratio}"`);
            const rw = Number(m[1]);
            const rh = Number(m[2]);
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
            left = Number(step.left);
            top = Number(step.top);
            cw = Number(step.width ?? step.cropWidth);
            ch = Number(step.height ?? step.cropHeight);
            if (left + cw > iw || top + ch > ih) {
              throw new Error(`crop step exceeds bounds (${iw}x${ih})`);
            }
          }
          p = p.extract({ left, top, width: cw, height: ch });
        } else if (step.type === 'convert') {
          if (!step.format) throw new Error('convert step requires format');
          targetKey = parseFormatArg(step.format);
          lastQuality = step.quality !== undefined ? parseQuality(step.quality, lastQuality) : lastQuality;
        } else if (step.type === 'compress') {
          lastQuality = step.quality !== undefined ? parseQuality(step.quality, lastQuality) : lastQuality;
        }
      }

      if (!targetKey) {
        const meta = await sharpInstance(ent.abs).metadata();
        targetKey = sharpFormatToKey(meta.format);
        if (merged.quality !== undefined) {
          lastQuality = parseQuality(merged.quality, lastQuality);
        }
      }

      const ext = extensionForFormatKey(targetKey);
      const outPath = buildOutputPath(outputAbs, ent.rel, ext);
      await ensureDir(path.dirname(outPath));
      if ((await pathExists(outPath)) && !merged.overwrite) {
        report.add({
          status: 'skipped',
          inLabel: ent.rel,
          outLabel: path.relative(process.cwd(), outPath),
          message: 'output exists (use --overwrite)',
          beforeBytes,
        });
        // eslint-disable-next-line no-continue
        continue;
      }

      p = encodePipeline(p, targetKey, lastQuality);
      await p.toFile(outPath);
      const afterBytes = await fileSize(outPath);
      report.add({
        status: 'success',
        inLabel: ent.rel,
        outLabel: path.relative(process.cwd(), outPath),
        beforeBytes,
        afterBytes,
      });
    } catch (e) {
      report.add({
        status: 'failed',
        inLabel: ent.rel,
        message: userFacingImageError(e),
        beforeBytes,
      });
      if (merged.strict) {
        console.log(report.toText());
        if (merged.report) {
          await report.writeJSON(path.resolve(merged.report));
        }
        process.exitCode = 1;
        return;
      }
    }
  }

  console.log(report.toText());
  if (merged.report) {
    await report.writeJSON(path.resolve(merged.report));
  }
}
