# Daily

`Daily/YYYYMMDD.md` is the canonical date spine. Start here before creating Sources, Notes, Summaries, or Exports.

## Daily note should answer

1. 今天输入了什么？
2. 今天输出了什么？
3. 今天做了什么？
4. 接下来要做什么？
5. 今天学到了什么、复盘出了什么？

It may also record life timeline signals: watched/read/listened/learned/visited/trained/built/felt/decided.

## Rules

- One file per day: `YYYYMMDD.md`.
- Do not create daily category folders by default.
- Write the daily note first; only create a Source when extra metadata is useful.
- Keep domain-specific research in a separate project.
- Keep user-facing rows readable; use `[[Sources/category/YYYYMMDD-slug|Readable Name]]` when a record should link to durable metadata.

## Dataview index

```dataview
TABLE date, weekday, focus_area, mood, energy, status
FROM "Daily"
WHERE note_type = "daily-log"
SORT date DESC
LIMIT 14
```

```dataview
TASK
FROM "Daily"
WHERE !completed
GROUP BY file.link
```

Public/blog candidates should come from `Sources/` records whose frontmatter explicitly sets `visibility: summary` or `visibility: public`; do not make Daily rows carry export metadata.
