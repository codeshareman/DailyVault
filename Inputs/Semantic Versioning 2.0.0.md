---
title: 语义化版本 2.0.0
type: clipping
dc_type: Text
identifier: https://semver.org/lang/zh-CN/
source: https://semver.org/lang/zh-CN/
canonical_url: https://semver.org/lang/zh-CN/
description: Semantic Versioning 2.0.0 中文规范：以主版本、次版本和修订号表达公共 API 的不兼容修改、兼容功能与兼容修复。
category: software-engineering
subject:
- software-engineering
- versioning
tags:
- kind/article
- topic/software-engineering
- topic/versioning
creator: Tom Preston-Werner；中文翻译 Wayou Liu
created: '2026-08-31'
last_checked: '2026-09-01'
status: active
bookmark_source_folder: Learn / Industry_Standards
---

> [!abstract] 摘要
> SemVer 以 `主版本号.次版本号.修订号` 表达软件公共 API 的变化：不兼容修改递增主版本，向下兼容的新功能递增次版本，向下兼容的修复递增修订号。先行版本和构建信息使用规范化后缀表示。

[阅读中文规范](https://semver.org/lang/zh-CN/)

## 核心规则

- 软件必须先定义清晰的公共 API，版本号才有可解释的语义。
- 已发布版本的内容不得被修改；任何变化都应发布新版本。
- `0.y.z` 表示初始开发阶段，公共 API 不应视为稳定。
- 主版本用于不兼容 API 修改；次版本用于兼容功能与弃用声明；修订号用于兼容修复。
- 先行版本优先级低于对应正式版本；构建信息不参与优先级比较。

## 适合什么时候回看

- 设计发布策略、判断 breaking change、管理依赖区间或记录弃用时。

## 适用边界

- SemVer 描述版本号语义，不自动保证发布者真的遵守兼容性承诺。
- 没有明确公共 API 的产品，不能仅凭版本号推断升级风险。
