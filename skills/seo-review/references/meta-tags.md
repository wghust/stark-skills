# Meta Tags & Head Elements / Meta标签和Head元素

## Table of Contents / 目录
- [Required Meta Tags / 必需的Meta标签](#required-meta-tags--必需的meta标签)
- [Title & Description / 标题和描述](#title--description--标题和描述)
- [Heading Structure / 标题结构](#heading-structure--标题结构)
- [Image Alt Text / 图片Alt文本](#image-alt-text--图片alt文本)
- [Open Graph Protocol / 开放图协议](#open-graph-protocol--开放图协议)
- [Twitter Cards / Twitter卡片](#twitter-cards--twitter卡片)
- [Favicon & Icons / 图标](#favicon--icons--图标)
- [Next.js Implementation / Next.js实现](#nextjs-implementation--nextjs实现)

---

## Required Meta Tags / 必需的Meta标签

Every page must have these meta tags in the `<head>`:

每个页面的`<head>`中必须有这些meta标签：

```html
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

### Viewport Parameters / Viewport参数

| Parameter | Description | Recommended Value | Notes |
|-----------|-------------|-------------------|-------|
| `width` | Viewport width | `device-width` | Can be specific pixels, but device-width is recommended |
| `height` | Viewport height | `device-height` | Rarely used by browsers |
| `initial-scale` | Initial zoom level | `1.0` | Min: 0.1, Max: 10, Default: 1 |
| `minimum-scale` | Minimum zoom | **Avoid setting** | iOS 10+ ignores this; hurts accessibility |
| `maximum-scale` | Maximum zoom | **Avoid setting < 3** | Values < 3 violate WCAG; iOS 10+ ignores |
| `user-scalable` | Allow zoom | **Never set to `no`** | Setting to `0` or `no` violates WCAG |
| `interactive-widget` | Keyboard behavior | `resizes-visual` (default) | Controls how virtual keyboard affects viewport |

**Recommended / 推荐:**
```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>
```

**Values for interactive-widget / interactive-widget 参数值:**
| Value | Description |
|-------|-------------|
| `resizes-visual` | (Default) Visual viewport shrinks when keyboard appears |
| `resizes-content` | Content is scaled down when keyboard appears |
| `overlays-content` | Keyboard overlays content without resizing |

**Accessibility Warning / 无障碍警告:**
Never disable user zoom. Setting `user-scalable=no` or `maximum-scale=1` violates WCAG 2.1 Success Criterion 1.4.4 (Resize text).

**禁止禁用缩放**。设置 `user-scalable=no` 或 `maximum-scale=1` 违反 WCAG 2.1 准则 1.4.4（调整文字大小）。

---

## Title & Description / 标题和描述

### Title Tag / Title标签
- Length: 50-60 characters (Google truncates longer titles)
- Should be unique for each page
- Include primary keywords near the beginning
- Brand name at the end (optional)

**Format / 格式:** `[Page Content] - [Brand Name]`

**Example / 示例:**
```html
<title>Apple (AAPL) Price, Quote & Forecast - Get it Now - AInvest</title>
```

### Meta Description / Meta描述
- Length: 150-160 characters
- Should be unique for each page
- Include relevant keywords naturally
- Should be compelling (affects click-through rate)

**Example / 示例:**
```html
<meta
  name="description"
  content="Track the live stock price of Apple (AAPL), get real-time quotes, and access in-depth analysis and prediction. Stay ahead of the market with AInvest's AI-powered tools."
/>
```

---

## Heading Structure / 标题结构

### H1 Requirements / H1要求
- **Exactly one `<h1>` per page** / 每个页面有且仅有一个`<h1>`
- Should describe the main content/topic
- Usually the largest visible heading
- Should match or relate to the page title

**Example / 示例:**
```tsx
// Stock detail page
<h1>Apple</h1>

// News article page
<h1>BlackRock Predicts Bitcoin to Reach $700,000 as Institutions Adopt Crypto</h1>
```

### Heading Hierarchy / 标题层级
Use semantic heading order (H1 → H2 → H3), don't skip levels.

使用语义化的标题顺序（H1 → H2 → H3），不要跳级。

```tsx
// Correct / 正确
<h1>Article Title</h1>
  <h2>Section 1</h2>
    <h3>Subsection 1.1</h3>
  <h2>Section 2</h2>

// Avoid / 避免
<h1>Article Title</h1>
  <h3>Section 1</h3>  // Skipped H2
```

---

## Image Alt Text / 图片Alt文本

All informational images must have descriptive `alt` attributes.

所有信息性图片必须有描述性的`alt`属性。

### Good Alt Text / 良好的Alt文本
- Describes the image content
- Includes relevant context
- Not too generic (avoid just "image" or "logo")

**Example / 示例:**
```tsx
<img
  src="https://cdn.example.com/icon/us/etf/SPY.png"
  alt="The logo of SPY ETF - S&P 500 Trust"
/>
```

### Bad Alt Text / 不良的Alt文本
```tsx
// Too generic
<img src="logo.png" alt="logo" />

// Missing alt
<img src="chart.png" />
```

### Decorative Images / 装饰性图片
For purely decorative images, use empty alt:

```tsx
<img src="decorative-border.png" alt="" />
```

---

## Open Graph Protocol / 开放图协议

OG tags control how content appears when shared on social media.

OG标签控制内容在社交媒体分享时的显示方式。

### Required OG Tags / 必需的OG标签

| Tag | Description | Example |
|-----|-------------|---------|
| `og:title` | Page title | Same as `<title>` |
| `og:description` | Page description | Same as meta description |
| `og:url` | Page URL | Full canonical URL |
| `og:image` | Share image URL | 1200x630px recommended |
| `og:type` | Content type | `website`, `article`, etc. |
| `og:site_name` | Site name | Your site name |

### Implementation / 实现
```tsx
<meta property="og:title" content="Apple (AAPL) Price, Quote & Forecast" />
<meta property="og:description" content="Track the live stock price of Apple..." />
<meta property="og:url" content="https://www.example.com/stocks/NASDAQ-AAPL/" />
<meta property="og:image" content="https://www.example.com/og-image.jpg" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="[SITE_NAME]" />
```

### OG Types / OG类型
Common values for `og:type`:

| Type | Usage |
|------|-------|
| `website` | Default, general pages |
| `article` | News articles, blog posts |
| `profile` | User profiles |
| `video.movie` | Movie pages |
| `book` | Book pages |

---

## Twitter Cards / Twitter卡片

Twitter-specific meta tags for rich link previews.

Twitter专用的meta标签，用于富链接预览。

### Required Twitter Tags / 必需的Twitter标签

| Tag | Description | Example |
|-----|-------------|---------|
| `twitter:card` | Card type | `summary_large_image` |
| `twitter:site` | Site account | `@AInvest` |
| `twitter:title` | Page title | Same as og:title |
| `twitter:description` | Description | Same as og:description |
| `twitter:image` | Share image | Same as og:image |

### Card Types / 卡片类型

| Type | Display |
|------|---------|
| `summary` | Title, description, thumbnail |
| `summary_large_image` | Title, description, large image |
| `app` | Direct app download |
| `player` | Video/audio player |

### Implementation / 实现
```tsx
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="[@TWITTER_HANDLE]" />
<meta name="twitter:title" content="Apple (AAPL) Price, Quote & Forecast" />
<meta name="twitter:description" content="Track the live stock price..." />
<meta name="twitter:image" content="https://www.example.com/og-image.jpg" />
```

---

## Favicon & Icons / 图标

### Required Icons / 必需图标
```tsx
<link rel="icon" href="/favicon.ico" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
```

### Multiple Sizes / 多种尺寸
```tsx
<link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/icon-16x16.png" />
<link rel="apple-touch-icon" sizes="512x512" href="/icon-512x512.png" />
```

---

## Next.js Implementation / Next.js实现

### App Router (Next.js 13+) / App Router
Use the `Metadata` API:

```tsx
// app/stocks/[symbol]/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apple (AAPL) Price, Quote & Forecast - [SITE_NAME]',
  description: 'Track the live stock price of Apple...',
  openGraph: {
    title: 'Apple (AAPL) Price, Quote & Forecast',
    description: 'Track the live stock price of Apple...',
    url: 'https://www.example.com/stocks/NASDAQ-AAPL/',
    images: [{ url: 'https://www.example.com/og-image.jpg' }],
    type: 'website',
    siteName: '[SITE_NAME]',
  },
  twitter: {
    card: 'summary_large_image',
    site: '[@TWITTER_HANDLE]',
    title: 'Apple (AAPL) Price, Quote & Forecast',
    description: 'Track the live stock price of Apple...',
    images: ['https://www.example.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://www.example.com/stocks/NASDAQ-AAPL/',
  },
};
```

### Dynamic Metadata / 动态Metadata
```tsx
// app/stocks/[symbol]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const stock = await getStock(params.symbol);

  return {
    title: `${stock.name} (${stock.symbol}) Price & Analysis - AInvest`,
    description: `Track ${stock.name} (${stock.symbol}) stock price...`,
    // ... other metadata
  };
}
```

### Pages Router (Legacy) / Pages Router
Use `next/head`:

```tsx
import Head from 'next/head';

function StockPage({ stock }) {
  return (
    <>
      <Head>
        <title>{stock.name} ({stock.symbol}) - AInvest</title>
        <meta name="description" content={`Track ${stock.name}...`} />
        <meta property="og:title" content={`${stock.name} (${stock.symbol})`} />
        <meta property="og:description" content={`Track ${stock.name}...`} />
        <meta property="og:url" content={`https://www.example.com/stocks/${stock.symbol}/`} />
        <link rel="canonical" href={`https://www.example.com/stocks/${stock.symbol}/`} />
      </Head>
      {/* Page content */}
    </>
  );
}
```

---

## Common Issues / 常见问题

### Issue: Multiple H1 Tags / 问题: 多个H1标签
**Detection / 检测:** Search for multiple `<h1>` in the page

**Fix / 修复:** Ensure only one H1 per page, downgrade others to H2-H6

### Issue: Missing Alt Text / 问题: 缺少Alt文本
**Detection / 检测:** Search for `<img>` without `alt` attribute

**Fix / 修复:** Add descriptive alt text to all informational images

### Issue: Duplicate Title/Description / 问题: 重复的标题/描述
**Detection / 检测:** Check if title/description is unique per page

**Fix / 修复:** Generate dynamic, page-specific metadata

### Issue: OG Tags in CSR Only / 问题: OG标签仅在CSR中设置
**Detection / 检测:** OG tags added via JavaScript after page load

**Fix / 修复:** Use SSR/SSG so OG tags are in initial HTML (required for social sharing)
