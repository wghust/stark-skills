import path from 'node:path';
import { pathExists, listInputEntries, fileSize } from '../utils/file.mjs';
import { createReport } from '../utils/report.mjs';
import { sharpInstance, userFacingImageError } from './pipeline.mjs';

function summarizeMeta(meta, byteSize) {
  const w = meta.width ?? 'n/a';
  const h = meta.height ?? 'n/a';
  const fmt = meta.format ?? 'unknown';
  const alpha = meta.hasAlpha ? 'alpha:true' : 'alpha:false';
  const space = meta.space ? `space:${meta.space}` : '';
  const exifOrientation = meta.orientation ? `EXIF orient:${meta.orientation}` : '';
  const size = `${byteSize} B`;
  return [size, `${w}x${h}`, fmt, alpha, space, exifOrientation].filter(Boolean).join(', ');
}

export async function runMetadata(ctx) {
  const inputAbs = path.resolve(ctx.input);
  if (!(await pathExists(inputAbs))) {
    throw new Error(`Input not found: ${inputAbs}`);
  }

  const outputAbs = ctx.output ? path.resolve(ctx.output) : path.resolve(inputAbs);
  const entries = await listInputEntries(inputAbs, outputAbs, ctx.recursive, {
    excludeNestedOutput: false,
  });
  const report = createReport('metadata', ctx.input, ctx.output ?? '(report only)');

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
      const meta = await sharpInstance(ent.abs).metadata();
      report.add({
        status: 'success',
        inLabel: ent.rel,
        outLabel: '',
        message: summarizeMeta(meta, beforeBytes),
        beforeBytes,
        afterBytes: beforeBytes,
      });
    } catch (e) {
      report.add({
        status: 'failed',
        inLabel: ent.rel,
        outLabel: '',
        message: userFacingImageError(e),
        beforeBytes,
      });
      if (ctx.strict) {
        console.log(report.toText());
        if (ctx.report) {
          await report.writeJSON(path.resolve(ctx.report));
        }
        process.exitCode = 1;
        return;
      }
    }
  }

  console.log(report.toText());
  if (ctx.report) {
    await report.writeJSON(path.resolve(ctx.report));
  }
}
