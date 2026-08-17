# Daily

`Daily/YYYYMMDD.md` 是唯一的日常记录源。每个文件使用 `Templates/daily.md` 创建，并保持以下固定章节：今日计划、随手记录、输入、输出、生活时间线、学到、复盘、明日 / 迁移。

规则：

- 每天一个文件，不创建日期子目录。
- 今日计划最多三项；完成状态以复选框为准。
- 文章、工具、课程和反馈直接写入“输入”；不创建资料卡片。
- 需要保留网页原文时，链接 `Clippings/` 中对应文件。
- 不为统计而添加冗长行内字段；Dataview 通过章节和前置属性聚合。
- 模板每个章节下有一行 HTML 注释标记（编辑时可见），提示该章节用途和适用的 `#kind/...` 标签；写作时按提示在条目行尾打标签即可。

## 条目分类

章节负责一级分类；需要统计的条目在行尾使用一个 `#kind/...` 标签。例如：

```markdown
- 读了 [[Clippings/某篇文章]] #kind/article
- 发现了某个工具 #kind/tool
- 跑步 5 公里 #kind/fitness
```

可用类型：`article`、`tool`、`course`、`book`、`video`、`podcast`、`movie`、`music`、`place`、`fitness`、`decision`、`project`。只有要长期追踪主题时，再添加 `#topic/...`。

## Dataview 索引

```dataview
TABLE date, weekday, week
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
