# DailyVault 服务

DailyVault 服务是 Markdown Vault 之上的本地访问层。Markdown 仍然是事实来源；本服务只负责读取、追加、创建 Source 记录、导出公开安全数据，以及生成 Nervia/ZNorth 提升候选。

## 安全默认值

- HTTP 默认绑定到 `127.0.0.1`。
- 类写入操作默认使用 `dry_run` 或预览模式。
- Source URL 整理只有 `save: true` 时才保存。
- 公开导出只返回 `visibility: summary` 或 `visibility: public` 的记录。
- 跨项目提升只返回候选负载；不会同步到 Nervia 或 ZNorth。
- 写入会在 `Server/logs/audit/*.jsonl` 下追加审计记录。
- URL 整理在解码前设置抓取超时和响应大小上限。
- HTTP JSON 请求体在解析前有大小限制。

## 安装

```bash
cd Server
npm install
```

## MCP stdio

```bash
npm run mcp
```

暴露的工具：

- `dailyvault.read_daily`
- `dailyvault.append_daily`
- `dailyvault.intake_source_url`
- `dailyvault.read_source`
- `dailyvault.search_sources`
- `dailyvault.export_public`
- `dailyvault.promote_candidate`
- `dailyvault.dry_run_candidate_promotions`

## HTTP API

```bash
npm run http
```

默认基础 URL：

```text
http://127.0.0.1:3417
```

端点：

```http
GET  /daily/:date
POST /daily/:date/append
POST /sources/intake-url
GET  /sources?query=&category=&visibility=&limit=
GET  /sources/:vaultRelativePath
GET  /exports/public
POST /promotions/candidate
POST /promotions/candidate/dry-run
```

Source 预览示例：

```bash
curl -X POST http://127.0.0.1:3417/sources/intake-url \
  -H 'content-type: application/json' \
  -d '{"url":"https://example.com","save":false}'
```

保存示例：

```bash
curl -X POST http://127.0.0.1:3417/sources/intake-url \
  -H 'content-type: application/json' \
  -d '{"url":"https://example.com","daily_date":"2026-07-03","save":true}'
```

## 环境变量

- `DAILYVAULT_ROOT`：可选的 Vault 根目录覆盖，用于测试或部署。
- `DAILYVAULT_HOST`：HTTP 主机，默认 `127.0.0.1`。
- `DAILYVAULT_PORT`：HTTP 端口，默认 `3417`。

## 验证

```bash
npm run check
```
