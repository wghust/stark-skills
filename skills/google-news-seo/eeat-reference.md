# EEAT Signal Reference / EEAT 检查项速查表

> This file is read by the agent during EEAT scanning to get the full signal checklist.
> 本文件在 EEAT 扫描时由 Agent Read 调用，获取完整检查项定义。
>
> **Manual rule**: If a signal cannot be determined from the fetched page alone (e.g., requires checking a third-party site), mark it as **🔍 Manual** and exclude it from the score denominator.
> 若某项信号无法仅凭抓取页面判断（如需检查第三方站点），标记为 **🔍 Manual**，并从该维度的评分分母中排除。

---

## Experience（经验）— 5 signals

| # | Signal / 信号 | Pass Condition / 通过条件 | Priority / 优先级 | Auto / Manual |
|---|--------------|--------------------------|-------------------|---------------|
| E1 | First-hand content indicators 第一手内容标识 | Article contains personal experience markers: first-person anecdotes ("I tested", "I visited", "我亲测"), original photos, or on-site descriptions | P1 | Auto |
| E2 | Date of experience stated 经历日期明确 | Content explicitly states when the experience occurred (e.g., "last week", "on March 3", "上周三") | P2 | Auto |
| E3 | Author byline present 作者署名可见 | A named human author byline is visible on the page (not just "Staff" or "Admin") | P0 | Auto |
| E4 | Author bio link present 作者简介链接存在 | Author name links to a profile, author page, or bio section | P1 | Auto |
| E5 | Original media 原创媒体 | At least one image/video is present AND no image URL/filename contains AI-tool markers: `qwen_generated`, `dall-e`, `midjourney`, `ChatGPT`, `stable-diffusion` | P0 | Auto |

**Score formula**: `floor(passing_signals / 5 × 100)`  
*(If any signal is 🔍 Manual, reduce denominator by 1 per Manual signal)*

---

## Expertise（专业度）— 6 signals

| # | Signal / 信号 | Pass Condition / 通过条件 | Priority / 优先级 | Auto / Manual |
|---|--------------|--------------------------|-------------------|---------------|
| X1 | Author credentials stated 作者资质说明 | Author bio or article mentions professional credentials, degrees, job titles, or relevant domain experience | P1 | Auto |
| X2 | Author has topic-relevant history 作者具备主题历史 | Author page lists ≥ 3 articles on the same topic or beat | P1 | 🔍 Manual |
| X3 | Sources cited 引用信源 | Article cites ≥ 2 external authoritative sources via links or named references | P1 | Auto |
| X4 | Technical accuracy indicators 内容准确性 | No obvious factual inconsistencies detectable from page content (dates match, names consistent, claims not contradicted by page itself) | P1 | Auto |
| X5 | Content depth 内容深度 | Article word count ≥ 500 words OR covers ≥ 3 distinct sub-aspects of the topic | P2 | Auto |
| X6 | Structured data author is Person Schema 作者类型为 Person | NewsArticle Schema `author.@type` = "Person" (not "Organization" or absent) | P1 | Auto |

**Score formula**: `floor(passing_signals / 6 × 100)`  
*(Reduce denominator for 🔍 Manual signals)*

---

## Authoritativeness（权威性）— 6 signals

| # | Signal / 信号 | Pass Condition / 通过条件 | Priority / 优先级 | Auto / Manual |
|---|--------------|--------------------------|-------------------|---------------|
| A1 | Publisher About page exists 发布方"关于"页面存在 | Site has an accessible /about, /about-us, /关于我们 or equivalent page | P1 | Auto |
| A2 | Publisher contact information 联系方式可见 | Site has a contact page or visible email/phone/address on the page or footer | P1 | Auto |
| A3 | Publisher name in Schema Schema 中有发布方名称 | NewsArticle Schema `publisher.name` is present and non-empty | P0 | Auto |
| A4 | External mentions / links 外部提及/链接 | Page or author is referenced by external authoritative domains (news aggregators, Wikipedia, other major publications) | P1 | 🔍 Manual |
| A5 | Author social or professional profiles 作者社媒/职业档案 | Author bio links to LinkedIn, Twitter/X, Weibo, or equivalent professional profile | P2 | Auto |
| A6 | NewsArticle Schema present NewsArticle Schema 存在 | `@type: "NewsArticle"` (or subtype) exists in page JSON-LD | P0 | Auto |

**Score formula**: `floor(passing_signals / 6 × 100)`  
*(Reduce denominator for 🔍 Manual signals)*

---

## Trustworthiness（可信度）— 7 signals

| # | Signal / 信号 | Pass Condition / 通过条件 | Priority / 优先级 | Auto / Manual |
|---|--------------|--------------------------|-------------------|---------------|
| T1 | HTTPS HTTPS 加密 | Page URL uses `https://` | P0 | Auto |
| T2 | Privacy policy page 隐私政策页面 | Site has an accessible /privacy-policy, /privacy, /隐私政策 or equivalent | P1 | Auto |
| T3 | Terms of service page 服务条款页面 | Site has an accessible /terms, /terms-of-service, /服务条款 or equivalent | P2 | Auto |
| T4 | Corrections / transparency policy 纠错/透明度政策 | Site has a visible corrections policy, editorial standards page, or transparency statement | P2 | Auto |
| T5 | Author is real person (not AI agent) 作者为真实人物 | Author name is a human name; NOT "AI Agent", "Bot", "GPT", "Claude", "AI Writer", "机器人", or any AI tool name | P0 | Auto |
| T6 | Schema dateModified ≥ datePublished Schema 日期逻辑正确 | NewsArticle Schema `dateModified` is equal to or later than `datePublished` | P0 | Auto |
| T7 | No manipulated-media policy violations 无操纵媒体违规 | No deepfake disclosures, no flagged manipulated-media warnings visible on the page | P1 | Auto |

**Score formula**: `floor(passing_signals / 7 × 100)`  
*(Reduce denominator for 🔍 Manual signals)*

---

## Priority Definitions / 优先级定义

| Priority | Meaning |
|----------|---------|
| **P0** | Blocks Google indexing or violates content policy — fix immediately / 影响 Google 收录或违反内容政策，立即修复 |
| **P1** | Reduces EEAT signal strength or rich result eligibility — should fix / 削弱 EEAT 信号或富摘要资格，应尽快修复 |
| **P2** | Best practice for long-term EEAT standing — nice to have / 长期 EEAT 建设最佳实践，建议跟进 |
