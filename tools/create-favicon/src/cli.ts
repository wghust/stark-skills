#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import { program } from "commander";
import sharp from "sharp";
import { ICO_SIZES, buildIcoFromPngs } from "./ico.js";

program
  .name("create-favicon")
  .description("Write favicon.ico with embedded PNGs at 32, 48, and 180 px")
  .requiredOption("-i, --input <path>", "source image path (png, jpeg, webp, svg, …)")
  .requiredOption("-o, --output <path>", "output favicon.ico path")
  .parse();

const opts = program.opts<{ input: string; output: string }>();

async function main(): Promise<void> {
  const images: { width: number; height: number; png: Buffer }[] = [];
  for (const size of ICO_SIZES) {
    const png = await sharp(opts.input)
      .resize(size, size, { fit: "cover", position: "centre" })
      .png()
      .toBuffer();
    images.push({ width: size, height: size, png });
  }

  const ico = buildIcoFromPngs(images);
  await writeFile(opts.output, ico);
  // stderr: operational message; stdout left clean for potential piping
  console.error(`Wrote ${opts.output} (${ico.length} bytes, ${ICO_SIZES.join("/")} PNG-in-ICO).`);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`create-favicon: ${msg}`);
  process.exitCode = 1;
});
