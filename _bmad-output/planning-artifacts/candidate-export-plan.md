---
title: DailyVault 授权候选导出计划
status: ready-for-planning
date: 2026-07-13
owner_repository: DailyVault
outbound_contract: Candidate Envelope v1
---

# 目标

在不改变 Daily 作为唯一时间主线、不公开私人原文的前提下，从明确授权范围增量发现可供 ZNorth 人工评估的脱敏候选。

# 仓库职责

DailyVault 拥有私人时间线、笔记、剪藏和来源记录；只决定什么材料允许 AI 分析，不决定品牌采纳或公开发布。正式公开内容由 ZNorth 管理。

# 扫描边界

默认允许：

- `Daily/`
- `Notes/`
- 已整理并显式允许分析的 `Sources/`

条件允许：

- `Clippings/` 仅在被 Daily、Note 或 Source 明确引用且授权分析时进入上下文。

默认禁止：

- `Server/logs/`、私密附件、未授权目录、模板与 Obsidian 内部状态；
- `visibility: private` 的正文导出；
- 隐私或授权无法确定的材料。

# Candidate Envelope v1 投影

每个候选只输出：稳定 candidateId、不透明 source.ref、内容 digest、更新时间、分析授权、隐私判断、标题、脱敏摘要、短摘录、kind、evidenceStatus、suggestedFormat。

不得输出本地绝对路径、原始 Daily 全文、个人健康或凭证信息，也不得输出 ZNorth 状态。

# Epic 与 Story

## Epic DV-1：建立授权扫描边界

### DV-1.1 定义 allowlist 与拒绝优先级

- 目录允许只是第一层；单条记录的 private/deny 必须覆盖目录允许。
- 验收：未声明或冲突时默认拒绝；测试覆盖 allow、deny、继承和条件引用。

### DV-1.2 实现隐私最小化投影

- 从允许材料生成脱敏摘要，不复制原始正文。
- 验收：候选不含绝对路径、私人字段、凭证、Server 日志或未授权正文。

## Epic DV-2：生成增量 Candidate Envelope

### DV-2.1 稳定 ref 与 digest

- ref 在文件移动以外的普通内容更新中保持可关联；digest 反映候选相关内容。
- 验收：未变化材料不重复输出；内容变化生成新 digest；删除或撤权后不再导出。

### DV-2.2 严格 schema 导出

- 输出 Candidate Envelope v1，并在落盘前校验。
- 验收：每个输出均可被共享 schema 验证；隐私不确定时无输出并记录本地原因。

## Epic DV-3：本地增量运行与审计

### DV-3.1 提供 dry-run

- 展示将扫描、跳过、更新的记录及原因，不写候选。
- 验收：dry-run 不修改候选状态或源文件。

### DV-3.2 持久化最小增量状态

- 仅保存 source ref、digest、最近结果和时间；不建立第二份内容数据库。
- 验收：中断后可安全重跑；失败不把未验证候选标为已导出。

# 实施顺序

1. DV-1 明确授权和隐私规则。
2. DV-2 完成契约与增量语义。
3. DV-3 增加可观察的本地运行。
4. 稳定后再考虑定时调度；首版只要求人工触发。

# 非目标

- 自动晋升、编辑或发布。
- 直接生成 MRZZZ 博客数据。
- 扩展新的 Sources 分类体系。
- 让 ZNorth 读取 DailyVault 文件系统。
