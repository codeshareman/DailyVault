# Exports

`Exports/` 定义按日期命名的 Daily Markdown 文件如何成为个人博客或开放 API 的数据来源。导出器先读取 `Daily/`，再从已链接的 `Sources/`、`Clippings/`、`Notes/` 和 `Summaries/` 补充信息。

DailyVault 默认私有。导出器只能发布明确设置可见性的记录：

```yaml
visibility: summary # 或 public
```

## 可能的博客页面

参考包含片段、笔记、照片、训练、书影音、地图和工具等页面的个人站，DailyVault 可以导出：

- 每日片段和公开摘要；
- 看过/读过/听过的记录；
- 训练和跑步路线；
- 去过的地点和活动；
- 喜欢的工具和资源；
- 年度复盘亮点；
- 兴趣趋势。

## 建议生成文件

```text
Exports/public/
├── daily/YYYY-MM-DD.json
├── timeline.json
├── sources.json
├── media.json
├── workouts.json
├── places.json
├── tools.json
├── interests.json
└── summaries/
    ├── weekly.json
    ├── monthly.json
    ├── quarterly.json
    └── yearly.json
```

## 建议 API 形态

```text
GET /api/daily?date=YYYY-MM-DD
GET /api/timeline?from=YYYY-MM-DD&to=YYYY-MM-DD
GET /api/sources?type=tool&tag=domain/frontend
GET /api/media?year=2026
GET /api/workouts?from=YYYY-MM-DD&to=YYYY-MM-DD
GET /api/places?year=2026
GET /api/interests?period=year
GET /api/summaries/yearly?year=2026
```

## 公开记录结构

```json
{
  "id": "dv_src_202607021430_example",
  "date": "2026-07-02",
  "type": "tool",
  "title": "示例工具",
  "summary": "它为什么重要。",
  "url": "https://example.com",
  "tags": ["type/tool", "public/candidate"],
  "source_path": "Sources/tools/20260702-example-tool.md",
  "daily_path": "Daily/20260702.md",
  "metrics": {},
  "visibility": "public"
}
```

## 导出规则

- 永远不要导出 `visibility: private`。
- 优先导出摘要，不导出原始个人笔记。
- 除非明确批准，否则移除私人姓名、私人地址、私人健康细节和敏感工作细节。
- 优先保留 `daily_path`，有 `source_path` 时也保留，便于追溯。
- AI 可以提议导出候选，但由用户决定哪些内容公开。

## 导出前检查指标

发布或生成 API 负载前，确认：

- 按 `visibility` 统计公开记录数量，只包含 `summary` / `public`；
- Source 分类覆盖：适用时包含 reading、watching、listening、learning、tools、places、events、fitness；
- 已排除的私有路径包括原始 Daily、Notes、Clippings、私密训练/身体细节，以及未处理的 Sources/inbox 记录；
- 每条导出记录都保留 `daily_path`，并在可用时保留 `source_path` 以便追溯；
- 除非明确批准，否则不包含私人姓名、私人地址、敏感工作细节或敏感健康细节。
