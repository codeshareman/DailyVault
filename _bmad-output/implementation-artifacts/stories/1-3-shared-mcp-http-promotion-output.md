---
status: done
story_key: 1-3-shared-mcp-http-promotion-output
story_id: DV-1.3
epic: DV-1
title: 统一 MCP 与 HTTP promotion 输出路径
created: 2026-07-16
completed: 2026-07-16
source_epics: _bmad-output/planning-artifacts/epics-and-stories.md
source_sprint: _bmad-output/implementation-artifacts/sprint-status.yaml
owner: DEV
---

# Story DV-1.3：统一 MCP 与 HTTP promotion 输出路径

## 状态

`done`

## 用户故事

作为 agent/API 使用者，我希望 MCP `dailyvault.promote_candidate` 与 HTTP `/promotions/candidate` 产生同一 ZNorth envelope，这样不同入口不会出现字段漂移。

## 实现摘要

- `Server/src/http/server.js` 继续通过 `promoteCandidate()` 返回 ZNorth envelope。
- `Server/src/mcp/server.js` 继续通过 `promoteCandidate()` 返回同一结果。
- `Server/src/bridge/promotion.js` 的 `dry_run: false` 只写 DailyVault 本地 audit，audit 不记录 `source_path` 或 Source body。
- 新增 `POST /promotions/candidate/dry-run` 与 `dailyvault.dry_run_candidate_promotions`，二者复用 `dryRunCandidatePromotions()`。

## 验收证据

- `Server/tests/promotion.test.js` 覆盖 HTTP `/promotions/candidate` 与直接 `promoteCandidate()` envelope 一致。
- `Server/tests/promotion.test.js` 覆盖 `dry_run: false` audit 不含 Source body、`source_path` 或 Source path。
- `cd Server && npm run check` 已通过，26 个测试全部通过。

## 非目标回查

- 未写入 ZNorth。
- 未在 HTTP route 中复制 mapper 分支。
