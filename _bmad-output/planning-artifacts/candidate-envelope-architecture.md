---
title: DailyVault Candidate Envelope v1 架构主干
status: ready-for-epics-and-stories
date: 2026-07-16
owner_repository: DailyVault
method: bmad-architecture
source_prd: _bmad-output/planning-artifacts/candidate-envelope-prd.md
source_plan: _bmad-output/planning-artifacts/candidate-export-plan.md
downstream_contract: ../ZNorth/_bmad-output/implementation-artifacts/stories/2-1-candidate-envelope-v1-input-contract.md
---

# DailyVault Candidate Envelope v1 架构主干

## 1. 架构决策

DailyVault 将 ZNorth 候选提升实现为一个纯投影：从符合资格的 DailyVault 记录生成脱敏的 `candidate-envelope.v1`，不复制原始 Markdown 正文，不让 ZNorth 回读 DailyVault。

首个实现目标只支持 `Sources/` 记录，因为现有 `promoteCandidate({ target, source_path })` 已经通过 `readSource(source_path)` 读取 Source Markdown。

Daily 与 Clipping 支持保留为后续扩展，并且必须复用同一个 mapper 接口；不得在 HTTP/MCP 中单独硬编码另一套逻辑。

## 2. 不变量

1. DailyVault 默认私有。
2. Source 是否可提升由单条记录决定，不由目录决定。
3. `visibility: summary | public` 是必要条件，但不是充分条件；还必须有显式分析授权。
4. 生成的 envelope 是公开候选投影，不是事实来源文档。
5. `source.ref` 对 ZNorth 不透明。
6. digest 基于脱敏投影，不基于 raw Markdown。
7. 缺失隐私、缺失授权、缺失风险判断或缺失公开摘要都必须失败关闭。
8. MCP 和 HTTP 调用同一个共享函数。
9. DailyVault 永不写 ZNorth，也不调用 `--apply`。
10. AI 推荐字段永不改变 ZNorth 的人工状态。

## 3. 数据来源

### 3.1 当前 Source Reader

`Server/src/vault/source.js` 暴露 `readSource(sourcePath)`，返回：

- `path`：Vault 相对 Source 路径。
- `frontmatter`：解析后的标量和数组元数据。
- `summary`：当前 Source reader 从正文提取的摘要候选。
- `body`：原始 Markdown 正文。

ZNorth envelope mapper 只能使用 `frontmatter` 和明确的安全公开字段。它不得把 `body` 放入输出，也不得用 `summary` 的正文 fallback 生成 ZNorth 摘要。

### 3.2 Source eligibility frontmatter

ZNorth envelope 生成所需字段：

```yaml
visibility: summary # 或 public
analysis_allowed: true
public_summary: "..."
public_risk_level: low # 或 medium/high
```

推荐但可选字段：

```yaml
source_id: dv_src_YYYYMMDD_slug
public_title: "..."
public_tags: [public/candidate, domain/example]
public_score: 4
public_reader_promise: "..."
public_risk_notes: "..."
canonical_url: https://example.com
source_type: article
category: reading
```

决策：Markdown frontmatter 使用 snake_case，输出 envelope 使用 ZNorth contract 的 camelCase。理由：现有 Source metadata 已使用 `public_summary`、`public_tags`、`daily_path` 等 snake_case 字段。

### 3.3 拒绝条件

出现以下情况时，mapper 返回结构化拒绝/不可提升结果，而不是 envelope：

1. `visibility` 不在 `summary | public`。
2. `analysis_allowed !== true`。
3. `public_summary` 为空。
4. `public_risk_level` 缺失或不在 `low | medium | high`。
5. `title` 与 `public_title` 都为空。
6. `source_type` 无法映射到 DailyVault 支持的 `source.kind`。
7. 无法生成符合 ZNorth 规则的 `candidateId`。
8. 脱敏投影没有通过泄漏防护。

## 4. Envelope 字段映射

### 4.1 顶层字段

| Envelope 字段 | DailyVault 来源 |
| --- | --- |
| `schemaVersion` | 常量 `candidate-envelope.v1` |
| `candidateId` | `cand_<YYYYMMDD>_<slug>` |
| `source.system` | 常量 `dailyvault` |
| `source.kind` | 首个 story 固定为 `source` |
| `source.ref` | `dv:source:<stable-ref>` |
| `source.digest` | `sha256:<canonical-sanitized-projection>` |
| `authorization.analysisAllowed` | `analysis_allowed === true` |
| `authorization.privacy` | `visibility` |

### 4.2 摘要字段

| Envelope 字段 | Source 优先级 |
| --- | --- |
| `summary.title` | `public_title` -> `title` |
| `summary.readerPromise` | `public_reader_promise` -> `public_summary` |
| `summary.digestSummary` | `public_summary` |

ZNorth envelope 不允许从正文兜底提取摘要。`exportPublicSources` 可以为了公开导出返回正文兜底并给出警告，但 ZNorth 候选生成必须要求显式 `public_summary`，避免误把原始笔记摘要推给 ZNorth。

### 4.3 Signals

首版 signals allowlist：

- `public_tags`
- `category`
- `source_type`
- 数值评分：`quality_score`、`relevance_score`、`actionability_score`、`memory_score`、`public_score`

Signals 是规范化对象，不是 frontmatter 原样 dump。示例：

```json
[
  { "type": "tag", "value": "public/candidate" },
  { "type": "category", "value": "reading" },
  { "type": "score", "name": "public_score", "value": 4 }
]
```

### 4.4 Evidence

Source 记录默认：

```json
{
  "status": "verified",
  "role": "inspiration"
}
```

如果未来记录是人工摘要但来源访问受阻，`evidence.status` 可以是 `partial` 或 `blocked`，但必须来自显式 metadata。不要推断。

### 4.5 Risk

Risk 必须显式：

```yaml
public_risk_level: low | medium | high
public_risk_notes: "..."
```

DailyVault 可以生成 high-risk envelope，因为 ZNorth contract 接受 `high`；但 high risk 通常应让 `aiRecommendation.recommendedAction` 为 `needs-human-review`。缺失 risk 不得默认成 low。

### 4.6 AI Recommendation

默认值：

```json
{
  "recommendedAction": "triage",
  "rationale": "DailyVault public summary candidate; requires human editorial decision in ZNorth.",
  "rank": null
}
```

如果存在 `public_score`，mapper 可以基于可观察 public score 生成 rank 或 rationale，但不得把推荐解释成 ZNorth 人工接受状态。

## 5. 稳定标识

### 5.1 Candidate ID

格式：`cand_YYYYMMDD_slug`。

日期优先级：

1. `date` frontmatter，规范化成 `YYYYMMDD`。
2. `captured_at` 日期。
3. Source 文件名中的可解析日期。
4. 无有效日期则拒绝。

Slug 优先级：

1. `public_title`。
2. `title`。
3. `source_id`。
4. 规范化后仍为空则拒绝。

可复用现有 `slugify()`，但要保证输出满足 ZNorth ID 规则；无法满足时拒绝或做保守规范化。

### 5.2 Source Ref

优先级：

1. `source_id` -> `dv:source:<source_id>`。
2. Vault-relative Source path 的 hash -> `dv:source:path:<sha256-12>`。

不输出绝对路径。不要求 ZNorth 解析这个 ref。

### 5.3 Digest

Digest 输入是 canonical JSON object，只包含脱敏且与 envelope 有关的字段，并排除 `source.digest` 本身。对象 key 递归排序。

当标题、公开摘要、公开标签、风险、signals 或推荐理由等公开投影字段变化时，digest 必须变化。私密正文变化但公开投影不变时，digest 不应变化。

## 6. 泄漏防护

返回 envelope 前，将 envelope 序列化并拒绝以下内容：

- DailyVault root 的绝对路径。
- `/Users/` 路径前缀。
- 被复制进 summary/signals 的 `Daily/`、`Notes/`、`Clippings/` 原文。
- 输出对象中的 `dailyvault_source_path` 或 `source_path`。
- 已知敏感 metadata key：私人姓名、私人地址、健康细节、凭据、raw body。

泄漏防护不是唯一隐私控制；它只是 allowlist mapping 后的最后一道防线。

## 7. 模块边界

推荐实现结构：

```text
Server/src/bridge/
├── promotion.js              # 现有公开入口
├── znorth-envelope.js         # mapper、校验、digest、泄漏防护
└── candidate-result.js        # 可选共享结果 helper
```

测试可以继续放在 `Server/tests/vault.test.js`，除非增长到需要拆成 `promotion.test.js`。

HTTP 和 MCP 保持当前 route/tool 定义，但都调用同一个 `promoteCandidate()`。

## 8. 验证边界

实现 story 的最低验证命令：

```bash
cd Server
npm run check
```

跨仓 dry-run 兼容验证：

```bash
cd /Users/codeshareman/Documents/03_ME/Projects/GitHub/ZNorth
python3 Tools/Automation/import_candidate_envelope.py <dailyvault-generated-envelope>.json
```

如果 CI 或本地环境不适合跨仓执行，则保留镜像 ZNorth ZN-2.1 contract 的 fixture test，并在 story 验证记录中说明手动 dry-run 结果。

## 9. 影响与取舍

正向影响：

- DailyVault 可以把候选交给 ZNorth，而不共享原始私密 Vault 内容。
- 现有 MCP/HTTP 入口保持稳定。
- digest 和 `source.ref` 语义与 ZNorth 幂等导入契约对齐。

取舍：

- 要求 `analysis_allowed` 和 `public_risk_level` 会增加提升前的 metadata 工作。
- 首版只支持 Source，会延后 Daily/Clipping 直接 promotion，但能避免首轮误抽正文。
- 公开导出里的正文摘要兜底被刻意排除在 ZNorth promotion 之外。
