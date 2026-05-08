import { defaults } from './config/defaults.mjs';
import { runCompress } from './core/compress.mjs';
import { runConvert } from './core/convert.mjs';
import { runResize } from './core/resize.mjs';
import { runCrop } from './core/crop.mjs';
import { runRotate } from './core/rotate.mjs';
import { runFlip } from './core/flip.mjs';
import { runWatermark } from './core/watermark.mjs';
import { runMetadata } from './core/metadata.mjs';
import { runBatchFromConfig } from './core/batch.mjs';

function parseArgv(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') {
      flags.help = true;
      continue;
    }
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq !== -1) {
        const k = a.slice(2, eq);
        flags[k] = a.slice(eq + 1);
        continue;
      }
      const key = a.slice(2);
      const nx = argv[i + 1];
      if (nx && !nx.startsWith('--')) {
        flags[key] = nx;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(a);
    }
  }
  return { flags, positional };
}

function buildContext(flags, op) {
  const recursive = flags['no-recursive'] ? false : defaults.recursive;
  const output =
    flags.output !== undefined
      ? flags.output
      : op === 'metadata'
        ? undefined
        : defaults.outputDir;
  return {
    input: flags.input,
    output,
    quality: flags.quality,
    format: flags.format,
    width: flags.width,
    height: flags.height,
    maxWidth: flags.maxWidth,
    maxHeight: flags.maxHeight,
    ratio: flags.ratio,
    angle: flags.angle,
    direction: flags.direction,
    text: flags.text,
    watermarkPath: flags.watermark,
    position: flags.position,
    opacity: flags.opacity,
    margin: flags.margin,
    left: flags.left,
    top: flags.top,
    cropWidth: flags.cropWidth,
    cropHeight: flags.cropHeight,
    overwrite: Boolean(flags.overwrite),
    strict: Boolean(flags.strict),
    recursive,
    report: flags.report,
    withoutEnlargement: flags['allow-enlarge'] ? false : true,
  };
}

function globalHelp() {
  return `Usage: image-toolkit <operation> [options]

Operations:
  compress    Raster re-encode with optional max-width constraint
  convert     Convert to webp/avif/jpg/png
  resize      Resize (fit inside, preserve aspect by default)
  crop        Ratio center-crop or explicit box
  rotate      90|180|270|auto (EXIF)
  flip        horizontal|vertical
  watermark   Text and/or image overlay
  metadata    Print metadata scan report (no image writes)
  batch       Chained ops from JSON config

Common options:
  --input <path>        File or directory
  --output <path>       Output root (default: ${defaults.outputDir})
  --quality <1-100>     Default ${defaults.quality}
  --format <fmt>        original|jpg|jpeg|png|webp|avif
  --maxWidth <px>       Long-edge cap for compress default ${defaults.maxWidth}
  --recursive             (default on; use --no-recursive to disable)
  --overwrite           Overwrite existing outputs
  --strict              Fail fast on first per-file error
  --report <path.json>  Also write JSON report

Examples:
  image-toolkit compress --input ./a.png --output ./dist --quality 75
  image-toolkit convert --input ./images --output ./dist --format webp --quality 80
  image-toolkit resize --input ./a.jpg --output ./dist --width 1200
  image-toolkit crop --input ./a.jpg --output ./dist --ratio 16:9
  image-toolkit rotate --input ./a.jpg --output ./dist --angle 90
  image-toolkit flip --input ./a.jpg --output ./dist --direction horizontal
  image-toolkit watermark --input ./a.jpg --output ./dist --text "Brand" --position bottom-right
  image-toolkit metadata --input ./images
  image-toolkit batch --config ./image-toolkit.config.json
`;
}

export async function main(argv) {
  const { flags, positional } = parseArgv(argv);
  const op = positional[0];

  if (flags.help || op === 'help') {
    console.log(globalHelp());
    process.exitCode = 0;
    return;
  }
  if (!op) {
    console.log(globalHelp());
    process.exitCode = 1;
    return;
  }

  const ctx = buildContext(flags, op);

  try {
    switch (op) {
      case 'compress':
        if (!ctx.input) throw new Error('--input is required');
        await runCompress(ctx);
        break;
      case 'convert':
        if (!ctx.input) throw new Error('--input is required');
        await runConvert(ctx);
        break;
      case 'resize':
        if (!ctx.input) throw new Error('--input is required');
        await runResize(ctx);
        break;
      case 'crop':
        if (!ctx.input) throw new Error('--input is required');
        await runCrop(ctx);
        break;
      case 'rotate':
        if (!ctx.input) throw new Error('--input is required');
        await runRotate(ctx);
        break;
      case 'flip':
        if (!ctx.input) throw new Error('--input is required');
        await runFlip(ctx);
        break;
      case 'watermark':
        if (!ctx.input) throw new Error('--input is required');
        await runWatermark(ctx);
        break;
      case 'metadata':
        if (!ctx.input) throw new Error('--input is required');
        await runMetadata(ctx);
        break;
      case 'batch': {
        const config = flags.config;
        if (!config) throw new Error('batch requires --config <file.json>');
        await runBatchFromConfig(ctx, config);
        break;
      }
      default:
        console.error(`Unknown operation: ${op}\n`);
        console.log(globalHelp());
        process.exitCode = 1;
    }
  } catch (e) {
    console.error(String(e?.message || e));
    process.exitCode = 1;
  }
}
