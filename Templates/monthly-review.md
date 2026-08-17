---
date: {{date:YYYY-MM-DD}}
month: "{{date:YYYY-MM}}"
quarter: "{{date:YYYY}}-Q{{date:Q}}"
year: {{date:YYYY}}
note_type: summary
period_type: monthly
---

# 月复盘 — {{date:YYYY-MM}}

## 本月总结
- 

## 下月重点
- [ ] 
- [ ] 
- [ ] 

## Dataview 汇总

### Daily

```dataview
LIST
FROM "Daily"
WHERE note_type = "daily-log" AND month = this.month
SORT date ASC
```

### 未完成事项

```dataview
TASK
FROM "Daily"
WHERE !completed AND month = this.month
GROUP BY file.link
```

### 条目分类

```dataview
TABLE length(rows) AS 数量
FROM "Daily"
FLATTEN file.lists AS item
FLATTEN item.tags AS tag
WHERE month = this.month AND startswith(tag, "#kind/")
GROUP BY tag
SORT length(rows) DESC
```

### 随手记录（闪念）

```dataview
LIST item.text
FROM "Daily"
FLATTEN file.lists AS item
WHERE month = this.month AND meta(item.section).subpath = "随手记录"
SORT date ASC
```

### 输入

```dataview
LIST item.text
FROM "Daily"
FLATTEN file.lists AS item
WHERE month = this.month AND meta(item.section).subpath = "输入"
SORT date ASC
```

### 输出

```dataview
LIST item.text
FROM "Daily"
FLATTEN file.lists AS item
WHERE month = this.month AND meta(item.section).subpath = "输出"
SORT date ASC
```

### 生活时间线

```dataview
LIST item.text
FROM "Daily"
FLATTEN file.lists AS item
WHERE month = this.month AND meta(item.section).subpath = "生活时间线"
SORT date ASC
```
