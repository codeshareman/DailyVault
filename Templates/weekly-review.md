---
summary_id: dv_week_{{date:GGGG-[W]WW}}
date: {{date:YYYY-MM-DD}}
week: "{{date:GGGG-[W]WW}}"
month: "{{date:YYYY-MM}}"
quarter: "{{date:YYYY}}-Q{{date:Q}}"
year: {{date:YYYY}}
module: Summaries
note_type: summary
period_type: weekly
created: {{date:YYYY-MM-DD}}
visibility: private
reviewed: false
---

# Weekly Review — {{date:GGGG-[W]WW}}

## 本周一句话


## 完成了什么

-

## 值得记住的生活片段

- 看 / 读 / 听：
- 学：
- 去 / 活动：
- 练 / 身体：
- 其他：

## 反复出现的问题

-

## 下周 Top 3

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
WHERE note_type = "daily-log" AND week = this.week
SORT date ASC
```

### Sources 生活/输入分类统计

```dataview
TABLE length(rows) AS Count
FROM "Sources"
WHERE week = this.week AND note_type = "source"
GROUP BY category
SORT length(rows) DESC
```

```dataview
TABLE length(rows) AS Count
FROM "Sources"
WHERE week = this.week AND note_type = "source"
GROUP BY source_type
SORT length(rows) DESC
```

```dataview
TABLE length(rows) AS Count
FROM "Sources"
WHERE week = this.week AND note_type = "source"
GROUP BY visibility
SORT length(rows) DESC
```
### Source 公开候选

```dataview
TABLE title, category, source_type, public_score, visibility, daily_path
FROM "Sources"
WHERE week = this.week AND note_type = "source" AND contains(list("summary", "public"), visibility)
SORT public_score DESC, date DESC
```

### Notes 状态与未完成事项

```dataview
TABLE length(rows) AS Count
FROM "Notes"
WHERE week = this.week AND note_type = "fleeting-note"
GROUP BY status
SORT length(rows) DESC
```

```dataview
TASK
FROM "Daily" OR "Notes"
WHERE !completed AND week = this.week
GROUP BY file.link
```
