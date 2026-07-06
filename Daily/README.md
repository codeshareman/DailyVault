# Daily

`Daily/YYYYMMDD.md` 是日期主线。创建 Sources、Notes、Summaries 或 Exports 之前，先从这里开始。

## Daily 应回答

1. 今天输入了什么？
2. 今天输出了什么？
3. 今天做了什么？
4. 接下来要做什么？
5. 今天学到了什么、复盘出了什么？

它也可以记录生活时间线信号：看了、读了、听了、学了、去了、练了、做了、感受了、决定了什么。

## 规则

- 每天一个文件：`YYYYMMDD.md`。
- 默认不要创建按天分类的子文件夹。
- 先写 Daily；只有额外元数据有用时，才创建 Source。
- 特定领域研究放在独立项目中。
- 面向用户的行要保持可读；当一条记录需要链接到长期元数据时，使用 `[[Sources/category/YYYYMMDD-slug|可读名称]]`。

## Dataview 索引

```dataview
TABLE date, weekday, focus_area, mood, energy, status
FROM "Daily"
WHERE note_type = "daily-log"
SORT date DESC
LIMIT 14
```

```dataview
TASK
FROM "Daily"
WHERE !completed
GROUP BY file.link
```

公开/博客候选应来自 frontmatter 明确设置 `visibility: summary` 或 `visibility: public` 的 `Sources/` 记录；不要让 Daily 行承担导出元数据。
