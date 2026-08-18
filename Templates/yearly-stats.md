---
date: {{date:YYYY-MM-DD}}
year: {{date:YYYY}}
note_type: stats
period_type: yearly
---

# {{date:YYYY}} 统计

> [[{{date:YYYY}}]]

<!-- 年度统计只做一次，从每日记录（note_type: daily-log）派生。统计口径：任务按 status 精确区分（[x]完成 / [ ]待办 / [-]取消 / 其他状态），只统计真正的待办为未完成；计划类章节不参与内容统计，任务意义在"做了什么/没做了什么"。 -->

## 年度概览

```dataviewjs
const y = dv.current().year;
const pages = dv.pages('"' + y + '"').where(p => p.note_type === "daily-log" && p.year === y).sort(p => p.date);
const lists = pages.flatMap(p => p.file.lists.map(l => ({ ...l, page: p })));
const items = lists.filter(l => l.text && l.text.trim() && !l.task);
const tasks = lists.filter(l => l.task && l.text && l.text.trim());
const done = tasks.filter(l => l.status === "x");
const todo = tasks.filter(l => l.status === " " || l.status === "");
const cancelled = tasks.filter(l => l.status === "-");
const other = tasks.length - done.length - todo.length - cancelled.length;
const planTasks = tasks.filter(l => l.section?.subpath === "今日计划" && l.status !== "-");
const planDone = planTasks.filter(l => l.status === "x");
const inCount = items.filter(l => l.section?.subpath === "输入").length;
const outCount = items.filter(l => l.section?.subpath === "输出").length;
let streak = 0, best = 0, prev = null;
for (const p of pages) {
  const d = p.date;
  streak = prev && d.ts - prev.ts === 86400000 ? streak + 1 : 1;
  best = Math.max(best, streak);
  prev = d;
}
const rate = (a, b) => b ? Math.round(a / b * 100) + "%" : "—";
dv.table(
  ["指标", "数值"],
  [
    ["记录天数", pages.length + " 天"],
    ["总条目数", items.length + " 条"],
    ["任务总数", tasks.length + "（完成 " + done.length + " / 待办 " + todo.length + " / 取消 " + cancelled.length + " / 其他 " + other + "）"],
    ["任务完成率", rate(done.length, tasks.length)],
    ["今日计划达标率", rate(planDone.length, planTasks.length)],
    ["最长连续记录", best + " 天"],
    ["输入 / 输出", inCount + " / " + outCount],
  ]
);
```

## 今年做了什么

<!-- 完成的任务、输出交付物与学到的认识——年度成果清单。条目文本可点击跳转回来源的每日记录；文本内的 [[内链]] 直接指向对应笔记；#kind/... 标签可点击搜索。来源列同样可跳转。 -->

```dataviewjs
const y = dv.current().year;
const pages = dv.pages('"' + y + '"').where(p => p.note_type === "daily-log" && p.year === y).sort(p => p.date);
const lists = pages.flatMap(p => p.file.lists.map(l => ({ ...l, page: p })));
const show = (s, n = 80) => s.length > n ? s.slice(0, n) + "…" : s;
const clean = (s) => s.replace(/^[-*]\s*\[[ x-]\]\s*/, "").replace(/^[-*]\s*/, "");
// 条目文本 → 可点击链接：纯文本包 wikilink 指向 daily；含内链/URL 时保留原样（Dataview 渲染为可点击）
const cell = (l) => {
  const t = show(clean(l.text));
  if (l.text.includes("[[") || l.text.includes("http")) return t;
  return `[[${l.page.file.link.path}|${t}]]`;
};
// 完成的任务
const doneTasks = lists.filter(l => l.task && l.status === "x" && l.text.trim());
// 输出与学到条目
const outs = lists.filter(l => !l.task && l.text.trim() && l.section?.subpath === "输出");
const learned = lists.filter(l => !l.task && l.text.trim() && l.section?.subpath === "学到");
const rows = [];
for (const t of doneTasks) rows.push(["✅ " + cell(t), t.page.file.link]);
for (const o of outs) rows.push(["📦 " + cell(o), o.page.file.link]);
for (const l of learned) rows.push(["💡 " + cell(l), l.page.file.link]);
dv.table(["成果", "来源"], rows.length ? rows : [["（今年还没有已完成任务、输出或学到条目）", ""]]);
```

## 今年没做什么

<!-- 真正的未完成待办（[ ]）与取消项（[-]）。条目文本可点击跳转回来源的每日记录；文本内的 [[内链]] 直接指向对应笔记；来源列同样可跳转。 -->

```dataviewjs
const y = dv.current().year;
const pages = dv.pages('"' + y + '"').where(p => p.note_type === "daily-log" && p.year === y).sort(p => p.date);
const lists = pages.flatMap(p => p.file.lists.map(l => ({ ...l, page: p })));
const show = (s, n = 80) => s.length > n ? s.slice(0, n) + "…" : s;
const clean = (s) => s.replace(/^[-*]\s*\[[ x-]\]\s*/, "").replace(/^[-*]\s*/, "");
// 条目文本 → 可点击链接：纯文本包 wikilink 指向 daily；含内链/URL 时保留原样（Dataview 渲染为可点击）
const cell = (l) => {
  const t = show(clean(l.text));
  if (l.text.includes("[[") || l.text.includes("http")) return t;
  return `[[${l.page.file.link.path}|${t}]]`;
};
const todo = lists.filter(l => l.task && (l.status === " " || l.status === "") && l.text.trim());
const cancelled = lists.filter(l => l.task && l.status === "-" && l.text.trim());
const rows = [];
for (const t of todo) rows.push(["⏳ " + cell(t), t.page.file.link]);
for (const c of cancelled) rows.push(["❌ " + cell(c), c.page.file.link]);
dv.table(["未完成（⏳待办 / ❌取消）", "来源"], rows.length ? rows : [["（今年没有未完成或取消的任务）", ""]]);
```

## 月度活跃趋势

<!-- 每月条目数柱状图：一眼看出全年节奏（哪几个月活跃、哪几个月停滞）。 -->

```dataviewjs
const y = dv.current().year;
const pages = dv.pages('"' + y + '"').where(p => p.note_type === "daily-log" && p.year === y);
const counts = {};
for (const p of pages) {
  const m = p.date ? p.date.toFormat("yyyy-MM") : String(p.month || "").slice(0, 7);
  if (!m || !/^\d{4}-\d{2}$/.test(m)) continue;
  counts[m] = (counts[m] || 0) + p.file.lists.filter(l => l.text && l.text.trim()).length;
}
const months = Object.keys(counts).sort();
if (!months.length) {
  dv.paragraph("今年还没有记录。");
} else {
  const max = Math.max(...months.map(m => counts[m]), 1);
  const chart = dv.container.createEl("div", { attr: { style: "display:flex;align-items:flex-end;height:140px;gap:6px;padding:4px 0" } });
  for (const m of months) {
    const col = chart.createEl("div", { attr: { style: "flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:2px;min-width:18px" } });
    col.createEl("div", { text: String(counts[m]), attr: { style: "font-size:10px;color:#888;line-height:1" } });
    col.createEl("div", { attr: { style: `width:70%;background:#4a9eda;border-radius:3px 3px 0 0;height:${Math.round(counts[m] / max * 100)}px` } });
    // 月份标签可点击：搜索该月全部记录（path:"2026/2026-08"）。
    // 不能用 obsidian:// 链接（Obsidian 会显示放大镜图标），用 onclick 打开搜索面板。
    const monthLink = col.createEl("a", {
      text: m.slice(5),
      attr: { style: "font-size:10px;color:#666;line-height:1;text-decoration:none" }
    });
    monthLink.setAttribute("href", "#");
    monthLink.addEventListener("click", async (e) => {
      e.preventDefault();
      const query = 'path:"' + y + "/" + m + '"';
      let leaf = app.workspace.getLeavesOfType("search")[0];
      if (!leaf) {
        leaf = app.workspace.getRightLeaf(false);
        await leaf.setViewState({ type: "search", active: true });
      }
      await app.workspace.revealLeaf(leaf);
      setTimeout(() => {
        const view = leaf.view;
        if (view?.searchComponent?.inputEl) view.setQuery(query);
      }, 100);
    });
  }
}
```

## 月度计划完成率

<!-- 每月今日计划的完成/待办进度条：衡量执行力的月度波动。 -->

```dataviewjs
const y = dv.current().year;
const pages = dv.pages('"' + y + '"').where(p => p.note_type === "daily-log" && p.year === y).sort(p => p.date);
const monthly = {};
for (const p of pages) {
  const m = p.date ? p.date.toFormat("yyyy-MM") : String(p.month || "").slice(0, 7);
  if (!m || !/^\d{4}-\d{2}$/.test(m)) continue;
  const plan = p.file.lists.filter(l => l.task && l.text.trim() && l.section?.subpath === "今日计划" && l.status !== "-");
  if (!plan.length) continue;
  const done = plan.filter(l => l.status === "x").length;
  if (!monthly[m]) monthly[m] = { done: 0, total: 0 };
  monthly[m].done += done;
  monthly[m].total += plan.length;
}
const months = Object.keys(monthly).sort();
if (!months.length) {
  dv.paragraph("今年还没有记录计划任务。");
} else {
  const container = dv.container.createEl("div", { attr: { style: "margin:4px 0" } });
  for (const m of months) {
    const { done, total } = monthly[m];
    const pct = Math.round(done / total * 100);
    const row = container.createEl("div", { attr: { style: "display:flex;align-items:center;gap:8px;margin:3px 0;width:100%" } });
    // 月份标签可点击：搜索该月全部记录。不能用 obsidian:// 链接（Obsidian 会显示放大镜图标）。
    const monthLink = row.createEl("a", {
      text: m,
      attr: { style: "width:70px;font-size:12px;flex-shrink:0;color:#555;text-decoration:none" }
    });
    monthLink.setAttribute("href", "#");
    monthLink.addEventListener("click", async (e) => {
      e.preventDefault();
      const query = 'path:"' + y + "/" + m + '"';
      let leaf = app.workspace.getLeavesOfType("search")[0];
      if (!leaf) {
        leaf = app.workspace.getRightLeaf(false);
        await leaf.setViewState({ type: "search", active: true });
      }
      await app.workspace.revealLeaf(leaf);
      setTimeout(() => {
        const view = leaf.view;
        if (view?.searchComponent?.inputEl) view.setQuery(query);
      }, 100);
    });
    const track = row.createEl("div", { attr: { style: "flex:1;background:#eee;border-radius:3px;height:14px;overflow:hidden;min-width:40px" } });
    track.createEl("div", { attr: { style: `width:${pct}%;background:${pct >= 70 ? "#4caf50" : pct >= 40 ? "#ff9800" : "#f44336"};height:100%;border-radius:3px` } });
    row.createEl("div", { text: `${done}/${total} = ${pct}%`, attr: { style: "width:110px;font-size:12px;text-align:right;flex-shrink:0;color:#555" } });
  }
}
```

## 知识转化漏斗

<!-- 输入 → 学到 → 输出 三段式漏斗：只统计这三个内容章节的非任务条目，看"读了多少 → 提炼了多少 → 产出了多少"。转化率低于 30% 标红（只进不出），30–69% 橙色，≥70% 绿色。 -->

```dataviewjs
const y = dv.current().year;
const pages = dv.pages('"' + y + '"').where(p => p.note_type === "daily-log" && p.year === y);
const lists = pages.flatMap(p => p.file.lists.map(l => ({ ...l, page: p })));
const count = (sec) => lists.filter(l => !l.task && l.text.trim() && l.section?.subpath === sec).length;
const inN = count("输入"), learnN = count("学到"), outN = count("输出");
if (!inN && !learnN && !outN) {
  dv.paragraph("今年还没有内容记录。");
} else {
  const stages = [
    { name: "输入", sub: "读/看/听", n: inN, color: "#4a9eda" },
    { name: "学到", sub: "提炼", n: learnN, color: "#7e57c2" },
    { name: "输出", sub: "产出", n: outN, color: "#4caf50" },
  ];
  const max = Math.max(...stages.map(s => s.n), 1);
  const rateColor = (r) => r >= 70 ? "#4caf50" : r >= 30 ? "#ff9800" : "#f44336";
  const container = dv.container.createEl("div", { attr: { style: "margin:4px 0" } });
  stages.forEach((s, i) => {
    const row = container.createEl("div", { attr: { style: "display:flex;align-items:center;gap:8px;margin:3px 0;width:100%" } });
    row.createEl("div", { text: s.name + "·" + s.sub, attr: { style: "width:80px;font-size:12px;flex-shrink:0;color:#555" } });
    const track = row.createEl("div", { attr: { style: "flex:1;background:#eee;border-radius:3px;height:16px;overflow:hidden;min-width:40px" } });
    track.createEl("div", { attr: { style: `width:${Math.max(Math.round(s.n / max * 100), s.n ? 4 : 0)}%;background:${s.color};height:100%;border-radius:3px` } });
    row.createEl("div", { text: s.n + " 条", attr: { style: "width:50px;font-size:12px;text-align:right;flex-shrink:0;color:#555" } });
    // 转化率箭头（在每两段之间）
    if (i < 2) {
      const next = stages[i + 1];
      const r = s.n ? Math.round(next.n / s.n * 100) : 0;
      const arrow = container.createEl("div", { attr: { style: "display:flex;align-items:center;gap:8px;margin:1px 0 2px;padding-left:88px" } });
      arrow.createEl("div", { text: `${next.name} / ${s.name} = ${r}%`, attr: { style: `font-size:11px;color:${s.n ? rateColor(r) : "#999"};flex-shrink:0` } });
    }
  });
}
```

## 条目分类

<!-- 按 #kind/... 标签统计投入结构，带分布条形图。 -->

```dataviewjs
const y = dv.current().year;
const pages = dv.pages('"' + y + '"').where(p => p.note_type === "daily-log" && p.year === y);
const tags = {};
for (const p of pages) {
  for (const l of p.file.lists) {
    if (!l.text || !l.text.trim()) continue;
    for (const t of (l.tags || [])) if (t.startsWith("#kind/")) tags[t] = (tags[t] || 0) + 1;
  }
}
const entries = Object.entries(tags).sort((a, b) => b[1] - a[1]);
if (!entries.length) {
  dv.paragraph("今年还没有 #kind/... 标记的条目。");
} else {
  const total = entries.reduce((s, [, n]) => s + n, 0);
  const max = Math.max(...entries.map(([, n]) => n), 1);
  const container = dv.container.createEl("div", { attr: { style: "margin:4px 0" } });
  for (const [tag, n] of entries) {
    const pct = Math.round(n / total * 100);
    const row = container.createEl("div", { attr: { style: "display:flex;align-items:center;gap:8px;margin:3px 0;width:100%" } });
    // 原生 tag 渲染：文本必须带 #（否则 Obsidian 不识别为 tag，会显示放大镜的未解析链接图标）。
    // href 用 #，点击事件用 app.workspace 打开搜索面板并设置查询 tag:kind/article。
    const tagLink = row.createEl("a", {
      text: tag,  // #kind/article（带 # 触发 tag 样式）
      cls: "tag",
      attr: { style: "width:110px;font-size:12px;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center" }
    });
    tagLink.setAttribute("href", "#");
    tagLink.setAttribute("target", "_blank");
    tagLink.setAttribute("rel", "noopener");
    tagLink.addEventListener("click", async (e) => {
      e.preventDefault();
      const query = "tag:" + tag.slice(1);  // tag:kind/article
      let leaf = app.workspace.getLeavesOfType("search")[0];
      if (!leaf) {
        leaf = app.workspace.getRightLeaf(false);
        await leaf.setViewState({ type: "search", active: true });
      }
      await app.workspace.revealLeaf(leaf);
      setTimeout(() => {
        const view = leaf.view;
        if (view?.searchComponent?.inputEl) view.setQuery(query);
      }, 100);
    });
    const track = row.createEl("div", { attr: { style: "flex:1;background:#eee;border-radius:3px;height:14px;overflow:hidden;min-width:40px" } });
    track.createEl("div", { attr: { style: `width:${Math.round(n / max * 100)}%;background:#7e57c2;height:100%;border-radius:3px` } });
    row.createEl("div", { text: `${n} 条 ${pct}%`, attr: { style: "width:90px;font-size:12px;text-align:right;flex-shrink:0;color:#555" } });
  }
}
```

## 输入

<!-- 每一天 daily「输入」章节的完整输入：文章/工具/课程/对话/反馈等外部信息。剪藏（[[Clippings/...]] 内链）是输入的子集，随条目一起呈现；纯 URL 地址、链接都可点击。条目文本可点击跳转回来源的每日记录；含内链/URL 的条目保留原样由 Dataview 渲染为可点击。 -->

```dataviewjs
const y = dv.current().year;
const pages = dv.pages('"' + y + '"').where(p => p.note_type === "daily-log" && p.year === y).sort(p => p.date);
const lists = pages.flatMap(p => p.file.lists.map(l => ({ ...l, page: p })));
const show = (s, n = 80) => s.length > n ? s.slice(0, n) + "…" : s;
const clean = (s) => s.replace(/^[-*]\s*\[[ x-]\]\s*/, "").replace(/^[-*]\s*/, "");
// 条目文本 → 可点击链接：纯文本包 wikilink 指向 daily；含内链/URL 时保留原样（Dataview 渲染为可点击）
const cell = (l) => {
  const t = show(clean(l.text));
  if (l.text.includes("[[") || l.text.includes("http")) return t;
  return `[[${l.page.file.link.path}|${t}]]`;
};
const inputs = lists.filter(l => !l.task && l.text.trim() && l.section?.subpath === "输入");
if (!inputs.length) {
  dv.paragraph("今年还没有输入记录。");
} else {
  const rows = [];
  for (const l of inputs) rows.push([cell(l), l.page.file.link]);
  dv.table(["输入（剪藏是输入的子集）", "来源"], rows);
}
```

## 输出

<!-- 每一天 daily「输出」章节的完整输出：交付物/决定/明确结果。输出可能是一篇文章、一个地址（URL）、一个交付物；链接都可点击。条目文本可点击跳转回来源的每日记录；含内链/URL 的条目保留原样由 Dataview 渲染为可点击。 -->

```dataviewjs
const y = dv.current().year;
const pages = dv.pages('"' + y + '"').where(p => p.note_type === "daily-log" && p.year === y).sort(p => p.date);
const lists = pages.flatMap(p => p.file.lists.map(l => ({ ...l, page: p })));
const show = (s, n = 80) => s.length > n ? s.slice(0, n) + "…" : s;
const clean = (s) => s.replace(/^[-*]\s*\[[ x-]\]\s*/, "").replace(/^[-*]\s*/, "");
// 条目文本 → 可点击链接：纯文本包 wikilink 指向 daily；含内链/URL 时保留原样（Dataview 渲染为可点击）
const cell = (l) => {
  const t = show(clean(l.text));
  if (l.text.includes("[[") || l.text.includes("http")) return t;
  return `[[${l.page.file.link.path}|${t}]]`;
};
const outs = lists.filter(l => !l.task && l.text.trim() && l.section?.subpath === "输出");
if (!outs.length) {
  dv.paragraph("今年还没有输出记录。");
} else {
  const rows = [];
  for (const l of outs) rows.push([cell(l), l.page.file.link]);
  dv.table(["输出（文章 / 地址 / 交付物）", "来源"], rows);
}
```