---
name: google-news-seo
description: Audit and optimize news articles for Google News SEO, including NewsArticle Schema review and fixes, AI-generated content compliance checks, Google News inclusion requirements, and Google E-E-A-T scanning with structured report generation. Use when asked about Google News SEO, NewsArticle Schema optimization, how AI content can get into Google News, reviewing a news article's Schema, or running an EEAT scan / audit. 检查和优化新闻文章的 Google News SEO，包括 NewsArticle Schema 审查与修复、AI 生成内容合规性检查、Google News 收录要求核查，以及 Google E-E-A-T 全维度扫描并生成结构化报告。当用户询问 Google News SEO、NewsArticle Schema 如何优化、AI 内容如何进入 Google News、需要审查某篇新闻文章的 Schema、或要求 EEAT 扫描/审计时使用。
---

# Google News SEO

> **Language / 语言**：Detect the user's language and respond in the same language throughout.
> 用户用中文提问则全程用中文回复；用英文提问则全程用英文回复。

---

## 0 · Initial Assessment 审计前评估

Before starting any checks, gather context by asking the following questions. **Skip any question already answered in the user's prompt.**

| # | Question / 问题 |
|---|----------------|
| 1 | **Site type / 站点类型** — Is this a dedicated news publisher, a corporate blog with a news section, or another site type? |
| 2 | **Target topics / keywords / 目标关键词或议题** — Which topics, keywords, or named entities are most important for this audit? |
| 3 | **Current status / 当前状态** — Any known issues, recent migrations, or Google Search Console alerts? |
| 4 | **Scope / 审计范围** — Full-site audit, specific article(s), or a specific area (Schema only / EEAT only / Technical only / On-Page only)? |

**Skip rule / 跳过规则：** If the user's prompt already implies answers (e.g., provides a URL + says "check the Schema"), skip the answered questions and proceed directly.

**Acknowledgement / 确认语句：** Before starting checks, output one line:
```
Auditing [URL / article / site] — scope: [scope summary]. Starting checks...
```

---

## 1 · Prerequisites 前置要求

**Determine input type first / 先判断产物类型：**

| Input | Action |
|-------|--------|
| Live URL / 线上 URL | Fetch page, extract JSON-LD Schema |
| Raw Schema JSON | Parse directly |
| URL or HTML + EEAT scan request / URL 或 HTML + EEAT 扫描请求 | Run full E-E-A-T analysis → see Sections 7–9 / 执行 EEAT 全维度分析 → 见第 7–9 节 |

### Schema Fetch Protocol / Schema 获取流程

Retrieve JSON-LD in three sequential phases. Only advance to the next phase if the current one yields no JSON-LD blocks.

> ⚠️ **Anti-pattern — do NOT do this:**  
> Do NOT report "JSON-LD 无法通过抓取自动提取（前端渲染）" or "client-side rendered" based solely on a failed `web_fetch`. SSR/SSG sites (Next.js, Nuxt, Hugo, WordPress) pre-render JSON-LD into static HTML — `curl` can fetch it directly. A fetch failure alone is **not** evidence of CSR.

---

**Phase 1 — web_fetch（优先）**

Use `web_fetch` to retrieve the page. If the response contains one or more `<script type="application/ld+json">` blocks → extract and proceed to Schema analysis. **Stop here.**

---

**Phase 2 — curl fallback（web_fetch 无结果时）**

> **Note**: Attempting curl fallback — SSR/SSG sites pre-render JSON-LD into static HTML; curl can retrieve it directly without JS execution.

If Shell tool is unavailable, skip directly to Phase 3.

```bash
# Step A: fetch raw HTML with Googlebot UA
# Note: macOS mktemp doesn't support extensions; use a plain suffix
TMPFILE=$(mktemp /tmp/page_XXXXXX)
curl -sL \
  -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
  --max-time 15 \
  "<URL>" > "$TMPFILE" 2>&1
echo "File size: $(wc -c < "$TMPFILE") bytes"
```

- **403 / 429**: retry once with Chrome UA:  
  `-H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"`
- **Timeout / non-zero exit / file size 0**: skip to Phase 3

```bash
# Step B: extract JSON-LD — write Python script via heredoc to avoid quoting issues
cat > /tmp/extract_jsonld.py << 'PYEOF'
import re, json
html = open('/tmp/page_XXXXXX.html').read()  # replace XXXXXX with actual suffix from $TMPFILE
pattern = re.compile(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', re.DOTALL | re.IGNORECASE)
blocks = pattern.findall(html)
print(f'Total blocks found: {len(blocks)}')
for i, b in enumerate(blocks, 1):
    print(f'=== JSON-LD Block {i} ===')
    try:
        print(json.dumps(json.loads(b.strip()), indent=2, ensure_ascii=False))
    except Exception as e:
        print(f'Parse error: {e}')
        print(b.strip()[:500])
PYEOF
# Replace the filename placeholder with the actual $TMPFILE path, then run:
sed -i '' "s|/tmp/page_XXXXXX.html|$TMPFILE|g" /tmp/extract_jsonld.py
python3 /tmp/extract_jsonld.py
```

```bash
# Step B fallback — grep (if Python 3 unavailable)
grep -oE '<script[^>]+type="application/ld\+json"[^>]*>.*?</script>' "$TMPFILE" | sed 's/<[^>]*>//g'
```

```bash
# Step C: clean up
rm -f "$TMPFILE" /tmp/extract_jsonld.py
```

If extraction returns results → use for Schema analysis; note **"Schema retrieved via curl fallback"**.

- **Multiple blocks**: extract all; use the block with `"@type": "NewsArticle"` for Schema analysis
- **Malformed JSON**: output raw block, flag as "partially retrievable", continue best-effort analysis

---

**Phase 3 — 🔍 Manual（仅在两阶段均无结果时）**

Mark Schema detection as 🔍 Manual. Output exactly:

```
Schema could not be auto-detected (web_fetch and curl both returned no JSON-LD).
Verify manually: 🔗 https://search.google.com/test/rich-results?url=<URL>
```

❌ Do NOT say: "前端渲染" / "client-side rendering" / "JavaScript-rendered"  
✅ Only say: "could not be auto-detected"

---

**3 hard requirements for Google News inclusion / 三项硬性门槛：**

1. **Dedicated news publisher / 专属新闻网站** — the site's core purpose must be news, not a product with a news section
2. **Content policy compliance / 内容政策合规** — no dangerous / deceptive / manipulated-media content; AI-generated content must be transparently disclosed
3. **Technical compliance / 技术合规** — permanent URLs, HTML-rendered content, `robots.txt` must not block Googlebot-News

---

## 2 · NewsArticle Schema Checklist Schema 审查清单

### Critical — affects indexing / 必检项（影响收录）

```
- [ ] @context = "https://schema.org"  (not http://)
- [ ] @type = "NewsArticle"  (matches actual content type)
- [ ] dateModified >= datePublished  (must not be earlier)
- [ ] image URL contains no AI-tool markers  (qwen_generated / ChatGPT Image / dall-e / midjourney)
- [ ] author.name matches the byline shown on the page  (Schema ≠ AI agent while page shows human)
- [ ] author is a real person with a verifiable author page  (not a team name or AI Agent)
- [ ] publisher.logo exists and is a valid ImageObject
```

### Recommended — affects rich results / 建议补充项（影响富摘要）

```
- [ ] mainEntityOfPage points to the article URL
- [ ] description field present  (populated from article summary)
- [ ] articleSection set
- [ ] BreadcrumbList last item has an "item" URL
```

---

## 3 · AI Content Checks AI 内容专项

| Issue / 问题 | Risk / 风险 | Fix / 修复 |
|---|---|---|
| Image filename contains AI tool name | Manipulated media policy violation | Rename on upload; strip AI-tool prefixes |
| Schema `author` ≠ page byline | Deceptive markup | Use the same real editor name in both |
| No human editor byline | Insufficient E-E-A-T | Establish human editorial attribution |
| AI Agent listed as `author` | Unverifiable authority | Replace with the reviewing editor |

**Recommended attribution pattern for AI content / AI 内容推荐署名模式：**
- Schema `author` → real editor's `Person` node
- Page display → "Generated by AI, reviewed by [Editor Name]" / "AI 生成，经 [编辑姓名] 审校"
- Editor's author page must include: real name, professional bio, contact

---

## 4 · Schema Fix Template 修复模板

```json
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/news/article-slug/"
  },
  "headline": "Article title / 文章标题",
  "description": "100-200 char summary / 文章摘要",
  "datePublished": "2026-03-03T19:55:26-05:00",
  "dateModified": "2026-03-03T20:10:00-05:00",
  "image": ["https://cdn.example.com/images/article-cover.jpg"],
  "author": [{
    "@type": "Person",
    "name": "Editor Name / 编辑姓名",
    "url": "https://example.com/author/editor-slug/",
    "jobTitle": "Senior Editor"
  }],
  "publisher": {
    "@type": "Organization",
    "name": "Publication Name",
    "url": "https://example.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png",
      "width": 600,
      "height": 60
    }
  },
  "articleSection": "Markets",
  "isAccessibleForFree": true
}
```

---

## 5 · Systemic Bugs 系统性 Bug（批量修复）

If the same issue appears across multiple articles, fix at the template level.
若多篇文章存在相同问题，需从模板层修复，不要逐篇处理。

| Bug | Root cause / 根因 | Fix / 修复 |
|-----|-------------------|-----------|
| `dateModified` < `datePublished` | Field assignment order / 赋值顺序错误 | Set `modified` to last-edited timestamp |
| `"http://schema.org"` | Hardcoded old protocol / 模板写死旧协议 | Global replace → `"https://schema.org"` |
| `publisher.logo` missing | Not in template / 模板缺字段 | Add `logo` ImageObject to Schema template |
| `description` missing | Not mapped from summary / 未映射摘要 | Auto-populate from `summary` / `excerpt` |
| BreadcrumbList last item has no `item` | Template omission / 模板漏写 | Set last item's `item` = article URL |
| AI-tool name in image filename | No rename on upload / 上传未重命名 | Strip AI-tool prefixes in upload pipeline |

---

## 5.5 · Technical SEO 技术检查

| Check / 检查项 | Pass Condition / 通过条件 | Priority | Auto / Manual |
|---------------|--------------------------|----------|---------------|
| robots.txt accessible | `<domain>/robots.txt` returns HTTP 200 | P1 | Auto |
| Googlebot-News not blocked | No `Disallow` rule under `User-agent: Googlebot-News` covering the article path | P0 | Auto |
| News Sitemap exists | Sitemap URL (from robots.txt or `<domain>/news-sitemap.xml`) is accessible and contains `<news:news>` tags | P1 | Auto |
| News Sitemap has `<news:news>` tags | Sitemap is valid per Google News Sitemap spec | P1 | Auto |
| Core Web Vitals — LCP | LCP < 2.5s (Good); 2.5–4s (Needs Improvement ⚠️); > 4s (Poor ❌) | P1 | 🔍 Manual |
| Core Web Vitals — INP | INP < 200ms (Good); 200–500ms (⚠️); > 500ms (❌) | P1 | 🔍 Manual |
| Core Web Vitals — CLS | CLS < 0.1 (Good); 0.1–0.25 (⚠️); > 0.25 (❌) | P1 | 🔍 Manual |
| HTTPS | Article URL uses `https://` | P0 | Auto |

**CWV verification / CWV 验证：** Use PageSpeed Insights: `https://pagespeed.web.dev/report?url=<url>`

---

## 5.6 · On-Page SEO 文章页检查

### Title Tag / 标题标签

| Check | Pass Condition | Priority |
|-------|---------------|----------|
| Title tag present | `<title>` element exists and is non-empty | P0 |
| Length 50–70 characters | Title length between 50 and 70 characters | P1 |
| Primary keyword near start | Key topic/entity within the first 60 characters | P1 |
| Unique (not duplicated) | Title is not identical to other pages (🔍 Manual) | P1 |
| No keyword stuffing | Same keyword not repeated > 2 times | P2 |

### Meta Description

| Check | Pass Condition | Priority |
|-------|---------------|----------|
| Meta description present | `<meta name="description">` exists and non-empty | P1 |
| Length 120–160 characters | Description length between 120 and 160 characters | P2 |
| Contains primary keyword | Primary topic/entity appears in description | P2 |

### Canonical Tag

| Check | Pass Condition | Priority |
|-------|---------------|----------|
| Canonical tag present | `<link rel="canonical">` exists | P1 |
| Points to correct URL | Canonical URL matches the article URL (self-referencing) or a valid canonical version | P1 / P0 if target returns non-200 |

### Heading Structure

| Check | Pass Condition | Priority |
|-------|---------------|----------|
| Exactly one H1 | Page contains exactly one `<h1>` element | P1 |
| H1 matches headline | H1 text consistent with article headline | P1 |
| Logical hierarchy | No heading levels skipped (e.g., no H1 → H3 without H2) | P2 |
| H1 contains primary keyword | Primary topic/entity appears in H1 | P2 |

---

## 6 · Output Report Format 总结报告格式

After analysis, output the report in three parts: Executive Summary → Detailed Check Tables → Priority Fix List.
分析完成后按三段输出：执行摘要 → 逐项检查表 → 优先级修复列表。

---

### Executive Summary 执行摘要

Output this section first, before all detailed tables.

**Overall Health / 总体健康度：**

| Condition | Rating |
|-----------|--------|
| 0 P0 issues AND ≤ 2 P1 issues | 🟢 **Good** |
| 1–2 P0 issues OR 3–5 P1 issues | 🟡 **Needs Work** |
| 3+ P0 issues OR 6+ P1 issues | 🔴 **Critical** |

**Top Issues / 优先问题（最多 5 项）：**
```
- [P0] **[Area]**: Brief description of issue
- [P1] **[Area]**: Brief description of issue
```
If more than 5 issues exist, show the 5 most severe and add: *"See full findings below for all issues."*
If no issues found: *"No critical issues found ✅"*

**Quick Wins / 快速修复（最多 3 项，低成本高收益）：**
```
- **[Fix name]**: One-sentence instruction (e.g., "Add publisher.name to NewsArticle Schema")
```
Quick Win criteria: fixable in < 30 minutes, no code deployment required (e.g., CMS field edit, meta tag addition, file rename).
If none qualify: *"No quick wins identified — remaining issues require development work."*

---

**Executive Summary template / 执行摘要模板：**

```
### Executive Summary

**Overall Health**: 🟢 Good / 🟡 Needs Work / 🔴 Critical
**Scope**: [what was audited]

**Top Issues**
- [P0] **Schema**: dateModified is earlier than datePublished
- [P1] **On-Page**: Meta description missing on article page
- [P1] **Technical**: No News Sitemap found

**Quick Wins**
- **Fix dateModified**: Set dateModified to the last-edited timestamp in your CMS Schema output
- **Add meta description**: Map the article excerpt/summary field to meta description in your theme template
```

---

### Detailed Findings / 逐项检查表

**Table / 表格：**

| Check item / 检查项 | Result / 结果 | Notes / 说明 |
|---|---|---|
| (item) | Pass ✅ / Fail ❌ / Manual 🔍 | Issue description or fix suggestion |

---

### Priority Fix List / 优先级修复列表

- **P0** — blocks indexing or violates content policy / 影响收录或违反内容政策
- **P1** — affects rich results or EEAT signal strength / 影响富摘要或 EEAT 信号
- **P2** — best practice / 规范性

---

## 7 · EEAT Scan 触发与输入处理

**Trigger words / 触发词**：  
`EEAT 扫描` / `Run EEAT scan` / `扫描 EEAT` / `EEAT audit` / `EEAT 审计` / `做个 EEAT 扫描`

**Step 1 — Read the signal checklist / 第一步：读取检查项清单**

Before scanning, read `eeat-reference.md` (same directory as this file) to load all 24 signal definitions.

```
Read: eeat-reference.md
```

**Step 2 — Determine input type / 第二步：判断输入类型**

| Input | Action |
|-------|--------|
| Live URL / 线上 URL | Use WebFetch to fetch the page; extract full page HTML, JSON-LD, and visible text |
| Raw HTML / 原始 HTML | Parse provided HTML directly; no fetch needed |
| URL unreachable / 无法抓取 | Mark all signals that require live page inspection as 🔍 Manual; proceed with available information |

**Step 3 — Execute dimensional scans / 第三步：按维度执行扫描**

Run the four dimensions in order: **Experience → Expertise → Authoritativeness → Trustworthiness**

For each signal in `eeat-reference.md`:
1. Check the pass condition against the fetched page content
2. Record result: **Pass ✅** / **Fail ❌** / **🔍 Manual**
3. For Fail results, note what was found and what is expected
4. For Manual signals, note what requires manual verification

---

## 8 · EEAT 评分算法

**Per-dimension score / 维度评分：**

```
维度分 = floor(该维度通过项数 / 该维度有效项数 × 100)
```

- 有效项数 = 总项数 − 🔍 Manual 项数（Manual 项从分母中排除）
- 四个维度各自独立计算

**Total score / 总分：**

```
总分 = floor((经验分 + 专业度分 + 权威性分 + 可信度分) / 4)
```

**Rating labels / 评级标签：**

| Score range | Label |
|-------------|-------|
| 80–100 | 良好 ✅ |
| 50–79 | 需改进 ⚠️ |
| 0–49 | 差 ❌ |

---

## 9 · EEAT 报告格式

After completing all scans, output the report in the following structure.
Use the **same language as the user's prompt** throughout (Chinese prompt → Chinese report; English prompt → English report).

---

**Report template / 报告模板：**

```
## EEAT 扫描报告

**扫描对象**：https://example.com/article/ （或 "Raw HTML input"）
**扫描日期**：YYYY-MM-DD
**总分：XX / 100**

---

### 维度总览

| 维度 | 得分 | 评级 |
|------|------|------|
| 经验 (Experience) | XX | 良好 ✅ / 需改进 ⚠️ / 差 ❌ |
| 专业度 (Expertise) | XX | ... |
| 权威性 (Authoritativeness) | XX | ... |
| 可信度 (Trustworthiness) | XX | ... |

---

### 经验 (Experience) — XX/100

| 检查项 | 结果 | 说明 |
|--------|------|------|
| 第一手内容标识 | Pass ✅ | 符合要求 |
| 经历日期明确 | Fail ❌ | 未注明具体经历时间 |
| 作者署名可见 | Pass ✅ | 符合要求 |
| 作者简介链接存在 | 🔍 Manual | 需手动核查作者页是否可访问 |
| 原创媒体 | Fail ❌ | 图片文件名含 "dall-e" |

### 专业度 (Expertise) — XX/100

| 检查项 | 结果 | 说明 |
|--------|------|------|
| ... | ... | ... |

### 权威性 (Authoritativeness) — XX/100

| 检查项 | 结果 | 说明 |
|--------|------|------|
| ... | ... | ... |

### 可信度 (Trustworthiness) — XX/100

| 检查项 | 结果 | 说明 |
|--------|------|------|
| ... | ... | ... |

---

### 行动建议

**P0 — 立即修复（影响收录或违反内容政策）**
- **[经验]** 原创媒体 — 将图片文件名中的 "dall-e" 前缀去除，上传流程中禁止保留 AI 工具名称
- **[可信度]** HTTPS — 将站点迁移至 HTTPS 并配置 301 重定向

**P1 — 应尽快修复**
- **[专业度]** 作者资质说明 — 在作者简介中补充职业背景或领域经验描述
- **[权威性]** 发布方名称缺失 — 在 NewsArticle Schema 的 publisher.name 字段填写机构名称

**P2 — 建议跟进**
- **[专业度]** 内容深度 — 文章不足 500 字，建议扩充至覆盖 3 个以上子议题
```

---

## References 参考资源

- Google News ranking factors, optimization strategies, AI content policy, News Sitemap examples:
  见 [reference.md](reference.md)
- EEAT signal definitions and priority table:
  见 [eeat-reference.md](eeat-reference.md)
