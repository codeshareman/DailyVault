---
title: OpenRouter
type: tool-introduction
dc_type: Service
identifier: https://openrouter.ai/
source_type: website
url: https://openrouter.ai/
canonical_url: https://openrouter.ai/
description: 通过统一兼容 API 访问和路由多家模型提供商，并比较模型能力、价格、上下文与端点属性。
category: ai
subject:
- ai
- llm-api
tags:
- kind/tool
- topic/ai
- topic/llm-api
platform: Web / API
content_scope: ai inference platforms
creator: OpenRouter
pricing: 按模型与提供商计费；免费模型池有频率、可用性与选模限制
update_frequency: ongoing
captured_at: '2026-08-31'
last_checked: '2026-09-01'
status: active
bookmark_source_folder: Tools / For_AI
source: https://openrouter.ai/
---

# 用统一 API 路由多家模型提供商

[OpenRouter](https://openrouter.ai/)

## 基本信息

| 项目 | 信息 |
| --- | --- |
| 平台 | Web、API |
| 内容 | 模型目录、兼容 API、提供商路由、价格与端点属性 |
| 浏览方式 | 网站筛选与 Models API；通过兼容接口接入应用 |
| 定价 | 按模型与提供商计费；免费池有额度和可用性限制 |
| 创建者 | OpenRouter |
| 资源 | [模型目录](https://openrouter.ai/models) · [模型说明](https://openrouter.ai/docs/guides/overview/models) · [提供商路由](https://openrouter.ai/docs/guides/routing/provider-selection) · [数据收集说明](https://openrouter.ai/docs/guides/privacy/data-collection) |

## 它是什么

OpenRouter 提供统一的 OpenAI 兼容 API，并在多家模型与上游提供商之间执行路由。模型目录和 API 可用于比较上下文、能力、价格、吞吐与端点属性；请求可约束提供商、回退策略和部分数据政策。

## 为什么值得收藏

- 用一个接口评估和接入多家模型，减少每家供应商分别适配的成本。
- 模型目录适合在能力、上下文、价格和端点条件之间做初步筛选。
- 路由与回退适合验证多提供商可用性，而不是依赖单一公益节点。
- 与 Hugging Face 的权重发现、Ollama 的本地运行形成不同层次的入口。

## 适合什么时候使用

- 开发需要切换或比较多个模型提供商的应用时。
- 需要按价格、吞吐、上下文和能力筛选云端模型时。
- 想为单一模型设置多提供商回退时。
- 需要用统一接口完成短期基准或兼容性验证时。

## 使用限制

- 默认路由可能在多个上游提供商间切换；实际性能、留存政策和训练政策取决于最终提供商。
- 免费模型池会变化，存在较低 rate limit、暂时不可用、高延迟和不能固定选模等限制。
- 敏感工作负载应审阅并约束 provider、数据收集与 ZDR 设置；插件和外部工具有独立边界。
- 目录价格与端点属性适合筛选，但最终成本和条款仍应以上游供应商及实际账单为准。
