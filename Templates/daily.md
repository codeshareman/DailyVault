<%*
const year = tp.date.now("YYYY");
const stem = tp.date.now("YYYYMMDD");
if (!tp.file.path(true).startsWith(`Daily/${year}/`)) {
  await tp.file.move(`Daily/${year}/${stem}`);
}
%>
---
date: {{date:YYYY-MM-DD}}
weekday: {{date:dddd}}
week: "{{date:GGGG-[W]WW}}"
month: "{{date:YYYY-MM}}"
quarter: "{{date:YYYY}}-Q{{date:Q}}"
year: {{date:YYYY}}
note_type: daily-log
---

# {{date:YYYY-MM-DD}}

<!-- 类型标签速查（写在条目行尾）：#kind/article | #kind/tool | #kind/course | #kind/book | #kind/video | #kind/podcast | #kind/movie | #kind/music | #kind/place | #kind/fitness | #kind/decision | #kind/project；长期主题另加 #topic/... -->

## 今日计划
- [ ] 
- [ ] 
- [ ] 

## 随手记录
<!-- 闪念：随时捕捉，不要求分类，直接写 -->
- 

## 输入
<!-- 外部信息（文章/工具/课程/对话/反馈），行尾带类型标签，如：- 读了 [[Clippings/某篇]] #kind/article。下方表格自动归集今日剪藏 -->
- 

```dataview
TABLE WITHOUT ID file.link AS 剪藏, description AS 摘要
FROM "Clippings"
WHERE created = this.date
SORT file.name ASC
``` 

## 输出
<!-- 交付物/决定/明确结果，可带 #kind/decision | #kind/project -->
- 

## 生活时间线
<!-- 活动与片段，可带 #kind/fitness | #kind/place | #kind/movie | #kind/music -->
- 

## 学到
<!-- 从输入或经历提炼的认识，可带来源类型标签 #kind/article | #kind/course | #kind/book -->
- 

## 复盘
<!-- 对行动过程的评价；明天的动作放“明日 / 迁移” -->
- 

## 明日 / 迁移
- [ ] 
-