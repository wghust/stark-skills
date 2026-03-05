# Insight PDF Reference

## 设计 Token 表（2.4）

| Token | 值 | 用途 |
|-------|-----|------|
| `--color-primary` | `#1e3a5f` | 标题、重要元素 |
| `--color-primary-alt` | `#2c3e50` | 主色备选 |
| `--color-gray-600` | `#6b7280` | 正文、次要文案 |
| `--color-gray-400` | `#9ca3af` | 辅助信息 |
| `--color-gray-200` | `#e5e7eb` | 边框、分割线 |
| `--color-bg` | `#ffffff` | 背景 |
| `--color-accent` | `#0ea5e9` | 强调色（图表、链接） |
| `--color-accent-alt` | `#3b82f6` | 强调色备选 |
| `--font-title` | Libre Baskerville, Georgia | 标题 serif |
| `--font-body` | Source Sans 3, Inter | 正文 sans-serif |

### 可选强调色

- `#0ea5e9`（默认）
- `#3b82f6`
- `#0891b2`
- `#6366f1`

---

## 4.1 Markdown/文本转 HTML

使用 templates/insight-report.html 作为基础。替换占位符：

- `{{REPORT_TITLE}}` — 报告标题（封面 + title）
- `{{REPORT_SUBTITLE}}` — 副标题（可选）
- `{{REPORT_META}}` — 元信息如日期、作者（可选）
- `{{REPORT_BODY}}` — 正文 HTML。Markdown 需先转为 HTML：`h1`→`<h1>`, `p`→`<p>`, `table`→`<table>`, 等
- `{{CHARTS_SECTION}}` — 图表容器与 Chart.js 初始化脚本

### 新增组件

**Stat Cards（统计卡片）**
```html
<div class="stat-grid">
  <div class="stat-card shadow-sm">
    <div class="stat-icon">📈</div>
    <div class="stat-value">1,234</div>
    <div class="stat-label">Total Users</div>
  </div>
  <div class="stat-card shadow-sm">
    <div class="stat-icon">💰</div>
    <div class="stat-value">$56K</div>
    <div class="stat-label">Revenue</div>
  </div>
</div>
```

**Callout Boxes（提示框）**
```html
<div class="callout callout-info">
  <div class="callout-title">ℹ️ Information</div>
  <p>Important information here.</p>
</div>

<div class="callout callout-warning">
  <div class="callout-title">⚠️ Warning</div>
  <p>Warning message here.</p>
</div>

<div class="callout callout-success">
  <div class="callout-title">✓ Success</div>
  <p>Success message here.</p>
</div>
```

**Enhanced Tables（增强表格）**
```html
<table class="table-enhanced">
  <thead>
    <tr><th>Metric</th><th>Value</th><th>Change</th></tr>
  </thead>
  <tbody>
    <tr><td>Users</td><td>1,234</td><td>+12%</td></tr>
    <tr><td>Revenue</td><td>$56K</td><td>+8%</td></tr>
  </tbody>
</table>
```

**Chart with Title**
```html
<div class="chart-wrapper">
  <div class="chart-title">Monthly Revenue Trend</div>
  <div class="chart-container"><canvas id="chart1"></canvas></div>
  <div class="chart-description">Data shows consistent growth over Q4 2025</div>
</div>
```

正文结构示例：

```html
<section>
  <h2>Executive Summary</h2>
  <p>...</p>
</section>
<section class="bg-gray-50" style="padding: 1.5rem; border-radius: 8px;">
  <h2>Key Findings</h2>
  <p>...</p>
</section>
```

### 信息图组件

**Progress Bars（进度条）**
```html
<div class="progress-bar">
  <div class="progress-fill" style="width: 75%;">75%</div>
</div>
```

**Comparison Blocks（对比块）**
```html
<div class="comparison-grid">
  <div class="comparison-item">
    <div class="comparison-value">$2.4M</div>
    <div class="comparison-label">2024 Revenue</div>
  </div>
  <div class="comparison-item">
    <div class="comparison-value">$3.1M</div>
    <div class="comparison-label">2025 Revenue</div>
  </div>
</div>
```

**Timeline（时间线）**
```html
<div class="timeline">
  <div class="timeline-item">
    <div class="timeline-dot"></div>
    <div class="timeline-content">
      <div class="timeline-date">Q1 2025</div>
      <div class="timeline-title">Product Launch</div>
      <p>Successfully launched new product line.</p>
    </div>
  </div>
</div>
```

**Badges（徽章）**
```html
<span class="badge badge-primary">New</span>
<span class="badge badge-accent">Featured</span>
```

## 4.2 Chart.js 扁平配置

使用设计系统配色，禁用渐变与动画：

```javascript
const chartColors = ['#1e3a5f', '#6b7280', '#0ea5e9', '#9ca3af', '#2c3e50'];
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['A', 'B', 'C'],
    datasets: [{ label: 'Value', data: [10, 20, 15], backgroundColor: chartColors, borderColor: chartColors }]
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    animation: false,
    plugins: { legend: { labels: { color: '#1e3a5f' } } },
    scales: {
      x: { ticks: { color: '#6b7280' }, grid: { color: '#e5e7eb' } },
      y: { ticks: { color: '#6b7280' }, grid: { color: '#e5e7eb' } }
    }
  }
});
```

## 4.3 ECharts 配置示例

**基础配置**
```javascript
const chart = echarts.init(document.getElementById('chart1'));
chart.setOption({
  ...echartsBaseConfig,
  title: { text: 'Sales Trend', textStyle: { color: '#1e3a5f' } },
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed'] },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: [120, 200, 150] }]
});
```

**Heatmap（热力图）**
```javascript
const heatmapChart = echarts.init(document.getElementById('heatmap'));
heatmapChart.setOption({
  ...echartsBaseConfig,
  tooltip: {},
  grid: { height: '50%', top: '10%' },
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  yAxis: { type: 'category', data: ['Morning', 'Afternoon', 'Evening'] },
  visualMap: { min: 0, max: 100, calculable: true, orient: 'horizontal', left: 'center', bottom: '15%', inRange: { color: ['#e0f2fe', '#0ea5e9', '#1e3a5f'] } },
  series: [{ type: 'heatmap', data: [[0,0,50], [0,1,80], [1,0,30]], label: { show: true } }]
});
```

**Radar（雷达图）**
```javascript
const radarChart = echarts.init(document.getElementById('radar'));
radarChart.setOption({
  ...echartsBaseConfig,
  radar: { indicator: [{ name: 'Sales', max: 100 }, { name: 'Marketing', max: 100 }, { name: 'Development', max: 100 }, { name: 'Support', max: 100 }] },
  series: [{ type: 'radar', data: [{ value: [80, 90, 70, 85], name: 'Q1' }] }]
});
```

**Gauge（仪表盘）**
```javascript
const gaugeChart = echarts.init(document.getElementById('gauge'));
gaugeChart.setOption({
  ...echartsBaseConfig,
  series: [{ type: 'gauge', progress: { show: true, width: 18 }, axisLine: { lineStyle: { width: 18 } }, axisTick: { show: false }, splitLine: { length: 15, lineStyle: { width: 2, color: '#999' } }, axisLabel: { distance: 25, color: '#999', fontSize: 12 }, detail: { valueAnimation: false, formatter: '{value}%', color: '#1e3a5f', fontSize: 24 }, data: [{ value: 75, name: 'Progress' }] }]
});
```

**Sankey（桑基图）**
```javascript
const sankeyChart = echarts.init(document.getElementById('sankey'));
sankeyChart.setOption({
  ...echartsBaseConfig,
  series: [{ type: 'sankey', layout: 'none', emphasis: { focus: 'adjacency' }, data: [{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }], links: [{ source: 'A', target: 'B', value: 10 }, { source: 'A', target: 'C', value: 15 }, { source: 'B', target: 'D', value: 8 }] }]
});
```

## 4.3 封面与正文拼接及分页

1. 封面与正文在同一 HTML 文件中：`<div class="cover">` 后接 `<div class="content">`
2. 打印分页：`.cover` 已设置 `page-break-after: always`，封面后自动换页
3. 正文区块：`section` 设置 `page-break-inside: avoid`，避免区块内分页

---

## 5. HTML → PDF 转换（无项目污染）

### 5.1 临时目录工作流

Agent **不得**在用户项目目录写入 HTML 或执行 npm install。工作流：

1. 将 HTML 写入临时目录：`os.tmpdir()` 或 `$TMPDIR` 下的 `insight-pdf-<uuid>/report.html`
2. 调用 skill 内 convert 脚本：`node <skill-dir>/scripts/convert.js <html-path> <pdf-path>`
3. 转换成功后删除临时目录
4. 用户项目仅得到 PDF

### 5.2 首次安装（在 skill 目录）

```bash
cd skills/insight-pdf   # 或项目内 skills/insight-pdf，或 ~/.cursor/skills/insight-pdf
npm install
npx playwright install chromium
```

**不要在用户项目目录执行 npm install。**

### 5.3 脚本调用

```bash
node skills/insight-pdf/scripts/convert.js /tmp/insight-pdf-xxx/report.html /path/to/project/report.pdf
```

脚本接收 HTML 绝对路径和 PDF 输出绝对路径，输出 PDF 到指定位置。

### 5.4 错误处理

| 错误 | 处理 |
|------|------|
| Chromium 未安装 | 到 **skill 目录**执行 `npm install && npx playwright install chromium` |
| HTML 文件不存在 | 检查临时路径是否正确写入 |
| 图表未渲染 | convert.js 默认 wait 1500ms，可修改脚本增加 timeout |
| 字体缺失 | 使用 reference 中的字体 fallback；或下载字体到本地并 `@font-face` |

---

## 6.3 字体 Fallback 与高级配置

### 字体 Fallback

CDN 不可用时，使用系统字体：

```css
--font-title: 'Libre Baskerville', Georgia, 'Times New Roman', serif;
--font-body: 'Source Sans 3', 'Inter', system-ui, -apple-system, sans-serif;
```

### 本地字体嵌入

```css
@font-face {
  font-family: 'Libre Baskerville';
  src: url('./fonts/LibreBaskerville-Regular.woff2') format('woff2');
  font-display: swap;
}
```

### 高级配置

- **超时**：`page.setDefaultTimeout(30000)` 处理大报告
- **视口**：`page.setViewportSize({ width: 1200, height: 900 })` 可改善宽屏封面
- **16:9 封面**：给 `.cover` 加 `cover-aspect-16-9`，或单独设置 `min-height`/`aspect-ratio`
