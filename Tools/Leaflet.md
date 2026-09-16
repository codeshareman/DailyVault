---
title: Leaflet
type: tool-introduction
dc_type: Software
identifier: https://leafletjs.com/
source_type: website
source: https://leafletjs.com/
url: https://leafletjs.com/
canonical_url: https://leafletjs.com/
description: 面向移动端友好交互地图的开源 JavaScript 库；体积约 42 KB，无外部依赖，可叠加瓦片、标记、矢量与 GeoJSON，并可通过插件扩展。
category: developer-tools
subject:
- developer-tools
- software
tags:
- kind/tool
- topic/developer-tools
- topic/software
platform: Web / Browser
content_scope: interactive maps JavaScript library
creator: Volodymyr Agafonkin
captured_at: '2026-09-16'
last_checked: '2026-09-16'
status: active
---

# Leaflet

[官方网站](https://leafletjs.com/) · [GitHub](https://github.com/Leaflet/Leaflet) · [下载](https://leafletjs.com/download.html) · [API](https://leafletjs.com/reference.html)

## 基本信息

| 项目 | 信息 |
| --- | --- |
| 平台 | 浏览器（桌面与移动端）；无外部依赖 |
| 内容 | 交互地图：瓦片/WMS、标记与弹窗、矢量图层、GeoJSON、图层控件 |
| 浏览方式 | 文档与示例；npm / 官网下载后在页面中引用 |
| 许可 | BSD-2-Clause（以仓库声明为准） |
| 当前版本 | 官网标注 Leaflet 2.0.0-alpha.1（2025-08-16） |

## 它是什么

Leaflet 是用于在网页中构建交互地图的开源 JavaScript 库。它刻意只把基础能力做稳：拖拽平移、滚轮与捏合缩放、标记与弹窗、折线/多边形/圆、图片叠加和 GeoJSON。体积约 42 KB JS，可在主流桌面与移动浏览器上运行，并通过大量 [插件](https://leafletjs.com/plugins.html) 扩展。

## 为什么值得收藏

- 轻量、无依赖，适合在站点或内部工具里快速加一张可交互地图，而不引入重量级 GIS 套件。
- API 与教程完整，瓦片来源可换（如 OSM），图层与控件可自定义。
- 生态成熟：插件覆盖绘制、热力、聚类、底图切换等常见需求。

## 适合什么时候使用

- 需要在 Web 页面展示点、线、面或 GeoJSON，并支持缩放、点击弹窗时。
- 希望自己选底图与数据源，而不是绑定某一家地图 SaaS 时。
- 移动端也要流畅拖拽与捏合缩放时。

## 我的判断

- Leaflet 本身不提供地图数据；底图、地理编码与路线需另接 OSM、商业瓦片或其他服务，并遵守其版权与用量条款。
- 复杂 3D、矢量瓦片或完整 GIS 分析可另评 MapLibre GL、OpenLayers 等；基础二维交互地图仍是 Leaflet 的强项。
- 2.x 仍处 alpha，生产环境版本与破坏性变更以 [官网](https://leafletjs.com/) 与 [GitHub](https://github.com/Leaflet/Leaflet) 为准。
