# Templates

DailyVault 脚手架的可复用模板。模板只定义结构，不是自动化契约。

## 文件

| 模板 | 用途 |
| --- | --- |
| `daily.md` | 轻量每日计划、日志、输入/输出、生活时间线、学习、复盘和迁移。 |
| `source.md` | AI 辅助的资料/链接记录：用户只提供 URL 也可以，由 AI 填写可观察元数据、分类、评分、摘要、Daily 回链和下一步。 |
| `note.md` | 轻量闪念笔记。 |
| `weekly-review.md` | 基于 Daily 优先证据的周复盘。 |
| `monthly-review.md` | 基于 Daily 优先证据的月复盘。 |
| `quarterly-review.md` | 基于 Daily 优先证据的季度复盘。 |
| `yearly-review.md` | 基于 Daily 优先证据的年度复盘。 |

## 模板策略

- `daily.md` 保持通用。
- 不要给 `daily.md` 添加领域专用章节。
- 在真实数据和工作流需求出现之前，不添加特定服务自动化。
- 不要创建 `clipping.md`；Obsidian Web Clipper 管理剪藏格式。
- 优先使用自然语言每日记录；不要在普通 Daily 行暴露冗长的 Dataview 行内字段。
- Source 捕捉由 AI 辅助：模板有完整元数据字段，但用户不应手动填写；AI 从公开资料填可观察字段，未知字段留空。

## Daily 列表约定

- 重复记录使用无序列表，不使用单行桶。一天可以有多条观看、阅读、聆听、到访、训练或工具记录。
- 当一行需要链接到长期资源时，使用带别名的 Markdown wiki 链接：`[[Sources/category/YYYYMMDD-slug|可读名称]]`。
- 名称和链接保持在一起。不要写成分离的 `名称 [[链接]]`，也不要在面向用户的 Daily 行暴露 `title/source/summary` 行内字段语法。

## 复盘指标维度

周/月/季/年模板在 AI 综合之前，应先暴露这些 Dataview 维度：

- Daily 覆盖：按周/月/季/年统计真实记录天数。
- 生活时间线 / 输入：使用可读 Daily 链接供人工复盘；聚合统计主要来自已链接的 `Sources` frontmatter。
- Sources：category、source_type、visibility、兴趣标签和摘要/公开导出候选。
- Notes：状态计数和未解决的笔记分诊任务。
- 任务：按文件分组的 Daily/Notes 未完成任务。
