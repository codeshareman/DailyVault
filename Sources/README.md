# Sources

`Sources/` stores AI-assisted source records for links, media, events, tools, training/body records, places, and datasets. `Daily/YYYYMMDD.md` remains the canonical timeline; Sources enrich Daily rows when a link or activity needs metadata, tags, scoring, source references, or future export data.

Core user experience: the user can give one URL, and AI should read the public source, classify it, fill all observable metadata, score it, summarize it, link it to Daily, and create or propose the Source record. Unknown fields stay blank; uncertain conclusions are marked `[推断]` in the note body.

`Clippings/` stores raw Obsidian Web Clipper captures. `Sources/` stores the cleaned, classified, linked source record.

## Directory layout

Keep the folders small and life-oriented:

```text
Sources/
├── inbox/      # default landing zone when category is unclear
├── reading/    # articles, essays, papers, books, newsletters
├── watching/   # movies, shows, videos, talks
├── listening/  # music, podcasts, albums, live sets
├── learning/   # courses, docs, tutorials, learning paths
├── tools/      # websites, apps, CLIs, repos, workflows
├── places/     # restaurants, cities, routes, venues, trips
├── events/     # concerts, exhibitions, talks, performances, tickets
└── fitness/    # manually recorded workouts, routes, training notes, body signals
```

## Link intake workflow

When the user gives a link and asks to save, classify, or 整理成 Source:

1. Read the public URL or local clipping first.
2. If the page is private, blocked, or unreadable, say so and only use user-provided facts.
3. Choose `source_type`, `category`, target folder, filename, tags, and `interest_tags`.
4. Fill observable metadata: title, canonical_url, site/platform, author/creator, published_at, updated_at, captured_at, language, source_ref/raw_source_path if available.
5. Summarize the source and extract key points.
6. Score 1-5 as AI recommendations: quality, relevance, actionability, memory, public.
7. Link back to `Daily/YYYYMMDD.md`; if no date is specified, use today’s Daily note.
8. Create the file if the user asks to execute; otherwise return the proposed Source record.

Do not fabricate metadata, ratings, locations, creator names, durations, or completion status.

## Classification

| If the item is… | Put in | source_type examples |
| --- | --- | --- |
| Article / blog / newsletter / paper / book | `Sources/reading/` | `article`, `paper`, `book`, `newsletter` |
| Movie / show / video / talk | `Sources/watching/` | `movie`, `show`, `video`, `talk` |
| Music / podcast / album / concert recording | `Sources/listening/` | `music`, `album`, `podcast` |
| Course / tutorial / docs / learning plan | `Sources/learning/` | `course`, `tutorial`, `docs` |
| App / website / CLI / GitHub repo / workflow | `Sources/tools/` | `tool`, `repo`, `workflow` |
| Restaurant / city / route / venue / trip | `Sources/places/` | `place`, `route`, `trip`, `venue` |
| Concert / exhibition / talk / ticket page | `Sources/events/` | `event`, `concert`, `exhibition` |
| Workout / route / body signal already recorded by the user | `Sources/fitness/` | `workout`, `route`, `body-metric` |
| Unsure | `Sources/inbox/` | `link`, `unknown` |

## Metadata contract

Every Source should have a Daily backlink and enough metadata to be useful later:

```yaml
source_id:
date:
week:
month:
quarter:
year:
time:
module: Sources
note_type: source
source_type:
category:
status:
url:
canonical_url:
title:
site_name:
platform:
author:
creator:
published_at:
updated_at:
captured_at:
language:
tags: []
interest_tags: []
quality_score:
relevance_score:
actionability_score:
memory_score:
public_score:
rating:
visibility: private
public_title:
public_summary:
public_tags: []
related_daily: [[Daily/YYYYMMDD]]
daily_path: Daily/YYYYMMDD.md
source_ref:
raw_source_path:
reviewed: false
```

## Tags

Use lower-kebab names. Prefer prefix tags so AI and exporters can group them.

```yaml
tags:
  - type/article
  - domain/frontend
  - domain/ai
  - life/movie
  - life/fitness
  - life/travel
  - format/video
  - status/to-read
  - status/used
  - source/manual
  - source/clipper
  - public/candidate
interest_tags:
  - frontend-engineering
  - strength-training
  - singapore-life
```

Rules:

- `tags` describe classification and workflow.
- `interest_tags` describe the user’s personal interests.
- Use 3-8 tags per source. If more are needed, the source probably needs a note summary.
- Use `public/candidate` only when it may be shared on the blog.

## Scoring

Use 1-5. Blank means unknown.

| Field | Meaning |
| --- | --- |
| `quality_score` | 信息质量、可信度、制作水准 |
| `relevance_score` | 与当前生活、工作、兴趣的相关度 |
| `actionability_score` | 是否能触发行动、学习、购买、观看、训练、出行 |
| `memory_score` | 年终回看是否值得记住 |
| `public_score` | 是否适合公开分享到博客 |

Suggested interpretation:

- 5 = standout / should resurface in reviews.
- 4 = useful or memorable.
- 3 = normal, keep if relevant.
- 2 = weak, archive unless needed.
- 1 = delete or reject.

## Public / blog export

Private by default.

Only `visibility: summary` or `visibility: public` records should be exported to `Exports/public/` or a blog API. Prefer `public_summary` over raw private notes.
