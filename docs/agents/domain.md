---
title: 领域文档
type: documentation
dc_type: Text
identifier: dailyvault:docs/agents/domain.md
description: Repository agent configuration and operating guidance.
category: operations
subject:
- operations
- agent-configuration
tags:
- topic/operations
- topic/agent-configuration
last_checked: '2026-09-01'
status: active
---

# 领域文档

本文件规定工程技能在探索代码库时如何读取本仓库的领域文档。

## 布局

本仓库采用 **single-context** 布局：

- 根目录：`CONTEXT.md`
- 架构决策：`docs/adr/`

`CONTEXT.md` 和 `docs/adr/` 在领域术语或决策得到确认时按需创建；本次配置不创建空占位文件。

## 探索前需要读取

- 根目录的 **`CONTEXT.md`**。
- **`docs/adr/`** 中与即将修改区域有关的 ADR。

如果这些路径不存在，**直接继续，不作提示**。不要报告缺失，也不要建议预先创建。`/domain-modeling` 技能会在领域术语或决策实际确定后按需创建它们。

## 使用 glossary 中的词汇

当输出需要命名领域概念时，例如 issue 标题、重构提案、假设或测试名称，应使用 `CONTEXT.md` 定义的术语。不要改用 glossary 明确排除的同义词。

如果 glossary 尚未包含所需概念，应重新判断是否正在发明项目未使用的语言；若确属领域缺口，则通过 `/domain-modeling` 记录。

## 标明与 ADR 的冲突

如果输出与现有 ADR 冲突，应明确指出，而不是静默覆盖：

> _与 ADR-0007（事件溯源订单）冲突，但值得重新讨论，因为……_
