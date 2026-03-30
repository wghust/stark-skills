---
name: news-seo-pdf-report
description: Group Skill — runs a full Google News SEO diagnostic on a target URL, then exports the diagnostic report as a professional PDF. Use when the user wants an auditable, shareable SEO report in PDF format.
---

# News SEO PDF Report

对目标新闻网站执行 Google News SEO 全站诊断，并将诊断报告生成为专业 PDF 文件，方便存档与分享。

---

## When to Use

当用户需要对一个新闻网站进行 Google News SEO 审计，并希望将结果导出为 PDF 报告时使用。
Use when the user says: "audit this site and give me a PDF", "generate a SEO report PDF", or provides a URL and wants a downloadable report.

---

## Dependencies

Install all sub-skills before running this group skill:

```bash
npx skills add https://github.com/wghust/stark-skills --skill google-news-seo
npx skills add https://github.com/wghust/stark-skills --skill insight-pdf
```

---

## Universal Orchestration Logic

### Step 0 — Initialize Shared Context

Load the `## Initial Context` block from this SKILL.md as the shared context object `context`.
Display it at the start so the current state is always visible.

### Step 1..N — Execute Sub-skills in Order

For each sub-skill listed in `## Sub-skills`:

1. Read that sub-skill's SKILL.md in full
2. Before executing, remind yourself of the current `context` state
3. Execute the sub-skill's instructions completely
4. After execution, update `context` with any new outputs produced (fields defined in `## Context Fields`)
5. Display the updated `context` before moving to the next sub-skill

> If a sub-skill fails: stop, report the failure, and display the current `context`. Do not continue.

### Step Final — Summary

Output the final `context` as the execution summary.

---

## Sub-skills

1. google-news-seo — 对 `context.target-url` 执行 Google News SEO 全站诊断（Layer 1 + Layer 2 + Competitor Analysis），将完整 Markdown 报告写入 `context.seo-report-markdown`
2. insight-pdf — 读取 `context.seo-report-markdown`，生成专业 PDF，将输出路径写入 `context.output-pdf-path`

---

## Initial Context

```json
{
  "target-url": null,
  "seo-report-markdown": null,
  "output-pdf-path": null,
  "status": "not-started"
}
```

> `target-url` 由用户在执行前提供（URL 或域名）。

---

## Context Fields

| Field | Updated by | Description |
|---|---|---|
| `target-url` | User (before start) | 待审计的新闻网站 URL 或域名 |
| `seo-report-markdown` | google-news-seo | 完整的 Google News SEO 诊断报告（Markdown 格式） |
| `output-pdf-path` | insight-pdf | 生成的 PDF 文件路径（相对于项目目录） |
| `status` | Updated after each step | `not-started` → `seo-done` → `done` |
