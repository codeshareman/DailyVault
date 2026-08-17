# Templates

| 模板 | 用途 |
| --- | --- |
| `daily.md` | 每日计划、记录和收尾；首行 Templater 命令自动把文件按年归入 `Daily/YYYY/`（QuickAdd 创建到 `Daily/` 根后自动移动）。 |
| `weekly-review.md` | 基于 Daily 的周复盘。 |
| `monthly-review.md` | 基于 Daily 的月复盘。 |
| `quarterly-review.md` | 基于 Daily 的季度复盘。 |
| `yearly-review.md` | 基于 Daily 的年度复盘。 |

Daily 模板保持低摩擦：最多三项计划，其他章节只保留一个自由记录入口。模板在每个章节标题下内置一行 HTML 注释标记，说明该章节的用途和适用的 `#kind/...` 标签——编辑时可见、阅读时隐藏、不进入 Dataview 统计。“输入”章节还内置“今日剪藏输入（自动）”查询，按 `Clippings/` 的 `created` 字段自动归集当天剪藏。周期模板只保留本期总结、下期三项重点和 Dataview 汇总；不要加入 Source、Note 或领域专用字段。

周期复盘的创建入口：QuickAdd「创建周/月/季/年复盘」生成骨架（Templater 填日期、Dataview 自动统计），或让 AI 调用 `period-review` skill 全自动生成。

固定章节是一级分类；需要 Dataview 统计的列表项在行尾使用一个 `#kind/...` 标签。模板已内置标签引导，文章、工具、课程、地点、训练和项目等可复用类型应优先标记。
