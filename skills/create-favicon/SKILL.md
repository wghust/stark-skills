---
name: create-favicon
description: |
  Generate a standards-aligned browser favicon.ico from a user-supplied source image, embedding PNG rasters at 32×32, 48×48, and 180×180 in one ICO container. Use when the user asks to create a favicon, 生成 favicon、网站图标、从图片做 ico、favicon.ico、create favicon from image.
  从用户提供的源图生成含 32/48/180 三档尺寸的 favicon.ico（ICO 内嵌 PNG）。若用户未上传或未指定可用源图，必须中止并提示上传/路径。
---

# create-favicon

> **Language**: Match the user’s language (中文提问则中文回复).

## Normative references (read before generating)

1. `references/ico-format-and-browser-notes.md` — ICO 结构、MIME、尺寸与 Apple Touch Icon 说明。
2. `USAGE.md` — 输入输出约定与无图门禁话术。

---

## Step 0 · Mandatory source image gate（必须最先执行）

**DO NOT** resize, pack ICO, or write `favicon.ico` until a **usable source image** is confirmed.

Treat the source as **present** only if **至少一项**成立：

- 用户在对话中 **附加了图片**；或
- 用户给出了 **可读的绝对/相对路径**，且你能 `read_file`/打开该图像文件；或
- 用户 **明确指定** 工作区内某文件为源图（例如 `@public/logo.png`），且该文件为常见栅格/矢量图格式（PNG、JPEG、WebP、GIF、SVG 等）。

**IF** none of the above applies — including when the user only says “做个 favicon”而未指定用哪张图、也未附加图片：

- **STOP** immediately.
- **DO NOT** invent a placeholder icon, **DO NOT** pick a random image from the repo, **DO NOT** run conversion tools.
- Reply clearly, e.g. **「请先上传用作 favicon 的源图片，或提供可访问的图片文件路径（如 `public/logo.png`），我才能生成 `favicon.ico`。」**

---

## Step 1 · Resolve output path

- Ask or infer where to write `favicon.ico` (e.g. `public/favicon.ico`, `app/favicon.ico`, or site root). Do not overwrite without user confirmation if a file already exists.

---

## Step 2 · Generate ICO（优先使用本仓库 CLI）

**Preferred path** — when `tools/create-favicon/` exists and dependencies are installable:

1. `cd tools/create-favicon && pnpm install && pnpm build`
2. Run:

```bash
node dist/cli.js --input "<absolute-or-workspace-path-to-source>" --output "<absolute-or-workspace-path-to-favicon.ico>"
```

The CLI writes a single `favicon.ico` containing **three** embedded **PNG** blobs at **32×32**, **48×48**, and **180×180** (ICO container per Windows icon layout; see references).

**Fallback** — if the tool is missing or `sharp` cannot run in the environment:

- Use another method that still satisfies the **ICO + three PNG payloads** requirement (e.g. document ImageMagick/`magick` steps in `USAGE.md` patterns), or stop and explain what is missing.

---

## Step 3 · Quick verification

- Confirm file size is non-zero and magic `00 00 01 00` at offset 0 (ICO), image count `03 00` at offset 4.
- Optionally decode each embedded PNG signature `89 50 4E 47` at offsets listed in directory entries.

---

## Step 4 · Tell the user

- Output path, the three embedded sizes, and a short HTML hint (`<link rel="icon" href="/favicon.ico" …>`). Mention that **iOS 主屏幕** 常用独立 `apple-touch-icon.png`；详见 `references/ico-format-and-browser-notes.md`。
