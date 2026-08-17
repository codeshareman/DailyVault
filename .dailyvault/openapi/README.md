# DailyVault OpenAPI

这是 DailyVault 的隐藏支持模块，不属于 Obsidian 内容目录。它只提供对 `Daily/` 的本地 HTTP 和 MCP 访问，不创建 Source、导出或跨项目提升数据。

## 契约与接口

- OpenAPI 3.1 契约：`openapi.yaml`
- `GET /health`：健康检查。
- `GET /openapi.yaml`：返回 API 契约。
- `GET /daily/{date}`：读取指定 Daily。
- `POST /daily/{date}/append`：默认预览；`dry_run: false` 才写入固定 Daily 章节。

## 运行与验证

```bash
cd .dailyvault/openapi
npm run http
npm run check
```

默认仅监听 `127.0.0.1:3417`。`DAILYVAULT_ROOT` 可覆盖 Vault 根目录，`DAILYVAULT_OPENAPI_ROOT` 可覆盖本模块目录，主要供测试或部署使用。
