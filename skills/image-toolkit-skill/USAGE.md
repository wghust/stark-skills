# image-toolkit-skill · USAGE

> **Language**: Match the user’s language in chat; this file is bilingual where it helps CI humans.

## Skill package directory（技能包目录）

本技能是一个**自包含目录**（内含 `SKILL.md`、`package.json`、`bin/`、`src/`）。下文称 **技能根目录** 或 **技能包根目录**。

**不要假定**它安装在某个固定全局路径（如某一编辑器的 skills 目录或某一 monorepo 子路径）。同一套文件可能被放在：

- 工作区内的 `skills/…`、`.agents/skills/…`
- 用户或团队维护的 skills 集合中的任意文件夹
- Codex、Claude Code、Cursor 等各自加载 skill 时所解析到的实际路径

代理或用户只需：**在包含 `package.json` 的那一层执行 `npm install`**（或等价包管理器安装），并在调用 CLI 时使用下文路径规则。

### 如何确认技能根目录

在文件系统中，`package.json` 的 `"name": "image-toolkit-skill"` 与 **`bin/image-toolkit.mjs`** 所在目录的上一级即为技能根目录。

要求：**Node.js ≥ 18.17**（见 `package.json` 的 `engines`）。

```bash
cd "<directory-that-contains-package.json>"
npm install    # 首次或依赖变更后
```

## 运行 CLI

### 方式 A：在技能根目录下运行（相对路径最简）

```bash
cd "<skill-root>"
node bin/image-toolkit.mjs <operation> [options]
# 或
npm start -- compress --input ./x.png --output ./dist
```

### 方式 B：在任意当前工作目录运行（适合在用户项目目录里操作）

使用 **技能根目录的绝对路径** 调用入口脚本；`--input`、`--output`、`--config`、`--report` 等可使用 **绝对路径**，或相对于 **当前 shell 的 cwd** 的相对路径（与技能包位置无关）：

```bash
node "/path/to/image-toolkit-skill/bin/image-toolkit.mjs" compress \
  --input "/path/to/project/public/a.png" \
  --output "/path/to/project/dist/optimized"
```

支持的操作：`compress`、`convert`、`resize`、`crop`、`rotate`、`flip`、`watermark`、`metadata`、`batch`。

帮助：

```bash
node "<skill-root>/bin/image-toolkit.mjs" help
```

## 与 `SKILL.md` 的关系

- **代理何时用本技能、如何映射意图到子命令** → 读 `SKILL.md`。
- **安装、任意 cwd 调用方式、故障排查、JSON 报告契约** → 读本 `USAGE.md`。

## 给各类 Agent 宿主（Codex / Claude Code / Cursor / …）

- 读取本技能时，以 **实际载入的 `SKILL.md` 路径** 推出技能根目录（其父目录即为根，若你的加载方式把 `SKILL.md` 放在子目录，则仍以同时包含 `package.json` 与 `bin/` 的目录为准）。
- 不要将「本仓库」或「某一 IDE 全局目录」写死到自动化指令里；对用户说明「在技能包目录 `npm install` 一次」，执行命令时用 **方式 B** 在用户项目 cwd 下调用亦可。

## 故障排查

### 1. `failed to load` / `sharp` / 原生模块报错

`sharp` 带有原生二进制。请依次尝试：

1. 在**技能根目录**执行：`rm -rf node_modules && npm install`
2. 确认 Node 版本：`node -v`（需满足 `engines`）
3. 若仍失败：查看 [sharp 安装说明](https://sharp.pixelplumbing.com/install)（Apple Silicon、离线环境、代理等）

### 2. 启动即提示找不到 `sharp`（由 CLI 预检给出）

在**技能根目录**执行 `npm install`。若已安装仍失败，回到上一节。

**CLI 预检_stderr 形态（`TOOL-002`，便于 CI / 人工对账）**  
当 `sharp` 无法加载（例如未执行 `npm install`、或原生二进制与当前平台不匹配）时，进程在导入业务代码**之前**退出，`stderr` 会为如下三行（与 `bin/image-toolkit.mjs` 一致，仅可能随版本微调措辞）：

```text
image-toolkit: could not load dependency "sharp".

Fix: cd to the skill package directory (the folder containing package.json) and run: npm install

Requires Node.js >= 18.17. See USAGE.md in the same package for troubleshooting.

```

CI 或对账时可断言子串：`sharp`、`npm install`。自动化用例见 `tests/toolkit.test.mjs`（含只写输出目录、`Input not found` 等失败路径）。

### 3. `Cannot write to output directory`

检查 `--output` 目录权限、磁盘空间；必要时换可写路径或加权限。

### 4. 批量任务「全跳过」或输出为空

- 确认 `--input` 下确有 `jpg/jpeg/png/webp/avif`；SVG 等会 **skipped**
- 若输出目录嵌套在输入目录内，写文件类操作会排除输出子树（`metadata` 行为见 `SKILL.md`）

## `--report` JSON 报告（CI / 门禁）

使用 `--report ./report.json` 时，会额外写入**一份**与 stdout 文本报告对应的 JSON 文件（路径相对于 **当前 shell cwd**，除非传绝对路径）。

### 顶层字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `operation` | string | 子命令名，如 `compress`、`batch` |
| `input` | string | 调用时的输入根路径（与 CLI 一致） |
| `output` | string | 输出根或占位字符串（`metadata` 无默认输出目录时可能为 `(report only)`） |
| `summary` | object | 聚合统计 |
| `items` | array | 每个输入条目一行结果 |

### `summary` 对象

| 字段 | 类型 | 说明 |
|------|------|------|
| `total` | number | 条目总数（含 skipped） |
| `success` | number | 成功写出或 metadata 成功 |
| `skipped` | number | 跳过（不支持的扩展、output exists 等） |
| `failed` | number | 单文件失败 |
| `before` | number | 参与统计的字节（成功 + 失败条目上的 before 聚合；与文本协议一致） |
| `after` | number | 输出字节聚合 |
| `saved` | number | `max(0, before - after)` |
| `savedPct` | number | 节省比例（0–100） |

### `items[]` 元素（常见字段）

| 字段 | 类型 | 说明 |
|------|------|------|
| `status` | string | `success` \| `skipped` \| `failed` |
| `inLabel` | string | 相对输入的标签路径或文件名 |
| `outLabel` | string | 输出相对路径；仅扫描时可能为空 |
| `beforeBytes` | number? | 输入文件大小（若有） |
| `afterBytes` | number? | 输出大小（success 时） |
| `message` | string? | `metadata` 的 `Info` 文本；或 skip/fail 原因 |

**稳定性说明**：字段集合以当前 `src/utils/report.mjs` 的 `toJSON()` 为准；CI 建议只依赖上表列出的键，并对未知扩展键保持前向兼容。

## 示例与 batch 配置

见 `examples/README.md` 与 `examples/image-toolkit.config.json`。
