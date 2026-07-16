---
title: Story DV-1.1 Validation — Source eligibility 与 ZNorth envelope mapper
status: approved-for-dev
date: 2026-07-16
story: _bmad-output/implementation-artifacts/stories/1-1-source-eligibility-and-znorth-envelope-mapper.md
method: bmad-create-story:validate
validator: AI
---

# Story DV-1.1 Validation

## 1. 结论

**APPROVED_FOR_DEV。**

Story DV-1.1 可以进入开发。它的范围足够窄：只改 ZNorth target 的 Source promotion mapper，不扩展 Daily/Clipping，不写 ZNorth，不处理跨仓 dry-run。

## 2. 验证检查

| 检查项 | 结果 | 说明 |
| --- | --- | --- |
| 业务目标明确 | PASS | 目标是把旧 DailyVault 自定义 ZNorth candidate 替换为 `candidate-envelope.v1`。 |
| 范围足够小 | PASS | 只处理 `Sources/`，保持 Nervia target 不变。 |
| 验收可测试 | PASS | AC2-AC6 都可用临时 Vault fixture 测试。 |
| 隐私边界明确 | PASS | 禁止从正文兜底提取摘要，缺风险等级时失败关闭，不输出 Source body。 |
| 下游契约方向正确 | PASS | 输出字段对齐 ZNorth ZN-2.1 必填路径。 |
| 依赖可用 | PASS | 当前 `promotion.js`、`readSource()`、node:test 均存在。 |
| 非目标清楚 | PASS | 不写 ZNorth、不运行 ZNorth dry-run、不改 Daily/Clipping。 |

## 3. 必须保留的实现约束

1. 不要复用 `exportPublicSources()` 作为 envelope source，因为它允许从正文兜底提取摘要。
2. 不要默认 `public_risk_level: low`。
3. 不要在拒绝结果中包含 Source body。
4. 不要修改 `Templates/daily.md`。
5. 不要改变 Nervia target 输出结构。
6. 不要把 `source.path` 或绝对路径放进 envelope。

## 4. 建议测试 fixture

### 合法 Source

```yaml
---
source_id: dv_src_20260716_example
date: 2026-07-16
note_type: source
source_type: article
category: reading
title: 示例 Source
public_title: 示例公开标题
visibility: summary
analysis_allowed: true
public_summary: 安全公开摘要。
public_reader_promise: 这条候选为什么可能对读者有价值。
public_risk_level: low
public_tags: [public/candidate, domain/example]
public_score: 4
canonical_url: https://example.com
---

# 示例 Source

Private body sentinel: SHOULD_NOT_LEAK.
```

预期：生成 envelope，且输出不含 `SHOULD_NOT_LEAK`。

### 缺 `public_summary`

```yaml
visibility: summary
analysis_allowed: true
public_risk_level: low
title: Missing Summary
```

正文中即使有 `一句话摘要：SHOULD_NOT_BE_USED`，也必须拒绝。

### 缺 `public_risk_level`

预期：拒绝，原因包含 `missing:public_risk_level`，不得生成 `risk.level: low`。

## 5. 验证命令

开发完成后最低验证：

```bash
cd Server
npm run check
```

本 story 不要求运行 ZNorth dry-run；该验证属于 DV-2.1。

## 6. 风险

1. **误用 public export fallback**：会把正文摘要带进 ZNorth。缓解：测试缺 `public_summary` 且 body 有摘要时仍拒绝。
2. **风险默认过宽**：会误把未审查内容标低风险。缓解：测试缺 risk 时拒绝。
3. **Nervia 回归**：改 promotion 分支时可能影响 target routing。缓解：保留现有 Nervia 测试或新增 targeted assertion。

## 7. 批准条件

DV-1.1 可进入 `bmad-dev-story`，前提是开发者遵守 story 中的范围外条款，并在完成后记录 `npm run check` 结果。
