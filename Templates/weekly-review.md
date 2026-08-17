---
date: {{date:YYYY-MM-DD}}
week: "{{date:GGGG-[W]WW}}"
month: "{{date:YYYY-MM}}"
quarter: "{{date:YYYY}}-Q{{date:Q}}"
year: {{date:YYYY}}
note_type: summary
period_type: weekly
---

# 周复盘 — {{date:GGGG-[W]WW}}

## 本周总结
- 

## 下周重点
- [ ] 
- [ ] 
- [ ] 

## Dataview 汇总

### Daily

```dataview
LIST
FROM "Daily"
WHERE note_type = "daily-log" AND week = this.week
SORT date ASC
```

### 未完成事项

```dataview
TASK
FROM "Daily"
WHERE !completed AND week = this.week
GROUP BY file.link
```

### 条目分类

```dataview
TABLE length(rows) AS 数量
FROM "Daily"
FLATTEN file.lists AS item
FLATTEN item.tags AS tag
WHERE week = this.week AND startswith(tag, "#kind/")
GROUP BY tag
SORT length(rows) DESC
```

### 随手记录（闪念）

```dataview
LIST item.text
FROM "Daily"
FLATTEN file.lists AS item
WHERE week = this.week AND meta(item.section).subpath = "随手记录"
SORT date ASC
```

### 输入

```dataview
LIST item.text
FROM "Daily"
FLATTEN file.lists AS item
WHERE week = this.week AND meta(item.section).subpath = "输入"
SORT date ASC
```

### 输出

```dataview
LIST item.text
FROM "Daily"
FLATTEN file.lists AS item
WHERE week = this.week AND meta(item.section).subpath = "输出"
SORT date ASC
```

### 生活时间线

```dataview
LIST item.text
FROM "Daily"
FLATTEN file.lists AS item
WHERE week = this.week AND meta(item.section).subpath = "生活时间线"
SORT date ASC
```
