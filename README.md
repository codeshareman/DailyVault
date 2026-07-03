# DailyVault

DailyVault is a personal life timeline and daily operating system.

It uses `Daily/YYYYMMDD.md` as the canonical date spine. Every day is first recorded in that date-named Markdown file: work, life, watching, listening, learning, places, fitness, thoughts, outputs, and memories. `Sources/`, `Clippings/`, and `Notes/` are supporting material; AI extracts structure from `Daily/` first, then enriches from linked sources when needed. The goal is not only “今天做了什么”，but also “这一年我如何生活、学习、训练、观看、聆听、旅行、创造、变化”。

It should answer five questions every day:

1. 今天输入了什么？
2. 今天输出了什么？
3. 今天做了什么？
4. 接下来要做什么？
5. 今天学到了什么、复盘出了什么？

It should also preserve personal life signals:

- 看了什么：电影、剧、视频、文章、书。
- 听了什么：播客、音乐、演唱会、分享。
- 学了什么：课程、文档、技术、方法。
- 去了哪里：城市、场馆、旅行、展览、活动。
- 练了什么：跑步、力量训练、运动数据、身体状态。
- 用了什么好工具：网站、App、repo、工作流。

Domain-specific research belongs in separate projects with their own workflows. DailyVault keeps general daily execution, personal capture, life timeline, source metadata, learning, review, and public-shareable life data.

## Structure

```text
DailyVault/
├── AGENTS.md       # AI assistant rules and review workflows
├── Daily/          # one file per day: YYYYMMDD.md; the date spine
├── Inbox.md        # unprocessed tasks, ideas, questions
├── Clippings/      # Obsidian Web Clipper output; plugin format is source of truth
├── Sources/        # links, media, events, places, training/body records, tools, datasets
├── Notes/          # fleeting thoughts, personal notes, rough thinking
├── Summaries/      # weekly/monthly/quarterly/yearly reviews
├── Exports/        # future blog/API/public JSON export contracts
├── Server/         # local MCP/HTTP access layer over the Markdown vault
└── Templates/      # reusable non-clipper templates
```

## Daily rule

`Daily/YYYYMMDD.md` is the primary timeline record and the source of truth for that date. It is not a folder for every file created that day. If something matters today, write it in the Daily file first; add a `Source` only when extra metadata, scoring, source references, or export structure is useful.

```text
Daily/YYYYMMDD.md
  = canonical date record: watched, read, listened, trained, visited, learned, built, felt, decided
  + optional links to Inbox / Clippings / Sources / Notes
  -> AI extraction by date range
  -> Summaries/weekly, monthly, quarterly, yearly
  -> Exports/public when marked shareable
```

Use date folders only for rare attachment bundles. Do not make `Daily/YYYYMMDD/clippings/` or daily category folders the default.

## Sources model

`Sources/` stores AI-assisted metadata for links, media, events, tools, training/body records, places, and datasets. It supports the Daily timeline; it does not replace it.

The intended workflow is simple: give AI a link, and AI reads the public source, fills observable metadata, classifies it, tags it, scores it, summarizes it, links it to Daily, and creates or proposes a Source record. If the source is private, blocked, or unreadable, AI states the limitation and only uses user-provided facts.

A source can come from:

- a manual link or note;
- an Obsidian Web Clipper capture;
- a watched/read/listened item;
- a course, document, tool, repo, or workflow;
- a place, route, event, trip, or training/body record.

Service-specific automation is out of scope until real data and a real workflow need prove it.

See `Sources/README.md` and `Templates/source.md`.

## Template principles

`Templates/daily.md` is intentionally low-friction:

- Write the Daily note first in natural language; blanks are fine.
- Keep the default page short enough to open and write immediately.
- Use `Top 3`, input, output, did, Life Timeline, learning/review, and migration as the daily spine.
- Add Dataview inline fields only when a row should be queried later.
- Keep scoring, export fields, and detailed classification out of the Daily page; AI may fill them in Source records during link intake or review.

## Templates

- `Templates/daily.md` — lightweight daily plan/log/life-timeline/review template.
- `Templates/source.md` — AI-assisted source/link record template; user can provide only a URL, AI fills metadata and summary.
- `Templates/note.md` — lightweight fleeting-thought / note template for `Notes/`.
- `Templates/weekly-review.md` — weekly review template.
- `Templates/monthly-review.md` — monthly review template.
- `Templates/quarterly-review.md` — quarterly review template.
- `Templates/yearly-review.md` — yearly review template.

No `Templates/clipping.md`: clipping content should follow the Obsidian Web Clipper plugin’s own format and write directly into `Clippings/`.

## Obsidian setup

- Core Daily Notes creates `Daily/YYYYMMDD.md` with template `Templates/daily.md`.
- Calendar follows the same daily-note settings.
- QuickAdd provides `创建{{日期}}.md`, `记录闪念`, and `创建 Source`.
- Templater uses folder templates for `Daily/`, `Notes/`, `Sources/inbox/`, and summary folders.
- `Clippings/` is owned by Obsidian Web Clipper, not QuickAdd or Templater.

## AI assistance

AI may help summarize, analyze, organize, classify, score, review, and prepare public-shareable outputs, but it should not fabricate daily facts or overwrite the user’s own daily record. See `AGENTS.md` for the working rules.

Useful AI workflows:

- Daily closeout: summarize today’s inputs, outputs, execution, life timeline, learning, blockers, and tomorrow’s first step.
- Source link intake: given a URL, read the public source, fill metadata, classify, tag, score, summarize, link to Daily, and create/propose a Source record.
- Inbox triage: classify each item into Daily, Notes, Sources, Clippings, or external project.
- Weekly/monthly/quarterly/yearly review: extract themes, repeated blockers, interests, memorable moments, unfinished commitments, and next-period focus.
- Interest mining: infer current interests from watched/read/listened/visited/trained records and suggest what is worth deeper exploration.
- Public export review: decide which daily/source records are safe and worthwhile to publish on the blog.

## Server access layer

`Server/` exposes DailyVault to local agents and scripts without replacing Markdown as the source of truth.

- MCP stdio tools for AI clients: read/append Daily, intake Source URLs, search Sources, export public-safe records, and generate Nervia/ZNorth promotion candidates.
- Local HTTP API for scripts or apps, bound to `127.0.0.1` by default.
- Writes are conservative: append operations default to dry-run, URL intake saves only with `save: true`, and audit logs are written under `Server/logs/audit/`.
- Cross-project bridge actions produce candidates by default; they do not auto-sync source truth into Nervia or ZNorth.

See `Server/README.md`.

## Blog / API direction

DailyVault can become the data source for a personal blog: daily moments, movies/books/music, workouts/routes, visited places, favorite tools, and yearly memories. Exportable records must use explicit visibility fields:

```yaml
visibility: private # private | summary | public
public_title:
public_summary:
public_tags: []
```

Future exporters should read `Daily/` as the primary input, enrich with `Sources/` and `Clippings/` when linked, then generate public JSON/API payloads under `Exports/public/`. See `Exports/README.md`.
