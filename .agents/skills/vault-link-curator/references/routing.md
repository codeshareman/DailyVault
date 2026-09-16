# 链接路由参考

## 快速决策

```
URL
 ├─ 电商/闲鱼/具体商品成交页 → income-opportunity-research（非本技能）
 ├─ github.com/*/repo（可安装的工具/库）
 │    └─ Tools/ · Software · kind/tool
 ├─ npm / pypi / crates / go.dev 包页
 │    └─ Tools/ · Software · kind/tool
 ├─ 产品官网 / SaaS / CLI 下载页 / 文档站入口
 │    └─ Tools/ · Service 或 Software · kind/tool
 ├─ 博客文章 / 教程 / 论文 / 规范全文
 │    └─ Inputs/ · Text · kind/article
 └─ 用户自己的发布物（gist 交付、个人文章成品）
      └─ 通常 Outputs/；仅当用户明确要求
```

## 常见 subject（取最贴切 1–3 个）

| subject | 适用 |
| --- | --- |
| `developer-tools` | 开发工具、CLI、构建、Lint、Git 生态 |
| `ai` | AI 模型、Agent、推理服务 |
| `local-ai` | 本地模型运行时 |
| `software` | 通用自托管/桌面应用 |
| `packages` | 语言包管理器上的库 |
| `documentation` | 以文档阅读为主的入口 |
| `media` / `video` | 视频平台 |
| `design` | 设计资源与灵感站 |
| `productivity` | 效率、笔记、协作 |
| `inbox` | 暂时无法分类；`status: draft` |

`category` 必须等于 `subject` 第一项。

## 去重规则

视为同一资源（更新而非新建）若满足任一：

- `identifier` 相同（规范化后的 canonical URL）
- `Tools/` 或 `Inputs/` 中已有文件的 `source` / `url` 与当前链接仅差 scheme、末尾 `/` 或常见追踪参数
- GitHub 仓库：同一 `owner/repo` 已存在卡片（即使 URL 是 `/tree/main` 子路径）

## 命名

- 优先：`scrcpy.md`、`Immich.md`、`DeepWiki.md`
- 避免：完整 URL slug、`— 069` 书签编号、过长英文标题全拼
- 标题含特殊字符时文件名用可读中文或核心英文名
- 与现有文件冲突且确为不同资源：在名称后加区分词（如 `GitHub Issues.md` vs `GitHub.md`）

## 与其它技能的分工

| 场景 | 技能 |
| --- | --- |
| 整理链接、生成工具卡/剪藏 | **vault-link-curator**（本技能） |
| 闲鱼/电商赚钱拆解 | income-opportunity-research |
| 周期复盘写入 | period-review |
| 纯网页剪藏原文快照 | 用户用 Obsidian Web Clipper → `Inputs/`；本技能写描述卡，不替代全文剪藏 |
