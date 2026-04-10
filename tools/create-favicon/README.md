# create-favicon

从单张源图生成 **`favicon.ico`**：在 ICO 容器内嵌入三幅 **PNG**（**32×32、48×48、180×180**），符合 Windows ICO + Vista 起 PNG payload 的常见实现方式。

## 约定

- **只写** `--output` 指定的文件；不修改用户项目的其他文件。
- 运行信息（成功/错误）打在 **stderr**；**stdout** 保持空闲，便于将来扩展管道用法。

## 要求

- Node **≥ 18.17**
- 本目录执行 `pnpm install`（`sharp` 会拉取平台二进制）

若 `pnpm` 提示 **Ignored build scripts: sharp**，导致运行时报缺少原生模块，请在本目录执行 `pnpm approve-builds` 允许 `sharp` 的安装脚本，或改用 `npm install`。

## 构建与运行

```bash
cd tools/create-favicon
pnpm install
pnpm build
node dist/cli.js --input /path/to/logo.png --output /path/to/favicon.ico
```

全局链接（可选）：

```bash
pnpm link --global
create-favicon -i ./logo.png -o ./favicon.ico
```

## 验收建议

```bash
# 魔数：ICO 头
xxd -l 8 favicon.ico
# 期望含: 0000 0100 与 0300（3 张图，小端）

# 若已安装 ImageMagick
identify favicon.ico
```

应能看到三个内嵌 PNG 及其尺寸为 32、48、180。

## 与 Cursor Skill 的关系

Agent 侧流程见 `skills/create-favicon/SKILL.md`：优先调用本 CLI；用户 **未提供源图** 时 **不得** 生成 ICO。
