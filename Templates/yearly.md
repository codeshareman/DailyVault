---
date: {{date:YYYY-MM-DD}}
year: {{date:YYYY}}
note_type: summary
period_type: yearly
---

# {{date:YYYY}} 计划与复盘

> 年度统计：[[{{date:YYYY}} 统计]]

<%* 
const statsFolder = app.vault.getAbstractFileByPath(tp.file.folder(true));
const statsT = tp.file.find_tfile("Templates/yearly-stats.md");
const statsName = tp.date.now("YYYY") + " 统计";
if (statsT && statsFolder && !(await tp.file.exists(statsFolder.path + "/" + statsName + ".md"))) {
  await tp.file.create_new(statsT, statsName, false, statsFolder);
}
%>

<!-- 期初填「本期计划」；期末填「本期总结」与「下期重点」（即下一期计划）。年度统计随本文件自动生成。 -->

## 本期计划

- [ ] 

## 本期总结

- 

## 下期重点

- [ ] 