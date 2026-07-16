---
title: DailyVault 到 ZNorth Candidate Envelope v1 — Implementation Readiness Check
status: pass-with-concerns
date: 2026-07-16
owner_repository: DailyVault
method: bmad-check-implementation-readiness
reviewed_artifacts:
  - _bmad-output/planning-artifacts/candidate-export-plan.md
  - _bmad-output/planning-artifacts/candidate-envelope-prd.md
  - _bmad-output/planning-artifacts/candidate-envelope-architecture.md
  - _bmad-output/planning-artifacts/epics-and-stories.md
  - Server/README.md
  - Server/src/bridge/promotion.js
  - Server/src/http/server.js
  - Server/src/mcp/server.js
  - Server/tests/vault.test.js
  - ../ZNorth/_bmad-output/implementation-artifacts/stories/2-1-candidate-envelope-v1-input-contract.md
  - ../ZNorth/_bmad-output/implementation-artifacts/stories/2-2-incremental-import-and-dedupe.md
next_step: bmad-sprint-planning
---

# 评审结果：PASS_WITH_CONCERNS

## 1. 审查范围

已审查产物：

- 既有 DailyVault candidate export plan。
- 新 PRD 与 architecture spine。
- DV-1 到 DV-3 的 epic/story 拆解。
- 当前 Server promotion、HTTP、MCP 与测试。
- ZNorth Candidate Envelope v1 与 idempotent import stories。

意图与验收目标：

DailyVault 应从符合条件的 Source 记录生成 ZNorth 可验证的 `candidate-envelope.v1`，不泄露原始私密 Vault 内容，也不写入 ZNorth。

## 2. 结论

**通过，但有顾虑。**

设计已经可以进入 sprint planning 和 Story DV-1.1 创建，因为范围被刻意收窄到现有 `Sources/` promotion，并且能自然落到当前 `Server/src/bridge/promotion.js`。

以下顾虑不阻塞 sprint planning，但必须进入首批实施 story：

1. 现有 Source 模板没有 `analysis_allowed` 或 `public_risk_level`；实现必须在记录缺少这些字段时失败关闭。
2. 现有 `exportPublicSources` 允许从正文兜底提取摘要；ZNorth promotion 必须禁止复用该兜底逻辑。
3. 跨仓 ZNorth dry-run 应作为手动或可选验证证据，不应让 DailyVault 的常规 `npm run check` 强依赖 sibling repo。

## 3. Readiness Checks

| 检查项 | 结果 | 证据 | 决策 |
| --- | --- | --- | --- |
| 目标清晰度 | PASS | handoff 要求 DailyVault 生成 ZNorth `candidate-envelope.v1`。 | 可进入 sprint planning。 |
| 范围边界 | PASS | PRD 排除 ZNorth apply、Draft/Publication、MRZZZ、raw private export。 | 作为硬性非目标保留。 |
| 架构具体性 | PASS | Architecture 定义 Source 首版、frontmatter 门禁、字段映射、id/ref/digest、leakage guard。 | 可进入 DV-1.1。 |
| 仓库契合度 | PASS | 当前 `promoteCandidate()` 已经按 target 从 Source path 生成候选。 | 在 bridge 层实现。 |
| 可测试性 | PASS | AC 覆盖确定性 ID、digest 变化、隐私负向门禁、HTTP smoke、`npm run check`。 | 可进入开发。 |
| 隐私安全 | PASS_WITH_CONCERNS | 设计要求 allowlist mapping，并禁止从正文兜底提取摘要；现有 export 代码为其他用途保留了正文兜底。 | 增加显式回归测试。 |
| 下游兼容 | PASS_WITH_CONCERNS | ZNorth contract 与 dry-run 命令存在；DailyVault test 不宜强绑 sibling repo。 | 本地 contract test + 手动 dry-run 证据。 |
| 数据丢失风险 | PASS | Source 首版没有迁移或删除。 | 风险低。 |

## 4. 发现与建议

### [Major] 当前 Source 模板没有 eligibility 字段

证据：

- `Templates/source.md` 当前有 `visibility: private`，没有 `analysis_allowed` 或 `public_risk_level`。
- `Sources/README.md` 元数据契约有公开字段和评分，但没有显式分析授权/风险字段。

影响：

- 绝大多数当前 Source 会被设计性拒绝，直到显式审查。
- 这是正确的隐私默认值，但实现必须返回清晰 missing-field reason。

建议：

- DV-1.1 必须定义 missing field reasons：
  - `missing:analysis_allowed`
  - `analysis_not_allowed`
  - `missing:public_risk_level`
  - `missing:public_summary`
  - `privacy_not_publishable:<value>`
- 不要批量静默给所有 Sources 加这些字段。
- 后续可以在流程稳定后更新 `Sources/README.md`，说明可选提升字段。

信心：High。

### [Major] ZNorth promotion 不能复用 public export body fallback

证据：

- `Server/src/vault/export.js` 使用 `public_summary` 或 `extractPublicSummary(parsed.body)`，并在 fallback 时给 warning。
- PRD/architecture 要求 ZNorth candidate generation 必须有显式 `public_summary`。

影响：

- 若复用 export 逻辑，可能把 Source 正文文本带入 ZNorth envelope，削弱隐私边界。

建议：

- ZNorth mapper 使用单独 allowlist projection。
- 增加测试：body 中有唯一敏感 sentinel 且 `public_summary` 安全时，envelope 不包含 sentinel。
- 增加测试：缺少 `public_summary` 但 body 有 `一句话摘要` 时，ZNorth promotion 必须拒绝。

信心：High。

### [Major] Risk 默认值必须失败关闭

证据：

- ZNorth contract 接受 `risk.level` 枚举，但缺失 risk 会拒绝；handoff 明确不要默认 low，除非 DailyVault 有真实公开安全规则证明。

影响：

- 如果 mapper 默认 `low`，未审查的私人生活内容可能进入低风险编辑队列。

建议：

- DV-1.1 要求 Source frontmatter 明确 `public_risk_level`。
- 允许 `medium` / `high`；当 high 时建议 `aiRecommendation.recommendedAction: needs-human-review`。
- 测试必须证明缺失 risk 被拒绝。

信心：High。

### [Minor] 跨仓 dry-run 应作为证据，而不是硬性 unit test 依赖

证据：

- ZNorth dry-run 命令存在于 `../ZNorth/Tools/Automation/import_candidate_envelope.py`。
- DailyVault Server 测试是 Node-based 且当前自包含。

影响：

- 如果 `npm run check` 强依赖 sibling repo，未来在其他机器或 CI 会出现假失败。

建议：

- 单元测试本地镜像 ZNorth envelope schema。
- Story validation 手动运行 ZNorth dry-run，并记录结果。
- 如需自动跨仓测试，用显式 env var gate。

信心：Medium。

## 5. Sprint Planning 前置条件

开发开始前：

1. Sprint status 必须把 DV-1.1 标为第一个 `ready-for-dev` story。
2. DV-1.1 story 必须声明 Source 首版范围，并保持 Nervia target 不变。
3. DV-1.1 story 必须要求显式 `analysis_allowed` 与 `public_risk_level`。
4. DV-1.2 不得在 DV-1.1 建立 sanitized projection shape 前启动。
5. DV-2.1 的跨仓 ZNorth dry-run 应作为 story validation evidence，不作为常规 `npm run check` 硬依赖，除非显式 gate。

## 6. 建议 Sprint Slices

### Sprint Slice 1 — Safe Source envelope spine

Stories：DV-1.1、DV-1.2、DV-2.2。

Exit gate：

- 合法 Source 生成合法 envelope。
- private / missing authorization / missing summary / missing risk 都会拒绝。
- 稳定投影生成稳定 `candidateId` / `source.ref` / `source.digest`。
- body sentinel 不会出现在 envelope。

### Sprint Slice 2 — Entry points and downstream compatibility

Stories：DV-1.3、DV-2.1。

Exit gate：

- MCP/HTTP 输出同 shape。
- ZNorth dry-run 接受生成 envelope。
- `Server/npm run check` 通过。

### Sprint Slice 3 — Future expansion

Stories：DV-3.1、DV-3.2。

Exit gate：

- Daily/Clipping extension 先设计再编码。
- Batch dry-run 与 state 语义明确，且不创建第二份内容数据库。

## 7. 缺口与未知

1. 现有真实 Source 文件可能还没有 `analysis_allowed` 和 `public_risk_level`。
2. `Sources/README.md` 还没有公开风险审查 workflow。
3. Daily/Clipping 直接 promotion 需要独立 projection 设计。
4. DailyVault 与 ZNorth 之间还没有共享 JSON Schema 文件；兼容性依赖镜像 contract 与 dry-run validator。

## 8. 决策

进入 **BMAD Sprint Planning**，并附加约束：

> Source 首版的 ZNorth envelope generation 可以开始，但实现必须在缺少显式授权、缺少公开摘要、缺少风险等级时失败关闭。在 Source 首版 flow 通过 ZNorth dry-run 前，不要扩展到 Daily/Clipping。

建议立即输出：

- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/stories/1-1-source-eligibility-and-znorth-envelope-mapper.md`
