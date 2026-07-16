---
title: DailyVault 到 ZNorth Candidate Envelope v1 PRD
status: ready-for-architecture
date: 2026-07-16
owner_repository: DailyVault
method: bmad-prd
source_plan: _bmad-output/planning-artifacts/candidate-export-plan.md
handoff: /tmp/dailyvault-znorth-handoff.md
upstream_system: DailyVault
downstream_contract: ZNorth Candidate Envelope v1
---

# DailyVault 到 ZNorth Candidate Envelope v1 PRD

## 1. 背景

ZNorth 的 Candidate Envelope v1 输入契约与增量导入/去重已经完成。交接文档明确：下一步不是继续 MRZZZ，而是让 DailyVault 在上游产生可被 ZNorth 导入的 `candidate-envelope.v1` 候选信封。

DailyVault 的现有职责保持不变：`Daily/YYYYMMDD.md` 是事实时间线，`Sources/` 保存可复用资料元数据，`Exports/` 只导出 `visibility: summary` 或 `visibility: public` 的记录。Server 已暴露 `dailyvault.promote_candidate` 和 `POST /promotions/candidate`，但当前 ZNorth promotion 仍是 DailyVault 自定义候选对象，不是 ZNorth canonical envelope。

## 2. 产品目标

让 DailyVault 在不泄露私人时间线、原始剪藏、Notes 正文或敏感路径的前提下，为显式允许公开摘要/公开分析的记录生成 ZNorth `candidate-envelope.v1`。

成功后，用户或 agent 可以通过 MCP/HTTP 请求 DailyVault 生成候选信封，再手动或通过外部命令对 ZNorth import 做 dry-run。DailyVault 本身不写 ZNorth、不做人工接受/拒绝、不创建 Draft/Publication。

## 3. 用户与任务

主要用户：DailyVault/ZNorth 同一维护者。

核心任务：当某个 DailyVault Source 或未来 Daily/Clipping 的公开摘要值得进入 ZNorth 内容池时，用户希望 DailyVault 生成一个隐私安全、稳定、可重复验证的候选信封，而不是复制原始笔记或让 ZNorth 读取 DailyVault 文件系统。

## 4. 范围

### 4.1 范围内

1. 在 `dailyvault.promote_candidate` / `POST /promotions/candidate` 的 ZNorth target 路径中生成 `candidate-envelope.v1`。
2. 首版以 `Sources/` 记录为输入；Daily/Clipping 作为后续扩展 story，因为当前 Server promotion 已以 `source_path` 读取 Source。
3. 只允许 `visibility: summary` 或 `visibility: public`。
4. 要求显式分析授权：首版使用 Source frontmatter 字段 `analysis_allowed: true`，输出时映射为 `authorization.analysisAllowed: true`。
5. `source.ref` 必须是 DailyVault 生成的不透明稳定 ref，不要求 ZNorth 解析。
6. `source.digest` 必须对脱敏公开投影稳定：同一安全投影不变，digest 不变；投影变化，digest 变化。
7. 摘要字段只来自公开字段或安全摘要字段：`public_title` / `title`、`public_summary`、`public_tags`、公开评分/分类。
8. 输出必须能通过 ZNorth dry-run import validator。
9. MCP 与 HTTP 使用同一 mapper/validator 代码路径。
10. 添加聚焦测试，覆盖隐私门禁、授权门禁、稳定 ID/digest、字段映射、泄漏防护、HTTP/MCP 共享路径。

### 4.2 范围外

1. 不自动导入 ZNorth，不运行 `--apply`。
2. 不让 ZNorth 读取 DailyVault 内部路径。
3. 不导出 Daily 原文、Clipping 原文、Notes 正文、私人姓名、私人地址、敏感工作细节、敏感健康细节。
4. 不创建 Draft、Publication、Public Bundle 或 MRZZZ 数据。
5. 不扩大 Sources 分类体系，不修改 Daily 模板。
6. 不把 AI recommendation 当作人工接受/拒绝。
7. 不引入后台定时同步；首版人工触发。

## 5. 功能需求

### FR1 — ZNorth Envelope 生成

当 `target: "znorth"` 且输入 Source 记录满足授权和隐私门禁时，DailyVault 返回 envelope：

```json
{
  "schemaVersion": "candidate-envelope.v1",
  "candidateId": "cand_YYYYMMDD_slug",
  "source": {
    "system": "dailyvault",
    "ref": "opaque-source-ref",
    "digest": "sha256:<hex>",
    "kind": "source"
  },
  "authorization": {
    "analysisAllowed": true,
    "privacy": "summary"
  },
  "summary": {
    "title": "",
    "readerPromise": "",
    "digestSummary": ""
  },
  "signals": [],
  "evidence": {
    "status": "verified",
    "role": "inspiration"
  },
  "risk": {
    "level": "medium",
    "notes": ""
  },
  "aiRecommendation": {
    "recommendedAction": "triage",
    "rationale": "",
    "rank": null
  }
}
```

### FR2 — 隐私与授权失败关闭

以下输入必须拒绝或返回不可提升状态，不能生成 envelope：

1. `visibility` 缺失、`private`、`unknown`、`unreviewed` 或其他非 `summary/public`。
2. 分析授权缺失或不是字面 `true`。
3. 缺少公开摘要字段，且只能从正文或私密字段推断摘要。
4. Source 记录包含显式 private/deny 标记。
5. 生成投影中出现绝对路径、Daily/Notes/Clippings 原文或敏感字段。

### FR3 — 稳定 ID 与 digest

1. `candidateId` 必须符合 ZNorth `cand_YYYYMMDD_slug` 规则。
2. `candidateId` 基于 Source 日期和公开标题/source id 生成；同一安全投影重复请求生成相同 ID。
3. `source.digest` 基于规范化脱敏投影计算，不包含 Vault 绝对路径或不稳定对象顺序。
4. 公开投影变化时 digest 改变。

### FR4 — 不透明 `source.ref`

1. DailyVault 可保留内部可追溯性，但输出给 ZNorth 的 `source.ref` 不应要求 ZNorth 解析路径。
2. 首版 ref 推荐形态：`dv:source:<source_id>`，缺少 `source_id` 时使用路径 hash。
3. 输出不得包含本地绝对路径；默认不输出可读 vault-relative path。

### FR5 — 验证与 dry-run 兼容

1. DailyVault 侧 mapper 有本地 schema 校验，拒绝未知/缺失字段。
2. 测试至少生成一个合法 envelope fixture，并用 ZNorth dry-run validator 验证；如果跨仓调用不适合放进自动测试，则用本地 contract mirror 测试兜底，并在 story 验证记录中手动执行 ZNorth dry-run。
3. `npm run check` 在 `Server/` 下通过。

## 6. 非功能需求

1. 安全默认值：失败关闭，不以低风险默认通过。
2. 可重复：同一输入可安全重复运行。
3. 可审计：非 dry-run 写入 DailyVault audit 时，不记录私密正文。
4. 低耦合：DailyVault 不依赖 ZNorth 内部文件结构；只依赖 `candidate-envelope.v1` JSON contract。
5. 可维护：HTTP 与 MCP 不复制 mapper 逻辑。
6. Markdown-first：Source 仍是事实元数据来源，不新增第二份内容数据库。

## 7. 验收标准

1. `visibility: private` 或缺失 visibility 的 Source 不生成 ZNorth envelope。
2. 缺少显式 analysis authorization 的 Source 不生成 ZNorth envelope。
3. 合法 `summary/public` Source 生成 `schemaVersion: candidate-envelope.v1` 且 `source.system: dailyvault`。
4. 生成 envelope 的 `source.kind` 首版为 `source`；后续 Daily/Clipping 扩展必须使用 ZNorth 允许的 `daily` / `clipping`。
5. 生成 envelope 不包含原始 Daily body、Clipping body、Notes body、绝对路径、敏感健康细节、敏感工作细节、私人姓名或私人地址。
6. 同一安全投影重复调用产生相同 `candidateId` 与 `source.digest`。
7. 安全投影变化导致 `source.digest` 变化。
8. HTTP `/promotions/candidate` 与 MCP `dailyvault.promote_candidate` 返回同一 envelope 结构。
9. 合法 envelope 通过 ZNorth dry-run import validator。
10. `Server/npm run check` 通过。

## 8. 依赖与证据

- DailyVault 主线与目录职责：`README.md`、`AGENTS.md`。
- Source 元数据、公开字段与评分：`Sources/README.md`、`Templates/source.md`。
- 公开导出规则：`Exports/README.md`。
- Server 入口：`Server/README.md`、`Server/src/bridge/promotion.js`、`Server/src/http/server.js`、`Server/src/mcp/server.js`。
- ZNorth contract：`../ZNorth/_bmad-output/implementation-artifacts/stories/2-1-candidate-envelope-v1-input-contract.md`。
- ZNorth idempotent import：`../ZNorth/_bmad-output/implementation-artifacts/stories/2-2-incremental-import-and-dedupe.md`。

## 9. 待定问题

1. 首版采用 `analysis_allowed: true` 作为 Source frontmatter 字段；如未来需要更完整授权对象，再映射到 envelope 的 `authorization`。
2. 首版要求 `public_risk_level`，不缺省为 `low`；这会增加人工审查成本，但符合失败关闭原则。
3. `source.ref` 优先使用 `source_id`，缺失时使用路径 hash；不输出可读本地路径。
