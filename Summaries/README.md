# Summaries

从 `Daily/` 派生的周期复盘目录，不是新的日常记录入口。

```text
Summaries/
├── weekly/     # 周复盘（如 2026-W34.md）
├── monthly/    # 月复盘（如 2026-08.md）
├── quarterly/  # 季复盘（如 2026-Q3.md）
└── yearly/     # 年复盘（如 2026.md）
```

## 两种生成方式

**半自动（骨架 + 自动统计）**：QuickAdd「创建周/月/季/年复盘」在对应子目录用 `Templates/*-review.md` 创建文件，Templater 填充日期 frontmatter，Dataview 实时统计后你只写总结文字。

**全自动（AI 生成内容）**：让 AI 调用 `period-review` skill——它读取该周期全部 `Daily/`（唯一证据源），从真实记录提炼本期总结和下期重点，再带上 Dataview 汇总块，直接生成复盘笔记。

模板只读取 Daily 的日期属性、任务、固定章节和 `#kind/...` 标签。复盘笔记的 `week` / `month` / `quarter` / `year` frontmatter 决定它归属哪个周期；Dataview 查询用 `this.*` 引用它，因此**创建时的日期填充必须准确**。
