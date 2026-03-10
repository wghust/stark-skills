# Structured Data (JSON-LD) / 结构化数据

## Table of Contents / 目录
- [Overview / 概述](#overview--概述)
- [Article / 文章](#article--文章)
- [NewsArticle / 新闻文章](#newsarticle--新闻文章)
- [BreadcrumbList / 面包屑导航](#breadcrumblist--面包屑导航)
- [VideoObject / 视频](#videoobject--视频)
- [Paywalled Content / 付费内容](#paywalled-content--付费内容)
- [Next.js Implementation / Next.js实现](#nextjs-implementation--nextjs实现)
- [Validation / 验证](#validation--验证)

---

## Overview / 概述

Structured data helps search engines understand page content and enables rich results in search listings.

结构化数据帮助搜索引擎理解页面内容，并在搜索结果中启用富媒体展示。

### Format / 格式
Use JSON-LD format in a `<script>` tag within the page's `<head>` or `<body>`.

在页面的`<head>`或`<body>`中使用`<script>`标签的JSON-LD格式。

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Type",
  "property": "value"
}
</script>
```

---

## Article / 文章

For blog posts, feature articles, and general content pages.

用于博客文章、专题文章和一般内容页面。

### Required Properties / 必需属性
| Property | Description |
|----------|-------------|
| `headline` | Article title |
| `image` | Article images (array of URLs) |
| `datePublished` | Publication date (ISO 8601) |
| `dateModified` | Last modification date (ISO 8601) |
| `author` | Author object with `@type`, `name`, `url` |

### Example / 示例
```tsx
const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Market Analysis: Tech Stocks Rally Amid AI Boom",
  "image": [
    "https://www.example.com/photos/1x1/photo.jpg",
    "https://www.example.com/photos/4x3/photo.jpg",
    "https://www.example.com/photos/16x9/photo.jpg"
  ],
  "datePublished": "2026-03-02T08:00:00+08:00",
  "dateModified": "2026-03-02T09:20:00+08:00",
  "author": [{
    "@type": "Person",
    "name": "Jane Doe",
    "url": "https://www.example.com/profile/janedoe123"
  }]
};

// Render in component
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
/>
```

---

## NewsArticle / 新闻文章

For news content that should appear in Google News.

用于应该出现在Google新闻中的新闻内容。

### Required Properties / 必需属性
Same as Article, plus:

| Property | Description |
|----------|-------------|
| `headline` | News headline (max 110 chars) |
| `datePublished` | Must be accurate |
| `author` | Required with `name` and `url` |

### Example / 示例
```tsx
const newsArticleJsonLd = {
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "Apple Announces Record Q4 Earnings",
  "image": "https://www.example.com/news/apple-q4.jpg",
  "datePublished": "2026-03-02T08:00:00+08:00",
  "dateModified": "2026-03-02T09:20:00+08:00",
  "author": {
    "@type": "Person",
    "name": "John Smith",
    "url": "https://www.example.com/profile/johnsmith"
  },
  "publisher": {
    "@type": "Organization",
    "name": "[SITE_NAME]",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.example.com/logo.png"
    }
  }
};
```

---

## BreadcrumbList / 面包屑导航

Helps search engines understand site structure and displays breadcrumbs in search results.

帮助搜索引擎理解网站结构，并在搜索结果中显示面包屑。

### Required Properties / 必需属性
| Property | Description |
|----------|-------------|
| `itemListElement` | Array of ListItem objects |
| `ListItem.position` | Position in the path (1, 2, 3...) |
| `ListItem.name` | Display name |
| `ListItem.item` | Full URL (optional for last item) |

### Example / 示例
```tsx
const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.example.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Stocks",
      "item": "https://www.example.com/stocks/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "AAPL",
      "item": "https://www.example.com/stocks/NASDAQ-AAPL/"
    }
  ]
};
```

### Utility Function / 工具函数
```tsx
function generateBreadcrumb(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      ...(index < items.length - 1 && { item: item.url })
    }))
  };
}

// Usage
const breadcrumb = generateBreadcrumb([
  { name: 'Home', url: 'https://www.example.com/' },
  { name: 'Stocks', url: 'https://www.example.com/stocks/' },
  { name: 'AAPL', url: 'https://www.example.com/stocks/NASDAQ-AAPL/' }
]);
```

---

## VideoObject / 视频

For pages containing video content.

用于包含视频内容的页面。

### Required Properties / 必需属性
| Property | Description |
|----------|-------------|
| `name` | Video title |
| `description` | Video description |
| `thumbnailUrl` | Thumbnail image URLs (array) |
| `uploadDate` | Upload date (ISO 8601) |
| `contentUrl` | Direct video file URL |
| `duration` | Duration in ISO 8601 format (e.g., PT1M30S) |

### Optional Properties / 可选属性
| Property | Description |
|----------|-------------|
| `embedUrl` | Player embed URL |
| `interactionStatistic` | View count |
| `regionsAllowed` | Allowed country codes |

### Example / 示例
```tsx
const videoJsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Market Analysis: March 2026 Outlook",
  "description": "A comprehensive analysis of market trends...",
  "thumbnailUrl": [
    "https://www.example.com/thumbnails/1x1.jpg",
    "https://www.example.com/thumbnails/16x9.jpg"
  ],
  "uploadDate": "2026-03-01T08:00:00+08:00",
  "duration": "PT5M30S",
  "contentUrl": "https://www.example.com/videos/market-analysis.mp4",
  "embedUrl": "https://www.example.com/embed/market-analysis",
  "interactionStatistic": {
    "@type": "InteractionCounter",
    "interactionType": { "@type": "WatchAction" },
    "userInteractionCount": 12345
  },
  "regionsAllowed": ["US", "GB", "CA"]
};
```

---

## Paywalled Content / 付费内容

For content that requires subscription or payment to access fully.

用于需要订阅或付费才能完全访问的内容。

### Required Properties / 必需属性
| Property | Description |
|----------|-------------|
| `isAccessibleForFree` | Set to `false` for paywalled content |
| `hasPart` | Object defining paywalled section |
| `hasPart.@type` | Set to `WebPageElement` |
| `hasPart.cssSelector` | CSS class of paywalled content |
| `hasPart.isAccessibleForFree` | Set to `false` |

### Example / 示例

**HTML Structure / HTML结构:**
```tsx
<div className="free-content">
  <p>This introduction is free to read...</p>
</div>
<div className="paywall">
  <p>This premium content requires subscription...</p>
</div>
```

**JSON-LD:**
```tsx
const paywalledArticleJsonLd = {
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "Exclusive: Inside Apple's AI Strategy",
  "image": "https://www.example.com/articles/apple-ai.jpg",
  "datePublished": "2026-03-02T08:00:00+08:00",
  "dateModified": "2026-03-02T09:20:00+08:00",
  "author": {
    "@type": "Person",
    "name": "Jane Doe",
    "url": "https://www.example.com/profile/janedoe"
  },
  "isAccessibleForFree": false,
  "hasPart": {
    "@type": "WebPageElement",
    "isAccessibleForFree": false,
    "cssSelector": ".paywall"
  }
};
```

---

## Next.js Implementation / Next.js实现

### App Router with Script Component / App Router
```tsx
// app/article/[id]/page.tsx
import Script from 'next/script';

export default function ArticlePage({ article }) {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "datePublished": article.publishedAt,
    "author": { "@type": "Person", "name": article.author }
  };

  return (
    <>
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {/* Page content */}
    </>
  );
}
```

### Multiple Schemas / 多个Schema
```tsx
export default function Page({ data }) {
  return (
    <>
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
```

---

## Validation / 验证

### Google Rich Results Test
Always validate structured data before deployment.

部署前务必验证结构化数据。

**Tool / 工具:** [Google Rich Results Test](https://search.google.com/test/rich-results)

### Validation Checklist / 验证清单
- [ ] All required properties are present
- [ ] Dates are in ISO 8601 format
- [ ] URLs are valid and absolute
- [ ] JSON-LD syntax is valid
- [ ] No duplicate schemas
- [ ] Rich Results Test passes without errors

### Common Errors / 常见错误

| Error | Cause | Fix |
|-------|-------|-----|
| Missing required field | Property not included | Add required properties |
| Invalid date format | Wrong date format | Use ISO 8601: `YYYY-MM-DDTHH:mm:ss+TZ` |
| Invalid URL | Relative or broken URL | Use absolute URLs |
| JSON syntax error | Malformed JSON | Validate JSON structure |
