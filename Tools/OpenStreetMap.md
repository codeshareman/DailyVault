---
title: OpenStreetMap
type: tool-introduction
dc_type: Service
identifier: https://www.openstreetmap.org/
source_type: website
source: https://www.openstreetmap.org/
url: https://www.openstreetmap.org/
canonical_url: https://www.openstreetmap.org/
description: 由志愿者共同维护的开放世界地图与地理数据项目；数据可在署名与相同许可条件下自由使用，为网站、移动应用与硬件设备提供底图数据。
category: data
subject:
- data
- maps
tags:
- kind/tool
- topic/data
- topic/maps
platform: Web
content_scope: open map data and community mapping
creator: OpenStreetMap Foundation
captured_at: '2026-09-16'
last_checked: '2026-09-16'
status: active
---

# OpenStreetMap

[官方网站](https://www.openstreetmap.org/) · [关于](https://www.openstreetmap.org/about) · [版权与许可](https://www.openstreetmap.org/copyright)

## 基本信息

| 项目 | 信息 |
| --- | --- |
| 平台 | Web；数据还用于移动应用与硬件设备 |
| 内容 | 全球道路、步道、POI、铁路站点等地理要素；浏览、编辑、路线规划 |
| 浏览方式 | 官网地图；编辑需账号；数据另可通过导出与第三方工具使用 |
| 数据许可 | Open Data Commons Open Database License（ODbL）；文档为 CC BY-SA 2.0 |
| 运营 | OpenStreetMap Foundation（OSMF）代社区运营相关服务 |

## 它是什么

OpenStreetMap（OSM）是志愿者共建的开放世界地图。贡献者用航拍影像、GPS 与实地核对来维护道路、步道、咖啡馆、铁路站点等数据。官网提供浏览、搜索、路线规划（GraphHopper / OSRM / Valhalla）和编辑入口。数据面向任意用途开放，条件是署名 OpenStreetMap 及其贡献者；若改编或基于数据构建衍生库，须以相同许可分发。

## 为什么值得收藏

- 不绑定单一商业地图商，适合作为 Leaflet、MapLibre 等库的底图与 POI 数据源。
- 本地知识与社区更新快，灾害制图与小众路径（步道、自行车道）往往比封闭底图更完整。
- 许可条款公开、可复用；截图用于书刊、影视一般无需另行申请许可，但仍须按署名规范标注。

## 适合什么时候使用

- 需要开放底图、路网或 POI，且能遵守 ODbL 署名与 Share-Alike 时。
- 评估自建地图栈（渲染、瓦片、地理编码）而不想依赖 Google / 高德等封闭 API 时。
- 参与本地测绘、核对或 Humanitarian mapping 时。

## 我的判断

- **数据开放 ≠ 官方瓦片/API 可免费给第三方无限用。** OSMF 明确不提供面向第三方的免费地图 API 或瓦片服务；用量见 [Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/)、[API Usage Policy](https://operations.osmfoundation.org/policies/api/) 与 Nominatim 政策。自建或使用第三方瓦片提供商（如 Geofabrik、MapTiler）更稳妥。
- 使用数据必须署名并标明 ODbL；衍生数据库通常也要 ODbL。细节以 [版权页](https://www.openstreetmap.org/copyright) 与 OSMF 许可说明为准。
- 与 [[Leaflet]] 常搭配：Leaflet 负责交互渲染，OSM 提供数据或底图；二者不是同一产品。
