---
summary_id: dv_month_{{date:YYYY-MM}}
date: {{date:YYYY-MM-DD}}
month: "{{date:YYYY-MM}}"
quarter: "{{date:YYYY}}-Q{{date:Q}}"
year: {{date:YYYY}}
module: Summaries
note_type: summary
period_type: monthly
created: {{date:YYYY-MM-DD}}
visibility: private
reviewed: false
---

# Monthly Review — {{date:YYYY-MM}}

## 本月一句话


## 关键成果

-

## 最值得记住的 5 件事

1.
2.
3.
4.
5.

## 输入 / 输出 / 学习

- 最好的输入：
- 最好的输出：
- 学到的东西：

## 生活与身体

- 看 / 读 / 听：
- 去 / 活动：
- 练 / 身体：
- 能量变化：

## 兴趣变化

- 增强：
- 新出现：
- 可以放下：

## 未完成迁移

- [ ]

## 下月 Top 3

- [ ]
- [ ]
- [ ]

## 可公开候选

-

## Dataview 证据

### Daily 覆盖

```dataview
TABLE date, weekday, focus_area, mood, energy, status
FROM "Daily"
WHERE note_type = "daily-log" AND month = this.month
SORT date ASC
```

### Sources 生活/输入分类统计

```dataview
TABLE length(rows) AS Count
FROM "Sources"
WHERE month = this.month AND note_type = "source"
GROUP BY category
SORT length(rows) DESC
```

```dataview
TABLE length(rows) AS Count
FROM "Sources"
WHERE month = this.month AND note_type = "source"
GROUP BY source_type
SORT length(rows) DESC
```

```dataview
TABLE length(rows) AS Count
FROM "Sources"
WHERE month = this.month AND note_type = "source"
GROUP BY visibility
SORT length(rows) DESC
```
### Source 兴趣与公开候选

```dataview
TABLE length(rows) AS Count
FROM "Sources"
FLATTEN interest_tags AS interest
WHERE month = this.month AND note_type = "source" AND interest
GROUP BY interest
SORT length(rows) DESC
```

```dataview
TABLE title, category, source_type, public_score, visibility, daily_path
FROM "Sources"
WHERE month = this.month AND note_type = "source" AND contains(list("summary", "public"), visibility)
SORT public_score DESC, date DESC
```

### Notes 与未完成事项

```dataview
TABLE length(rows) AS Count
FROM "Notes"
WHERE month = this.month AND note_type = "fleeting-note"
GROUP BY status
SORT length(rows) DESC
```

```dataview
TASK
FROM "Daily" OR "Notes"
WHERE !completed AND month = this.month
GROUP BY file.link
```
