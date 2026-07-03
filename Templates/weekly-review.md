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

## 可选：Dataview 证据

```dataview
TABLE date, weekday, focus_area, mood, energy, status
FROM "Daily"
WHERE note_type = "daily-log" AND week = this.week
SORT date ASC
```

```dataview
TASK
FROM "Daily"
WHERE !completed AND week = this.week
GROUP BY file.link
```
