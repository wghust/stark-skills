# image-toolkit examples

安装方式与「任意工作目录调用 CLI」见包内 **`USAGE.md`**（不绑定某一编辑器或仓库布局）。

Install from the **skill package root** (directory that contains `package.json`):

```bash
cd "<skill-root>"
npm install
```

## Compress a single PNG

```bash
node bin/image-toolkit.mjs compress --input ./path/to/image.png --output ./dist --quality 75
```

Or from your app repo (absolute paths):

```bash
node "/path/to/image-toolkit-skill/bin/image-toolkit.mjs" compress \
  --input "/path/to/app/public/x.png" \
  --output "/path/to/app/dist/img"
```

## Convert a directory to WebP

```bash
node bin/image-toolkit.mjs convert --input ./public/images --output ./public/images-webp --format webp --quality 80
```

## Resize with max width (keeps aspect ratio)

```bash
node bin/image-toolkit.mjs resize --input ./hero.jpg --output ./dist --maxWidth 1200
```

## Center crop to 1:1

```bash
node bin/image-toolkit.mjs crop --input ./cover.jpg --output ./dist --ratio 1:1
```

## Batch pipeline from JSON

```bash
node bin/image-toolkit.mjs batch --config ./examples/image-toolkit.config.json
```

Point `input`/`output` in the JSON at your real project folders (e.g. Next.js `public/images`).

## Strict / reports

```bash
node bin/image-toolkit.mjs convert --input ./in --output ./out --format avif --strict --report ./report.json
```
