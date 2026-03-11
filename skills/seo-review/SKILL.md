---
name: seo-review
description: |
  Next.js SEO审查技能，用于检查网页是否符合Google SEO最佳实践。当用户请求SEO审查、SEO检查、SEO优化、SEO audit，或询问"这个页面的SEO有什么问题"、"帮我检查TDK"、"meta标签是否正确"、"结构化数据"等与SEO相关的问题时使用此技能。也适用于用户分享页面代码或组件请求SEO建议的场景。
---

# SEO Review / SEO审查指南

A comprehensive SEO review guide for Next.js applications based on Google search optimization best practices.

基于Google搜索引擎优化最佳实践的Next.js应用SEO审查指南。

## Review Workflow / 审查流程

1. **Collect Information / 收集信息**: Read the page code or component the user specifies
2. **Categorized Review / 分类审查**: Check against each dimension below
3. **Generate Report / 生成报告**: Output issues categorized by severity (🔴 Critical / 🟡 Warning / 🟢 Suggestion)
4. **Provide Fixes / 提供修复**: Include specific code examples for each issue

## Quick Reference / 快速参考

When reviewing a page, check these aspects:

### 1. URL & Links / URL和链接
Read `references/url-and-links.md` for details.

| Check | Requirement | Severity |
|-------|-------------|----------|
| Trailing slash | URLs must end with `/` (except homepage) | 🔴 |
| URL depth | Maximum 5 levels | 🟡 |
| URL readability | No unreadable/non-ASCII characters | 🔴 |
| Link elements | All links must use `<a>` tag | 🔴 |
| Absolute paths | Links must use absolute URLs | 🔴 |
| rel attribute | Properly set nofollow/sponsored/ugc | 🟡 |
| Canonical | Each page has `<link rel="canonical">` | 🔴 |
| Redirects | 301 redirects for URL changes, no chains | 🟡 |
| Query params | Content-affecting params should be path params | 🟡 |

### 2. Meta Tags / Meta标签
Read `references/meta-tags.md` for details.

| Check | Requirement | Severity |
|-------|-------------|----------|
| charset | `<meta charset="utf-8">` present | 🔴 |
| viewport | `<meta name="viewport">` properly configured | 🔴 |
| viewport zoom | `user-scalable` never set to `no` (WCAG) | 🔴 |
| title | Unique, descriptive, 50-60 chars | 🔴 |
| description | Unique, descriptive, 150-160 chars | 🔴 |
| H1 | Exactly one per page | 🔴 |
| Image alt | All informational images have alt | 🔴 |
| Open Graph | og:title, description, image, url, type | 🟡 |
| Twitter Card | twitter:card, title, description, image | 🟡 |
| Head elements | Only allowed elements in `<head>` | 🔴 |

### 3. Structured Data / 结构化数据
Read `references/structured-data.md` for details.

| Check | Requirement | Severity |
|-------|-------------|----------|
| Article | Article/NewsArticle schema for article pages | 🟡 |
| Breadcrumb | BreadcrumbList for navigation | 🟡 |
| Video | VideoObject for video content | 🟡 |
| Paywalled | isAccessibleForFree for paid content | 🟡 |
| Validation | Test via Google Rich Results Test | 🟢 |

### 4. Other Checks / 其他检查

| Check | Requirement | Severity |
|-------|-------------|----------|
| robots.txt | Present and correctly configured | 🔴 |
| sitemap | Present and updated for new pages | 🟡 |
| 404 handling | Custom 404 page, URL remains unchanged | 🟡 |
| Content visibility | No conditional rendering for SEO content | 🔴 |
| SSR/SSG | Important pages use SSR or SSG | 🟡 |
| Tab content | Use CSS hiding, not conditional render | 🟡 |

## Report Format / 报告格式

```markdown
## SEO Review Report / SEO审查报告

### 🔴 Critical Issues / 严重问题 (必须修复)
1. **[Issue Title / 问题标题]**
   - **Location / 位置**: file:line
   - **Impact / 影响**: [SEO impact description]
   - **Fix / 修复建议**:
     ```tsx
     // Code example
     ```

### 🟡 Warnings / 警告 (建议修复)
...

### 🟢 Suggestions / 优化建议 (可选)
...

### 📊 Summary / 审查摘要
- Total checks / 检查项总数: X
- Critical / 严重问题: X
- Warnings / 警告: X
- Suggestions / 建议项: X
```

## Severity Guidelines / 严重程度指南

- **🔴 Critical / 严重**: Directly impacts search engine crawling or indexing. Must be fixed before release.
- **🟡 Warning / 警告**: Affects SEO quality or user experience. Should be fixed.
- **🟢 Suggestion / 建议**: Optimization opportunity. Nice to have.

## Reference Files / 参考文件

For detailed specifications, read the appropriate reference file:

- `references/url-and-links.md` - URL structure, redirects, query vs path params, canonical URLs
- `references/meta-tags.md` - Head elements restriction, meta tags, viewport, Open Graph, Twitter cards
- `references/structured-data.md` - JSON-LD schemas for articles, breadcrumbs, videos
- `references/performance.md` - Rendering strategies, image optimization, robots.txt, sitemap, 404 handling

## Tools / 辅助工具

- [Google Rich Results Test](https://search.google.com/test/rich-results) - Test structured data
- [Google Search Console](https://search.google.com/search-console) - Monitor search performance
