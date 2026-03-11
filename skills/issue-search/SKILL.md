---
name: issue-search
description: |
  Search related GitHub issues when encountering problems. Analyzes user questions to identify relevant open-source libraries, searches their GitHub issues using gh CLI, and returns relevant issue links with titles and status.
  搜索相关的 GitHub issues。分析用户问题以识别相关开源库，使用 gh CLI 搜索其 GitHub issues，并返回相关 issue 链接、标题和状态。
triggers:
  - github issue
  - search issue
  - find issue
  - related issue
  - 搜索 issue
  - 查找问题
  - github 问题
---

# issue-search Skill

> **Language**: Respond in the same language as the user (中文提问则中文回答).

Search related GitHub issues across multiple repositories based on user questions.

---

## Execution Flow

### Step 0 · Check gh CLI

Verify `gh` CLI is available:

```bash
command -v gh
```

If not available, provide fallback web search URLs.

---

### Step 1 · Analyze Question

Extract keywords and identify relevant repositories:

**Technology mapping:**
- react → facebook/react
- next, nextjs → vercel/next.js
- typescript, ts → microsoft/TypeScript
- vue → vuejs/core
- tailwind → tailwindlabs/tailwindcss
- vite → vitejs/vite
- webpack → webpack/webpack
- eslint → eslint/eslint
- prettier → prettier/prettier
- node, nodejs → nodejs/node

Extract error messages and technical terms from user question.

---

### Step 2 · Search GitHub Issues

**Method A: gh CLI (Primary)**

For each identified repository (max 3), try `gh` CLI first:

```bash
gh issue list --repo <owner/repo> --search "<keywords>" --limit 5 --json number,title,state,url
```

**Method B: WebFetch (Fallback)**

If `gh` CLI fails or is unavailable, use WebFetch to access GitHub search page:

1. Construct search URL:
```
https://github.com/<owner/repo>/issues?q=<keywords>
```

2. Use WebFetch tool:
```
WebFetch(url, prompt="Extract GitHub issues from this search page. For each issue, provide: issue number, title, state (open/closed), and full URL. Return up to 5 issues.")
```

3. Parse response to extract:
   - Issue number (e.g., #69064)
   - Issue title
   - Issue state (open/closed)
   - Full URL (e.g., https://github.com/vercel/next.js/issues/69064)

---

### Step 3 · Present Results

Format output using **GFM (GitHub Flavored Markdown) tables**. One table per repository; when multiple repos are searched, show each repo's table separately with its identifier above.

**Table columns:** 序号 (or #) | 标题 (or Title) | 状态 (or State) | 链接 (or URL)

**Link column:** MUST use Markdown link syntax `[issues#<number>](url)` so the displayed text is short (e.g., `issues#12345`) and clickable, navigating to the full GitHub Issue URL.

**English format:**
```markdown
## Related GitHub Issues

### Repository: facebook/react
| # | Title | State | URL |
|------|------|------|------|
| 1 | [#12345] Component re-renders unexpectedly | Open | [issues#12345](https://github.com/facebook/react/issues/12345) |
| 2 | [#12340] Memory leak in useEffect | Closed | [issues#12340](https://github.com/facebook/react/issues/12340) |
```

**Chinese format:**
```markdown
## 相关 GitHub Issues

### 仓库: facebook/react
| 序号 | 标题 | 状态 | 链接 |
|------|------|------|------|
| 1 | [#12345] 组件意外重新渲染 | Open | [issues#12345](https://github.com/facebook/react/issues/12345) |
| 2 | [#12340] useEffect 内存泄漏 | Closed | [issues#12340](https://github.com/facebook/react/issues/12340) |
```

### Output Constraints

The output for Step 3 MUST follow these rules strictly:

1. **Table-only output**: The response MUST contain ONLY the section heading (`## 相关 GitHub Issues` / `## Related GitHub Issues`), per-repository sub-headings, and GFM tables. No additional prose, annotations, footnotes, or bullet lists MAY appear outside the table.

2. **One row per issue**: Each issue MUST occupy exactly one table row. Do NOT insert paragraphs, horizontal rules (`---`), or bullet lists between table rows or after the last table.

3. **Forbidden sections**: Do NOT add sections such as "重点说明"、"更多结果可查看"、"Key Notes"、"See also" or any similar commentary — these break the table structure.

4. **Pipe character escaping**: If an issue title contains a `|` character, it MUST be escaped as `\|` before placing it in a table cell to prevent column boundary corruption.

**Correct output (Chinese):**
```markdown
## 相关 GitHub Issues

### 仓库: vercel/next.js
| 序号 | 标题 | 状态 | 链接 |
|------|------|------|------|
| 1 | fix: handle a\|b edge case | Open | [issues#12345](https://github.com/vercel/next.js/issues/12345) |
```

**Wrong output (do NOT generate):**
```markdown
| 1 | some title | Open | [issues#12345](...) |
---
重点说明:
- ...
更多结果可查看: ...
```

---

## Error Handling

| Error | Action |
|---|---|
| `gh` not installed | Use WebFetch fallback |
| `gh` not authenticated | Use WebFetch fallback, suggest `gh auth login` |
| WebFetch fails | Provide search URL as last resort |
| No results found | Suggest broader search terms |
| API rate limit | Suggest trying again later |

---

## Examples

### Example A — React error

**Input:** "Why does my React component re-render unexpectedly?"

**Actions:**
1. Identify repository: facebook/react
2. Extract keywords: "component re-render"
3. Search: `gh issue list --repo facebook/react --search "component re-render" --limit 5`
4. Display results with links

### Example B — Next.js error (Chinese)

**Input:** "Next.js 出现 hydration 错误怎么办？"

**Actions:**
1. 识别仓库: vercel/next.js
2. 提取关键词: "hydration 错误"
3. 搜索: `gh issue list --repo vercel/next.js --search "hydration error" --limit 5`
4. 用中文展示结果
