# Static SEO Checks: Rendering & Page Structure / 静态SEO检查：渲染与页面结构

## Table of Contents / 目录
- [Rendering Strategies / 渲染策略](#rendering-strategies--渲染策略)
- [Image Optimization / 图片优化](#image-optimization--图片优化)
- [Other Static Checks / 其他静态检查](#other-static-checks--其他静态检查)

---

## Rendering Strategies / 渲染策略

### SSR (Server-Side Rendering)
Best for: SEO-critical pages with dynamic content.

适用于：SEO关键且内容动态的页面。

```tsx
// Next.js App Router - Server Component (default)
// app/stocks/[symbol]/page.tsx
export default async function StockPage({ params }) {
  const stock = await getStock(params.symbol); // Server-side fetch

  return (
    <div>
      <h1>{stock.name}</h1>
      <p>{stock.price}</p>
    </div>
  );
}
```

**Benefits / 优势:**
- Content available in initial HTML (SEO-friendly)
- OG tags work for social sharing
- Fast First Contentful Paint

### SSG (Static Site Generation)
Best for: Pages that don't change frequently.

适用于：不经常变化的页面。

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default function BlogPost({ params }) {
  // Pre-rendered at build time
  return <Article slug={params.slug} />;
}
```

### ISR (Incremental Static Regeneration)
Best for: Semi-dynamic content that updates periodically.

适用于：定期更新的半动态内容。

```tsx
// app/news/[id]/page.tsx
export const revalidate = 3600; // Revalidate every hour

export default async function NewsPage({ params }) {
  const news = await getNews(params.id);
  return <NewsArticle data={news} />;
}
```

### CSR (Client-Side Rendering)
Best for: Private/user-specific content, not SEO-critical.

适用于：私有/用户特定内容，对SEO不关键。

**Warning / 警告:** Search engines may not fully index CSR content.

搜索引擎可能无法完全索引CSR内容。

```tsx
// Content only visible after JS execution
'use client';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(setData);
  }, []);

  if (!data) return <Skeleton />;

  return <DashboardContent data={data} />;
}
```

### Recommendation for SEO / SEO建议
| Page Type | Recommended Strategy |
|-----------|---------------------|
| Homepage | SSG + ISR |
| Product/Stock pages | SSR |
| News/Articles | ISR |
| User dashboard | CSR (private) |
| Search results | SSR or ISR |

---

## Image Optimization / 图片优化

### Use Next.js Image Component
```tsx
import Image from 'next/image';

// Correct - with dimensions and alt
<Image
  src="/images/stock-chart.png"
  alt="AAPL stock price chart showing upward trend"
  width={800}
  height={400}
  priority // For above-the-fold images
/>

// External images - configure domains first
<Image
  src="https://cdn.example.com/stock/AAPL.png"
  alt="Apple Inc logo"
  width={64}
  height={64}
/>
```

### Next.js Image Configuration
```js
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};
```

### Image Best Practices
- Always include `alt` text
- Specify `width` and `height` to prevent CLS
- Use `priority` for above-the-fold images
- Use `loading="lazy"` for below-the-fold images (default in Next.js)
- Serve modern formats (WebP, AVIF)

---

## Other Static Checks / 其他静态检查

### Robots.txt
Ensure proper crawling rules.

确保正确的抓取规则。

```txt
# public/robots.txt
User-agent: *
Allow: /

# Block private pages
Disallow: /api/
Disallow: /account/
Disallow: /login/
Disallow: /register/

Sitemap: https://www.example.com/sitemap.xml
```

### Sitemap
Keep sitemap updated for new pages.

为新页面保持sitemap更新。

```tsx
// app/sitemap.ts (Next.js App Router)
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stocks = await getAllStocks();

  return [
    { url: 'https://www.example.com/', lastModified: new Date() },
    { url: 'https://www.example.com/stocks/', lastModified: new Date() },
    ...stocks.map((stock) => ({
      url: `https://www.example.com/stocks/${stock.symbol}/`,
      lastModified: stock.updatedAt,
    })),
  ];
}
```

### 404 Page Handling
Custom 404 page should keep the URL unchanged (don't redirect).

自定义404页面应保持URL不变（不要重定向）。

```tsx
// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link href="/">Go Home</Link>
    </div>
  );
}
```

### Content Visibility
Content requiring user interaction (tabs, accordions) may not be fully indexed.

需要用户交互（标签页、手风琴）的内容可能无法完全被索引。

**SEO Impact / SEO影响:**
- Google爬虫不会执行用户操作（点击、悬停等）
- Tab切换时，隐藏的tab内容可能无法被索引
- 手风琴/折叠内容同样存在此问题
- 延迟加载(lazy load)的内容可能被遗漏

**Recommendation / 建议:**
- Critical content should be visible by default
- Use CSS to hide/show rather than conditionally rendering
- Consider SSR for tab content if SEO-important

#### Static Check: Conditional Rendering / 静态检查：条件渲染

**❌ Avoid: Conditional Rendering / 避免：条件渲染**
```tsx
// 问题：隐藏的tab内容在HTML中不存在
function TabComponent() {
  const [activeTab, setActiveTab] = useState('tab1');
  
  return (
    <div>
      <button onClick={() => setActiveTab('tab1')}>Tab 1</button>
      <button onClick={() => setActiveTab('tab2')}>Tab 2</button>
      
      {/* 条件渲染 - 隐藏的tab不会被爬虫抓取 */}
      {activeTab === 'tab1' && <div>Tab 1 Content</div>}
      {activeTab === 'tab2' && <div>Tab 2 Content</div>}
    </div>
  );
}
```

**✅ Recommended: CSS-based Hiding / 推荐：CSS隐藏**
```tsx
// 推荐：所有tab内容都在HTML中，用CSS控制显示
function TabComponent() {
  const [activeTab, setActiveTab] = useState('tab1');
  
  return (
    <div>
      <button onClick={() => setActiveTab('tab1')}>Tab 1</button>
      <button onClick={() => setActiveTab('tab2')}>Tab 2</button>
      
      {/* 所有内容都在DOM中，爬虫可以抓取 */}
      <div className={activeTab === 'tab1' ? 'visible' : 'hidden'}>Tab 1 Content</div>
      <div className={activeTab === 'tab2' ? 'visible' : 'hidden'}>Tab 2 Content</div>
    </div>
  );
}

// CSS
.hidden { display: none; }
.visible { display: block; }
```

**✅ Best: SSR with All Content / 最佳：SSR渲染所有内容**
```tsx
// 服务端组件：所有tab内容默认渲染
async function TabComponent() {
  return (
    <div>
      <div className="tab active" data-tab="tab1">
        <h2>Important SEO Content</h2>
        <p>This content will be indexed...</p>
      </div>
      <div className="tab" data-tab="tab2" hidden>
        <h2>More SEO Content</h2>
        <p>This will also be indexed...</p>
      </div>
    </div>
  );
}
```

#### Detection Patterns / 检测模式

| Pattern | Issue | Severity |
|---------|-------|----------|
| `{condition && <Content />}` | 条件渲染，隐藏内容不在DOM中 | 🟡 Warning |
| `onClick` toggling content | 用户交互才能显示的内容 | 🟡 Warning |
| `useEffect` loading content | CSR延迟加载的内容 | 🟡 Warning |
| `hidden` attribute / CSS `display:none` | 内容在DOM中但隐藏 | 🟢 OK |
| SSR with all tabs rendered | 最佳实践 | 🟢 OK |

#### When to Use Each Approach / 使用场景

| Content Type | Recommended Approach |
|--------------|---------------------|
| SEO-critical content | SSR + CSS hiding |
| User-specific content | Conditional rendering OK |
| Large/expensive content | Lazy load with fallback |
| Navigation tabs | CSS-based hiding |

