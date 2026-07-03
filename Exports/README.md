# Exports

`Exports/` defines how date-named Daily Markdown files can become a data source for a personal blog or open API. Exporters read `Daily/` first, then enrich from linked `Sources/`, `Clippings/`, `Notes/`, and `Summaries/`.

DailyVault is private by default. Exporters must only publish records with explicit visibility:

```yaml
visibility: summary # or public
```

## Possible blog surfaces

Inspired by personal sites with pages such as moments, notes, photos, workouts, books/movies, maps, and tools, DailyVault can export:

- daily moments and public summaries;
- watched/read/listened records;
- workouts and running routes;
- visited places and events;
- favorite tools and resources;
- yearly review highlights;
- interest trends.

## Suggested generated files

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

## Suggested API shape

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

## Public record schema

```json
{
  "id": "dv_src_202607021430_example",
  "date": "2026-07-02",
  "type": "tool",
  "title": "Example Tool",
  "summary": "Why it mattered.",
  "url": "https://example.com",
  "tags": ["type/tool", "public/candidate"],
  "source_path": "Sources/tools/20260702-example-tool.md",
  "daily_path": "Daily/20260702.md",
  "metrics": {},
  "visibility": "public"
}
```

## Export rules

- Never export `visibility: private`.
- Prefer summaries over raw personal notes.
- Remove private people names, private addresses, private health details, and sensitive work details unless explicitly approved.
- Keep `daily_path` first and `source_path` when available for traceability.
- AI may propose exports, but the user decides what becomes public.

## Export preflight metrics

Before publishing or generating API payloads, verify:

- public record count by `visibility` (`summary` / `public` only);
- source category coverage: reading, watching, listening, learning, tools, places, events, fitness when applicable;
- excluded private paths include raw Daily, Notes, Clippings, private fitness/body details, and unresolved Sources/inbox records;
- every exported record keeps `daily_path` and `source_path` for traceability;
- no private people names, private addresses, sensitive work details, or sensitive health details are present unless explicitly approved.
