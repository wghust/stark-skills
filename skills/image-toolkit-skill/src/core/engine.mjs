import path from 'node:path';
import { pathExists, assertWritableDir, listInputEntries, fileSize } from '../utils/file.mjs';
import { createReport } from '../utils/report.mjs';

/**
 * @param {object} opts
 * @param {string} opts.operation
 * @param {string} opts.input
 * @param {string} opts.output
 * @param {object} opts.ctx booleans: strict, overwrite, recursive; report path optional
 * @param {(abs: string, rel: string, outRootAbs: string) => Promise<object>} opts.runOne returns report line object
 */
export async function runWithReport({ operation, input, output, ctx, runOne }) {
  const inputAbs = path.resolve(input);
  const outputAbs = path.resolve(output);
  if (!(await pathExists(inputAbs))) {
    throw new Error(`Input not found: ${inputAbs}`);
  }
  await assertWritableDir(outputAbs);

  const entries = await listInputEntries(inputAbs, outputAbs, ctx.recursive);
  const report = createReport(operation, input, output);

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
    const item = await runOne(ent.abs, ent.rel, outputAbs);
    report.add(item);
    if (ctx.strict && item.status === 'failed') {
      console.log(report.toText());
      if (ctx.report) {
        await report.writeJSON(path.resolve(ctx.report));
      }
      process.exitCode = 1;
      return;
    }
  }

  console.log(report.toText());
  if (ctx.report) {
    await report.writeJSON(path.resolve(ctx.report));
  }
}
