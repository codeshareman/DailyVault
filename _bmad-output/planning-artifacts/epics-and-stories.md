---
title: DailyVault 到 ZNorth Candidate Envelope v1 — Epic 与 Story
status: ready-for-implementation-readiness-check
date: 2026-07-16
owner_repository: DailyVault
method: bmad-create-epics-and-stories
source_plan: _bmad-output/planning-artifacts/candidate-export-plan.md
source_prd: _bmad-output/planning-artifacts/candidate-envelope-prd.md
source_architecture: _bmad-output/planning-artifacts/candidate-envelope-architecture.md
upstream_contract: DailyVault Source public projection
downstream_contract: ZNorth Candidate Envelope v1
---

# DailyVault 到 ZNorth Candidate Envelope v1 — Epic 与 Story

## 1. BMAD 前置校验

| 项 | 结果 | 证据 / 决策 |
| --- | --- | --- |
| 需求来源 | 可用 | `/tmp/dailyvault-znorth-handoff.md` 与 `candidate-export-plan.md` 指向 DailyVault 上游候选信封生成。 |
| PRD | 可用 | `candidate-envelope-prd.md` 定义 Source 首版、门禁、验收与非目标。 |
| 架构输入 | 可用 | `candidate-envelope-architecture.md` 定义 mapper 边界、字段映射、digest、`source.ref`、泄漏防护。 |
| 现状上下文 | 可用 | `Server/src/bridge/promotion.js` 已有 `promoteCandidate`，但 ZNorth target 当前不是 envelope v1。 |
| 输出位置 | 可用 | `_bmad-output/planning-artifacts/` 与 `_bmad-output/implementation-artifacts/`。 |

## 2. 产品目标与非目标

### 2.1 目标

让 DailyVault 从显式授权、可公开摘要的 Source 记录生成 ZNorth `candidate-envelope.v1`，供 ZNorth dry-run/import 消费，同时保持 DailyVault 私密事实源边界。

### 2.2 核心流程

`Source Markdown -> eligibility gate -> sanitized projection -> candidate-envelope.v1 -> ZNorth dry-run validator`

### 2.3 不变量

1. `visibility: summary | public` 必须存在，但不是充分条件。
2. `analysis_allowed: true` 必须显式存在。
3. `public_summary` 必须存在；ZNorth promotion 不使用正文 fallback。
4. `public_risk_level` 必须显式存在且为 `low | medium | high`。
5. `source.ref` 对 ZNorth 不透明，不要求解析路径。
6. `source.digest` 基于脱敏投影，不基于 raw Markdown。
7. 输出不得包含 Daily/Notes/Clippings 原文、绝对路径、敏感健康/工作/地址/私人姓名信息。
8. MCP 和 HTTP 共享 mapper/validator。
9. DailyVault 不写 ZNorth，不自动 apply。
10. 推荐字段不代表人工接受/拒绝。

---

# Epic DV-1：建立 ZNorth Envelope 安全投影主干

## Epic 目标

把当前 DailyVault 自定义 ZNorth candidate 输出替换为严格的 `candidate-envelope.v1` 投影主干，包含 eligibility gate、字段 allowlist、stable id/ref/digest 和 leakage guard。

## 业务价值

- 让 ZNorth 可以消费 DailyVault 候选，而不读取 DailyVault Vault。
- 降低私人笔记误导出风险。
- 为后续 Daily/Clipping 扩展提供同一 mapper spine。

## Stories

### Story DV-1.1：定义 Source eligibility 与 ZNorth envelope mapper

**用户故事**  
作为 DailyVault 维护者，我希望只有明确公开摘要、明确授权分析、明确风险等级的 Source 能生成 ZNorth envelope，这样私密或未审查资料不会进入品牌候选池。

**验收标准**

1. `target: "znorth"` 时返回 `schemaVersion: "candidate-envelope.v1"` 的 envelope，而不是旧 `suggested_fields.znorth_*` 对象。
2. Source 只有在 `visibility` 为 `summary` 或 `public` 时才可生成 envelope。
3. Source 必须有 `analysis_allowed: true`；缺失、false、字符串、空值均拒绝。
4. Source 必须有非空 `public_summary`；不得从 Markdown body 提取 fallback 摘要。
5. Source 必须有 `public_risk_level` 且值为 `low | medium | high`；缺失不得默认成 low。
6. `summary.title` 来自 `public_title` 或 `title`；两者都缺失时拒绝。
7. `source.system` 固定为 `dailyvault`，`source.kind` 首版固定为 `source`。
8. `authorization.analysisAllowed` 固定映射为 true，`authorization.privacy` 映射为 Source visibility。
9. 拒绝结果包含机器可读 reason/missing_fields，且不包含 Source body。
10. 保留 Nervia target 现有行为，不被 ZNorth mapper 改动。

**实施说明**

- 主要文件：`Server/src/bridge/promotion.js`，建议新增 `Server/src/bridge/znorth-envelope.js`。
- Source 读取沿用 `readSource(source_path)`。
- Markdown frontmatter 使用 snake_case；envelope 使用 ZNorth contract camelCase。
- 不要修改 `Templates/daily.md`。

**依赖**

- 无前置 story；这是实现主干。

---

### Story DV-1.2：实现稳定 candidateId、opaque source.ref 与 sanitized digest

**用户故事**  
作为 ZNorth 导入使用者，我希望同一 DailyVault 安全投影重复生成相同 `candidateId` / `source.ref` / `source.digest`，公开投影变化时 digest 改变，这样 ZNorth 去重和版本关系可以可靠工作。

**验收标准**

1. `candidateId` 匹配 ZNorth `cand_YYYYMMDD_slug` 规则。
2. 日期来源优先级明确：`date` -> `captured_at` -> 文件名日期；无法得到有效日期则拒绝。
3. slug 来源优先级明确：`public_title` -> `title` -> `source_id`；无法得到非空 slug 则拒绝。
4. `source.ref` 优先使用 `dv:source:<source_id>`；缺失 `source_id` 时使用 vault-relative source path 的短 hash，不输出路径本身。
5. `source.digest` 使用 `sha256:<hex>` 格式。
6. digest 输入为 canonical sanitized projection；对象 key 顺序不会改变 digest。
7. 修改 `public_summary` 会改变 digest。
8. 修改 raw Markdown body 但不修改 sanitized projection，不改变 digest。
9. 输出 envelope 不包含绝对路径或 `dailyvault_source_path`。
10. Tests 覆盖重复调用稳定性和 projection 变化场景。

**实施说明**

- 可使用 Node `crypto.createHash('sha256')`。
- 可复用 `Server/src/util/slug.js`，但要保证 ZNorth ID 规则合法。
- digest canonicalization 应作为纯函数测试。

**依赖**

- 依赖 DV-1.1 的 sanitized projection。

---

### Story DV-1.3：统一 MCP 与 HTTP promotion 输出路径

**用户故事**  
作为 agent/API 使用者，我希望 MCP `dailyvault.promote_candidate` 与 HTTP `/promotions/candidate` 产生同一 ZNorth envelope，这样不同入口不会出现字段漂移。

**验收标准**

1. MCP 工具和 HTTP endpoint 都调用同一 `promoteCandidate()` 代码路径。
2. HTTP 输入保持当前 `target/source_path/dry_run` 语义，不新增写 ZNorth 行为。
3. `dry_run: true` 不写 audit。
4. `dry_run: false` 只写 DailyVault 本地 audit，audit 中不得包含 Source body 或 raw private fields。
5. HTTP 与 MCP 返回 envelope shape 一致。
6. Tests 覆盖 HTTP ZNorth promotion smoke path。

**实施说明**

- `Server/src/http/server.js` 路由已调用 `promoteCandidate()`；避免在 route 中写 mapper 分支。
- `Server/src/mcp/server.js` 已调用 `promoteCandidate()`；只需确保 schema 接受必要输入。

**依赖**

- 依赖 DV-1.1。

---

# Epic DV-2：验证 ZNorth contract 兼容与隐私泄漏防护

## Epic 目标

证明 DailyVault 生成的 envelope 可被 ZNorth dry-run validator 接受，并且拒绝/泄漏防护可执行，而不是只靠人工约定。

## 业务价值

- 避免 DailyVault 与 ZNorth contract 漂移。
- 将隐私边界变成回归测试。
- 支持安全重复运行。

## Stories

### Story DV-2.1：添加 ZNorth contract fixture 与 dry-run 兼容验证

**用户故事**  
作为维护者，我希望 DailyVault 生成的合法 envelope 能通过 ZNorth dry-run validator，这样上游输出与下游输入契约一致。

**验收标准**

1. 测试 fixture 能生成一个合法的 Source -> envelope。
2. envelope 包含 ZNorth 必填路径：`schemaVersion`、`candidateId`、`source.system/ref/digest/kind`、`authorization`、`summary`、`signals`、`risk.level`。
3. envelope 不包含被禁止的人工/本地字段：顶层 `status`、`humanDecision`、`accepted/rejected/published` 状态。
4. 若 ZNorth repo 存在，则验证计划包含 `python3 Tools/Automation/import_candidate_envelope.py <envelope>.json` dry-run。
5. 若跨仓 dry-run 不适合纳入 `npm run check`，则保留本地 contract mirror test，并在 story 验证记录中手动执行 ZNorth dry-run。
6. `npm run check` 通过。

**实施说明**

- 不要让 DailyVault test 依赖 ZNorth 写入。
- 可以在测试中写临时 envelope JSON 后用 ZNorth dry-run 命令验证，前提是路径存在且不会写入。

**依赖**

- 依赖 DV-1.1、DV-1.2。

---

### Story DV-2.2：添加泄漏防护与负向测试

**用户故事**  
作为 DailyVault 用户，我希望即使 Source 中存在私密路径或正文，ZNorth envelope 也只包含 allowlist 字段，这样公开候选不会泄漏个人 Vault 内容。

**验收标准**

1. 私有 visibility Source 被拒绝。
2. 缺少 `analysis_allowed` Source 被拒绝。
3. 缺少 `public_summary` Source 被拒绝。
4. 缺少 `public_risk_level` Source 被拒绝。
5. 包含绝对路径字符串的候选投影被 leakage guard 拒绝。
6. Source body 中包含敏感文本但 public fields 安全时，envelope 不包含 body 敏感文本。
7. 输出 JSON 不包含 `Daily/`、`Notes/`、`Clippings/` raw body 或 `/Users/` 绝对路径。
8. 拒绝结果不保存 raw body。

**实施说明**

- 泄漏防护是 final guard，不替代 allowlist mapping。
- 不要用宽泛正则误删公开 URL；`https://...` URL 可作为 `canonical_url` 信号，但首版不必输出 URL。

**依赖**

- 依赖 DV-1.1。

---

# Epic DV-3：扩展输入类型与增量运行观察性

## Epic 目标

在 Source 首版稳定后，评估并实现 Daily/Clipping 输入、dry-run report 和最小增量状态，保持同一隐私门禁与 envelope mapper。

## 业务价值

- 让 DailyVault 不只从整理后的 Source，也能从显式授权的 Daily/Clipping projection 发现候选。
- 支持人工触发的安全重复运行。

## Stories

### Story DV-3.1：设计 Daily/Clipping projection 扩展

**用户故事**  
作为 DailyVault 维护者，我希望 Daily/Clipping 只有在存在显式公开摘要投影时才能生成候选，这样原始日记或剪藏正文不会被直接交给 ZNorth。

**验收标准**

1. Daily/Clipping 不读取 raw body 直接生成 ZNorth summary。
2. Daily projection 必须来自已审查公开摘要块或结构化公开导出记录。
3. Clipping projection 必须由 Source 或 Daily 明确引用并授权。
4. `source.kind` 对应 ZNorth 允许值：`daily` 或 `clipping`。
5. 复用 DV-1 mapper 接口，不新增 HTTP/MCP 分叉逻辑。
6. 输出设计文档更新后再进入开发。

**实施说明**

- 本 story 是设计/准备，不要求实现。
- 需要先观察真实 Daily/Clipping 数据形态。

**依赖**

- 依赖 Epic DV-1 完成。

---

### Story DV-3.2：提供本地 dry-run report 与最小增量状态

**用户故事**  
作为维护者，我希望批量候选生成可以 dry-run 并解释扫描/跳过/更新原因，这样我能审查候选输出而不写任何下游状态。

**验收标准**

1. dry-run report 列出 scanned、eligible、rejected、unchanged、changed 计数。
2. 每个 rejected item 有机器可读 reason，不含 raw body。
3. 增量状态只保存 source ref、digest、last result、timestamp。
4. 中断后可安全重跑。
5. 状态不成为第二份内容数据库。
6. 不实现定时调度。

**实施说明**

- 只有在单条 promotion 已稳定后再实现。
- 状态文件位置需另行设计，避免污染 Daily/Sources。

**依赖**

- 依赖 DV-2.1。

---

## 3. 建议实施顺序

1. DV-1.1：先替换 ZNorth mapper 与 eligibility gate。
2. DV-1.2：补 stable id/ref/digest。
3. DV-2.2：补负向隐私测试，但实现依赖 DV-1.1 mapper。
4. DV-1.3：确保 MCP/HTTP smoke path。
5. DV-2.1：执行 ZNorth dry-run compatibility。
6. DV-3 作为下一轮规划/实现，不阻塞 Source 首版。

## 4. 覆盖矩阵

| PRD requirement | Stories |
| --- | --- |
| ZNorth envelope v1 output | DV-1.1, DV-2.1 |
| Visibility gate | DV-1.1, DV-2.2 |
| Analysis authorization gate | DV-1.1, DV-2.2 |
| Explicit risk | DV-1.1, DV-2.2 |
| Stable candidateId/ref/digest | DV-1.2 |
| No raw body / no sensitive path leakage | DV-1.1, DV-2.2 |
| MCP/HTTP shared path | DV-1.3 |
| ZNorth dry-run compatibility | DV-2.1 |
| Future Daily/Clipping support | DV-3.1 |
| Incremental batch observability | DV-3.2 |

## 5. 下一步 BMAD 工作

运行 **Implementation Readiness Check**，检查 PRD、architecture、epics/stories 和当前 Server 代码是否一致。通过后生成 sprint status，并创建 Story DV-1.1 进入开发准备。
