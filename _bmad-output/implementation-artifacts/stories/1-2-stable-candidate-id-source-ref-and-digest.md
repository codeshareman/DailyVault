---
status: done
story_key: 1-2-stable-candidate-id-source-ref-and-digest
story_id: DV-1.2
epic: DV-1
title: 实现稳定 candidateId、opaque source.ref 与 sanitized digest
created: 2026-07-16
completed: 2026-07-16
source_epics: _bmad-output/planning-artifacts/epics-and-stories.md
source_sprint: _bmad-output/implementation-artifacts/sprint-status.yaml
owner: DEV
---

# Story DV-1.2：实现稳定 candidateId、opaque source.ref 与 sanitized digest

## 状态

`done`

## 用户故事

作为 ZNorth 导入使用者，我希望同一 DailyVault 安全投影重复生成相同 `candidateId` / `source.ref` / `source.digest`，公开投影变化时 digest 改变，这样 ZNorth 去重和版本关系可以可靠工作。

## 实现摘要

- 在 `Server/src/bridge/znorth-envelope.js` 中实现 `cand_YYYYMMDD_slug` 生成。
- 日期来源：`date` -> `captured_at` -> Source 文件名日期。
- `source.ref` 优先使用 `dv:source:<source_id>`，缺失时使用 vault-relative Source path 的短 hash。
- `source.digest` 使用 `sha256:<hex>`，输入为 canonical sanitized projection，不包含 Source body 或本地路径。
- digest 排除自身字段，避免不稳定递归。

## 验收证据

- `Server/tests/promotion.test.js` 覆盖：重复公开投影生成相同 `candidateId`、`source.ref`、`source.digest`。
- `Server/tests/promotion.test.js` 覆盖：仅修改 Source body 时 digest 不变；修改 `public_summary` 时 digest 改变。
- `cd Server && npm run check` 已通过，26 个测试全部通过。

## 非目标回查

- 未输出绝对路径。
- 未让 ZNorth 解析 `source.ref`。
- 未把 raw Markdown body 纳入 digest。
