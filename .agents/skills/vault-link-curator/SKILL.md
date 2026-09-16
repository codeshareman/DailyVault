---
name: vault-link-curator
description: Parse one or more URLs the user sends, research each link's public metadata, route it to the correct DailyVault directory, and write a Markdown description card. Use whenever the user pastes a link, a batch of links, or asks to 整理/收录/归档/入库 a URL, GitHub repo, npm package, product site, article, or documentation page into Tools/ or Inputs/. Use even when they only send the URL without extra instructions. Do NOT use for Goofish/e-commerce income analysis (use income-opportunity-research) or for rewriting Daily notes.
compatibility: Requires web fetch or GitHub read access for public pages, and a writable DailyVault repository.
---

# 链接整理

把用户发来的单个或批量链接，解析成可复用的 Markdown 描述文档，并放入 DailyVault 的正确目录。Daily 只链接结果，不复制正文。

## 领域边界

- **工具卡**（`Tools/`）：可跨项目复用的网站、服务、开源软件、CLI、包管理器条目。
- **剪藏**（`Inputs/`）：以阅读为主的文章、教程、规范页、长文文档；保留入口与摘要，不替代原文。
- **收入机会**（`Drafts/收入机会拆解/`）：商品、店铺、服务成交页——转交 `income-opportunity-research`，本技能不处理。
- **输出**（`Outputs/`）：用户自己的交付物；链接整理默认不写这里。

同一链接只维护一份 canonical 文档。更新已有卡片时改写原文件，不机械复制。

## 触发与默认产物

用户发来 URL（一个或多个），或明确要求整理、收录、生成工具介绍时执行。

默认产物：

| 链接性质 | 路径 | 文件名 |
| --- | --- | --- |
| 工具 / 服务 / 开源仓库 / 包 | `Tools/<名称>.md` | 产品或仓库名，如 `scrcpy.md`、`Immich.md` |
| 文章 / 教程 / 规范长文 | `Inputs/<标题>.md` | 简短可读标题，去掉书签编号后缀 |

观察日期写入 frontmatter 的 `captured_at` / `created` 和 `last_checked`，格式 `YYYY-MM-DD`。

## 工作流

### 1. 预检

1. 读取仓库 `AGENTS.md` 与 `Templates/tool.md`（工具卡结构参考）。
2. 从用户消息提取全部 URL；去掉重复、追踪参数和无意义 fragment（保留文档锚点若用户明确给出）。
3. 对每个 URL 在 `Tools/`、`Inputs/` 中按 `identifier`、`source`、`url`、`canonical_url` 检索是否已有卡片（`rg` 或 `glob`）。已存在则更新 `last_checked` 与正文，不新建重复文件。
4. 批量链接：先输出处理计划（链接数、预计目录、是否跳过重复），再逐个执行；全部完成后给汇总表。

### 2. 抓取公开信息

按链接类型选用来源（只读、无副作用）：

| 类型 | 优先来源 |
| --- | --- |
| `github.com/<owner>/<repo>` | `github file_read` 读 `README.md`；补充 About、license、releases 页公开信息 |
| `npmjs.com/package/*` | 包页描述、repository、keywords |
| `pypi.org/*`、`crates.io/*` | 项目页公开描述 |
| 产品官网 | `web_fetch` 或浏览器读 title、meta description、定价/文档入口 |
| 文章 / 博客 | 标题、作者、发布日期（页面有则记）、摘要 |

找不到的字段省略，禁止写 `unknown` 或空字符串占位。推断内容标 `[推断]`。

### 3. 路由

读完 `references/routing.md` 后分类。核心规则：

- **GitHub 开源仓库**（有 README、可安装使用的工具/库）→ `Tools/`，`dc_type: Software`
- **npm/PyPI 等包页** → `Tools/`，`dc_type: Software`
- **SaaS、文档站、聚合站、可反复查阅的产品入口** → `Tools/`，`dc_type: Service` 或 `Software`（以是否主要分发软件为准）
- **一次性阅读的文章、教程、规范全文入口** → `Inputs/`，`type: clipping`，`kind/article`
- **闲鱼、电商成交页、具体商品 listing** → 停止并改用 `income-opportunity-research`

边界模糊时：能反复当入口用的放 `Tools/`；主要是读完即走的放 `Inputs/`。

### 4. 写入文档

正文模板见 `references/templates.md`。须满足 `AGENTS.md` 第 11 条 frontmatter 契约：

- `category` = `subject` 第一项
- 每个 `subject` 有对应 `#topic/...` 标签
- 工具卡保留 `#kind/tool`；剪藏保留 `#kind/article`
- `identifier`、`source`、`description` 对齐 Dublin Core；日期纯 `YYYY-MM-DD`

正文用中文撰写，语气参考现有优质卡片（如 `Tools/Immich.md`、`Tools/Ollama.md`）：说清它是什么、为什么值得收藏、什么时候用、限制与判断。

GitHub 仓库卡片应覆盖：用途、主要能力、平台/安装方式、许可（页面有则写）、与官网/docs 的链接。

### 5. 回写 Daily（可选）

仅当用户明确要求记入今天，或消息里带有「今天」「记入 daily」等意图时：

- 向 `YYYY/YYYY-MM-DD.md` 的「输入」追加一行：`- [[文件名]] 或 URL — 一句话关联 #kind/tool` 或 `#kind/article`
- 不复制卡片正文到 Daily

### 6. 收尾

重新读取每个新建/更新的文件，确认 frontmatter 完整、链接可点击、无重复文件。用表格汇报：

| 链接 | 动作 | 文件路径 |
| --- | --- | --- |
| … | 新建 / 更新 / 跳过（已存在） | … |

## 质量门槛

交付前检查：

- 每个链接都有可回溯 URL 和对应文件路径
- 未编造价格、作者、许可、star 数等页面未公开的数据
- 工具卡与剪藏未混用 `type` / `dc_type` / `kind` 标签
- 文件名简洁，无 `— 073` 类历史书签编号（除非更新旧文件本身）
- 批量任务中每个链接独立成文，无合并到一个文件

最终用三句话说明：处理了几条链接、新建/更新各多少、有无需用户确认的边界案例。
