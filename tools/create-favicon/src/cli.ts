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
  .option(
    "--fit <mode>",
    "contain: scale full image inside square (default); cover: crop to fill square",
    "contain",
  )
  .parse();

const opts = program.opts<{ input: string; output: string; fit: string }>();

function parseFit(raw: string): "contain" | "cover" {
  const v = raw.toLowerCase();
  if (v === "contain" || v === "cover") {
    return v;
  }
  throw new Error(`--fit must be contain or cover, got: ${raw}`);
}

function warnIfTinyRaster(meta: sharp.Metadata): void {
  const w = meta.width;
  const h = meta.height;
  if (w === undefined || h === undefined) {
    return;
  }
  const shortEdge = Math.min(w, h);
  const longEdge = Math.max(w, h);
  if (shortEdge < 32 || longEdge < 32) {
    console.error(
      "create-favicon: warning: source bitmap is very small; favicon output may look soft or pixelated after upscaling. Prefer a larger raster (e.g. ≥128px) or SVG.",
    );
  }
}

async function main(): Promise<void> {
  const fit = parseFit(opts.fit);
  const meta = await sharp(opts.input).metadata();
  warnIfTinyRaster(meta);
  const hasAlphaChannel = meta.hasAlpha === true || meta.channels === 4;
  const padForContain =
    fit === "contain"
      ? hasAlphaChannel
        ? { r: 0, g: 0, b: 0, alpha: 0 }
        : { r: 255, g: 255, b: 255, alpha: 1 }
      : undefined;

  const hqKernel = sharp.kernel.lanczos3;
  const images: { width: number; height: number; png: Buffer }[] = [];
  for (const size of ICO_SIZES) {
    const resizeOpts =
      fit === "cover"
        ? {
            fit: "cover" as const,
            position: "centre" as const,
            kernel: hqKernel,
          }
        : {
            fit: "contain" as const,
            position: "centre" as const,
            background: padForContain,
            kernel: hqKernel,
          };

    const png = await sharp(opts.input)
      .resize(size, size, resizeOpts)
      .png()
      .toBuffer();
    images.push({ width: size, height: size, png });
  }

  const ico = buildIcoFromPngs(images);
  await writeFile(opts.output, ico);
  const padNote =
    fit === "contain"
      ? hasAlphaChannel
        ? "transparent padding if non-square"
        : "white padding if non-square (use PNG/SVG for transparent margins)"
      : "edges may be cropped if non-square";
  console.error(
    `Wrote ${opts.output} (${ico.length} bytes, ${ICO_SIZES.join("/")} PNG-in-ICO, fit=${fit}, kernel=lanczos3, ${padNote}).`,
  );
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`create-favicon: ${msg}`);
  process.exitCode = 1;
});
