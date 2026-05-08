export function parseIntStrict(name, raw, { min = 1, max = Number.MAX_SAFE_INTEGER } = {}) {
  if (raw === undefined || raw === null || raw === true || raw === '') {
    throw new Error(`${name}: value required`);
  }
  const n = Number.parseInt(String(raw), 10);
  if (!Number.isFinite(n) || String(raw).trim() !== String(n) && !/^-?\d+$/.test(String(raw).trim())) {
    throw new Error(`${name}: must be an integer (got ${JSON.stringify(raw)})`);
  }
  if (n < min || n > max) {
    throw new Error(`${name}: must be between ${min} and ${max} (got ${n})`);
  }
  return n;
}

export function parseOptionalInt(name, raw, bounds) {
  if (raw === undefined || raw === null || raw === false) return undefined;
  return parseIntStrict(name, raw, bounds);
}

export function parseQuality(raw, fallback = 75) {
  if (raw === undefined || raw === null || raw === '') return fallback;
  return parseIntStrict('quality', raw, { min: 1, max: 100 });
}

export function parseRatio(raw) {
  if (!raw) throw new Error('--ratio is required for this crop mode');
  const s = String(raw);
  const m = /^(\d+)\s*:\s*(\d+)$/.exec(s.trim());
  if (!m) throw new Error(`Invalid --ratio "${raw}" (expected like 16:9)`);
  return { w: Number(m[1]), h: Number(m[2]) };
}

export function parseAngle(raw) {
  if (!raw && raw !== 0) throw new Error('--angle required (90|180|270|auto)');
  const v = String(raw).toLowerCase();
  if (v === 'auto') return 'auto';
  const n = Number.parseInt(String(raw), 10);
  if (![90, 180, 270].includes(n)) {
    throw new Error(`Invalid --angle "${raw}" (use 90, 180, 270, or auto)`);
  }
  return n;
}

export function parseDirection(raw) {
  if (!raw) throw new Error('--direction required (horizontal|vertical)');
  const v = String(raw).toLowerCase();
  if (v === 'horizontal' || v === 'vertical') return v;
  throw new Error(`Invalid --direction "${raw}" (use horizontal|vertical)`);
}

export function parsePosition(raw, fallback = 'bottom-right') {
  if (!raw) return fallback;
  const v = String(raw).toLowerCase();
  const ok = new Set(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']);
  if (!ok.has(v)) throw new Error(`Invalid --position "${raw}"`);
  return v;
}
