---
status: done
story_key: 3-2-local-dry-run-report-and-minimal-incremental-state
story_id: DV-3.2
epic: DV-3
title: 提供本地 dry-run report 与最小增量状态
created: 2026-07-16
completed: 2026-07-16
source_epics: _bmad-output/planning-artifacts/epics-and-stories.md
source_sprint: _bmad-output/implementation-artifacts/sprint-status.yaml
owner: DEV
---

# Story DV-3.2：提供本地 dry-run report 与最小增量状态

## 状态

`done`

## 用户故事

作为维护者，我希望批量候选生成可以 dry-run 并解释扫描/跳过/更新原因，这样我能审查候选输出而不写任何下游状态。

## 实现摘要

- 新增 `Server/src/bridge/promotion-batch.js`。
- 新增 HTTP endpoint：`POST /promotions/candidate/dry-run`。
- 新增 MCP tool：`dailyvault.dry_run_candidate_promotions`。
- dry-run report 返回 `scanned`、`eligible`、`rejected`、`unchanged`、`changed` 计数和逐项机器可读结果。
- `save_state: true` 时只写 `Server/state/znorth-promotion-state.json`。
- state entries 只保存 `source_ref`、`digest`、`last_result`、`timestamp`，不保存 Source body、summary、title 或本地路径。
- HTTP `save_state` 只能接受真实布尔值；字符串 `"false"` 会被拒绝，避免误写 state。

## 验收证据

- `Server/tests/promotion.test.js` 覆盖 changed/rejected/unchanged 计数。
- `Server/tests/promotion.test.js` 覆盖 state 只包含 `source_ref`、`digest`、`last_result`、`timestamp`。
- `Server/tests/promotion.test.js` 覆盖 HTTP dry-run report。
- `Server/tests/promotion.test.js` 覆盖 HTTP dry-run 拒绝字符串 `save_state` 且不创建 state 文件。
- `cd Server && npm run check` 已通过，28 个测试全部通过。

## 非目标回查

- 未实现定时调度。
- 未写 ZNorth。
- 未创建第二份内容数据库；state 只保存增量比较所需的最小投影指纹。
