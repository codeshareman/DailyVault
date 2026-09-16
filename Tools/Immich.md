---
title: Immich
type: tool-introduction
dc_type: Software
identifier: https://github.com/immich-app/immich
source_type: website
url: https://github.com/immich-app/immich
canonical_url: https://immich.app/
description: 高性能自托管照片与视频管理方案，提供移动端自动备份、时间线、相册分享、地图、人脸识别与 CLIP 语义搜索等，常被用作 Google Photos 的开源替代。
category: software
subject:
- software
- ai
tags:
- kind/tool
- topic/software
- topic/ai
platform: Self-hosted / iOS / Android / Web
content_scope: self-hosted photo and video library with mobile backup and ML search
captured_at: '2026-09-15'
last_checked: '2026-09-15'
status: active
source: https://github.com/immich-app/immich
---

# Immich

[官方网站](https://immich.app/) · [GitHub](https://github.com/immich-app/immich)

## 基本信息

| 项目 | 信息 |
| --- | --- |
| 平台 | 自托管服务；iOS / Android App；Web |
| 内容 | 照片与视频备份、浏览、相册、分享、地图、人脸/物体/CLIP 搜索 |
| 浏览方式 | 官网与文档；自行部署后通过 Web / App 使用 |
| 许可 | AGPL-3.0（以仓库声明为准） |
| 部署 | 官方推荐 Docker Compose |

## 它是什么

Immich 是开源的高性能自托管照片与视频管理系统。目标体验接近 Google Photos：手机端可自动备份、去重，Web / App 提供时间线、多用户、相册与分享、EXIF / 地图、Live Photo、人脸聚类，以及基于元数据、物体和 CLIP 的搜索。媒体原件落在你自己控制的存储上，需自行备份媒体文件与数据库。

## 为什么值得收藏

- 想把相册从公有云迁回自建栈时，它是功能最完整、社区最活跃的候选之一。
- 原生移动端后台备份是相对 PhotoPrism 等方案的关键优势。
- 本地机器学习能力（人脸、语义搜索）减少对第三方云识图的依赖。

## 适合什么时候使用

- 需要家庭或个人私有相册，并希望手机持续自动上传时。
- 评估自托管 Google Photos 替代（相对 Ente 的端到端加密、PhotoPrism 的库整理取向）时。

## 我的判断

- 适合作为自托管相册的主候选入口；具体版本、硬件占用、备份要求与破坏性变更以 [GitHub](https://github.com/immich-app/immich) 与 [官网](https://immich.app/) 为准。
- 部署与运维成本高于纯云相册：需要稳定机器、存储规划，以及媒体与 PostgreSQL 的完整备份策略。
- 若硬性要求服务端也无法读取内容的端到端加密，应另行评估 Ente 等方案。
