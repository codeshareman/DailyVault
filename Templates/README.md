# Templates

Reusable templates for the DailyVault scaffold. Templates define structure only; they are not automation contracts.

## Files

| Template | Purpose |
| --- | --- |
| `daily.md` | Lightweight daily plan, log, input/output, Life Timeline, learning, review, and migration. |
| `source.md` | AI-assisted source/link record: user can provide only a URL; AI fills observable metadata, classification, scores, summary, Daily backlink, and next action. |
| `note.md` | Lightweight fleeting note. |
| `weekly-review.md` | Weekly review from Daily-first evidence. |
| `monthly-review.md` | Monthly review from Daily-first evidence. |
| `quarterly-review.md` | Quarterly review from Daily-first evidence. |
| `yearly-review.md` | Yearly review from Daily-first evidence. |

## Template policy

- `daily.md` stays general-purpose.
- Do not add domain-specific sections to `daily.md`.
- Do not add service-specific automation before real data and workflow needs exist.
- Do not create `clipping.md`; Obsidian Web Clipper owns clipping format.
- Prefer natural-language daily records first; do not expose verbose Dataview inline fields in ordinary Daily rows.
- Source capture is AI-assisted: the template has full metadata fields, but the user should not fill them manually; AI fills observable fields from the public source and leaves unknowns blank.

## Daily list convention

- Repeating records use unordered lists, not single-line buckets. A day can have multiple watched/read/listened/visited/trained/tool records.
- When a row should link to a durable resource, use one Markdown wiki link with alias: `[[Sources/category/YYYYMMDD-slug|Readable Name]]`.
- Keep the name and link together. Do not write separated `name [[link]]`, and do not expose `title/source/summary` inline-field syntax in user-facing Daily rows.

## Review metric dimensions

Weekly/monthly/quarterly/yearly templates should expose these Dataview dimensions before AI synthesis:

- Daily coverage: recorded days by week/month/quarter/year.
- Life Timeline / inputs: use readable Daily links for human review; aggregate statistics come primarily from linked `Sources` frontmatter.
- Sources: category, source_type, visibility, interest tags, and summary/public export candidates.
- Notes: status counts and unresolved note-triage tasks.
- Tasks: unfinished Daily/Notes tasks grouped by file.
