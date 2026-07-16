---
status: done
story_key: 2-1-znorth-contract-fixture-and-dry-run-compatibility
story_id: DV-2.1
epic: DV-2
title: 添加 ZNorth contract fixture 与 dry-run 兼容验证
created: 2026-07-16
completed: 2026-07-16
source_epics: _bmad-output/planning-artifacts/epics-and-stories.md
source_sprint: _bmad-output/implementation-artifacts/sprint-status.yaml
owner: DEV
---

# Story DV-2.1：添加 ZNorth contract fixture 与 dry-run 兼容验证

## 状态

`done`

## 用户故事

作为维护者，我希望 DailyVault 生成的合法 envelope 能通过 ZNorth dry-run validator，这样上游输出与下游输入契约一致。

## 实现摘要

- 新增 `Server/tests/fixtures/znorth-envelope-valid.json`，来自 DailyVault mapper 实际输出。
- DailyVault 本地测试覆盖 ZNorth 必填路径和禁止字段边界。
- 使用 ZNorth `Tools/Automation/import_candidate_envelope.py` 执行默认 dry-run，不使用 `--apply`。

## ZNorth dry-run 证据

命令：

```bash
cd /Users/codeshareman/Documents/03_ME/Projects/GitHub/ZNorth
python3 Tools/Automation/import_candidate_envelope.py /var/folders/77/_7bjwyj51f533b4bdgv_tw500000gn/T/dailyvault-dryrun-FPtUAH/candidate-envelope.json
```

结果摘要：

```json
{
  "ok": true,
  "mode": "dry-run",
  "results": [
    {
      "ok": true,
      "action": "would-create",
      "reason": "new_candidate",
      "candidate_id": "cand_20260716_dailyvault-dry-run-source"
    }
  ]
}
```

## 验收证据

- `Server/tests/promotion.test.js` 覆盖生成合法 Source -> envelope。
- `Server/tests/promotion.test.js` 覆盖 envelope 不含顶层 `status`、`humanDecision`、`accepted`、`published`。
- `cd Server && npm run check` 已通过，26 个测试全部通过。

## 非目标回查

- 未调用 `--apply`。
- 未写入 ZNorth。
