# Google News SEO — Reference 参考文档

## Google News Ranking Factors 排名因素

| Factor | Description / 说明 |
|--------|-------------------|
| **Relevance** | Keyword match + semantic relevance / 关键词匹配 + 语义相关性 |
| **Location** | User's location determines content shown / 用户所在地区决定推送内容 |
| **Prominence** | Trending coverage, highly cited, featured on-site / 热点事件、被多媒体引用、站内置顶 |
| **Authoritativeness** | Domain authority, E-E-A-T signals, backlinks / 域名权威度、E-E-A-T 信号、外链引用 |
| **Freshness** | Newer content preferred; must include accurate publish date / 发布时间越新越有优势，需含准确发布时间 |
| **Usability** | Multi-device, fast load; paywalls don't affect this score / 多端适配、加载速度；Paywall 不影响评分 |
| **Interests** | Powers Discover / For You personalization / 驱动 Discover / For You 个性化推送 |

---

## 7 Optimization Strategies 7 大优化方向

1. **Publish frequency / 发布频率** — multiple articles daily; include accurate publish dates
2. **Originality / 原创性** — prioritize original reporting; add `noindex` or canonical to syndicated content
3. **Author information / 作者信息** — real author page per article: name, bio, contact
4. **Keyword research / 关键词** — use Google Trends News Search; match article planning to search demand
5. **Headlines / 标题** — `<title>` = `<h1>` = Schema `headline`; include primary keyword
6. **Structured data / 结构化数据** — NewsArticle Schema + BreadcrumbList
7. **News Sitemap** — cover articles published within 48 hours; include `<news:publication_date>` and `<news:title>`

---

## Technical Requirements 技术要求

### Site structure / 站点结构
- News section URLs must be **permanent** and not change over time / 新闻分类页使用永久 URL
- Use HTML `<a>` links, not JS or image links / 使用 HTML 链接，不用 JS 动态链接
- Anchor text must match article titles / 锚文本与文章标题一致
- `robots.txt` must not block `Googlebot-News` / 不屏蔽 Googlebot-News

### Article pages / 文章页面
- Each article needs a **unique, permanent URL** / 每篇文章有唯一永久 URL
- Title and publish time must be in **HTML** (not JS-rendered) / 标题和时间用 HTML 明文输出
- Single language per article; multi-language sites need separate Publications / 单语言；多语言站需独立建立 Publication
- Encoding: **UTF-8**

---

## Google's Stance on AI Content AI 内容官方立场

> Google does not penalize AI-generated content. Quality and transparency are what matter.
> Google 不歧视 AI 生成内容，质量和透明度才是标准。

Key principles / 关键原则：
- AI writing ≠ violation; **hiding AI generation = violation** / AI 写作 ≠ 违规；隐瞒 AI 生成 = 违规
- A human editor must take responsibility and sign off / 需要人类编辑署名并承担责任
- AI-generated images must not constitute manipulated media / AI 配图须确认无操纵媒体内容嫌疑
- `author` in Schema must match what's shown on the page / Schema `author` 须与页面展示一致

---

## News Sitemap Example / Sitemap 示例

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <url>
    <loc>https://example.com/news/article-slug/</loc>
    <news:news>
      <news:publication>
        <news:name>Publication Name / 媒体名称</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>2026-03-03T19:55:26+00:00</news:publication_date>
      <news:title>Article Title / 文章标题</news:title>
    </news:news>
  </url>
</urlset>
```
