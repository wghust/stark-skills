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

## 构图：contain（默认）与 cover（须用户明确要求）

| 模式 | 行为 | 适用 |
|------|------|------|
| **`contain`（默认）** | 整图等比缩放进方形，**不裁切**内容；非 1:1 时有留白 | 用户希望 favicon **还是那张 logo**，不丢边缘 |
| **`cover`** | 铺满方形，**多出的部分裁掉**（常为中心裁切） | 用户**明确**要填满、不要留白、可接受裁边 |

旧版默认若使用 `cover`，横向/纵向 logo 易被裁成「变样」；当前 CLI **默认 `contain`**。**透明留白**需源图带 alpha（如 PNG/SVG）；**JPEG** 无透明通道时，默认可用 **白色** 留白（见 CLI 说明）。需要透明边时请使用 PNG/SVG 源图。

调用示例：`node dist/cli.js -i ... -o ...`（默认 contain）；仅当用户明确要求铺满时再 `--fit cover`。

## 多尺寸（32 / 48 / 180）与缩放质量

同一 `favicon.ico` 里的三档是 **同一构图** 的 **三种分辨率**：浏览器或系统在不同场景下选用不同条目时，**应是同一枚 logo 的缩放版**，而不是某一档突然换了裁切或留白逻辑。

CLI 对三档均使用 **Lanczos 类** 高质量重采样（`sharp`：`kernel=lanczos3`），**不**默认使用最近邻插值，以减轻锯齿与糊边。

若源图是 **很小的位图**（例如宽或高 **小于 32px**），放大到 favicon 方格后会 **发糊或显颗粒感**，CLI 会在 **stderr** 打出警告。建议提供 **更大尺寸的 PNG** 或 **SVG** 等矢量源，再生成 favicon。

## 何谓「污染」用户项目

**污染**指在用户的**业务应用仓库**里为跑本 CLI 而留下与站点无关的工程痕迹，例如：在应用根目录执行 `pnpm install` 仅为构建 favicon 工具、产生 **`node_modules`**、为本工具生成持久 **`dist/`**、把整套 **`tools/create-favicon`** 拷进用户仓库（**用户未要求 vendoring 时**）、或仅为本工具在应用根新增 **`package.json` / `pnpm-lock.yaml`**。

**不属污染、且应当发生**：在用户确认的路径写入 **`favicon.ico`**（如 `public/favicon.ico`）。**临时文件**应放在**系统临时目录**，用毕删除。

**推荐做法**（与 `SKILL.md` Step 2 一致）：在 **stark-skills（或含本工具的 monorepo）检出目录**的 `tools/create-favicon` 下构建；或在 **`$TMPDIR`** 等临时目录 disposable clone/复制后构建；**`--output`** 仍指向用户应用内的绝对路径。用户**明确要求**把 CLI 纳入其仓库时，可在该 vendored 路径下安装构建，并提示 `.gitignore` / CI 影响。

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

在 **本 monorepo（stark-skills）检出** 下的工具目录执行安装与构建（**不要**在用户自己的站点项目根里仅为 favicon 执行下列步骤）：

```bash
cd /absolute/path/to/stark-skills/tools/create-favicon
pnpm install
pnpm build
node dist/cli.js --input /absolute/path/to/source.png --output /absolute/path/to/user-app/public/favicon.ico
# 用户明确要求铺满、可裁边时：
# node dist/cli.js --input ... --output ... --fit cover
```

若当前仅有用户站点仓库，可将 `tools/create-favicon` **复制或浅克隆**到临时目录后在**临时目录**内 `pnpm install && pnpm build`，再用绝对路径调用 `node dist/cli.js`，`--output` 指向站点内目标文件。

## 故障排查

- **`sharp` 安装失败**：检查 Node 版本（建议 ≥18.17），或在本机使用 `pnpm` 重新安装依赖。
- **输出无法显示**：清浏览器缓存；确认部署路径与 `<link rel="icon">` 一致。
