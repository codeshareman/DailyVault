---
title: exif-photo-blog
type: tool-introduction
dc_type: Software
identifier: https://github.com/sambecker/exif-photo-blog
source_type: website
source: https://github.com/sambecker/exif-photo-blog
url: https://github.com/sambecker/exif-photo-blog
canonical_url: https://photos.sambecker.com/
description: Next.js 开源摄影博客：每张图展示光圈、快门、ISO 等 EXIF，可按标签、机身、镜头、富士配方与胶片模拟组织；官方示例站为 photos.sambecker.com。
category: software
subject:
- software
- photography
tags:
- kind/tool
- topic/software
- topic/photography
platform: Web / Vercel
content_scope: EXIF-aware photo blog template
creator: Sam Becker
captured_at: '2026-09-16'
last_checked: '2026-09-16'
status: active
---

# exif-photo-blog

[GitHub](https://github.com/sambecker/exif-photo-blog) · [示例站](https://photos.sambecker.com/) · [图库总览](https://photos.sambecker.com/library)

## 基本信息

| 项目 | 信息 |
| --- | --- |
| 平台 | Web；官方路径是 Vercel + Postgres + Blob，也可接 AWS S3、Cloudflare R2、MinIO |
| 内容 | 带 EXIF 的照片博客：上传、标签、无限滚动、搜索、RSS、富士配方与胶片模拟 |
| 浏览方式 | 公开站点浏览；管理后台 `/admin` 需自配账号 |
| 许可 | 仓库根目录无 LICENSE 文件；使用前自行核验 |
| 技术栈 | Next.js（App Router）、TypeScript、PostgreSQL |

## 它是什么

exif-photo-blog 是 Sam Becker 的开源摄影博客模板。上传照片时抽取相机 EXIF（光圈、快门、ISO、镜头等），并按标签、年份、机身、镜头、富士配方与胶片模拟分组。内置登录、CMD-K 搜索、自动 OG 图、明暗主题、RSS/JSON feed，以及可选的 AI 文案。官方 Demo 是 [photos.sambecker.com](https://photos.sambecker.com/)；README 还列出 birdnerd.photo、booshie.photo 等第三方示例。

## 为什么值得收藏

- 把「看照片」和「看拍摄参数」放在同一套界面，适合作品集，而不是全家桶备份。
- 一键 clone 到 Vercel（需 Postgres + 公开 Blob）；存储可换成 S3 / R2 / MinIO。
- 对富士用户较友好：胶片模拟与配方会写入 Makernote，可在侧栏和 CMD-K 里筛选。

## 适合什么时候使用

- 要自建带 EXIF 的公开摄影站，而不是用 [[Immich]] 做私有备份时。
- 想对照机身、镜头、胶片模拟或配方来浏览照片时。
- 评估 Next.js 图库模板、或对照 [photos.sambecker.com/library](https://photos.sambecker.com/library) 看成品时。

## 我的判断

- 这是**博客模板**，不是 Google Photos / Immich。私有相册备份仍看 [[Immich]]。
- 默认绑定 Vercel；自托管见仓库 FAQ（issue #116、#132）。FAQ 写明标为 private 的路径仍可能通过原始资源 URL 被访问。
- 不支持 HEIC 直出（依赖 sharp / next/image）；iOS 上编辑过的富士文件可能丢掉 Makernote。生产前核验带宽、缓存与存储策略。
