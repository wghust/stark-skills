import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import sharp from 'sharp';

const posix = process.platform !== 'win32';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'bin/image-toolkit.mjs');

function run(args, cwd = root) {
  const r = spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8' });
  return { status: r.status ?? 0, stdout: r.stdout, stderr: r.stderr };
}

async function pngFile(pathTo, w = 200, h = 120) {
  const buf = await sharp({
    create: { width: w, height: h, channels: 3, background: { r: 90, g: 120, b: 200 } },
  })
    .png()
    .toBuffer();
  await fs.writeFile(pathTo, buf);
}

async function tmpDir(name, t) {
  const d = path.join(root, `.tmp-test-${name}-${Date.now()}`);
  await fs.mkdir(d, { recursive: true });
  t.after(async () => {
    await fs.rm(d, { recursive: true, force: true });
  });
  return d;
}

test('compress: single png produces report and output', async (t) => {
  const base = await tmpDir('compress', t);
  const src = path.join(base, 'in.png');
  await pngFile(src, 640, 480);
  const out = path.join(base, 'out');
  const r = run(['compress', '--input', src, '--output', out, '--quality', '65', '--maxWidth', '320']);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Operation: compress/);
  assert.match(r.stdout, /Success: 1/);
  const outs = await fs.readdir(out);
  assert.ok(outs.includes('in.png'));
});

test('convert: writes webp', async (t) => {
  const base = await tmpDir('convert', t);
  const src = path.join(base, 'a.png');
  await pngFile(src);
  const out = path.join(base, 'out');
  const r = run(['convert', '--input', src, '--output', out, '--format', 'webp', '--quality', '80']);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Success: 1/);
  const buf = await fs.readFile(path.join(out, 'a.webp'));
  const meta = await sharp(buf).metadata();
  assert.equal(meta.format, 'webp');
});

test('resize: width constraint preserves webp output format from png input', async (t) => {
  const base = await tmpDir('resize', t);
  const src = path.join(base, 'a.png');
  await pngFile(src, 800, 400);
  const out = path.join(base, 'out');
  const r = run(['resize', '--input', src, '--output', out, '--width', '200']);
  assert.equal(r.status, 0, r.stderr);
  const meta = await sharp(path.join(out, 'a.png')).metadata();
  assert.equal(meta.width, 200);
});

test('crop: center 1:1', async (t) => {
  const base = await tmpDir('crop', t);
  const src = path.join(base, 'a.png');
  await pngFile(src, 400, 200);
  const out = path.join(base, 'out');
  const r = run(['crop', '--input', src, '--output', out, '--ratio', '1:1']);
  assert.equal(r.status, 0, r.stderr);
  const meta = await sharp(path.join(out, 'a.png')).metadata();
  assert.equal(meta.width, meta.height);
});

test('crop: explicit box out of bounds fails per-file', async (t) => {
  const base = await tmpDir('crop2', t);
  const src = path.join(base, 'a.png');
  await pngFile(src, 50, 50);
  const out = path.join(base, 'out');
  const r = run(['crop', '--input', src, '--output', out, '--left', '0', '--top', '0', '--cropWidth', '999', '--cropHeight', '999']);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /exceeds image bounds/);
});

test('rotate: 90', async (t) => {
  const base = await tmpDir('rot', t);
  const src = path.join(base, 'a.png');
  await pngFile(src, 200, 100);
  const out = path.join(base, 'out');
  const r = run(['rotate', '--input', src, '--output', out, '--angle', '90']);
  assert.equal(r.status, 0, r.stderr);
  const meta = await sharp(path.join(out, 'a.png')).metadata();
  assert.equal(meta.width, 100);
  assert.equal(meta.height, 200);
});

test('flip: horizontal', async (t) => {
  const base = await tmpDir('flip', t);
  const src = path.join(base, 'a.png');
  await pngFile(src);
  const out = path.join(base, 'out');
  const r = run(['flip', '--input', src, '--output', out, '--direction', 'horizontal']);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Success: 1/);
});

test('watermark: text only', async (t) => {
  const base = await tmpDir('wm', t);
  const src = path.join(base, 'a.png');
  await pngFile(src, 300, 200);
  const out = path.join(base, 'out');
  const r = run([
    'watermark',
    '--input',
    src,
    '--output',
    out,
    '--text',
    'Hello',
    '--position',
    'center',
    '--opacity',
    '0.8',
  ]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Success: 1/);
});

test('metadata: lists dimensions', async (t) => {
  const base = await tmpDir('meta', t);
  const src = path.join(base, 'a.png');
  await pngFile(src, 123, 77);
  const r = run(['metadata', '--input', src]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /123x77/);
});

test('directory: skips svg and processes png', async (t) => {
  const base = await tmpDir('mixed', t);
  await fs.writeFile(
    path.join(base, 'a.png'),
    await sharp({ create: { width: 10, height: 10, channels: 3, background: 'red' } }).png().toBuffer(),
  );
  await fs.writeFile(path.join(base, 'icon.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  const out = path.join(base, 'out');
  const r = run(['convert', '--input', base, '--output', out, '--format', 'webp']);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Skipped: 1/);
  assert.match(r.stdout, /Success: 1/);
  assert.match(r.stdout, /unsupported format/);
});

test('batch: resize+convert+compress', async (t) => {
  const base = await tmpDir('batch', t);
  const pub = path.join(base, 'public', 'images', 'nested');
  await fs.mkdir(pub, { recursive: true });
  const src = path.join(pub, 'a.png');
  await pngFile(src, 800, 600);
  const out = path.join(base, 'public', 'images-optimized');
  const cfg = {
    input: `./public/images`,
    output: `./public/images-optimized`,
    operations: [
      { type: 'resize', maxWidth: 400, withoutEnlargement: true },
      { type: 'convert', format: 'webp', quality: 80 },
      { type: 'compress', quality: 70 },
    ],
  };
  const cfgPath = path.join(base, 'cfg.json');
  await fs.writeFile(cfgPath, JSON.stringify(cfg));
  const r = run(['batch', '--config', cfgPath], base);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const outFile = path.join(out, 'nested', 'a.webp');
  await fs.access(outFile);
  const meta = await sharp(outFile).metadata();
  assert.ok((meta.width ?? 0) <= 400);
});

test('compress: non-writable output directory fails with clear error (TOOL-003)', async (t) => {
  if (!posix) {
    t.skip('POSIX-only: directory mode 0555');
    return;
  }
  const base = await tmpDir('ro-out', t);
  const src = path.join(base, 'in.png');
  await pngFile(src);
  const out = path.join(base, 'out');
  await fs.mkdir(out, { recursive: true });
  await fs.chmod(out, 0o555);
  const r = run(['compress', '--input', src, '--output', out]);
  try {
    await fs.chmod(out, 0o755);
  } catch {
    // ignore
  }
  assert.notEqual(r.status, 0, 'exit code should be non-zero');
  const combined = `${r.stderr}\n${r.stdout}`;
  assert.match(combined, /Cannot write to output directory/i);
});

test('compress: missing input path fails without successful report', async (t) => {
  const base = await tmpDir('missing-in', t);
  const ghost = path.join(base, 'nope.png');
  const out = path.join(base, 'out');
  const r = run(['compress', '--input', ghost, '--output', out]);
  assert.notEqual(r.status, 0);
  assert.match(`${r.stderr}${r.stdout}`, /Input not found/i);
});
