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
- Empty inline-field examples belong in code fences, not as live data rows.

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

```dataview
TABLE file.link AS Day, L.public_type AS Type, L.title AS Title, L.visibility AS Visibility, L.public_summary AS Summary
FROM "Daily"
FLATTEN file.lists AS L
WHERE L.public_type AND (L.visibility = "summary" OR L.visibility = "public")
SORT date DESC
```
