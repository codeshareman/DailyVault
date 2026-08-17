# DailyVault

DailyVault 是一个日期优先的个人记录库。每天只写一份 `Daily/YYYYMMDD.md`；文章、工具、想法、行动、结果和生活片段都以当天的语境记录。Dataview 再从这些 Daily 页面生成周/月/季/年汇总。

## 日常目录

```text
Daily/       # 唯一日常记录源
Clippings/   # Web Clipper 原文快照
Summaries/   # 从 Daily 派生的复盘与 Dataview 汇总
Templates/   # Daily 和复盘模板
```

本地 HTTP/MCP 支持代码位于隐藏目录 `.dailyvault/openapi/`，与 Obsidian 内容层分开；其 OpenAPI 契约也保留在该目录中。

## 每天怎么写

1. 用 QuickAdd 创建 `Daily/YYYYMMDD.md`。
2. 今日计划最多写三项；白天的临时内容都追加到“随手记录”。
3. 文章、工具、课程和反馈写在“输入”；实际结果写在“输出”；生活经历写在“生活时间线”。
4. 晚上补“学到”“复盘”和“明日 / 迁移”。空白可以留空。

```markdown
## 输入
- 读了 [[Clippings/在花大钱之前，先花一笔小钱验证你的决策]]，其中的小成本验证思路值得尝试。
- 发现了 [某个任务工具](https://example.com)，准备在本周试用。

## 输出
- 用新工具整理了本周任务。

## 学到
- 先验证使用场景，再投入迁移成本。
```

同一件事不必重复记录：接触到一篇文章是输入；它带来的个人认识才是“学到”；实际产出才是“输出”。

## 分类标识

固定章节提供一级分类。需要在 Dataview 中按类型统计的条目，再在行尾添加一个 `#kind/...` 标签：

```markdown
- 读了某篇文章 #kind/article
- 发现了一个任务工具 #kind/tool
- 看了一部电影 #kind/movie
- 练了 30 分钟力量 #kind/fitness
```

常用类型只有：`article`、`tool`、`course`、`book`、`video`、`podcast`、`movie`、`music`、`place`、`fitness`、`decision`、`project`。主题需要长期追踪时，才额外添加 `#topic/...`；不要为每条记录补一组字段。

## Clippings

Obsidian Web Clipper 直接写入 `Clippings/`。需要在 Daily 中提及时，添加一个可读链接和当天的判断；不要为剪藏再创建第二份资料记录。

## 汇总

周期复盘落在 `Summaries/{weekly,monthly,quarterly,yearly}/`，两种生成方式：QuickAdd「创建周/月/季/年复盘」建骨架（Dataview 自动统计），或让 AI 调用 `period-review` skill 全自动生成。模板的 Dataview 查询只读取 `Daily/`：

- 页面覆盖和日期属性；
- 未完成任务；
- “随手记录”（闪念）、“输入”“输出”“生活时间线”章节中的列表项。

这让 Daily 保持人可读，同时仍可按周、月、季、年回看。
