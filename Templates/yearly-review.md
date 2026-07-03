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

# Yearly Review — {{date:YYYY}}

## 这一年一句话


## 年度 Top moments

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

## 可选：Dataview 证据

```dataview
TABLE month AS Month, length(rows) AS Days
FROM "Daily"
WHERE note_type = "daily-log" AND year = this.year
GROUP BY month
SORT month ASC
```

```dataview
TABLE L.event_type AS Type, length(rows) AS Count
FROM "Daily"
FLATTEN file.lists AS L
WHERE year = this.year AND L.event_type
GROUP BY L.event_type
SORT length(rows) DESC
```
