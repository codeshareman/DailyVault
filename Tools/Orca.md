---
title: Orca
type: tool-introduction
dc_type: Software
identifier: https://www.onorca.dev/
source_type: website
url: https://www.onorca.dev/
canonical_url: https://www.onorca.dev/
description: 面向 AI 编程 Agent 的开源桌面开发环境（ADE），可在独立 Git worktree 中并行运行 Claude Code、Codex、OpenCode 等 Agent，并集成终端、diff 审查、浏览器与远程运行。
category: ai
subject:
- ai
- agents
- developer-tools
tags:
- kind/tool
- topic/ai
- topic/agents
- topic/developer-tools
platform: Desktop / Web docs
content_scope: multi-agent coding IDE and worktree orchestration
captured_at: '2026-09-15'
last_checked: '2026-09-15'
status: active
source: https://www.onorca.dev/
---

# Orca

[官方网站](https://www.onorca.dev/) · [文档](https://www.onorca.dev/docs)

## 基本信息

| 项目 | 信息 |
| --- | --- |
| 平台 | Desktop（macOS / Windows / Linux）；另有移动端 companion |
| 内容 | 多 Agent 并行开发环境：worktree、终端、diff、内嵌浏览器、CLI、远程服务器 |
| 浏览方式 | 官网介绍与公开文档；软件需本地安装 |
| 许可 | 开源（MIT，以官网 / 仓库声明为准） |
| 定价 | Bring your own agent / subscription；Orca 本身不售托管 VPS |

## 它是什么

Orca 自称 Agent Development Environment（ADE）：把多个 AI 编程 Agent（如 Claude Code、Codex、OpenCode、Cursor CLI 等）放在同一应用里并行运行。每个任务对应独立 Git worktree、Agent 终端与浏览器标签，便于分流试错、审查 diff，再通过 SSH、自托管 Remote Orca Server 或自带云账号上的按需环境把计算挪离本机。

## 为什么值得收藏

- 已付费多套 Agent / CLI 订阅时，可集中编排，而不是在多个终端与分支间手工切换。
- worktree 隔离适合同一问题多 Agent 并行试跑后再择优合并。
- 文档覆盖本地、SSH、Remote Server、Cloud VM 等运行方式，便于评估是否值得引入日常开发循环。

## 适合什么时候使用

- 需要同时开多个编码 Agent，并认真审查其 diff 再合入时。
- 希望 Agent 在远程机器或按需沙箱上跑，同时仍用同一套 IDE 工作流时。

## 我的判断

- 适合作为「多 Agent + worktree」开发环境候选入口；具体安装方式、支持的 Agent 列表与远程能力以 [官网](https://www.onorca.dev/) 和 [文档](https://www.onorca.dev/docs) 实时信息为准。
- 它不是模型提供商，也不替代 Git；算力与 Agent 订阅仍由使用者自备。
