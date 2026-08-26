<%*
const year = tp.date.now("YYYY");
const stem = tp.date.now("YYYY-MM-DD");
if (!tp.file.path(true).startsWith(`${year}/`)) {
  await tp.file.move(`${year}/${stem}`);
}
-%>
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

<%*
const currentDate = tp.file.title;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const isPendingTask = (line) => /^- \[ \] \S/.test(line);

if (!datePattern.test(currentDate)) {
  tR += '- [ ] \n';
} else {
  const previous = new Date(`${currentDate}T12:00:00`);
  previous.setDate(previous.getDate() - 1);
  const previousDate = [
    previous.getFullYear(),
    String(previous.getMonth() + 1).padStart(2, '0'),
    String(previous.getDate()).padStart(2, '0'),
  ].join('-');
  const previousPath = `${previousDate.slice(0, 4)}/${previousDate}.md`;
  const previousFile = app.vault.getAbstractFileByPath(previousPath);

  if (!previousFile) {
    tR += '- [ ] \n';
  } else {
    const previousContent = await app.vault.read(previousFile);
    const lines = previousContent.split('\n');
    const sectionStart = lines.findIndex((line) => line === '## 明日 / 迁移');
    const sectionEnd = sectionStart === -1
      ? -1
      : lines.findIndex((line, index) => index > sectionStart && /^##\s+/.test(line));
    const migrationLines = sectionStart === -1
      ? []
      : lines.slice(sectionStart + 1, sectionEnd === -1 ? lines.length : sectionEnd);
    const pendingTasks = migrationLines.filter(isPendingTask);

    if (!pendingTasks.length) {
      tR += '- [ ] \n';
    } else {
      const cleanedContent = lines.filter((line, index) => {
        const inMigrationSection = index > sectionStart && (sectionEnd === -1 || index < sectionEnd);
        return !(inMigrationSection && isPendingTask(line));
      }).join('\n');
      await app.vault.modify(previousFile, cleanedContent);
      tR += `${pendingTasks.join('\n')}\n`;
    }
  }
}
-%>

## 随手记录
<!-- 闪念：随时捕捉，不要求分类，直接写 -->

- 

## 输入
<!-- 外部信息（文章/工具/课程/对话/反馈），行尾带类型标签，如：- 读了 [[Clippings/某篇]] #kind/article。下方表格自动归集当天的剪藏和工具介绍。 -->

- 

```dataviewjs
const dateText = (value) => value && value.toFormat ? value.toFormat("yyyy-MM-dd") : String(value || "").slice(0, 10);
const day = dateText(dv.current().date || dv.current().file.day);
const capturedOn = (page) => day && [page.created, page.clipped_at, page.captured_at].some(value => dateText(value) === day);
const sources = [
  ...dv.pages('"Clippings"').where(capturedOn).map(page => ({ page, type: "剪藏" })),
  ...dv.pages('"Tools"').where(capturedOn).map(page => ({ page, type: "工具" })),
].sort((a, b) => a.page.file.name.localeCompare(b.page.file.name));
if (!sources.length) {
  dv.paragraph("当天还没有自动归集的剪藏或工具。");
} else {
  dv.table(
    ["输入", "摘要", "类型"],
    sources.map(({ page, type }) => [page.file.link, page.description || "", type])
  );
}
```

## 输出
<!-- Outputs/ 中的当日输出文件由下方表格自动展示；不要在此重复添加 Markdown 输出条目。 -->

```dataviewjs
const dateText = (value) => value && value.toFormat ? value.toFormat("yyyy-MM-dd") : String(value || "").slice(0, 10);
const day = dateText(dv.current().date || dv.current().file.day);
const outputs = dv.pages('"Outputs"')
  .where(page => dateText(page.created || page.date) === day)
  .sort(page => page.file.name);
if (!outputs.length) {
  dv.paragraph("今天还没有输出记录。");
} else {
  dv.table(
    ["输出", "类型", "完成日期"],
    outputs.map(page => [page.file.link, page.type || "output", dateText(page.created || page.date)])
  );
}
```


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
