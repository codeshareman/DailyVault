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

# AI Visual Diff SOP

## 背景

- AI Browser 迭代很快，不能把流程绑死在某一个 Agent 上。
- Applitools、Percy 这类商业 SaaS 能解决问题，但成本和锁定风险都偏高。
- 这套流程要服务长期演进的 AI 开发平台，因此底座优先选择开源、自托管、可替换的工具。

## 目标

搭一条低成本的设计质量检查流水线：自动打开页面，采集截图和结构化信息，做视觉差异对比，再由 AI 按设计知识库给出 Review 结论。流水线输出 PR 评论和可追溯报告，不依赖单一商业服务。

## 总体架构

| 层级 | 职责 | 首选工具 | 可替换方案 | 成本判断 |
| --- | --- | --- | --- | --- |
| L1 | 页面自动化 | Playwright | Puppeteer | 免费 |
| L2 | Browser Agent | ego lite / agent-browser | Browser Use | 免费 |
| L3 | Visual Diff | Argos 自托管 + Pixelmatch | LooksSame / Resemble.js | 免费 |
| L4 | AI Orchestrator | Skills / Prompt Router | LangGraph / 自研脚本 | 免费到可控 |
| L5 | AI Review | 本地模型 + 高质量模型兜底 | Qwen / GLM / Claude / GPT | 可控 |
| L6 | Report | GitHub Actions + Markdown | Gitea CI | 免费 |
| L7 | Artifact | Allure Report / HTML Report | 静态站点 | 免费 |
| L8 | Design Knowledge | Markdown 知识库 | 组件规范 / Token 文档 | 免费 |

核心原则：采集层、对比层、报告层尽量免费；只有关键 Review 才调用高质量模型。

## 流程

```text
Playwright
  -> Browser Agent
  -> Artifacts（Screenshot / DOM / A11y / Tokens）
  -> Visual Diff
  -> AI Orchestrator
  -> AI Reviewers
  -> Issue Aggregator
  -> PR Comment / HTML Report
```

## L1：页面自动化

Playwright 负责稳定采集页面状态。

采集范围：

- 页面遍历
- 登录态恢复
- 状态切换
- Hover / Focus
- Dark Mode
- Responsive 断点
- Screenshot
- Accessibility Snapshot
- Console Log
- Network Log

标准输出：

```text
artifacts/
  screenshots/
  dom.json
  a11y.json
  console.log
  network.log
```

这一层只负责事实采集，不做审美判断。

## L2：Browser Agent

Browser Agent 负责更长的交互流程，例如登录、切换状态、批量打开页面、模拟真实用户路径。

优先级：

1. ego lite：适合真实浏览器、登录态、长流程。
2. agent-browser：适合接入 Codex、Claude Code、Cursor 等开发环境。
3. Browser Use：Python 生态成熟，适合 LangGraph、CrewAI 等 Agent Workflow。
4. Open Operator 类运行时：保持观察，不作为当前架构硬依赖。

约束：Browser Agent 只能产出可复现步骤和采集结果，不直接给设计结论。

## L3：Visual Diff

视觉差异对比不必默认购买商业 SaaS。先用开源工具覆盖主流程。

### Argos 自托管

适合作为 PR 级视觉回归入口。

- 支持 GitHub Action
- 支持 Playwright
- 支持 PR Diff
- 可自托管

### Pixelmatch

适合做底层像素差异计算。

```text
before.png
  -> pixelmatch
after.png
  -> diff.png
```

### LooksSame / Resemble.js

适合补充处理抗锯齿、字体渲染、细微颜色差异。

Visual Diff 只回答“哪里变了”，不回答“这样好不好”。后者交给 AI Review。

## L4：AI Orchestrator

AI Orchestrator 放在 Visual Diff 和 AI Review 之间，负责分发材料和合并结论。

输入：

- Screenshot
- Diff Image
- DOM Snapshot
- A11y Snapshot
- Design Tokens
- Component Spec
- Design Knowledge

输出：

- 按问题类型拆分的 Review 任务
- 去重后的 Issue 列表
- PR 评论摘要
- 报告页数据

示例结构：

```text
AI Orchestrator
  ├── Layout Reviewer
  ├── Typography Reviewer
  ├── Color Reviewer
  ├── Component Reviewer
  ├── Accessibility Reviewer
  ├── Interaction Reviewer
  └── UX Reviewer
```

每个 Reviewer 对应一个独立 Skill。规则可以单独维护，避免一个大 Prompt 同时处理所有问题。

## L5：AI Review

AI Review 负责判断视觉变化是否符合设计预期。

输入组合：

```text
Screenshot
+ Diff Image
+ DOM
+ Design Token
+ Component Spec
+ Knowledge Rule
-> LLM Review
```

模型分级：

| 等级 | 模型来源 | 使用场景 |
| --- | --- | --- |
| Level 1 | 本地模型，如 Qwen、GLM、DeepSeek、Llama | 第一轮筛查 |
| Level 2 | Cloudflare Workers AI / 开源推理服务 | 普通 PR |
| Level 3 | Claude / GPT | main、release、design review |

默认走 Level 1 或 Level 2。只有高风险改动才进入 Level 3。

## L6：Report

报告不需要 SaaS。先用 Markdown 和 CI 原生能力。

输出路径：

```text
reports/
  Home.md
  Login.md
  Dashboard.md
```

PR 评论包含：

- 变更页面
- 截图链接
- Diff 链接
- AI Review 结论
- 阻断项
- 非阻断建议

## L7：HTML Report

Allure 适合作为本地和 CI 的可视化报告入口。

报告结构：

```text
Overview
  -> Failed Cases
  -> Screenshots
  -> Diff Images
  -> AI Comments
  -> Raw Artifacts
```

如果 Allure 太重，可以退回静态 HTML Report。

## L8：Design Knowledge

Design Knowledge 是长期质量的关键层。AI Review 不应该直接问“这个页面好吗”，而应该读取具体规则。

建议目录：

```text
knowledge/
  spacing.md
  typography.md
  button.md
  color.md
  card.md
  modal.md
  layout.md
```

Review 示例：

```text
Button Reviewer 读取 knowledge/button.md
Color Reviewer 读取 knowledge/color.md
Layout Reviewer 读取 knowledge/layout.md
UX Reviewer 汇总用户路径和交互问题
```

这样可以把设计判断沉淀成规则，而不是每次重新写 Prompt。

## 推荐落地版本

第一版只保留必要链路：

1. Playwright 采集截图、DOM、A11y。
2. Argos 自托管承接 PR 视觉回归。
3. Pixelmatch 生成 diff 图。
4. Markdown 知识库提供设计规则。
5. 本地模型做第一轮 Review。
6. 关键 PR 再调用 Claude 或 GPT。
7. GitHub Actions 生成 PR 评论。
8. Allure 或静态 HTML 保存完整报告。

## 阻断规则

出现以下问题时阻断 PR：

- 主流程页面明显错位。
- 关键按钮、输入框、导航不可见或不可用。
- 颜色、字号、间距偏离设计规范且影响识别。
- 可访问性快照显示关键控件缺少名称。
- Diff 覆盖核心业务区域，且没有设计变更说明。

以下问题只作为建议：

- 轻微像素偏移。
- 字体渲染差异。
- 非关键区域的小幅间距变化。
- 文案或图标微调。

## 下一步

- [ ] 选 3 个核心页面做 Playwright 采集样例。
- [ ] 自托管 Argos，跑通一次 PR Diff。
- [ ] 写第一版 `knowledge/button.md`、`knowledge/color.md`、`knowledge/layout.md`。
- [ ] 定义 Review 输出 JSON Schema。
- [ ] 生成 GitHub PR 评论模板。

