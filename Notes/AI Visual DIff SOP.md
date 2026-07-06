---
note_id: dv_note_202607061053_ai-visual-diff-sop
date: 2026-07-06
week: "2026-W28"
month: "2026-07"
quarter: "2026-Q3"
year: 2026
time: "10:53"
module: Notes
note_type: fleeting-note
status: inbox
tags: []
interest_tags: []
visibility: private
related_daily: "[[Daily/20260706]]"
reviewed: false
---

# AI Visual DIff SOP

## 内容

## 关联

- AI Browser 这个领域变化太快（几个月就会出现新的 Agent）。
- 商业 SaaS（Applitools、Percy 等）成本较高，容易被锁定。
- 你的目标是构建一套可长期演进的 AI 开发平台（之前讨论的 Codex + Skills + Knowledge + Invest-OS 等），开源生态更适合作为底座。

我会把整套 SOP 调整成下面这样。

---

# AI Design QA OSS Stack (Low Cost Edition)

| Layer | 职责          | 推荐（★★★★★）                    | 备选             | 是否免费             |
| ----- | ------------- | -------------------------------- | ---------------- | -------------------- |
| L1    | 页面遍历      | Playwright                       | Puppeteer        | ✅                   |
| L2    | Browser Agent | ego lite、agent-browser          | Browser Use      | ✅                   |
| L3    | Visual Diff   | Argos（自托管）                  | Loki、Pixelmatch | ✅                   |
| L4    | AI Review     | GPT-5 / Claude（可替换本地模型） | Qwen、Kimi、GLM  | ⚠️（模型可能有成本） |
| L5    | Report        | GitHub Actions + Markdown        | Gitea CI         | ✅                   |
| L6    | Artifact      | Allure Report                    | HTML Report      | ✅                   |

除了 L4 的大模型推理成本，其余几乎都可以做到免费、自托管。

---

# Layer 1：Playwright（必须）

仍然建议使用 **Playwright**。

负责：

- 页面遍历
- 登录
- 状态切换
- Hover
- Focus
- Dark Mode
- Responsive
- Screenshot
- Accessibility Snapshot

输出：

```text
screenshots/
dom.json
a11y.json
console.log
network.log
```

它是整个流水线的数据采集层。

---

# Layer 2：Browser Agent（推荐）

这里变化最快。

目前我建议优先关注：

### ⭐⭐⭐⭐⭐ ego lite

适合：

- 长流程
- 登录态
- 真实浏览器

---

### ⭐⭐⭐⭐⭐ agent-browser

适合：

- Codex
- Claude Code
- Cursor
- 自动执行

---

### ⭐⭐⭐⭐ Browser Use

Python 生态成熟。

适合：

- Agent Workflow
- LangGraph
- CrewAI

---

### ⭐⭐⭐⭐ Open Operator（持续关注）

这一类 AI Browser Runtime 很可能未来会快速发展，建议保持关注，而不是把架构绑定到单一实现。

---

# Layer 3：Visual Diff（完全可以不用商业产品）

很多人第一反应是：

> Applitools

其实未必需要。

推荐：

## ⭐⭐⭐⭐⭐ Argos（自托管）

优点：

- GitHub Action
- Playwright
- PR Diff
- 自托管

足够企业使用。

---

## ⭐⭐⭐⭐ Pixelmatch

GitHub 上非常经典。

原理：

```text
before.png

↓

pixelmatch

↓

after.png

↓

diff.png
```

几乎零成本。

---

## ⭐⭐⭐⭐ LooksSame

适合：

- 忽略 Anti-Alias
- 忽略字体细微差异

---

## ⭐⭐⭐⭐ Resemble.js

老牌工具。

很多 CI 都在用。

---

所以：

商业产品完全可以不用。

---

# Layer 4：AI Review（真正需要花钱的地方）

这一层决定整个系统质量。

建议：

```
Screenshot

+

DOM

+

Design Token

+

Component Spec

↓

LLM
```

如果想降低成本，可以做模型分级。

## Level 1（免费）

本地模型：

- Qwen3
- GLM
- DeepSeek
- Llama

负责：

- 第一轮 Review

---

## Level 2（便宜）

例如：

- Cloudflare Workers AI
- 开源推理服务

负责：

- 普通 PR

---

## Level 3（高质量）

例如：

- GPT-5
- Claude

只在：

```
main

release

design review
```

时触发。

这样一年能省很多成本。

---

# Layer 5：Report

不用 SaaS。

直接：

```text
Markdown

↓

GitHub Comment

↓

GitHub Check

↓

Artifacts
```

即可。

例如：

```text
reports/

Home.md

Login.md

Dashboard.md
```

PR 自动评论。

---

# Layer 6：HTML Report

推荐：

**Allure**

效果：

```
Overview

↓

Failed

↓

Screenshots

↓

Diff

↓

AI Comment
```

开发体验很好。

---

# 我还会增加一个 Layer：Design Knowledge（这是很多团队缺失的一层）

这也是最值得投入的地方。

```text
knowledge/

spacing.md

typography.md

button.md

color.md

card.md

modal.md

```

AI Review 时：

不是直接问：

> 这个页面好吗？

而是：

读取：

```
knowledge/button.md

knowledge/color.md

knowledge/layout.md
```

然后：

```
Button Reviewer

↓

Color Reviewer

↓

Layout Reviewer

↓

UX Reviewer
```

每个 Reviewer 都有自己的规则。

这比一个大 Prompt 准确得多，也与你一直在构建的知识库体系非常契合。

---

# 成本最低的最终推荐方案

| Layer          | 工具                                    | 成本    |
| -------------- | --------------------------------------- | ------- |
| 页面自动化     | Playwright                              | 🟢 免费 |
| Browser Agent  | ego lite / agent-browser                | 🟢 免费 |
| Visual Diff    | Argos + Pixelmatch                      | 🟢 免费 |
| AI Review      | 本地模型（Qwen 等）+ GPT-5（仅关键 PR） | 🟡 可控 |
| Report         | GitHub Actions + Markdown               | 🟢 免费 |
| Dashboard      | Allure Report                           | 🟢 免费 |
| Knowledge Base | Markdown + Skills + Prompt              | 🟢 免费 |

## 我建议再增加一个 AI Orchestrator 层

结合你之前构建 **Skills**、**Knowledge**、**Codex** 的思路，我认为还应该在 L4 前增加一个**编排层（Orchestrator）**：

```text
Playwright
        │
        ▼
Browser Agent
        │
        ▼
Artifacts（截图 / DOM / A11y / Tokens）
        │
        ▼
AI Orchestrator
        ├── Layout Reviewer
        ├── Typography Reviewer
        ├── Color Reviewer
        ├── Component Reviewer
        ├── Accessibility Reviewer
        ├── Interaction Reviewer
        └── UX Reviewer
        │
        ▼
Issue Aggregator
        │
        ▼
GitHub PR Comment
```

这样，每个 Reviewer 都是一个独立的 Skill，可以单独维护、升级和复用，而不是依赖一个庞大的 Prompt。这种模块化架构更符合长期维护和持续演进的需求，也与你现有的知识库设计方向保持一致。

## 下一步

- [ ]
