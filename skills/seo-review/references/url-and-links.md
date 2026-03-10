# URL & Links SEO Guidelines / URL和链接SEO规范

## Table of Contents / 目录
- [URL Structure / URL结构](#url-structure--url结构)
- [URL Redirects / URL重定向](#url-redirects--url重定向)
- [Query vs Path Parameters / Query参数vs路径参数](#query-vs-path-parameters--query参数vs路径参数)
- [Link Elements / 链接元素](#link-elements--链接元素)
- [Canonical URLs / 规范URL](#canonical-urls--规范url)
- [Common Issues / 常见问题](#common-issues--常见问题)

---

## URL Structure / URL结构

### Trailing Slash / 斜杠结尾
All URLs must end with `/` except the homepage.

除首页外，所有URL必须以`/`结尾。

**Correct / 正确:**
```
https://www.example.com/stocks/NASDAQ-AAPL/
https://www.example.com/news/market-update-20260302/
```

**Incorrect / 错误:**
```
https://www.example.com/stocks/NASDAQ-AAPL
https://www.example.com/news/market-update-20260302
```

**Next.js Implementation / Next.js实现:**
```tsx
// next.config.js
module.exports = {
  trailingSlash: true,
}
```

### URL Depth / URL层级
Maximum 5 levels deep. Search engines may not crawl deeper pages.

最多5层深度。搜索引擎可能不会抓取更深的页面。

**Good / 良好:** `https://example.com/stocks/us/tech/AAPL/` (4 levels)

**Avoid / 避免:** `https://example.com/a/b/c/d/e/f/g/` (too deep)

### URL Character Usage / URL字符使用

| Allowed / 允许 | Use with caution / 谨慎使用 | Do not use / 禁止使用 |
|---------------|---------------------------|---------------------|
| `-` (hyphen) | `?`, `=`, `&` (for queries) | `#` (fragment only) |
| Letters, numbers | `.` (for file extensions) | `_` (underscore) |
| `/` (path separator) | `,` (comma) | `:`, `;`, `[]`, `,,` |

### URL Readability / URL可读性
URLs should be human-readable with meaningful words, not random IDs.

URL应该是人类可读的，使用有意义的单词，而不是随机ID。

**Good / 良好:**
```
https://example.com/stocks/NASDAQ-AAPL/
https://example.com/news/apple-q4-earnings-report/
```

**Avoid / 避免:**
```
https://example.com/sid=3a5ebc944f41daa6f849f730f1
https://example.com/杂货/薄荷 (non-ASCII)
```

---

## URL Redirects / URL重定向

### When to Use 301 Redirects / 何时使用301重定向

| Scenario | Action |
|----------|--------|
| URL structure change | Redirect old URL to new URL |
| Page moved | Redirect to new location |
| Duplicate content | Redirect to canonical URL |
| Trailing slash fix | Redirect non-trailing to trailing slash |

### Next.js Implementation / Next.js实现

**Option 1: next.config.js redirects**
```js
// next.config.js
module.exports = {
  trailingSlash: true,
  async redirects() {
    return [
      // Redirect old URL to new URL
      {
        source: '/old-path/:slug',
        destination: '/new-path/:slug/',
        permanent: true, // 301 redirect
      },
      // Redirect non-trailing slash to trailing slash (handled by trailingSlash: true)
      {
        source: '/stocks/:symbol',
        destination: '/stocks/:symbol/',
        permanent: true,
      },
    ];
  },
};
```

**Option 2: Middleware redirects**
```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Redirect non-trailing slash to trailing slash
  if (!pathname.endsWith('/') && !pathname.includes('.')) {
    const url = request.nextUrl.clone();
    url.pathname = `${pathname}/`;
    return NextResponse.redirect(url, 301);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### Redirect Chain Warning / 重定向链警告

Avoid redirect chains (A → B → C). They slow down page load and dilute link equity.

避免重定向链（A → B → C）。它们会减慢页面加载速度并稀释链接权重。

**❌ Avoid / 避免:**
```
/old-page → /temp-page → /final-page/  (2 redirects)
```

**✅ Correct / 正确:**
```
/old-page → /final-page/  (1 redirect)
```

### Static Check Method / 静态检查方法

- Check `next.config.js` for `redirects` array
- Check `middleware.ts` for redirect logic
- Verify redirect chains don't exceed 1 hop

---

## Query vs Path Parameters / Query参数vs路径参数

### Rule / 规则

**Query parameters that affect page content should be converted to path parameters.**

影响页面内容的Query参数应该转换为路径参数。

### Comparison / 对比

| Type | Example | SEO Impact |
|------|---------|------------|
| Query param | `/screener?strategy=growth` | 🟡 Less readable, may not be indexed as separate page |
| Path param | `/screener/growth/` | 🟢 Clean URL, treated as separate page |

### When to Use Each / 使用场景

| Use Query Parameters | Use Path Parameters |
|---------------------|---------------------|
| Filtering/sorting (same content) | Different content pages |
| Analytics/tracking params | Strategy/category pages |
| Pagination (`?page=2`) | User profiles |
| Search queries | Product/stock detail pages |

### Examples / 示例

**❌ Avoid: Query parameters for content pages**
```tsx
// Bad: Strategy affects page content but uses query param
<Link href="/screener?strategy=growth">Growth Strategy</Link>
<Link href="/screener?strategy=value">Value Strategy</Link>
```

**✅ Recommended: Path parameters**
```tsx
// Good: Each strategy has its own URL path
<Link href="/screener/growth/">Growth Strategy</Link>
<Link href="/screener/value/">Value Strategy</Link>
```

### Next.js Dynamic Routes / Next.js动态路由

```tsx
// File structure
// app/screener/[strategy]/page.tsx

// page.tsx
export default function ScreenerPage({ params }: { params: { strategy: string } }) {
  const { strategy } = params; // 'growth' or 'value'
  
  return <ScreenerContent strategy={strategy} />;
}

// Generate static paths for known strategies
export async function generateStaticParams() {
  return [
    { strategy: 'growth' },
    { strategy: 'value' },
    { strategy: 'momentum' },
  ];
}
```

### Static Check Method / 静态检查方法

**Detect problematic patterns:**
```tsx
// ❌ Pattern to flag: Link with content-affecting query params
<Link href={`/list?category=${category}`} />

// ✅ Should be:
<Link href={`/list/${category}/`} />
```

**Detection rules:**
- Check `<Link href>` and `<a href>` for query strings
- Flag query params like `?category=`, `?type=`, `?strategy=`
- Exclude tracking params: `?utm_source=`, `?ref=`, `?sid=`

---

## Link Elements / 链接元素

### Use `<a>` Tags / 使用`<a>`标签
All navigation links must use `<a>` elements, not `<div>` or `<span>` with click handlers.

所有导航链接必须使用`<a>`元素，而不是带有点击处理程序的`<div>`或`<span>`。

**Correct / 正确:**
```tsx
<Link href="/stocks/NASDAQ-AAPL/">
  <a>AAPL</a>
</Link>
```

**Incorrect / 错误:**
```tsx
<div onClick={() => router.push('/stocks/NASDAQ-AAPL/')}>
  AAPL
</div>
```

### Absolute Paths / 绝对路径
Always use absolute URLs with the full domain.

始终使用带有完整域名的绝对URL。

**Correct / 正确:**
```tsx
<a href="https://www.example.com/stocks/NASDAQ-AAPL/">AAPL</a>
```

**Avoid / 避免:**
```tsx
<a href="/stocks/NASDAQ-AAPL/">AAPL</a>
<a href="../AAPL/">AAPL</a>
```

### Link Title Attribute / 链接title属性
Optional but recommended. Displays tooltip on hover.

可选但推荐。悬停时显示工具提示。

```tsx
<a
  href="https://www.example.com/stocks/NASDAQ-AAPL/"
  title="Apple (AAPL) Price, Quote & Forecast"
>
  AAPL
</a>
```

### Rel Attributes / Rel属性

| Attribute | Usage / 用途 |
|-----------|-------------|
| `rel="nofollow"` | Links you don't want search engines to follow (e.g., user-generated, untrusted) |
| `rel="sponsored"` | Paid or sponsored links |
| `rel="ugc"` | User-generated content links (e.g., comments) |

**Examples / 示例:**
```tsx
// Paid advertisement
<a href="https://advertiser.com/promo/" rel="sponsored">
  Sponsored Link
</a>

// User comment link
<a href="https://external-site.com/" rel="nofollow ugc">
  User posted link
</a>
```

---

## Canonical URLs / 规范URL

Every page must have a canonical URL to prevent duplicate content issues.

每个页面都必须有一个规范URL以防止重复内容问题。

### Implementation / 实现

**In Next.js with next/head:**
```tsx
<Head>
  <link
    rel="canonical"
    href="https://www.example.com/stocks/NASDAQ-AAPL/"
  />
</Head>
```

**In Next.js App Router (metadata):**
```tsx
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.example.com/stocks/NASDAQ-AAPL/',
  },
}
```

### Handling Duplicate Content / 处理重复内容
If multiple URLs show the same content, set canonical to the preferred URL.

如果多个URL显示相同的内容，将canonical设置为首选URL。

```html
<!-- On https://example.com/stocks/NASDAQ-AAPL (without trailing slash) -->
<link rel="canonical" href="https://www.example.com/stocks/NASDAQ-AAPL/" />
```

---

## Common Issues / 常见问题

### Issue: Missing Trailing Slash / 问题: 缺少斜杠结尾
**Detection / 检测:** Check if internal URLs end with `/`

**Fix / 修复:**
```tsx
// Add trailingSlash: true to next.config.js
module.exports = {
  trailingSlash: true,
}
```

### Issue: Relative URLs / 问题: 相对URL
**Detection / 检测:** Check for hrefs starting with `/` or `./`

**Fix / 修复:**
```tsx
// Use a utility function to generate absolute URLs
const getAbsoluteUrl = (path: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.example.com';
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

<a href={getAbsoluteUrl('/stocks/NASDAQ-AAPL/')}>AAPL</a>
```

### Issue: Non-crawlable Links / 问题: 不可抓取的链接
**Detection / 检测:** Look for `onClick` handlers on non-anchor elements

**Fix / 修复:** Replace with proper `<a>` tags or Next.js `<Link>` component

### Issue: Query Parameters Affecting Content / 问题: Query参数影响内容
**Detection / 检测:** URLs with `?param=value` that change page content

**Fix / 修复:** Use path parameters instead of query strings
```tsx
// Instead of: /screener?strategy=value
// Use: /screener/value/
```
