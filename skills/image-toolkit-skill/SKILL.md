---
name: image-toolkit-skill
version: "0.1.4"
description: |
  Local raster image toolkit for frontend/public assets, content ops, SEO/Lighthouse/LCP workflows, static asset hygiene, and automated pipelines. Use when users mention image toolkit, image processing, compress/optimize images, convert to WebP/AVIF, resize/crop/rotate/flip, watermark, batch images, image metadata/EXIF, LCP image optimization, frontend image assets, or static image governance.
  中文触发：图片处理、图片压缩、压缩图片、图片格式转换、图片转 WebP/AVIF、图片裁剪、图片缩放、图片旋转、图片翻转、图片加水印、图片批量处理、图片元信息、图片太大、优化图片体积、LCP 图片优化、前端图片资源优化、静态资源图片治理。
  English triggers: image toolkit, image processing, compress/optimize/convert/resize/crop/rotate/flip/watermark image, image metadata, batch image processing, convert to webp/avif.
---

# image-toolkit-skill

> **Language**: Match the user's language when replying.

## Normative references（read order）

1. **This `SKILL.md`** — triggers, AI routing, defaults, safety boundaries.
2. **`USAGE.md`** — **skill package layout** (no fixed global path), **`npm install`**, **run from any cwd** with absolute paths, **troubleshooting**, **`--report` JSON** for CI.

## Commands

本技能是**自包含目录**；安装与调用方式见 **`USAGE.md`**（含：在技能包根目录 `npm install`；可用 **`node <skill-root>/bin/image-toolkit.mjs`** 在用户项目目录下配合绝对路径运行）。

示例（当前 shell 已在技能根目录时）：

```bash
node bin/image-toolkit.mjs <operation> [options]
# or: npm start -- <operation> ...
```

Supported operations: `compress`, `convert`, `resize`, `crop`, `rotate`, `flip`, `watermark`, `metadata`, `batch`.

## AI routing (how to use)

1. If the user wants **lossless/quality tradeoff tuning** or **directory-wide** optimization, prefer `compress` or `batch`.
2. If the user wants **WebP/AVIF modernization**, use `convert` with `--format`, or `batch` with a `convert` step.
3. If the user wants **fixed widths/heights** or **max edge** constraints, use `resize` (fit `inside`, preserves aspect by default).
4. If the user wants **fixed aspect covers**, use `crop --ratio` (center crop) or explicit `--left --top --cropWidth --cropHeight`.
5. If the user wants **EXIF orientation normalization**, use `rotate --angle auto`.
6. If the user wants **auditing only** (no image writes), use `metadata`.
7. If the user describes **multi-step pipelines** (“先缩放再转 webp 再压质量”), prefer `batch --config image-toolkit.config.json`.

**Do not** use this skill for remote URL downloads, SVG rewriting, GIF/video, CDN upload, or automatic codebase reference rewrites (out of scope for v1).

## Host-agnostic note（Codex / Claude Code / Cursor / …）

- **Do not hard-code** a specific repo layout or editor global path when generating commands for the user.
- Resolve **skill root** from where this skill package actually lives on disk (the directory containing `package.json` and `bin/image-toolkit.mjs`).
- Prefer absolute paths for `--input` / `--output` / `--config` when the shell cwd is the user’s app project. Details: **`USAGE.md` → 方式 B**.

## Defaults & safety

- Default `--output`: `./image-toolkit-output`
- Default `--quality`: `75`; default compress long-edge cap `--maxWidth`: `1920` (when not overridden)
- Default **does not overwrite inputs**; outputs go under `--output`
- If an output file exists, the tool **skips** unless `--overwrite`
- Unsupported extensions (SVG/GIF/ICO/BMP/TIFF/…) are **skipped** with `unsupported format` in the report
- `--strict` fails fast on the first per-file error
- Recursive directory scans are **on** unless `--no-recursive`
- When output is nested inside input, the scanner **excludes** the output subtree from inputs (except `metadata`, which scans normally)

## Report

Every run prints a text **Image Toolkit Report** (summary + per-file lines). Optional `--report out.json` writes JSON (**字段契约见 `USAGE.md`**)。

## Examples

```bash
node bin/image-toolkit.mjs compress --input ./image.png --output ./dist --quality 75
node bin/image-toolkit.mjs convert --input ./images --output ./dist --format webp --quality 80
node bin/image-toolkit.mjs resize --input ./banner.jpg --output ./dist --width 1200
node bin/image-toolkit.mjs crop --input ./banner.jpg --output ./dist --ratio 16:9
node bin/image-toolkit.mjs rotate --input ./a.jpg --output ./dist --angle auto
node bin/image-toolkit.mjs flip --input ./a.jpg --output ./dist --direction horizontal
node bin/image-toolkit.mjs watermark --input ./a.jpg --output ./dist --text "AInvest" --position bottom-right
node bin/image-toolkit.mjs metadata --input ./images
node bin/image-toolkit.mjs batch --config ./examples/image-toolkit.config.json
```

### Batch config shape

See `examples/image-toolkit.config.json`. Supported step types: `resize`, `convert`, `compress`, `rotate`, `flip`, `crop`.

## Implementation notes (for agents)

- Stack: **Node.js + sharp** (native dependency; `npm install` in skill package root — see **`USAGE.md`** if load fails).
- Trigger mapping hints:
  - “转 webp/avif” → `convert` or `batch`
  - “压体积 / Lighthouse / LCP 优化” → `compress` or chained `batch`
  - “封面 16:9 / 头像 1:1” → `crop --ratio …`
  - “读取宽高 EXIF” → `metadata`
