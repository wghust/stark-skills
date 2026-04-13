# insight-pdf 使用说明

从 Markdown/文本思路生成企业风 PDF：Agent 按 `reference.md` 与 `templates/insight-report.html` 拼 HTML，再调用 `scripts/convert.js` 输出 **仅 PDF** 到用户指定路径（用户项目不留 HTML/node_modules）。

---

## 前置条件

- Node.js 18+（建议 LTS）
- 转换时若使用默认模板：**可访问外网**（jsDelivr、Google Fonts），见 `SKILL.md`「网络与模板依赖」

---

## 安装（始终在 skill 目录，不要在用户业务项目里装依赖）

```bash
cd skills/insight-pdf   # 或 ~/.cursor/skills/insight-pdf
npm install
```

安装脚本会尝试下载 Chromium。若报错「Executable doesn't exist」或缺少浏览器：

```bash
npx playwright install chromium
```

---

## 生成 PDF

1. 生成完整 HTML（替换模板中的 `{{REPORT_TITLE}}`、`{{REPORT_BODY}}`、`{{CHARTS_SECTION}}` 等占位符）。
2. 将 HTML 存到临时路径，调用（**skill 路径请用绝对路径**）：

```bash
node /path/to/skills/insight-pdf/scripts/convert.js /tmp/your-report.html /path/to/output/report.pdf
```

`convert.js` 会 **自动创建** PDF 父目录（若不存在）。HTML 路径与 PDF 路径均支持相对或绝对路径；内部使用 `pathToFileURL`，**Windows** 与含空格路径可正常加载 `file://`。

---

## 常见问题

**Chromium 未安装**  
在 skill 目录执行：`npm install && npx playwright install chromium`。

**超时或图表空白**  
多为 CDN/网络不可达。处理：保证联网；或修改模板改为本地/内网静态资源后再转换。

**内网/离线**  
必须去掉或替换模板中对 `cdn.jsdelivr.net`、`fonts.googleapis.com` 的引用，否则 `load` 可能长时间等待或失败。

**与用户项目的关系**  
依赖与浏览器仅在 **skill 目录**；用户仓库里通常只增加一个 `.pdf` 文件。

---

## 设计参考

配色、组件 HTML 片段见 `reference.md`；完整页面骨架见 `templates/insight-report.html`。
