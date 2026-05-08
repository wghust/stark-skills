#!/usr/bin/env node
/**
 * Preflight: sharp is native; give a fixed message before the rest of the graph loads.
 */
try {
  await import('sharp');
} catch {
  console.error('image-toolkit: could not load dependency "sharp".\n');
  console.error('Fix: cd to the skill package directory (the folder containing package.json) and run: npm install\n');
  console.error('Requires Node.js >= 18.17. See USAGE.md in the same package for troubleshooting.\n');
  process.exit(1);
}

const { main } = await import('../src/cli.mjs');
await main(process.argv.slice(2));
