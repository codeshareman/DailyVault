# DailyVault

DailyVault is the low-friction daily record vault for the ZNorth / Nervia workflow.

It records daily action, captures, personal context, and investment observations. It is intentionally lighter than Nervia and less publish-facing than ZNorth.

## Boundary

| System | Owns |
| --- | --- |
| `DailyVault` | Daily action logs, messy captures, clippings, resources, notes, investment observations |
| `Nervia` | Source-backed learning kernel: sources, research, experiments, knowledge topics, outputs |
| `ZNorth` | Brand content operations: editorial, products, distribution, automation, metrics |

Short rule:

```text
DailyVault records what happened today.
ZNorth packages what is publishable.
Nervia preserves what is source-backed and teachable.
```

## Structure

```text
DailyVault/
├── Daily/
│   └── YYYYMMDD.md
├── Inbox.md
├── Clippings/
├── Resources/
├── Notes/
├── Investing/
│   ├── holdings-current.md
│   ├── reports/
│   ├── timeline.md
│   ├── watchlist.md
│   ├── decisions-ledger.md
│   └── thesis/
├── Summaries/
├── Common/
└── Templates/
```

## Rule

`Daily/YYYYMMDD.md` is the daily action and judgment index. It is not the physical container for every clipping or resource.

```text
Daily/YYYYMMDD.md
  + Clippings/* / Resources/* / Notes/* / Investing/reports/*
  -> Summaries/weekly or monthly
  -> ZNorth candidates / Nervia promotion candidates / Investing timeline
```
