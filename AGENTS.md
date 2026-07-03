# AGENTS.md

DailyVault is a personal daily operating system and date-first life timeline. `Daily/YYYYMMDD.md` is the canonical record. Sources, clippings, notes, summaries, and exports support that date spine. AI assists with extracting, summarizing, analyzing, organizing, reviewing, and preparing public-shareable data; the user owns the daily record.

## Core rules

1. Do not fabricate facts, tasks, emotions, decisions, outputs, workouts, ratings, locations, or completion status.
2. Preserve the user’s wording in `Daily/` unless explicitly asked to rewrite it.
3. Prefer appending analysis, summaries, or next-action suggestions over overwriting original notes.
4. Keep the vault simple. Do not create new top-level folders unless the user explicitly asks or the README already defines them.
5. Keep domain-specific research out of this vault. Route it to a separate project instead of adding custom sections to `Templates/daily.md`.
6. Link evidence when summarizing: daily note path, source path, clipping path, note path, or exact source URL if present.
7. Mark uncertain conclusions as `[推断]`.
8. Do not delete, archive, publish, or export user notes unless explicitly instructed.
9. Private by default. Public/blog/API output requires `visibility: summary` or `visibility: public`.

## Directory ownership

- `Daily/`: one daily file per day. Canonical human-authored date record: plan, life timeline, execution log, watched/read/listened/visited/trained records, learning, reflection, task migration. AI reads this first.
- `Inbox.md`: unprocessed tasks, ideas, questions, and temporary captures.
- `Clippings/`: Obsidian Web Clipper output. The plugin format is the source of truth; do not use a local clipping template.
- `Sources/`: optional structured records for links, media, events, places, training/body records, tools, and datasets. Every useful source should link back to a Daily date.
- `Notes/`: fleeting thoughts, personal notes, rough thinking, early ideas.
- `Summaries/`: weekly/monthly/quarterly/yearly reviews.
- `Exports/`: future public/blog/API export contracts and generated public payloads.
- `Templates/`: reusable templates for Daily, Notes, Sources, and period reviews.

## What AI should help with

### Daily closeout

Use when the user asks for “daily 总结 / 收尾 / 复盘 / closeout”.

Read the relevant `Daily/YYYYMMDD.md` first. Read linked `Notes/`, `Sources/`, and `Clippings/` only when the Daily row needs enrichment. Produce:

1. 今日主线
2. 重要输入
3. 重要输出
4. 实际完成
5. Life Timeline：看了、听了、学了、去了、练了什么
6. 未完成与原因
7. 学到的东西
8. 明日 Top 3 建议
9. 需要迁移、归档或放弃的事项
10. 可公开分享候选

Rules:

- Never mark a task done unless the note or user says it is done.
- If evidence is insufficient, write “未观察到”。
- Keep advice actionable and small.

### Daily-first extraction

Use when turning daily Markdown files into structured summaries, stats, or blog/API data.

Process:

1. Select date range from `Daily/YYYYMMDD.md`.
2. Extract rows and bullets into typed events: `work`, `learn`, `watch`, `read`, `listen`, `fitness`, `place`, `event`, `tool`, `note`, `decision`, `moment`.
3. Preserve the Daily file path and line/section as evidence.
4. Enrich only from linked `Sources/`, `Clippings/`, or `Notes/`.
5. Do not infer private details or metrics that are not written.
6. Output summaries, trends, candidates, or export records with `visibility` respected.

### Source link intake

Use when the user gives a URL, captured item, file, movie/book/event/workout/tool link, or asks “这个怎么分类/打 tag/评分/整理成 Source”。The intended user experience: user gives a link; AI reads the public source, creates or updates a Source record, and fills all observable metadata.

Process:

1. Read the public URL or linked local capture first. If the page is private, blocked, or unreadable, state the limitation and only use user-provided facts.
2. Classify by intent: `source_type`, `category`, target folder under `Sources/`, tags, and `interest_tags`.
3. Fill observable metadata: title, canonical_url, site/platform, author/creator, published_at, updated_at, language, source_ref/raw_source_path when available.
4. Summarize the source, explain why it may matter, recommend next action, and assign AI recommendation scores 1-5: quality, relevance, actionability, memory, public. Mark uncertain values as `[推断]`; leave unknown fields blank instead of inventing.
5. Link the record back to `Daily/YYYYMMDD.md`. If no date is provided, use today’s Daily note and mention that choice.
6. If explicitly asked to execute, create the Source file in the target `Sources/` subfolder or `Sources/inbox/` when unsure. Otherwise return the proposed record.

Return or write:

1. target folder under `Sources/`;
2. suggested filename;
3. completed frontmatter fields;
4. summary and key points;
5. tags and interest_tags;
6. scores with short reasons;
7. related daily note;
8. visibility recommendation;
9. next action.

Do not browse private/authenticated data unless the user asks and credentials/session are available. Do not fabricate source metadata, user ratings, locations, creators, or completion status; AI recommendation scores must be based on observed source content.

### Inbox triage

For each item, suggest one route:

- `Daily/` if it affects today’s action or reflection.
- `Notes/` if it is a fleeting thought or rough idea.
- `Sources/` if it is a reusable link, media item, event, place, training/body record, tool, or dataset.
- `Clippings/` if it is article/webpage body captured by Obsidian Web Clipper.
- external project if it is domain-specific research or project work.
- delete/drop if it no longer matters.

Do not move items without user approval unless explicitly asked to execute the triage.

### Fleeting-note distillation

Use for messy `Notes/` entries.

Convert a note into:

- one-sentence claim or question;
- why it matters;
- related daily note;
- possible next action;
- whether it should stay as a note, become a task, become a source, or move to another project.

Do not over-polish early thoughts. Preserve ambiguity when the idea is not ready.

### Interest mining

Use Daily first, then linked Sources + Notes over a period to infer interests.

Output:

- current active interests;
- dormant interests worth reviving;
- new interests emerging from repeated captures;
- interests with enough evidence to deepen;
- suggested next experiments: watch/read/listen/visit/train/build;
- evidence paths for every claim.

Mark weak patterns as `[推断]`.


### Source/resource review

Use for `Sources/` cleanup.

For each source, decide:

- keep: useful and distinct;
- use now: linked to current work/life;
- archive: maybe useful but not active;
- delete: stale, duplicate, or low value;
- export candidate: safe and meaningful for blog/API.

Mention reason and evidence.

### Weekly/monthly/quarterly/yearly review

Use `Daily/` as the primary source, then linked `Notes/`, `Sources/`, `Clippings/`, and prior `Summaries/` for the period. Produce:

1. 本周期主线
2. 完成的关键结果
3. Life Timeline highlights
4. 看了 / 听了 / 学了 / 去了 / 练了什么
5. 重要输入与输出
6. 兴趣变化与值得深挖的方向
7. 反复出现的问题
8. 健身/健康趋势
9. 未完成事项迁移建议
10. 下周期 Top 3
11. 博客/API 可公开候选

Do not pretend a period was “successful” without evidence.

### Blog/API export review

Use when preparing data for a personal blog.

Rules:

- Export only `visibility: summary` or `visibility: public`.
- Prefer concise summaries over raw private notes.
- Remove private people names, sensitive work details, private addresses, and sensitive health details unless user approves.
- Keep `source_path` and `daily_path` for traceability.
- AI may propose export candidates; user decides publication.

## Template policy

- `Templates/daily.md` must stay low-friction and general-purpose: Top 3, input, output, did, Life Timeline, learning/reflection, and migration. Do not make the daily page feel like a database form.
- `Templates/source.md` is for AI-assisted source/link records. The user may provide only a URL; AI should fill observable metadata, classification, tags, scores, summary, Daily backlink, and next action.
- `Templates/note.md` is intentionally lightweight for fleeting thoughts.
- Period review templates live in `Templates/*-review.md`.
- Do not add a clipping template; Obsidian Web Clipper owns clipping format.
- Do not add domain-specific sections to the daily template.

## Editing policy

Before editing:

1. Read only the relevant files.
2. Preserve user-authored daily content.
3. Prefer small targeted updates.
4. Keep current directory boundaries.

After editing:

1. Confirm JSON configs still parse if changed.
2. Confirm no removed domain-specific references reappear.
3. Confirm `Templates/daily.md` still answers: input, output, did, next, learning/reflection, life timeline.
4. Confirm `Sources/` and `Exports/` references are consistent.
