# Templates

| 模板 | 用途 |
| --- | --- |
| `daily.md` | 每日计划、记录和收尾。 |
| `weekly-review.md` | 基于 Daily 的周复盘。 |
| `monthly-review.md` | 基于 Daily 的月复盘。 |
| `quarterly-review.md` | 基于 Daily 的季度复盘。 |
| `yearly-review.md` | 基于 Daily 的年度复盘。 |

Daily 模板保持低摩擦：最多三项计划，其他章节只保留一个自由记录入口。周期模板只保留本期总结、下期三项重点和 Dataview 汇总；不要加入 Source、Note 或领域专用字段。

周期复盘的创建入口：QuickAdd「创建周/月/季/年复盘」生成骨架（Templater 填日期、Dataview 自动统计），或让 AI 调用 `period-review` skill 全自动生成。

固定章节是一级分类；需要 Dataview 统计的列表项使用一个 `#kind/...` 标签。标签是可选的，但文章、工具、课程、地点、训练和项目等可复用类型应优先标记。
