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

# 季度复盘 — {{date:YYYY}} Q{{date:Q}}

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

## Dataview 证据

### Daily 覆盖

```dataview
TABLE length(rows) AS 天数
FROM "Daily"
WHERE note_type = "daily-log" AND quarter = this.quarter
GROUP BY month
SORT month ASC
```

### Sources 生活/输入分类统计

```dataview
TABLE length(rows) AS 数量
FROM "Sources"
WHERE quarter = this.quarter AND note_type = "source"
GROUP BY category
SORT length(rows) DESC
```

```dataview
TABLE length(rows) AS 数量
FROM "Sources"
WHERE quarter = this.quarter AND note_type = "source"
GROUP BY source_type
SORT length(rows) DESC
```

```dataview
TABLE length(rows) AS 数量
FROM "Sources"
WHERE quarter = this.quarter AND note_type = "source"
GROUP BY visibility
SORT length(rows) DESC
```
### Source 兴趣与公开候选

```dataview
TABLE length(rows) AS 数量
FROM "Sources"
FLATTEN interest_tags AS interest
WHERE quarter = this.quarter AND note_type = "source" AND interest
GROUP BY interest
SORT length(rows) DESC
```

```dataview
TABLE title, category, source_type, public_score, visibility, daily_path
FROM "Sources"
WHERE quarter = this.quarter AND note_type = "source" AND contains(list("summary", "public"), visibility)
SORT public_score DESC, date DESC
```

### Notes 状态

```dataview
TABLE length(rows) AS 数量
FROM "Notes"
WHERE quarter = this.quarter AND note_type = "fleeting-note"
GROUP BY status
SORT length(rows) DESC
```
