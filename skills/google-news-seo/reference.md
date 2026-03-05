# Google News SEO — Reference 参考文档

## Google News Two-Layer Architecture 双层架构模型

Google News operates on two independent systems that publishers must satisfy separately.

| Layer | Name | What it controls |
|-------|------|-----------------|
| **Layer 1** | News Index System | Whether the site appears in Google News at all |
| **Layer 2** | News Ranking System | Whether articles rank in topic clusters and Top Stories |

**Common diagnostic mistake**: Publishers optimize for ranking (Layer 2) before their site is indexed (Layer 1). Diagnose Layer 1 first.

**Layer 1 key signals**: Publisher trust pages, author attribution, valid NewsArticle Schema, News Sitemap, crawlability, URL structure.

**Layer 2 key signals**: Freshness, content type (original reporting vs. aggregation), topic cluster compatibility (entity density, timeliness), publisher authority, Top Stories carousel presence.

---

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

## Topic Cluster Ranking Signals 话题聚类排名信号

Google News groups articles about the same event into **topic clusters**. Cluster membership and ranking position depend on:

| Signal | Description | Optimization |
|--------|-------------|-------------|
| **Named entity match** | Headline and body contain the same entities as competing articles in the cluster | Include specific people, companies, locations in headline |
| **Publication speed** | Earlier articles get priority cluster placement | Aim to publish within 30 min of event; submit to News Sitemap immediately |
| **Original reporting** | Direct quotes, exclusive data, bylined reporters signal higher authority | Add at least one original source quote per article |
| **Entity density** | Higher concentration of named entities in body text improves cluster signal | Target ≥ 1 named entity per 100 words |
| **Publisher authority** | Sites with consistent publishing history and organization Schema rank higher | Maintain regular publishing cadence; keep Organization Schema complete |
| **Content depth** | Analysis-type articles retain cluster position longer than breaking news | For analysis, target 800+ words with 3+ named sources |

---

## 7 Optimization Strategies 7 大优化方向

1. **Publish frequency / 发布频率** — multiple articles daily; include accurate publish dates
2. **Originality / 原创性** — prioritize original reporting; add `noindex` or canonical to syndicated content
3. **Author information / 作者信息** — real author page per article: name, bio, contact, social links
4. **Keyword research / 关键词** — use Google Trends News Search; match article planning to search demand
5. **Headlines / 标题** — `<title>` = `<h1>` = Schema `headline`; include primary named entity
6. **Structured data / 结构化数据** — NewsArticle Schema + BreadcrumbList + Organization Schema
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

## Competitor Gap Analysis Methodology 竞争对手差距分析方法论

When a publisher asks "why do competitors rank higher?", analyze three primary gap dimensions:

### 1. Publication Speed Gap 发布速度差距

Google News rewards the **earliest credible article** on a topic. A publication speed gap of > 30 minutes can significantly reduce cluster ranking potential.

**How to measure**: Compare `datePublished` timestamps. The publisher with the earliest timestamp on a topic typically holds the top cluster position unless outranked by authority.

**How to close**: Implement News Sitemap auto-submission, reduce editorial review time for breaking news, use templated breaking news formats that can be published in < 5 minutes.

### 2. Schema Completeness Gap Schema 完整度差距

Required fields for maximum Google News Schema signals:
`@type` · `headline` · `image` · `datePublished` · `dateModified` · `author` · `publisher` · `publisher.logo` · `mainEntityOfPage`

**Benchmark**: Top Google News publishers typically score 95–100% Schema completeness. Scores below 80% correlate with reduced rich result eligibility.

### 3. Author Authority Gap 作者权威差距

Publishers with named authors and full profile pages (bio, credentials, social links) have stronger author credibility graphs. Anonymous or team-attributed articles score lower.

**Key signals competitors have**: Bylined reporter with `/author/<name>` profile page, bio mentioning domain expertise, 2+ social links, publication history visible.

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

**Freshness rule**: News Sitemaps should only contain articles published within the **last 48 hours**. Articles older than 48 hours are automatically excluded from Google News Sitemap processing.

---

## Publisher Trust Pages 发布者信任页面

Google evaluates whether a site operates as a legitimate news publisher. Recommended pages:

| Page | Purpose | Minimum content |
|------|---------|-----------------|
| `/about` | Establish organizational identity | Newsroom description, founding date, mission statement |
| `/editorial-policy` | Demonstrate editorial standards | Fact-checking policy, correction policy, editorial independence statement |
| `/contact` | Enable communication | Email, physical address, press contact |
| `/team` or `/staff` | Show human organization | Team member names and roles |
| `/authors` | Author credibility hub | Links to individual author profile pages |
