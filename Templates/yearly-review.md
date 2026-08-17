---
date: {{date:YYYY-MM-DD}}
year: {{date:YYYY}}
note_type: summary
period_type: yearly
---

# 年度复盘 — {{date:YYYY}}

## 年度总结
- 

## 下一年重点
- [ ] 
- [ ] 
- [ ] 

## Dataview 汇总

### Daily

```dataview
LIST
FROM "Daily"
WHERE note_type = "daily-log" AND year = this.year
SORT date ASC
```

### 未完成事项

```dataview
TASK
FROM "Daily"
WHERE !completed AND year = this.year
GROUP BY file.link
```

### 条目分类

```dataview
TABLE length(rows) AS 数量
FROM "Daily"
FLATTEN file.lists AS item
FLATTEN item.tags AS tag
WHERE year = this.year AND startswith(tag, "#kind/")
GROUP BY tag
SORT length(rows) DESC
```

### 随手记录（闪念）

```dataview
TABLE WITHOUT ID date AS 日期, item.text AS 闪念
FROM "Daily"
FLATTEN file.lists AS item
WHERE year = this.year AND meta(item.section).subpath = "随手记录" AND item.text
SORT date ASC
```

### 输入

```dataview
TABLE WITHOUT ID date AS 日期, item.text AS 输入
FROM "Daily"
FLATTEN file.lists AS item
WHERE year = this.year AND meta(item.section).subpath = "输入" AND item.text
SORT date ASC
```

### 输出

```dataview
TABLE WITHOUT ID date AS 日期, item.text AS 输出
FROM "Daily"
FLATTEN file.lists AS item
WHERE year = this.year AND meta(item.section).subpath = "输出" AND item.text
SORT date ASC
```

### 生活时间线

```dataview
TABLE WITHOUT ID date AS 日期, item.text AS 时间线
FROM "Daily"
FLATTEN file.lists AS item
WHERE year = this.year AND meta(item.section).subpath = "生活时间线" AND item.text
SORT date ASC
```
