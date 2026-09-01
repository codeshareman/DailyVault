---
title: Ollama
type: tool-introduction
dc_type: Software
identifier: https://ollama.com/
source_type: website
url: https://ollama.com/
canonical_url: https://ollama.com/
description: 在本机拉取、运行和调用开放权重模型的运行时，提供 CLI、本地 REST API 与常用语言库。
category: ai
subject:
- ai
- local-ai
tags:
- kind/tool
- topic/ai
- topic/local-ai
platform: macOS / Windows / Linux / Cloud
content_scope: local ai
creator: Ollama Inc.
pricing: 本地运行不按用量收费；云端套餐另有额度与并发限制
update_frequency: ongoing
captured_at: '2026-08-31'
last_checked: '2026-09-01'
status: active
bookmark_source_folder: Tools / For_AI
source: https://ollama.com/
---

# 在本地运行开放权重模型

[Ollama](https://ollama.com/)

## 基本信息

| 项目 | 信息 |
| --- | --- |
| 平台 | macOS、Windows、Linux；另有可选云端服务 |
| 内容 | 模型下载、本地推理、CLI、本地 REST API、Python/JavaScript 库 |
| 浏览方式 | 官网模型库、命令行与本地 API |
| 定价 | 本地运行不按用量收费；云端套餐有额度与并发限制 |
| 创建者 | Ollama Inc. |
| 资源 | [模型库](https://ollama.com/library) · [GitHub](https://github.com/ollama/ollama) · [定价](https://ollama.com/pricing) · [隐私说明](https://ollama.com/privacy) |

## 它是什么

Ollama 是面向本地模型的运行时。它把模型拉取、版本选择、推理服务和 API 调用收敛到一套 CLI 与本地接口中，可供应用、脚本和编码 Agent 调用。官方模型库用于发现不同规模和能力的开放权重模型。

## 为什么值得收藏

- 为本地模型提供统一且低摩擦的运行入口，适合快速验证模型能否满足真实任务。
- 本地推理时提示词与内容无需发送到云端，适合有隐私或离线要求的工作流。
- CLI、本地 REST API 与常用语言库便于从手动试用过渡到应用集成。
- 模型库、运行时和官方仓库职责清晰，不依赖临时公益节点或共享账号。

## 适合什么时候使用

- 需要在本机测试开放权重模型时。
- 想为本地应用或编码 Agent 提供统一模型 API 时。
- 需要比较模型大小、速度、内存占用与任务效果时。
- 数据不适合发送到第三方云端时。

## 使用限制

- 大型模型能否流畅运行取决于本机内存、GPU、模型量化方式与上下文长度。
- 云端模型有会话额度和并发限制，不能把云端 Free 计划理解为无条件永久免费。
- 云端请求与本地离线运行的隐私边界不同；敏感内容应优先使用本地模型，并以官方隐私说明为准。
