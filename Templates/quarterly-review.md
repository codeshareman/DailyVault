---
date: {{date:YYYY-MM-DD}}
quarter: "{{date:YYYY}}-Q{{date:Q}}"
year: {{date:YYYY}}
note_type: summary
period_type: quarterly
---

# 季度复盘 — {{date:YYYY}} Q{{date:Q}}

## 本季度总结
- 

## 下季度重点
- [ ] 
- [ ] 
- [ ] 

## Dataview 汇总

### Daily

```dataview
LIST
FROM "Daily"
WHERE note_type = "daily-log" AND quarter = this.quarter
SORT date ASC
```

### 未完成事项

```dataview
TASK
FROM "Daily"
WHERE !completed AND quarter = this.quarter
GROUP BY file.link
```

### 条目分类

```dataview
TABLE length(rows) AS 数量
FROM "Daily"
FLATTEN file.lists AS item
FLATTEN item.tags AS tag
WHERE quarter = this.quarter AND startswith(tag, "#kind/")
GROUP BY tag
SORT length(rows) DESC
```

### 随手记录（闪念）

```dataview
TABLE WITHOUT ID date AS 日期, item.text AS 闪念
FROM "Daily"
FLATTEN file.lists AS item
WHERE quarter = this.quarter AND meta(item.section).subpath = "随手记录" AND item.text
SORT date ASC
```

### 输入

```dataview
TABLE WITHOUT ID date AS 日期, item.text AS 输入
FROM "Daily"
FLATTEN file.lists AS item
WHERE quarter = this.quarter AND meta(item.section).subpath = "输入" AND item.text
SORT date ASC
```

### 输出

```dataview
TABLE WITHOUT ID date AS 日期, item.text AS 输出
FROM "Daily"
FLATTEN file.lists AS item
WHERE quarter = this.quarter AND meta(item.section).subpath = "输出" AND item.text
SORT date ASC
```

### 生活时间线

```dataview
TABLE WITHOUT ID date AS 日期, item.text AS 时间线
FROM "Daily"
FLATTEN file.lists AS item
WHERE quarter = this.quarter AND meta(item.section).subpath = "生活时间线" AND item.text
SORT date ASC
```
