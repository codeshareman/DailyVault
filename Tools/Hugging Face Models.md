---
title: Hugging Face Models
type: tool-introduction
dc_type: Service
identifier: https://huggingface.co/
source_type: website
url: https://huggingface.co/models
canonical_url: https://huggingface.co/
description: 用于发现模型、权重、模型卡、许可证与生态格式的社区模型目录。
category: ai
subject:
- ai
- models
tags:
- kind/tool
- topic/ai
- topic/models
platform: Web / API / SDK
content_scope: ai model discovery
creator: Hugging Face
pricing: 模型目录可公开浏览；下载、托管与推理服务按具体模型和服务条款执行
update_frequency: ongoing
captured_at: '2026-08-31'
last_checked: '2026-09-01'
status: active
bookmark_source_folder: Tools / For_AI
source: https://huggingface.co/models
---

# 查找模型、权重与模型卡

[Hugging Face Models](https://huggingface.co/models)

## 基本信息

| 项目 | 信息 |
| --- | --- |
| 平台 | Web、API、SDK |
| 内容 | 模型目录、权重、模型卡、任务与格式筛选、许可证信息 |
| 浏览方式 | 按任务、库、格式、推理提供商或硬件筛选 |
| 定价 | 目录可公开浏览；托管和推理服务按具体方案执行 |
| 创建者 | Hugging Face |
| 资源 | [Models](https://huggingface.co/models) · [Hub 文档](https://huggingface.co/docs/hub/en/models-the-hub) · [模型卡说明](https://huggingface.co/docs/hub/en/model-cards) · [安全说明](https://huggingface.co/docs/hub/en/security) |

## 它是什么

Hugging Face Models 是 Hugging Face Hub 的模型发现入口。它汇集社区与组织发布的模型权重、模型卡和元数据，可按任务、生态库、文件格式、硬件与推理提供商进行筛选。卡片的核心用途是发现和审阅模型，不把它描述成永久免费推理服务。

## 为什么值得收藏

- 可在同一入口比较 GGUF、MLX、Transformers、Diffusers、Ollama 等生态格式。
- 模型卡通常包含预期用途、训练与评测信息、限制及许可证，是下载前的必要审阅入口。
- 适合从宽泛搜索收敛到具体模型、版本和权重文件，再进入本地或云端验证。
- 与 Ollama 的本地运行、OpenRouter 的云 API 路由边界不同，三者不重复。

## 适合什么时候使用

- 需要为本地推理或研究寻找模型与权重时。
- 需要核对模型用途、版本、许可证和发布者说明时。
- 想按任务、格式或硬件兼容性缩小候选范围时。
- 需要定位模型的官方组织页、仓库或社区讨论时。

## 使用限制

- 模型卡和元数据主要由发布者维护，不能自动视为平台对质量、安全或权利状态的担保。
- 下载和运行前仍需逐模型核对来源、许可证、版本、文件格式与资源需求。
- 平台扫描可以降低恶意文件、pickle 和 secrets 风险，但不能消除供应链风险。
- Inference Providers 的免费额度与服务可用性会变化，不应作为收藏该入口的主要理由。
