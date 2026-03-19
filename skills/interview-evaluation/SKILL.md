---
name: interview-evaluation
description: |
  Generate structured interview summaries from conversation records. Parses dialogue into four sections: background, core project, engineering experience, and coding test. Supports pasted text or file path input.
  基于面试对话记录生成结构化面试总结。将对话解析为背景履历、核心项目、工程经验、编程题四段式输出。支持粘贴文本或文件路径输入。
triggers:
  - 面试评价
  - 面试总结
  - interview evaluation
  - 面试复盘
  - 面试记录总结
---

# interview-evaluation Skill

> **Language**: Respond in the same language as the user (中文提问则中文回答).

Generate a structured interview summary from conversation records. Parse dialogue heuristically, then output a four-section Markdown summary suitable for archival and cross-candidate comparison.

---

## Input Handling

### Accepted Input

| 形式 | 说明 |
|------|------|
| **粘贴** | 用户将面试对话粘贴到聊天中，直接使用该内容 |
| **文件路径** | 用户提供 .txt / .md 等文本文件路径，Read 该文件后使用内容 |

### Formats

- Plain text
- Markdown（含多轮问答、面试官备注等）

### Edge Cases

- 对话格式不统一时：按轮次、话题转换推断区块
- 用户明确说明「无编程题」「无项目深挖」：对应区块简化或标注「无」

---

## Output Template（四段式）

| 区块 | 内容要点 |
|------|----------|
| **1. 背景与履历** | 学历、专业排名、保研/考研、研究方向、奖项、AI 编码使用情况 |
| **2. 核心项目** | 技术方案、方法论、架构熟悉度（模型/框架名称如 SAM、Adapter、FiLM、MaPLe、AlphaCLIP） |
| **3. 工程经验** | 系统架构（RAG、多 Agent 等）、规模指标、技术栈、工程痛点调试经验 |
| **4. 编程题** | 题目描述、实现思路、完成时间 |

---

## Parsing and Extraction Logic

### Heuristic Extraction

不依赖严格 schema，基于以下推断内容归属：

| 信号 | 推断区块 |
|------|----------|
| 学校、专业、排名、保研、奖项、自我介绍 | 1. 背景与履历 |
| 研究方向、论文、比赛 | 1. 背景与履历 |
| AI 编码工具（Claude、Cursor、Gemini、Copilot 等） | 1. 背景与履历 |
| 项目方案、技术细节、模型/架构名称 | 2. 核心项目 |
| 系统设计、RAG、Agent、多智能体、规模数据 | 3. 工程经验 |
| 向量库、Prompt 调优、检索失效、分段优化 | 3. 工程经验 |
| 算法题、编码题、LeetCode、实现思路、完成时间 | 4. 编程题 |

### Topic Shifts

- 面试官切换话题（如「介绍一下项目」「聊一下工程」）可帮助划分区块
- 若某区块无对应内容：标注「无」或省略

---

## Output Formatting Rules

- **格式**: Markdown
- **小节编号**: 使用 `1、2、3、4` 或 `#### 1.` 等形式
- **风格**: 简洁、可扫读；多用事实和关键词，避免冗长叙述
- **示例句式**: 「某985硕+某211本，专业前X%保研」「10 分钟左右完成编码」

---

## Execution Flow

### Step 1 · Get Input

- **IF** 用户提供文件路径 → **Read** 该文件
- **ELSE** 用户已粘贴对话 → 使用当前对话中的粘贴内容
- **IF** 输入为空或无法获取 → 请用户粘贴对话或提供有效路径

### Step 2 · Parse and Extract

- 通读对话，按关键词、话题转换划分区块
- 提取：学历/背景、项目/技术、工程/系统、编程题
- 若用户明确说明某部分无 → 相应区块简化

### Step 3 · Generate Summary

- 按四段式模板产出
- 使用 Markdown，编号清晰
- 保持简洁专业，与下方 Example 风格一致

### Step 4 · Output

- 直接回复 Markdown 总结
- 可选：询问用户是否需写入文件（如 `interview-summary-YYYYMMDD.md`）

---

## Example

> **设计原则**：下方示例仅作风格与结构参考，使用匿名化占位符避免可识别个人信息。Agent 生成总结时按用户输入如实提取，不强制匿名。

### Input（对话片段示意）

> 面试官：先自我介绍一下吧。  
> 候选人：某985硕士，本科某211，专业前X%，保研。研究方向是计算机视觉与多模态，主要是伪装目标检测（COD）和大模型适配（PEFT），有军工保密项目，拿过机器人大赛全国一等奖、数学建模二等奖。AI 编码用得比较多，用 Claude Code 同时操作 Gemini、Claude、Codex。  
> 面试官：核心项目这块，能详细讲讲？  
> 候选人：针对伪装目标检测做了分层属性调制。冻结 SAM 骨干，用轻量化 Adapter（参数量<1%）做知识迁移，用 FiLM 把物种、环境等语义动态注入 ViT 不同层级。熟悉 MaPLe、AlphaCLIP 等架构。  
> …（工程、编程题部分）

### Output（预期总结风格）

1、某985硕+某211本，专业前X%保研。主要研究方向是计算机视觉与多模态领域，伪装目标检测（COD）与大模型适配（PEFT），有对应的军工保密项目，另外有多个奖项（机器人大赛全国一等奖、数学建模二等奖），AI 编码使用的相对比较深入，用 Claude Code 同时操作 gemini、claude、codex 进行编码。

2、核心项目这块，候选人针对伪装目标检测提出分层属性调制方案。在冻结SAM骨干网络基础上，通过轻量化Adapter（参数量<1%）实现知识迁移。利用FiLM机制将物种、环境、策略等高阶语义动态注入ViT不同层级，实现精准语义对齐。熟悉MaPle、AlphaCLIP等架构，对多模态深度提示对齐有实操经验。

3、工程方面，主导构建某多智能体服务系统。采用RAG架构解决大模型幻觉，设计多路意图识别与多Agent协作工作流。系统累计服务 X 万独立用户，处理咨询 Y 万条。熟悉向量数据库、Prompt调优及低代码Agent开发，对RAG检索失效、分段优化、语义聚类等工程痛点有实际调试经验。

4、编程题（电话号码回溯）实现思路正确，10 分钟左右完成编码。

---

## Error Handling

| 情况 | 处理 |
|------|------|
| 未提供对话内容 | 提示用户粘贴对话或提供文件路径 |
| 文件路径无效/不存在 | 提示检查路径，或请用户粘贴内容 |
| 对话过短、信息不足 | 尽可提取，缺失部分标注「未提及」或简化 |
| 非技术面试（如纯 HR 面） | 按现有模板尽力提取，或提示本 skill 侧重技术面 |
