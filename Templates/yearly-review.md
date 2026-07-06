---
summary_id: dv_year_{{date:YYYY}}
date: {{date:YYYY-MM-DD}}
year: {{date:YYYY}}
module: Summaries
note_type: summary
period_type: yearly
created: {{date:YYYY-MM-DD}}
visibility: private
reviewed: false
---

# 年度复盘 — {{date:YYYY}}

## 这一年一句话


## 年度重要片段

1.
2.
3.
4.
5.

## 我完成了什么

-

## 我如何生活

- 看了什么：
- 听了什么：
- 学了什么：
- 去了哪里：
- 练了什么：
- 创造了什么：

## 兴趣画像

- 最强兴趣：
- 新兴趣：
- 值得深挖：
- 可以放下：

## 遗憾与未完成

-

## 下一年主题

-

## 可公开候选

-

## Dataview 证据

### Daily 覆盖

```dataview
TABLE length(rows) AS 天数
FROM "Daily"
WHERE note_type = "daily-log" AND year = this.year
GROUP BY month
SORT month ASC
```

### Sources 生活/输入分类统计

```dataview
TABLE length(rows) AS 数量
FROM "Sources"
WHERE year = this.year AND note_type = "source"
GROUP BY category
SORT length(rows) DESC
```

```dataview
TABLE length(rows) AS 数量
FROM "Sources"
WHERE year = this.year AND note_type = "source"
GROUP BY source_type
SORT length(rows) DESC
```

```dataview
TABLE length(rows) AS 数量
FROM "Sources"
WHERE year = this.year AND note_type = "source"
GROUP BY visibility
SORT length(rows) DESC
```
### Source 兴趣与公开候选

```dataview
TABLE length(rows) AS 数量
FROM "Sources"
FLATTEN interest_tags AS interest
WHERE year = this.year AND note_type = "source" AND interest
GROUP BY interest
SORT length(rows) DESC
```

```dataview
TABLE title, category, source_type, public_score, visibility, daily_path
FROM "Sources"
WHERE year = this.year AND note_type = "source" AND contains(list("summary", "public"), visibility)
SORT public_score DESC, date DESC
```

### Notes 状态

```dataview
TABLE length(rows) AS 数量
FROM "Notes"
WHERE year = this.year AND note_type = "fleeting-note"
GROUP BY status
SORT length(rows) DESC
```
