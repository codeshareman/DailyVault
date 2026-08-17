---
date: {{date:YYYY-MM-DD}}
year: {{date:YYYY}}
note_type: stats
period_type: yearly
---

# {{date:YYYY}} 统计

> [[{{date:YYYY}}]]

## 章节条目统计

```dataview
TABLE WITHOUT ID 章节, length(rows) AS 条数
FROM ""
FLATTEN file.lists AS item
FLATTEN nonnull(list(item.section)) AS section
WHERE note_type = "daily-log" AND year = this.year AND item.text
GROUP BY meta(section).subpath AS 章节
SORT length(rows) DESC
```

## 每日活跃度

```dataview
TABLE WITHOUT ID date AS 日期, length(rows) AS 条目数
FROM ""
FLATTEN file.lists AS item
WHERE note_type = "daily-log" AND year = this.year AND item.text
GROUP BY date
SORT date ASC
```

## 计划完成情况

```dataview
TABLE WITHOUT ID date AS 日期, length(filter(rows, (r) => r.item.completed)) AS 完成, length(rows) AS 计划
FROM ""
FLATTEN file.lists AS item
FLATTEN nonnull(list(item.section)) AS section
WHERE note_type = "daily-log" AND year = this.year AND item.task AND meta(section).subpath = "今日计划" AND item.text
GROUP BY date
SORT date ASC
```

## 未完成任务

```dataview
TASK
FROM ""
WHERE !completed AND note_type = "daily-log" AND year = this.year AND text
GROUP BY file.link
```

## 条目分类

```dataview
TABLE WITHOUT ID tag AS 类型, length(rows) AS 条目数
FROM ""
FLATTEN file.lists AS item
FLATTEN item.tags AS tag
WHERE note_type = "daily-log" AND year = this.year AND startswith(tag, "#kind/")
GROUP BY tag
SORT length(rows) DESC
```

## 剪藏输入

```dataview
TABLE WITHOUT ID file.link AS 剪藏, description AS 摘要
FROM "Clippings"
WHERE created.year = this.year
SORT file.name ASC
```