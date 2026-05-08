import fs from 'node:fs/promises';
import path from 'node:path';
import { classifyPath } from './format.mjs';

export async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function fileSize(p) {
  const st = await fs.stat(p);
  return st.size;
}

export async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function isSubPath(root, candidate) {
  const rel = path.relative(root, candidate);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

/**
 * List files to process or skip under inputAbs; excludes files under outputAbs when nested in input.
 * @param {string} inputAbs
 * @param {string} outputAbs
 * @param {boolean} recursive
 * @param {boolean} [opts.excludeNestedOutput]
 * @returns {Promise<Array<{ abs: string, rel: string, kind: 'supported'|'skipped', reason?: string }>>}
 */
export async function listInputEntries(inputAbs, outputAbs, recursive, opts = {}) {
  const excludeNestedOutput = opts.excludeNestedOutput !== false;
  const stat = await fs.stat(inputAbs);
  if (stat.isFile()) {
    const cls = classifyPath(inputAbs);
    const rel = path.basename(inputAbs);
    if (cls.kind === 'supported') {
      return [{ abs: inputAbs, rel, kind: 'supported' }];
    }
    return [{ abs: inputAbs, rel, kind: 'skipped', reason: cls.reason }];
  }

  if (!stat.isDirectory()) {
    throw new Error(`Input is not a file or directory: ${inputAbs}`);
  }

  const entries = [];
  const outputNorm = path.normalize(outputAbs);
  const inputRoot = inputNorm(inputAbs);
  const excludeOutputSubtree = excludeNestedOutput && isSubPath(inputRoot, outputNorm);

  async function walk(dir) {
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const it of items) {
      const full = path.join(dir, it.name);
      if (excludeOutputSubtree && isSubPath(outputNorm, full)) {
        continue;
      }
      if (it.isDirectory()) {
        if (recursive) await walk(full);
        continue;
      }
      if (!it.isFile()) continue;
      const rel = path.relative(inputRoot, full);
      const cls = classifyPath(full);
      if (cls.kind === 'supported') {
        entries.push({ abs: full, rel, kind: 'supported' });
      } else {
        entries.push({ abs: full, rel, kind: 'skipped', reason: cls.reason });
      }
    }
  }

  await walk(inputRoot);
  entries.sort((a, b) => a.rel.localeCompare(b.rel));
  return entries;
}

function inputNorm(p) {
  return path.normalize(path.resolve(p));
}

/**
 * Build output file path preserving directory structure. Never returns source path.
 * @param {string} outputRootAbs
 * @param {string} relToInputRoot - posix-like relative path ok
 * @param {string} targetExtWithDot e.g. '.webp'
 */
export function buildOutputPath(outputRootAbs, relToInputRoot, targetExtWithDot) {
  const parsed = path.parse(relToInputRoot);
  const relDir = parsed.dir;
  const base = parsed.name;
  const outRel = path.join(relDir, `${base}${targetExtWithDot}`);
  return path.join(outputRootAbs, outRel);
}

export async function assertWritableDir(dirAbs) {
  await ensureDir(dirAbs);
  const probe = path.join(dirAbs, '.image-toolkit-write-probe');
  try {
    await fs.writeFile(probe, 'ok');
    await fs.rm(probe);
  } catch (e) {
    throw new Error(`Cannot write to output directory: ${dirAbs} (${e.message})`);
  }
}
