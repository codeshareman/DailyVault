# DailyVault Server

DailyVault Server is a local access layer over the Markdown vault. Markdown remains the source of truth; this server only reads, appends, creates Source records, exports public-safe data, and produces Nervia/ZNorth promotion candidates.

## Safety defaults

- Binds HTTP to `127.0.0.1` by default.
- Write-like operations default to `dry_run` or preview mode.
- Source URL intake saves only when `save: true`.
- Public export only returns records with `visibility: summary` or `visibility: public`.
- Cross-project promotion returns candidate payloads; it does not sync into Nervia or ZNorth.
- Writes append audit entries under `Server/logs/audit/*.jsonl`.
- URL intake has a fetch timeout and response-size cap before decoding.
- HTTP JSON request bodies are size-limited before parsing.

## Install

```bash
cd Server
npm install
```

## MCP stdio

```bash
npm run mcp
```

Tools exposed:

- `dailyvault.read_daily`
- `dailyvault.append_daily`
- `dailyvault.intake_source_url`
- `dailyvault.read_source`
- `dailyvault.search_sources`
- `dailyvault.export_public`
- `dailyvault.promote_candidate`

## HTTP API

```bash
npm run http
```

Default base URL:

```text
http://127.0.0.1:3417
```

Endpoints:

```http
GET  /daily/:date
POST /daily/:date/append
POST /sources/intake-url
GET  /sources?query=&category=&visibility=&limit=
GET  /sources/:vaultRelativePath
GET  /exports/public
POST /promotions/candidate
```

Example source preview:

```bash
curl -X POST http://127.0.0.1:3417/sources/intake-url \
  -H 'content-type: application/json' \
  -d '{"url":"https://example.com","save":false}'
```

Example save:

```bash
curl -X POST http://127.0.0.1:3417/sources/intake-url \
  -H 'content-type: application/json' \
  -d '{"url":"https://example.com","daily_date":"2026-07-03","save":true}'
```

## Environment

- `DAILYVAULT_ROOT`: optional vault root override for tests or deployment.
- `DAILYVAULT_HOST`: HTTP host, defaults to `127.0.0.1`.
- `DAILYVAULT_PORT`: HTTP port, defaults to `3417`.

## Verification

```bash
npm run check
```
