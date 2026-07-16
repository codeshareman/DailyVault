# AGENTS.md

DailyVault 是个人每日操作系统和日期优先的生活时间线。`Daily/YYYYMMDD.md` 是事实记录。Sources、Clippings、Notes、Summaries 和 Exports 都服务于这条日期主线。AI 辅助提取、总结、分析、组织、复盘和准备可公开分享的数据；用户拥有每日记录。

## 核心规则

1. 不要编造事实、任务、情绪、决定、输出、训练、评分、地点或完成状态。
2. 除非用户明确要求改写，否则保留 `Daily/` 中的用户原话。
3. 优先追加分析、摘要或下一步建议，不覆盖原始笔记。
4. 保持 Vault 简单。除非用户明确要求，或 README 已定义，否则不要创建新的顶层文件夹。
5. 特定领域研究不要放进这个 Vault。应转到独立项目，不要给 `Templates/daily.md` 增加领域专用章节。
6. 总结时链接证据：Daily 笔记路径、Source 路径、剪藏路径、Note 路径，或已存在的精确源 URL。
7. 不确定结论标为 `[推断]`。
8. 除非明确指示，否则不要删除、归档、发布或导出用户笔记。
9. 默认私有。公开/博客/API 输出需要 `visibility: summary` 或 `visibility: public`。

## 目录职责

- `Daily/`：每天一个文件。由人写作的日期事实记录：计划、生活时间线、执行日志、看/读/听/去/练记录、学习、反思、任务迁移。AI 优先读取这里。
- `Inbox.md`：未处理的任务、想法、问题和临时捕捉。
- `Clippings/`：Obsidian Web Clipper 输出。插件把原始剪藏直接写到这里；不会自动关联 Daily 或 Sources。插件格式是事实来源；不要使用本地剪藏模板。
- `Sources/`：链接、媒体、活动、地点、训练/身体记录、工具和数据集的可选结构化记录。每个有用 Source 都应链接回某个 Daily 日期；只有用户提供或 AI 能识别具体剪藏文件时，才链接剪藏。
- `Notes/`：闪念、个人笔记、粗糙思考和早期想法。
- `Summaries/`：周/月/季/年复盘。
- `Exports/`：未来公开/博客/API 导出契约和生成的公开负载。
- `Templates/`：Daily、Notes、Sources 和周期复盘的可复用模板。

## AI 应协助的工作

### 每日收尾

当用户要求“daily 总结 / 收尾 / 复盘 / closeout”时使用。

先读取相关的 `Daily/YYYYMMDD.md`。只有当 Daily 行需要补充信息时，才读取已链接的 `Notes/`、`Sources/` 和 `Clippings/`。输出：

1. 今日主线
2. 重要输入
3. 重要输出
4. 实际完成
5. 生活时间线：看了、听了、学了、去了、练了什么
6. 未完成与原因
7. 学到的东西
8. 明日最重要 3 件事建议
9. 需要迁移、归档或放弃的事项
10. 可公开分享候选

规则：

- 除非笔记或用户明确说已完成，否则不要把任务标记为完成。
- 如果证据不足，写“未观察到”。
- 建议要小而可执行。

### Daily 优先提取

当需要把 Daily Markdown 文件转为结构化摘要、统计或博客/API 数据时使用。

流程：

1. 从 `Daily/YYYYMMDD.md` 选择日期范围。
2. 将行和列表项提取为类型化事件：`work`、`learn`、`watch`、`read`、`listen`、`fitness`、`place`、`event`、`tool`、`note`、`decision`、`moment`。
3. 保留 Daily 文件路径和行/章节作为证据。
4. 只从已链接的 `Sources/`、`Clippings/` 或 `Notes/` 补充信息。
5. 不要推断未写明的私密细节或指标。
6. 输出摘要、趋势、候选或导出记录时遵守 `visibility`。

### Source 链接整理

当用户提供 URL、捕捉条目、文件、电影/书/活动/训练/工具链接，或询问“这个怎么分类/打 tag/评分/整理成 Source”时使用。目标体验：用户给一个链接；AI 读取公开资料，创建或更新 Source 记录，并填入所有可观察元数据。

流程：

1. 先读取公开 URL 或用户指定的本地捕捉。不要假设 `Clippings/` 里的每个文件都已有 Daily 或 Source 关系。如果页面私有、被阻止或不可读，说明限制，只使用用户提供的事实。
2. 按意图分类：`source_type`、`category`、`Sources/` 下的目标文件夹、tags 和 `interest_tags`。
3. 填入可观察元数据：title、canonical_url、site/platform、author/creator、published_at、updated_at、language，以及可用时的 source_ref/raw_source_path。
4. 总结资料，说明它为什么可能重要，建议下一步，并给出 1-5 分 AI 推荐分：质量、相关性、行动性、记忆价值、公开价值。不确定值标为 `[推断]`；未知字段留空，不要编造。
5. 将记录链接回 `Daily/YYYYMMDD.md`。如果没有提供日期，使用今天的 Daily，并说明这个选择。
6. 如果用户明确要求执行，在目标 `Sources/` 子文件夹中创建 Source 文件；不确定时放 `Sources/inbox/`。否则返回提议的记录。

返回或写入：

1. `Sources/` 下的目标文件夹；
2. 建议文件名；
3. 完成的 frontmatter 字段；
4. 摘要和关键点；
5. tags 和 interest_tags；
6. 带简短理由的评分；
7. 关联 Daily 笔记；
8. 可见性建议；
9. 下一步行动。

除非用户要求且凭据/会话可用，否则不要浏览私有或需认证的数据。不要编造资料元数据、用户评分、地点、创作者或完成状态；AI 推荐分必须基于观察到的资料内容。

### Inbox 分诊

对每一项建议一个去向：

- `Daily/`：影响今天行动或反思。
- `Notes/`：闪念或粗糙想法。
- `Sources/`：可复用链接、媒体条目、活动、地点、训练/身体记录、工具或数据集。
- `Clippings/`：由 Obsidian Web Clipper 捕捉的文章/网页正文。
- 外部项目：领域研究或项目工作。
- 删除/放弃：已经不重要。

除非明确要求执行分诊，否则不要在没有用户批准的情况下移动条目。

### 闪念笔记提炼

用于粗糙的 `Notes/` 条目。

将笔记转换为：

- 一句话主张或问题；
- 为什么重要；
- 关联 Daily 笔记；
- 可能的下一步；
- 应保留为笔记、转为任务、转为 Source，还是迁移到其他项目。

不要过度润色早期想法。想法尚未成熟时，保留模糊性。

### 兴趣挖掘

先用 Daily，再用某个周期内已链接的 Sources 和 Notes 来推断兴趣。

输出：

- 当前活跃兴趣；
- 值得恢复的沉睡兴趣；
- 从重复捕捉中出现的新兴趣；
- 有足够证据可深入的兴趣；
- 建议的下一步实验：看/读/听/去/练/做；
- 每个判断的证据路径。

弱模式标为 `[推断]`。

### Source/资源审查

用于 `Sources/` 清理。

对每个 Source 做决定：

- 保留：有用且独特；
- 现在使用：与当前工作/生活相关；
- 归档：可能有用但不活跃；
- 删除：过时、重复或低价值；
- 导出候选：对博客/API 安全且有意义。

说明理由和证据。

### 周/月/季/年复盘

以 `Daily/` 为主要来源，再读取该周期内已链接的 `Notes/`、`Sources/`、`Clippings/` 和之前的 `Summaries/`。输出：

1. 本周期主线
2. 完成的关键结果
3. 生活时间线亮点
4. 看了 / 听了 / 学了 / 去了 / 练了什么
5. 重要输入与输出
6. 兴趣变化与值得深挖的方向
7. 反复出现的问题
8. 健身/健康趋势
9. 未完成事项迁移建议
10. 下周期最重要 3 件事
11. 博客/API 可公开候选

没有证据时，不要假装某个周期“成功”。

### 博客/API 导出审查

用于准备个人博客数据。

规则：

- 只导出 `visibility: summary` 或 `visibility: public`。
- 优先导出简洁摘要，而不是原始私密笔记。
- 除非用户批准，否则移除私人姓名、敏感工作细节、私人地址和敏感健康细节。
- 保留 `source_path` 和 `daily_path` 以便追溯。
- AI 可以提出导出候选；用户决定是否发布。

## 模板策略

- `Templates/daily.md` 必须保持低摩擦和通用：最重要 3 件事、输入、输出、做了什么、生活时间线、学习/反思和迁移。不要让每日页面像数据库表单。
- `Templates/source.md` 用于 AI 辅助的资料/链接记录。用户可以只提供 URL；AI 应填入可观察元数据、分类、标签、评分、摘要、Daily 回链和下一步。
- `Templates/note.md` 对闪念刻意保持轻量。
- 周期复盘模板位于 `Templates/*-review.md`。
- 不要增加剪藏模板；Obsidian Web Clipper 管理剪藏格式。
- 不要给每日模板添加领域专用章节。

## 跨项目桥接规则

- DailyVault 只生成 Nervia/ZNorth 候选负载，不自动写入下游项目。
- ZNorth `candidate-envelope.v1` 首版只能从 `Sources/` 下且 `note_type: source` 的 Source 记录生成；`Daily/`、`Notes/`、`Clippings/` 不能直接 promotion，必须先有显式公开摘要投影或 Source 关联。
- ZNorth promotion 必须要求 `visibility: summary | public`、`analysis_allowed: true`、`public_summary` 和 `public_risk_level`；不得从 Markdown body 兜底摘要。
- HTTP/MCP 输入必须保持类型安全；会写本地 state 或 audit 的选项只能接受真实布尔值，不能把字符串 `"false"` 当作 truthy 写入。
- Envelope、audit 和 dry-run state 不得包含 Source body、Daily/Clipping/Notes 原文、本地绝对路径、`source_path`、`dailyvault_source_path` 或 raw markdown。

## 编辑策略

编辑前：

1. 只读取相关文件。
2. 保留用户写下的 Daily 内容。
3. 优先做小而精确的更新。
4. 保持当前目录边界。

编辑后：

1. 如果改了 JSON 配置，确认仍能解析。
2. 确认已移除的领域专用引用没有重新出现。
3. 确认 `Templates/daily.md` 仍能回答：输入、输出、做了什么、下一步、学习/反思、生活时间线。
4. 确认 `Sources/` 和 `Exports/` 引用一致。
