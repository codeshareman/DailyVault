---
status: done
story_key: 2-2-leakage-guard-and-negative-tests
story_id: DV-2.2
epic: DV-2
title: 添加泄漏防护与负向测试
created: 2026-07-16
completed: 2026-07-16
source_epics: _bmad-output/planning-artifacts/epics-and-stories.md
source_sprint: _bmad-output/implementation-artifacts/sprint-status.yaml
owner: DEV
---

# Story DV-2.2：添加泄漏防护与负向测试

## 状态

`done`

## 用户故事

作为 DailyVault 用户，我希望即使 Source 中存在私密路径或正文，ZNorth envelope 也只包含 allowlist 字段，这样公开候选不会泄漏个人 Vault 内容。

## 实现摘要

- `Server/src/bridge/znorth-envelope.js` 在 allowlist projection 后执行 leakage guard。
- 拒绝 `/Users/` 绝对路径、Vault root 绝对路径、`source_path`、`dailyvault_source_path`、raw body/markdown 等字段。
- 负向门禁覆盖 `private` visibility、非 `Sources/` 路径、非 `note_type: source`、缺少 `analysis_allowed`、缺少 `public_summary`、缺少 `public_risk_level`。
- 拒绝结果只含机器可读 `reasons`、`missing_fields` 和下一步提示，不包含 Source body。

## 验收证据

- `Server/tests/promotion.test.js` 覆盖 body sentinel 不出现在成功 envelope 或拒绝结果。
- `Server/tests/promotion.test.js` 覆盖公开投影中出现 `/Users/` 时拒绝。
- `Server/tests/promotion.test.js` 覆盖 audit 不含 Source body、`source_path` 或本地 Source path。
- `Server/tests/promotion.test.js` 覆盖非 `Sources/` 路径与非 Source note_type 被拒绝。
- `Server/tests/vault.test.js` 覆盖旧不完整 Source 通过机器可读原因拒绝。
- `cd Server && npm run check` 已通过，28 个测试全部通过。

## 非目标回查

- 未删除或改写用户 Source。
- 未更改 `exportPublicSources()` 的正文兜底行为；该行为仍只用于公开导出，不用于 ZNorth promotion。
