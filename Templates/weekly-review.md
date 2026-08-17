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

## 统计概览

### 章节条目统计

```dataview
TABLE WITHOUT ID meta(item.section).subpath AS 章节, length(rows) AS 条数
FROM "Daily"
FLATTEN file.lists AS item
WHERE week = this.week AND item.text
GROUP BY meta(item.section).subpath
SORT length(rows) DESC
```

### 每日活跃度

```dataview
TABLE WITHOUT ID date AS 日期, length(rows) AS 条目数
FROM "Daily"
FLATTEN file.lists AS item
WHERE week = this.week AND item.text
GROUP BY date
SORT date ASC
```

### 计划完成情况

```dataview
TABLE WITHOUT ID date AS 日期, length(filter(rows, (r) => r.item.completed)) AS 完成, length(rows) AS 计划
FROM "Daily"
FLATTEN file.lists AS item
WHERE week = this.week AND item.task AND meta(item.section).subpath = "今日计划"
GROUP BY date
SORT date ASC
```

### 未完成任务

```dataview
TASK
FROM "Daily"
WHERE !completed AND week = this.week
GROUP BY file.link
```

### 条目分类

```dataview
TABLE WITHOUT ID tag AS 类型, length(rows) AS 条目数
FROM "Daily"
FLATTEN file.lists AS item
FLATTEN item.tags AS tag
WHERE week = this.week AND startswith(tag, "#kind/")
GROUP BY tag
SORT length(rows) DESC
```

## 内容归集

### 闪念（随手记录）

```dataview
TABLE WITHOUT ID date AS 日期, item.text AS 闪念
FROM "Daily"
FLATTEN file.lists AS item
WHERE week = this.week AND meta(item.section).subpath = "随手记录" AND item.text
SORT date ASC
```

### 输入

```dataview
TABLE WITHOUT ID date AS 日期, item.text AS 输入
FROM "Daily"
FLATTEN file.lists AS item
WHERE week = this.week AND meta(item.section).subpath = "输入" AND item.text
SORT date ASC
```

<!-- 剪藏输入按 created 自动归集到本周期 -->

```dataview
TABLE WITHOUT ID file.link AS 剪藏, description AS 摘要
FROM "Clippings"
WHERE created.weekYear = number(split(this.week, "-")[0]) AND created.weekNumber = number(split(this.week, "-W")[1])
SORT file.name ASC
```

### 输出

```dataview
TABLE WITHOUT ID date AS 日期, item.text AS 输出
FROM "Daily"
FLATTEN file.lists AS item
WHERE week = this.week AND meta(item.section).subpath = "输出" AND item.text
SORT date ASC
```

### 学到

```dataview
TABLE WITHOUT ID date AS 日期, item.text AS 学到
FROM "Daily"
FLATTEN file.lists AS item
WHERE week = this.week AND meta(item.section).subpath = "学到" AND item.text
SORT date ASC
```

### 复盘

```dataview
TABLE WITHOUT ID date AS 日期, item.text AS 复盘
FROM "Daily"
FLATTEN file.lists AS item
WHERE week = this.week AND meta(item.section).subpath = "复盘" AND item.text
SORT date ASC
```

### 生活时间线

```dataview
TABLE WITHOUT ID date AS 日期, item.text AS 时间线
FROM "Daily"
FLATTEN file.lists AS item
WHERE week = this.week AND meta(item.section).subpath = "生活时间线" AND item.text
SORT date ASC
```
