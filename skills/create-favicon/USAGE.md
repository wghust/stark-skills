# create-favicon — 使用说明

## 何时使用

用户希望从**自己提供的** logo/图片生成浏览器可用的 **`favicon.ico`**，且一个文件内包含 **32×32、48×48、180×180** 三档方形图（ICO 内嵌 PNG）。

## 无图不继续（门禁）

在以下情况 **不得** 生成 ICO：

- 用户未在对话中 **上传/附加** 图片，且
- 未给出 **可读路径**，也未 **明确点名** 工作区中的某图像文件。

此时应提示用户：**请先上传源图，或提供图片路径**（示例：`public/logo.png`）。不要猜测、不要用仓库里无关图片代替。

## 支持的源格式

实现上依赖 `tools/create-favicon` 使用的 `sharp`：常见 **PNG、JPEG、WebP、GIF、SVG** 等通常可读。若某格式解码失败，向用户说明并建议转为 PNG/SVG 再试。

## 输出

- 默认文件名 **`favicon.ico`**。
- 写入路径由用户指定或约定为站点根 / `public/` / 框架约定目录；覆盖已存在文件前应征询用户。

## 推荐 HTML（示例）

```html
<link rel="icon" href="/favicon.ico" sizes="any" />
```

IANA 类型为 `image/vnd.microsoft.icon`；部分服务器仍配置 `image/x-icon`，二者在实践中均常见。

## Apple Touch Icon（补充）

**180×180** 在 Web 上常作为 **Apple Touch Icon** 以 **独立 PNG**（如 `/apple-touch-icon.png`）提供；本 skill 仍按约定把 **180×180 嵌入 `favicon.ico`**。若用户关心 iOS「添加到主屏幕」效果，可建议额外放置 `apple-touch-icon` 并查阅 `references/ico-format-and-browser-notes.md`。

## CLI 示例

在仓库根目录：

```bash
cd tools/create-favicon
pnpm install
pnpm build
node dist/cli.js --input /path/to/source.png --output /path/to/favicon.ico
```

## 故障排查

- **`sharp` 安装失败**：检查 Node 版本（建议 ≥18.17），或在本机使用 `pnpm` 重新安装依赖。
- **输出无法显示**：清浏览器缓存；确认部署路径与 `<link rel="icon">` 一致。
