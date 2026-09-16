---
title: Tools
aliases:
- 工具索引
- 工具目录
type: documentation
note_type: tool-catalog
dc_type: Dataset
identifier: dailyvault:Tools/README.md
description: Tools 目录入口：按能力域浏览工具卡，并用 Dataview 从 frontmatter 派生统计。不维护第二套元数据。
category: knowledge-management
subject:
- knowledge-management
tags:
- topic/knowledge-management
last_checked: '2026-09-16'
status: active
---

# Tools

本目录的入口页。打开本文件即可浏览与统计全部工具卡。

卡片上的 `category` 是收录时的主题词。历史书签把它拆得过碎（三十余类，其中十余个只有一张卡）。本页按常见目录做法分成两层，**不改写原卡片**：

1. **浏览层（能力域）**：约 10 个任务导向分组，对应 App Store / G2 / awesome list 的一级类目。
2. **分面层**：Dublin Core `dc_type`、`subject`、`platform`、`status` 各自独立筛选，不互相覆盖。

## 跳转

- [[#概览]] · [[#按能力域]] · [[#类型与状态]] · [[#平台]] · [[#主题词]]
- [[#最近收录]] · [[#待整理]] · [[#完整目录]]

## 概览

```dataviewjs
const tools = dv.pages('"Tools"').where(p => p.type === "tool-introduction");
const dateText = (value) => value && value.toFormat ? value.toFormat("yyyy-MM-dd") : String(value || "").slice(0, 10);
const countBy = (items, keyFn) => {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item) || "未知";
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
};
const domainOf = (page) => {
  const map = {
    "developer-tools": "开发与工程", "programming-languages": "开发与工程",
    "documentation": "开发与工程", "hosting": "开发与工程", "system": "开发与工程",
    "ai": "AI 与模型",
    "productivity": "效率与知识", "writing": "效率与知识", "knowledge-management": "效率与知识",
    "design": "设计与灵感",
    "education": "学习与研究", "learning": "学习与研究", "reference": "学习与研究", "language": "学习与研究",
    "career": "职业与资格", "employment": "职业与资格",
    "community": "社区与发现", "social": "社区与发现", "discovery": "社区与发现", "feedback": "社区与发现",
    "marketplace": "商业与市场", "business": "商业与市场", "product": "商业与市场",
    "market-research": "商业与市场", "finance": "商业与市场", "procurement": "商业与市场", "real-estate": "商业与市场",
    "media": "媒体与内容",
    "data": "数据与开放资料",
    "automation": "自动化",
    "hardware": "硬件与评测",
    "software": "软件与自托管",
  };
  return map[page.category] || "其他";
};
const dcType = countBy(tools, p => p.dc_type);
const status = countBy(tools, p => p.status);
const category = countBy(tools, p => p.category);
const domains = countBy(tools, domainOf);
const withUrl = tools.filter(p => p.url || p.source || p.identifier).length;
const latest = tools.sort(p => dateText(p.captured_at || p.last_checked), "desc")[0];

dv.table(
  ["指标", "数值"],
  [
    ["工具卡", tools.length + " 张"],
    ["能力域", domains.length + " 组"],
    ["原始 category", category.length + " 类"],
    ["Software / Service", (dcType.find(([k]) => k === "Software")?.[1] || 0) + " / " + (dcType.find(([k]) => k === "Service")?.[1] || 0)],
    ["active", (status.find(([k]) => k === "active")?.[1] || 0) + " 张"],
    ["含入口链接", withUrl + " 张"],
    ["最近收录", latest ? `${latest.file.link}（${dateText(latest.captured_at || latest.last_checked)}）` : "—"],
  ]
);
```

## 按能力域

一级浏览用「这件事是干什么的」，而不是书签文件夹名。映射只存在于本页。

```dataviewjs
const tools = dv.pages('"Tools"').where(p => p.type === "tool-introduction");
const domainOf = (page) => {
  const map = {
    "developer-tools": "开发与工程", "programming-languages": "开发与工程",
    "documentation": "开发与工程", "hosting": "开发与工程", "system": "开发与工程",
    "ai": "AI 与模型",
    "productivity": "效率与知识", "writing": "效率与知识", "knowledge-management": "效率与知识",
    "design": "设计与灵感",
    "education": "学习与研究", "learning": "学习与研究", "reference": "学习与研究", "language": "学习与研究",
    "career": "职业与资格", "employment": "职业与资格",
    "community": "社区与发现", "social": "社区与发现", "discovery": "社区与发现", "feedback": "社区与发现",
    "marketplace": "商业与市场", "business": "商业与市场", "product": "商业与市场",
    "market-research": "商业与市场", "finance": "商业与市场", "procurement": "商业与市场", "real-estate": "商业与市场",
    "media": "媒体与内容",
    "data": "数据与开放资料",
    "automation": "自动化",
    "hardware": "硬件与评测",
    "software": "软件与自托管",
  };
  return map[page.category] || "其他";
};
const groups = new Map();
for (const page of tools) {
  const domain = domainOf(page);
  if (!groups.has(domain)) groups.set(domain, []);
  groups.get(domain).push(page);
}
const rows = [...groups.entries()]
  .sort((a, b) => b[1].length - a[1].length)
  .map(([domain, pages]) => {
    const cats = [...new Set(pages.map(p => p.category || "未分类"))].sort();
    return [
      domain,
      pages.length,
      Math.round(pages.length / tools.length * 100) + "%",
      cats.join("、"),
    ];
  });
dv.table(["能力域", "数量", "占比", "包含的 category"], rows);
```

### 原始 category

frontmatter 原值，用于核对其是否应合并进上表。

```dataviewjs
const tools = dv.pages('"Tools"').where(p => p.type === "tool-introduction");
const map = new Map();
for (const page of tools) {
  const key = page.category || "未分类";
  map.set(key, (map.get(key) || 0) + 1);
}
dv.table(
  ["category", "数量", "占比"],
  [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => [name, count, Math.round(count / tools.length * 100) + "%"])
);
```

## 类型与状态

`dc_type` 用 Dublin Core：`Software` 为可安装或可分发的软件，`Service` 为网站或在线服务。

```dataview
TABLE length(rows) AS 数量
FROM "Tools"
WHERE type = "tool-introduction"
GROUP BY dc_type
SORT length(rows) DESC
```

```dataview
TABLE length(rows) AS 数量
FROM "Tools"
WHERE type = "tool-introduction"
GROUP BY status
SORT length(rows) DESC
```

## 平台

```dataviewjs
const tools = dv.pages('"Tools"').where(p => p.type === "tool-introduction" && p.platform);
const map = new Map();
for (const page of tools) {
  map.set(String(page.platform), (map.get(String(page.platform)) || 0) + 1);
}
dv.table(
  ["platform", "数量"],
  [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)
);
```

## 主题词

`subject` 是多值标签，一张卡可属于多个主题。只列命中最多的 15 个。

```dataviewjs
const tools = dv.pages('"Tools"').where(p => p.type === "tool-introduction");
const map = new Map();
for (const page of tools) {
  const subjects = Array.isArray(page.subject) ? page.subject : [page.subject].filter(Boolean);
  for (const subject of subjects) map.set(subject, (map.get(subject) || 0) + 1);
}
dv.table(
  ["subject", "命中工具数"],
  [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)
);
```

## 最近收录

```dataview
TABLE platform AS 平台, category AS 分类, dc_type AS 类型, captured_at AS 收录
FROM "Tools"
WHERE type = "tool-introduction"
SORT captured_at DESC
LIMIT 20
```

## 待整理

缺摘要、仍是草稿、或落在 `inbox` 的卡片。

```dataview
TABLE category, status, platform, description
FROM "Tools"
WHERE type = "tool-introduction" AND (status = "draft" OR category = "inbox" OR !description)
SORT file.name ASC
```

仅出现 1–2 次的 `category`，优先考虑并入对应能力域的常用词，而不是继续新增类名。

```dataviewjs
const tools = dv.pages('"Tools"').where(p => p.type === "tool-introduction");
const map = new Map();
for (const page of tools) {
  const key = page.category || "未分类";
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(page);
}
const rare = [...map.entries()].filter(([, pages]) => pages.length <= 2).sort((a, b) => a[0].localeCompare(b[0]));
if (!rare.length) {
  dv.paragraph("没有低频 category。");
} else {
  dv.table(
    ["category", "数量", "卡片"],
    rare.map(([name, pages]) => [name, pages.length, pages.map(p => p.file.link)])
  );
}
```

## 完整目录

按能力域分组。`category` 仍显示在表中，便于对照原分类。

```dataviewjs
const tools = dv.pages('"Tools"').where(p => p.type === "tool-introduction");
const dateText = (value) => value && value.toFormat ? value.toFormat("yyyy-MM-dd") : String(value || "").slice(0, 10);
const domainOf = (page) => {
  const map = {
    "developer-tools": "开发与工程", "programming-languages": "开发与工程",
    "documentation": "开发与工程", "hosting": "开发与工程", "system": "开发与工程",
    "ai": "AI 与模型",
    "productivity": "效率与知识", "writing": "效率与知识", "knowledge-management": "效率与知识",
    "design": "设计与灵感",
    "education": "学习与研究", "learning": "学习与研究", "reference": "学习与研究", "language": "学习与研究",
    "career": "职业与资格", "employment": "职业与资格",
    "community": "社区与发现", "social": "社区与发现", "discovery": "社区与发现", "feedback": "社区与发现",
    "marketplace": "商业与市场", "business": "商业与市场", "product": "商业与市场",
    "market-research": "商业与市场", "finance": "商业与市场", "procurement": "商业与市场", "real-estate": "商业与市场",
    "media": "媒体与内容",
    "data": "数据与开放资料",
    "automation": "自动化",
    "hardware": "硬件与评测",
    "software": "软件与自托管",
  };
  return map[page.category] || "其他";
};
const groups = new Map();
for (const page of tools) {
  const key = domainOf(page);
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(page);
}
const sortedGroups = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
for (const [domain, pages] of sortedGroups) {
  dv.header(3, `${domain}（${pages.length}）`);
  dv.table(
    ["工具", "category", "平台", "类型", "摘要", "收录"],
    pages
      .sort(p => p.file.name, "asc")
      .map(p => [
        p.file.link,
        p.category || "",
        p.platform || "",
        p.dc_type || "",
        p.description ? (p.description.length > 48 ? p.description.slice(0, 48) + "…" : p.description) : "",
        dateText(p.captured_at || p.last_checked),
      ])
  );
}
```

## 约定

- 本文件固定为 `Tools/README.md`。GitHub 打开 `Tools/` 会直接渲染它；Obsidian 里也可搜别名「工具索引」。
- 本页 `type: documentation`，不会计入工具统计。
- 新建工具卡用 `Templates/tool.md`，遵守 `AGENTS.md` 第 11 条：`type: tool-introduction`，`category` 等于 `subject` 第一项，并带 `#kind/tool` 与 `#topic/...`。
- 新卡优先复用已有 `category`；不要为单张卡发明新类名。细节放 `subject`。
