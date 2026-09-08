---
title: Atomic Design
type: clipping
dc_type: Text
identifier: https://bradfrost.com/blog/post/atomic-web-design/
source: https://bradfrost.com/blog/post/atomic-web-design/
canonical_url: https://bradfrost.com/blog/post/atomic-web-design/
description: Brad Frost 提出的设计系统方法：以原子、分子、组织、模板、页面五个层级，从可复用组件构建完整界面。
category: design
subject:
- design
- design-systems
- frontend
tags:
- kind/article
- topic/design
- topic/design-systems
- topic/frontend
creator: Brad Frost
issued: '2013-06-10'
created: '2026-09-01'
last_checked: '2026-09-01'
status: active
bookmark_source_folder: Learn / Industry_Standards
---

> [!abstract] 摘要
> Atomic Design 将界面拆分为原子、分子、组织、模板和页面五个层级。其价值不在于机械套用层级，而在于从小而稳定的可复用单元构建设计系统，并在真实页面中验证组件组合是否有效。

[阅读原文](https://bradfrost.com/blog/post/atomic-web-design/)

## 核心框架

- **原子**：标签、输入框、按钮、颜色、字体和动画等基础元素。
- **分子**：完成单一职责的原子组合，例如表单标签、输入框和按钮构成的搜索表单。
- **组织**：形成明确界面区块的分子组合，例如导航头部或商品网格。
- **模板**：将组织组合为页面结构，用于观察布局与上下文。
- **页面**：以真实内容替换占位内容，用于测试设计系统在实际情境下的效果与变体。

## 适合什么时候回看

- 设计或重构组件库、设计系统、Pattern Library 和多页面产品界面时。

## 适用边界

- 五层模型是沟通与组织框架，不是每个组件都必须归入唯一层级的硬性架构。
- 组件复用不应牺牲业务语义、可访问性、内容结构或真实页面验证。
