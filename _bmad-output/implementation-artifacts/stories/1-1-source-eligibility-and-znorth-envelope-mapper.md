---
status: ready-for-dev
story_key: 1-1-source-eligibility-and-znorth-envelope-mapper
story_id: DV-1.1
epic: DV-1
title: 定义 Source eligibility 与 ZNorth envelope mapper
created: 2026-07-16
source_epics: _bmad-output/planning-artifacts/epics-and-stories.md
source_sprint: _bmad-output/implementation-artifacts/sprint-status.yaml
readiness_report: _bmad-output/planning-artifacts/implementation-readiness-report.md
owner: DEV
---

# Story DV-1.1：定义 Source eligibility 与 ZNorth envelope mapper

## 状态

`ready-for-dev`

## 用户故事

作为 DailyVault 维护者，我希望只有明确公开摘要、明确授权分析、明确风险等级的 Source 能生成 ZNorth envelope，这样私密或未审查资料不会进入品牌候选池。

## 业务背景

ZNorth 已完成 `candidate-envelope.v1` 输入契约和增量导入/去重。DailyVault 当前 `Server/src/bridge/promotion.js` 已支持 `target: "znorth"`，但输出仍是旧的 DailyVault 自定义候选结构：`suggested_fields.znorth_*`、`dailyvault_source_path` 等字段，不是 ZNorth canonical envelope。

本 story 把 ZNorth target 的输出改为严格的 `candidate-envelope.v1`，并建立 Source-level eligibility gate。首版只处理 `Sources/` 记录，不扩展 Daily/Clipping，不写 ZNorth，不调用 `--apply`。

## 来源需求

来自 PRD：

1. `dailyvault.promote_candidate` / `/promotions/candidate` 应为 ZNorth 生成 `candidate-envelope.v1`。
2. 只允许 `visibility: summary` 或 `visibility: public`。
3. 必须有显式 `analysis_allowed: true`。
4. 必须有显式 `public_summary`。
5. 必须有显式 `public_risk_level`，不得默认 `low`。
6. 输出不得包含 Source body、Daily body、Clipping body、Notes body、绝对路径或敏感字段。
7. MCP 与 HTTP 后续必须共享 mapper；本 story 保持现有 `promoteCandidate()` 入口。

来自 architecture：

1. Markdown frontmatter 使用 snake_case，envelope 使用 camelCase。
2. `source.system` 固定 `dailyvault`。
3. 首版 `source.kind` 固定 `source`。
4. `summary.title` 从 `public_title` -> `title`。
5. `summary.readerPromise` 从 `public_reader_promise` -> `public_summary`。
6. `summary.digestSummary` 从 `public_summary`。
7. signals 只能来自 allowlist 字段。
8. ZNorth promotion 不复用 `exportPublicSources` 的正文摘要兜底逻辑。

## 范围

### 范围内

1. 修改 `target: "znorth"` 的 promotion path，使成功结果包含 `candidate` envelope：

```json
{
  "schemaVersion": "candidate-envelope.v1",
  "candidateId": "cand_YYYYMMDD_slug",
  "source": {
    "system": "dailyvault",
    "ref": "dv:source:<stable-ref>",
    "digest": "sha256:<hex>",
    "kind": "source"
  },
  "authorization": {
    "analysisAllowed": true,
    "privacy": "summary"
  },
  "summary": {
    "title": "...",
    "readerPromise": "...",
    "digestSummary": "..."
  },
  "signals": [],
  "evidence": {
    "status": "verified",
    "role": "inspiration"
  },
  "risk": {
    "level": "low",
    "notes": ""
  },
  "aiRecommendation": {
    "recommendedAction": "triage",
    "rationale": "...",
    "rank": null
  }
}
```

2. 新增或等效实现 ZNorth envelope mapper，例如 `Server/src/bridge/znorth-envelope.js`。
3. 实现资格门禁：`visibility`、分析授权、公开摘要、风险等级、标题。
4. 实现机器可读的拒绝结果。
5. 保留 Nervia target 现有行为。
6. 增加聚焦测试。

### 范围外

1. 不实现 Daily/Clipping promotion。
2. 不实现稳定 digest 的最终规范化完整规则；DV-1.2 会细化。DV-1.1 可先生成合法占位 digest，但必须是 `sha256:<hex>`，且来源于脱敏投影。
3. 不实现 ZNorth dry-run 兼容验证；DV-2.1 处理。
4. 不修改 `Templates/daily.md`。
5. 不写 ZNorth，不调用 `--apply`。
6. 不修改 Source 分类体系。

## 必要设计决策

### 1. 资格必填字段

| 字段 | 合法值 | 拒绝原因 |
| --- | --- | --- |
| `visibility` | `summary` 或 `public` | `privacy_not_publishable:<value>` 或 `missing:visibility` |
| `analysis_allowed` | 字面布尔值 `true` | `missing:analysis_allowed` 或 `analysis_not_allowed` |
| `public_summary` | 非空字符串 | `missing:public_summary` |
| `public_risk_level` | `low`、`medium`、`high` | `missing:public_risk_level` 或 `invalid_public_risk_level:<value>` |
| `public_title` / `title` | 至少一个非空 | `missing:title` |

### 2. 禁止正文摘要兜底

即使 Source body 中存在 `一句话摘要：...`，ZNorth promotion 也必须在缺少 `public_summary` 时拒绝。

### 3. Signals 白名单

首版 signals 只允许来自：

- `public_tags`
- `category`
- `source_type`
- `quality_score`
- `relevance_score`
- `actionability_score`
- `memory_score`
- `public_score`

### 4. Risk 与推荐

- `risk.level` 直接映射 `public_risk_level`。
- `risk.notes` 映射 `public_risk_notes || ""`。
- `public_risk_level: high` 时 `aiRecommendation.recommendedAction` 应为 `needs-human-review`。
- 其他风险等级默认 `triage`。

## 验收标准

### AC1 — 成功结果是 ZNorth envelope

合法 Source 调用 `promoteCandidate({ target: "znorth", source_path })` 时，返回的 `candidate` 包含：

- `schemaVersion: "candidate-envelope.v1"`
- `source.system: "dailyvault"`
- `source.kind: "source"`
- `authorization.analysisAllowed: true`
- `authorization.privacy` 等于 Source `visibility`
- `summary.title`
- `summary.readerPromise`
- `summary.digestSummary`
- `signals` array
- `evidence.role: "inspiration"`
- `risk.level`
- `aiRecommendation.recommendedAction`

### AC2 — visibility 门禁失败关闭

`visibility: private`、缺失 visibility 或其他非 `summary/public` 值不得生成 envelope，并返回机器可读原因。

### AC3 — analysis authorization 门禁失败关闭

缺失 `analysis_allowed`、`analysis_allowed: false`、`analysis_allowed: "true"` 或其他非字面 true 值不得生成 envelope。

### AC4 — public summary 必须显式存在

缺少 `public_summary` 时拒绝，即使 Source body 包含可提取摘要。

### AC5 — risk level 必须显式存在

缺少 `public_risk_level` 或值不合法时拒绝；不得默认 `low`。

### AC6 — 不泄露 Source body

成功 envelope 和拒绝结果都不包含 Source Markdown body，也不包含测试中放入 body 的唯一哨兵文本。

### AC7 — Nervia target 不回归

`target: "nervia"` 的现有测试继续通过，输出仍保持原有 Nervia candidate 行为。

### AC8 — 现有检查通过

在 `Server/` 下运行：

```bash
npm run check
```

必须通过。

## 建议实施任务

1. 新增 `Server/src/bridge/znorth-envelope.js`，导出 `buildZNorthEnvelopeCandidate(source)` 或等效函数。
2. 在 `promotion.js` 中将 `target === "znorth"` 分支改为调用新 mapper。
3. 实现 `validateSourceEligibility(frontmatter)`。
4. 实现 `buildSignals(frontmatter)`，仅使用 allowlist。
5. 实现 `buildRisk(frontmatter)` 与 `buildAiRecommendation(frontmatter)`。
6. 实现安全结果结构：成功 `status: "candidate"`，失败 `status: "incomplete_candidate"` 或等效现有兼容状态，但必须包含机器可读 `reasons` / `missing_fields`。
7. 添加测试：合法 Source、private Source、缺少 analysis、缺少 public_summary 且正文可兜底、缺少 risk、body 哨兵文本、Nervia target 不回归。
8. 运行 `npm run check`。

## 验证计划

1. 使用临时 Vault 写入合法 Source，调用 `promoteCandidate({ target: "znorth" })`，断言 envelope 结构。
2. 使用 `visibility: private` Source，断言拒绝原因。
3. 删除 `analysis_allowed`，断言拒绝原因。
4. 删除 `public_summary`，但 body 放 `一句话摘要：不应泄漏`，断言拒绝且输出不含 body 文本。
5. 删除 `public_risk_level`，断言拒绝且没有默认 low。
6. body 放唯一哨兵文本，合法 public fields 安全，断言 envelope 不含该文本。
7. 调用 Nervia promotion 现有测试，确认未回归。
8. 运行 `cd Server && npm run check`。

## 非目标回查

- 未写 ZNorth。
- 未调用 ZNorth import dry-run。
- 未修改 Daily 模板。
- 未支持 Daily/Clipping direct promotion。
- 未创建批量状态文件。
