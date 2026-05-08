import fs from 'node:fs/promises';

function fmtBytes(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return 'n/a';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function createReport(operation, inputRoot, outputRoot) {
  return {
    operation,
    input: inputRoot,
    output: outputRoot,
    items: [],
    add(item) {
      this.items.push(item);
    },
    summary() {
      let total = 0;
      let success = 0;
      let skipped = 0;
      let failed = 0;
      let before = 0;
      let after = 0;
      for (const it of this.items) {
        total += 1;
        if (it.status === 'success') {
          success += 1;
          before += it.beforeBytes ?? 0;
          after += it.afterBytes ?? 0;
        } else if (it.status === 'skipped') {
          skipped += 1;
        } else {
          failed += 1;
          before += it.beforeBytes ?? 0;
        }
      }
      const saved = Math.max(0, before - after);
      const savedPct = before > 0 ? (saved / before) * 100 : 0;
      return { total, success, skipped, failed, before, after, saved, savedPct };
    },
    toText() {
      const s = this.summary();
      const lines = [];
      lines.push('Image Toolkit Report');
      lines.push('');
      lines.push(`Operation: ${this.operation}`);
      lines.push(`Input: ${this.input}`);
      lines.push(`Output: ${this.output}`);
      lines.push('');
      lines.push('Summary:');
      lines.push(`- Total files: ${s.total}`);
      lines.push(`- Success: ${s.success}`);
      lines.push(`- Skipped: ${s.skipped}`);
      lines.push(`- Failed: ${s.failed}`);
      lines.push(`- Before: ${fmtBytes(s.before)}`);
      lines.push(`- After: ${fmtBytes(s.after)}`);
      lines.push(`- Saved: ${fmtBytes(s.saved)}`);
      lines.push(`- Saved percent: ${s.savedPct.toFixed(2)}%`);
      lines.push('');
      lines.push('Details:');
      for (const it of this.items) {
        if (it.status === 'success') {
          const pct = it.beforeBytes > 0 ? (((it.beforeBytes - it.afterBytes) / it.beforeBytes) * 100).toFixed(1) : '0.0';
          lines.push(`- ${it.inLabel} -> ${it.outLabel}`.trimEnd());
          if (it.message) {
            lines.push(`  Info: ${it.message}`);
          }
          lines.push(`  Before: ${fmtBytes(it.beforeBytes)}`);
          lines.push(`  After: ${fmtBytes(it.afterBytes)}`);
          lines.push(`  Saved: ${pct}%`);
        } else if (it.status === 'skipped') {
          lines.push(`- ${it.inLabel}`);
          lines.push(`  Skipped: ${it.message}`);
        } else {
          lines.push(`- ${it.inLabel}`);
          lines.push(`  Failed: ${it.message}`);
        }
      }
      return lines.join('\n');
    },
    toJSON() {
      return {
        operation: this.operation,
        input: this.input,
        output: this.output,
        summary: this.summary(),
        items: this.items,
      };
    },
    async writeJSON(filePath) {
      await fs.writeFile(filePath, `${JSON.stringify(this.toJSON(), null, 2)}\n`, 'utf8');
    },
  };
}
