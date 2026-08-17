# DailyVault OpenAPI

DailyVault 的隐藏支持模块，不属于 Obsidian 内容目录。它只提供对 `YYYY/YYYY-MM-DD.md` 的本地读写能力（HTTP + MCP 双入口），不创建其他类型的记录。

## 目录结构

```text
openapi.yaml        # OpenAPI 3.1 契约
src/
├── audit.js        # 写入审计（logs/audit/YYYYMMDD.jsonl）
├── config/paths.js # 路径解析与安全边界
├── http/server.js  # 本地 HTTP API（默认 127.0.0.1:3417）
├── mcp/server.js   # MCP stdio 服务
├── util/           # 日期与响应处理
└── vault/          # Daily 读写、追加与原子写入
tests/              # node:test 测试（运行在临时 Vault，不触碰真实笔记）
```

## HTTP 接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/health` | 健康检查。 |
| GET | `/openapi.yaml` | 返回 API 契约。 |
| GET | `/daily/{date}` | 读取指定 Daily；不存在返回 404。 |
| POST | `/daily/{date}/append` | 向固定章节追加内容；默认 `dry_run: true` 只预览，`dry_run: false` 才写入并记审计。 |

错误统一返回 `{ "error": "..." }`：`400` 参数/请求体无效、`404` 未找到、`413` 请求体过大、`500` 内部错误（细节不外泄，记入审计）。

## MCP 工具

- `dailyvault.read_daily`：读取 Daily。
- `dailyvault.append_daily`：追加到固定章节，默认 dry_run。

## 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `DAILYVAULT_HOST` | `127.0.0.1` | HTTP 监听地址。 |
| `DAILYVAULT_PORT` | `3417` | HTTP 监听端口。 |
| `DAILYVAULT_ROOT` | 仓库根目录 | Vault 根目录（测试/部署时覆盖）。 |
| `DAILYVAULT_OPENAPI_ROOT` | 模块目录 | 本模块目录。 |

## 运行与验证

```bash
cd .dailyvault/openapi
npm run http    # 启动 HTTP 服务
npm run mcp     # 启动 MCP stdio 服务
npm run check   # 语法检查 + 全部测试
```

写操作只接受固定章节：今日计划、随手记录、输入、输出、生活时间线、学到、复盘、明日 / 迁移；日期接受 `YYYY-MM-DD` 或 `YYYYMMDD`。
