# create-favicon

从单张源图生成 **`favicon.ico`**：在 ICO 容器内嵌入三幅 **PNG**（**32×32、48×48、180×180**），符合 Windows ICO + Vista 起 PNG payload 的常见实现方式。

## 约定

- **只写** `--output` 指定的文件；不修改用户项目的其他文件。
- **Install / build 位置**：请在 **本 monorepo（stark-skills）检出** 下的本目录，或 **系统临时目录** 内的 disposable 拷贝中执行 `pnpm install` / `pnpm build`。**不要**在用户无关的**业务应用项目根**默认执行上述步骤，以免产生 `node_modules` 等污染；详见 `skills/create-favicon/SKILL.md` 与 `USAGE.md`。
- 运行信息（成功/错误）打在 **stderr**；**stdout** 保持空闲，便于将来扩展管道用法。

## 要求

- Node **≥ 18.17**
- 本目录执行 `pnpm install`（`sharp` 会拉取平台二进制）

若 `pnpm` 提示 **Ignored build scripts: sharp**，导致运行时报缺少原生模块，请在本目录执行 `pnpm approve-builds` 允许 `sharp` 的安装脚本，或改用 `npm install`。

## 构建与运行

在 **stark-skills 仓库**（或任意已包含本目录的检出）中使用绝对路径示例：

```bash
cd /absolute/path/to/stark-skills/tools/create-favicon
pnpm install
pnpm build
node dist/cli.js --input /absolute/path/to/logo.png --output /absolute/path/to/target/favicon.ico

# 默认 --fit contain（整图可见；非方形时透明或白边）。仅当需要铺满并可接受裁边：
node dist/cli.js --input /absolute/path/to/logo.png --output /absolute/path/to/target/favicon.ico --fit cover
```

若你在**仅含站点代码**的工作区，请把本目录复制到 **`$TMPDIR`**（或 Windows `%TEMP%`）下再在**该临时路径**内执行 `pnpm install` / `pnpm build`，`--output` 指向站点项目内的 `favicon.ico`。

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
