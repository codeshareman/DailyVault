---
summary_id: dv_quarter_{{date:YYYY}}-Q{{date:Q}}
date: {{date:YYYY-MM-DD}}
quarter: "{{date:YYYY}}-Q{{date:Q}}"
year: {{date:YYYY}}
module: Summaries
note_type: summary
period_type: quarterly
created: {{date:YYYY-MM-DD}}
visibility: private
reviewed: false
---

# Quarterly Review — {{date:YYYY}} Q{{date:Q}}

## 本季度一句话


## 关键成果与转折

-

## 生活与兴趣地图

- 工作 / 创作：
- 学习：
- 影视 / 书 / 音乐：
- 旅行 / 地点 / 活动：
- 健身 / 身体：
- 人与关系：

## 值得继续深挖

-

## 应该减少或停止

-

## 下季度策略

- [ ]
- [ ]
- [ ]

## 可公开候选

-

## 可选：Dataview 证据

```dataview
TABLE month AS Month, length(rows) AS Days
FROM "Daily"
WHERE note_type = "daily-log" AND quarter = this.quarter
GROUP BY month
SORT month ASC
```

```dataview
TABLE L.event_type AS Type, length(rows) AS Count
FROM "Daily"
FLATTEN file.lists AS L
WHERE quarter = this.quarter AND L.event_type
GROUP BY L.event_type
SORT length(rows) DESC
```
