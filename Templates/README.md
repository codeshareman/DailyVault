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
- Prefer natural-language daily records first; use Dataview inline fields only when a row should be queried later.
- Source capture is AI-assisted: the template has full metadata fields, but the user should not fill them manually; AI fills observable fields from the public source and leaves unknowns blank.
