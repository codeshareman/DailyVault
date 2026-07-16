---
status: done
story_key: 3-1-daily-clipping-projection-extension-design
story_id: DV-3.1
epic: DV-3
title: 设计 Daily/Clipping projection 扩展
created: 2026-07-16
completed: 2026-07-16
source_epics: _bmad-output/planning-artifacts/epics-and-stories.md
source_sprint: _bmad-output/implementation-artifacts/sprint-status.yaml
owner: DEV
---

# Story DV-3.1：设计 Daily/Clipping projection 扩展

## 状态

`done`

## 用户故事

作为 DailyVault 维护者，我希望 Daily/Clipping 只有在存在显式公开摘要投影时才能生成候选，这样原始日记或剪藏正文不会被直接交给 ZNorth。

## 设计决策

1. Daily/Clipping 不能直接用 raw body 生成 `summary.digestSummary`。
2. Daily projection 必须来自已审查公开摘要块或结构化公开导出记录，且具备 `visibility: summary | public`、`analysis_allowed: true`、`public_summary`、`public_risk_level` 等等价字段。
3. Clipping projection 必须由 Source 或 Daily 明确引用，并通过 Source/Daily 提供公开摘要和授权；不能从 `Clippings/` 正文自行抽取摘要。
4. 后续 `source.kind` 可使用 ZNorth 允许的 `daily` 或 `clipping`，但必须复用 `Server/src/bridge/znorth-envelope.js` 的 mapper 接口，不能在 HTTP/MCP 中新增分叉逻辑。
5. Daily/Clipping 扩展进入代码前，应先增加公开投影数据结构，而不是扩大现有 Daily 模板或 Clippings 格式。

## 验收证据

- 现有实现仍只支持 Source 首版，没有扩展 Daily/Clipping direct promotion。
- `Server/src/bridge/promotion-batch.js` 仅扫描 `Sources/`，没有读取 Daily/Clipping raw body。
- `Server/src/bridge/znorth-envelope.js` 的 mapper 已可作为后续 `source.kind` 扩展点。
- `cd Server && npm run check` 已通过，26 个测试全部通过。

## 后续开发门槛

Daily/Clipping 代码实现必须另起 story，并先定义公开投影 frontmatter 或结构化公开导出记录；不得把 Daily/Clipping body fallback 接入 ZNorth promotion。
