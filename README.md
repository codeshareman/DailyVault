# DailyVault

DailyVault 是一个个人生活时间线和每日操作系统。

它以 `Daily/YYYYMMDD.md` 作为按日期组织的主线。每天先记录在这个按日期命名的 Markdown 文件中：工作、生活、观看、聆听、学习、地点、训练、想法、输出和记忆。`Sources/`、`Clippings/`、`Notes/` 都是辅助材料；AI 先从 `Daily/` 提取结构，必要时再从已链接的资料补充信息。目标不只是回答“今天做了什么”，也要回答“这一年我如何生活、学习、训练、观看、聆听、旅行、创造、变化”。

它每天应回答五个问题：

1. 今天输入了什么？
2. 今天输出了什么？
3. 今天做了什么？
4. 接下来要做什么？
5. 今天学到了什么、复盘出了什么？

它也应保存个人生活信号：

- 看了什么：电影、剧、视频、文章、书。
- 听了什么：播客、音乐、演唱会、分享。
- 学了什么：课程、文档、技术、方法。
- 去了哪里：城市、场馆、旅行、展览、活动。
- 练了什么：跑步、力量训练、运动数据、身体状态。
- 用了什么好工具：网站、App、仓库、工作流。

特定领域研究应放在独立项目里，使用各自的工作流。DailyVault 只保留通用的每日执行、个人捕捉、生活时间线、资料元数据、学习、复盘，以及可公开分享的生活数据。

## 使用指南

### 每天只做三件事

1. 打开或创建 `Daily/YYYYMMDD.md`。
2. 先写自然语言：今天做了什么、输入了什么、输出了什么、看/读/听/学/去/练/用了什么、明天第一步。
3. 只有当一条记录值得长期保留、复盘统计或未来公开时，再链接到 `Sources/`、`Notes/` 或 `Clippings/`。

空白可以留空；不要为了填满模板而编内容。Daily 是人的日记和时间线，不是表单。

### Daily 怎么写

推荐写法：

```markdown
## 输入
- 读了 [[Sources/reading/20260703-frontend-state|Frontend State Article]]：一句真正有用的收获。
- 临时看了一篇文章，还不确定有没有价值。

## 生活时间线
- 看了
  - [[Sources/watching/20260703-react-debugging|React Debugging Video]]
- 练了
  - 肩颈活动 15 分钟，感觉右肩轻松一点。

## 学到 / 复盘
- 学到：取消请求和忽略过期响应不是一回事。
- 明天第一步：先补最小复现，再改组件状态。
```

避免写法：

```markdown
- 一整串面向统计的字段，而不是人能直接读的句子。
- 名称写在外面，后面再跟一个裸链接。
```

也就是：正文保持可读；如果要链接，使用 `[[path|可读名称]]`，让名称和链接在同一个 Markdown 链接里。

### 什么时候放到哪里

| 你手里有什么 | 放哪里 | 用法 |
| --- | --- | --- |
| 今天发生的事、计划、复盘、生活片段 | `Daily/YYYYMMDD.md` | 先写这里；这是主线。 |
| 一个 URL、视频、书、工具、地点、活动、训练记录 | `Sources/` | 需要 metadata、分类、评分、公开候选时再建。 |
| Web Clipper 自动抓下来的网页正文 | `Clippings/` | 这是原文快照；不会自动关联 Daily/Sources。需要时再手动引用或整理成 Source。 |
| 闪念、问题、半成品想法 | `Notes/` | 可以粗糙；之后再决定放弃、补充或迁移。 |
| 没想清楚的任务/想法 | `Inbox.md` | 临时收纳，之后再分诊。 |
| 周/月/季度/年度复盘 | `Summaries/` | 从 Daily 和 Sources 的证据生成。 |
| 准备公开到博客/API 的内容 | `Exports/` | 只导出明确 `visibility: summary/public` 的内容。 |

### 最小工作流

- 早上：写 `今日主线` 和 `Top 3`。
- 白天：在 `做了什么`、`输入`、`输出`、`生活时间线` 里随手追加。
- 遇到链接：先贴在 Daily；如果值得保留，对 AI 说“把这个链接整理成 Source”。如果是 Web Clipper 已抓取的内容，告诉 AI 具体 clipping 文件名或链接。
- 有想法但没成型：放 `Notes/` 或 `Inbox.md`，不要塞进 Daily 模板结构里硬整理。
- 晚上：对 AI 说“帮我做 daily closeout / 今日收尾”，再补 `明天第一步`。
- 每周：用 `Templates/weekly-review.md` 从 Daily 和 Sources 生成复盘。

### 可以直接对 AI 说的话

- “帮我创建今天的 Daily，并保持简单。”
- “把这个链接整理成 Source，链接回今天。”
- “把 `Clippings/某篇文章.md` 整理成 Source，链接回今天。”
- “这个东西应该放 Daily、Note、Source 还是 Inbox？”
- “帮我做今天收尾，不要编没有证据的内容。”
- “基于本周 Daily 和 Sources 生成周复盘。”
- “找出可以公开到博客/API 的摘要级内容。”

### 判断标准

- Daily 是否打开就能写？如果不能，模板太重。
- 一条记录半年后是否还能看懂？如果不能，链接或摘要太少。
- 是否需要统计、分类、公开、安全过滤？如果需要，放到 Sources/Exports，不要污染 Daily 正文。
- AI 是否能根据文件路径和 frontmatter 追溯证据？如果不能，补链接；不要补事实。

## 目录结构

```text
DailyVault/
├── AGENTS.md       # AI 助手规则和复盘工作流
├── Daily/          # 每天一个文件：YYYYMMDD.md；日期主线
├── Inbox.md        # 未处理的任务、想法、问题
├── Clippings/      # Obsidian Web Clipper 输出；插件格式是事实来源
├── Sources/        # 链接、媒体、活动、地点、训练/身体记录、工具、数据集
├── Notes/          # 闪念、个人笔记、粗糙思考
├── Summaries/      # 周/月/季/年复盘
├── Exports/        # 未来博客/API/公开 JSON 导出契约
├── Server/         # Markdown Vault 的本地 MCP/HTTP 访问层
└── Templates/      # 可复用的非剪藏模板
```

## Daily 规则

`Daily/YYYYMMDD.md` 是当天的主要时间线记录，也是当天事实来源。它不是当天所有文件的收纳文件夹。某件事如果对今天重要，先写进 Daily；只有在额外元数据、评分、来源引用或导出结构有用时，才新增 `Source`。

```text
Daily/YYYYMMDD.md
  = 日期事实记录：看了、读了、听了、练了、去了、学了、做了、感受了、决定了什么
  + 可选链接到 Inbox / Clippings / Sources / Notes
  -> AI 按日期范围提取
  -> 进入 Summaries 的周/月/季/年复盘
  -> 标记可分享后进入 Exports/public
```

只有少数附件集合才使用日期文件夹。不要默认创建 `Daily/YYYYMMDD/clippings/` 或按天分类的子文件夹。

## Sources 模型

`Sources/` 保存由 AI 辅助整理的链接、媒体、活动、工具、训练/身体记录、地点和数据集元数据。它支持 Daily 时间线，但不替代 Daily。

预期工作流很简单：给 AI 一个链接，或明确指定一个剪藏文件；AI 读取资料，填充可观察元数据，分类、打标签、评分、摘要、链接回 Daily，并创建或提议一个 Source 记录。Web Clipper 本身只把原始文件写入 `Clippings/`，不会自动建立关联。如果资料是私有、被阻止或无法读取的，AI 需要说明限制，只使用用户提供的事实。

资料可以来自：

- 手动链接或笔记；
- 用户明确指定的 Obsidian Web Clipper 剪藏；
- 看过、读过、听过的条目；
- 课程、文档、工具、仓库或工作流；
- 地点、路线、活动、旅行或训练/身体记录。

在真实数据和真实工作流证明有必要之前，不做特定服务自动化。

见 `Sources/README.md` 和 `Templates/source.md`。

## 模板原则

`Templates/daily.md` 刻意保持低摩擦：

- 先用自然语言写 Daily；空白可以保留。
- 默认页面要短，打开后能立即写。
- 使用 `Top 3`、输入、输出、做了什么、生活时间线、学习/复盘和迁移作为每日骨架。
- 在 Daily 中使用可读的 `[[path|名称]]` 链接；可查询元数据放进 Sources frontmatter，不放在 Daily 行内字段。
- 评分、导出字段和详细分类不要进入 Daily 页面；AI 可以在链接整理或复盘时填入 Source 记录。

## Templates

- `Templates/daily.md`：轻量每日计划、日志、生活时间线和复盘模板。
- `Templates/source.md`：AI 辅助的资料/链接记录模板；用户只提供 URL 也可以，由 AI 填元数据和摘要。
- `Templates/note.md`：用于 `Notes/` 的轻量闪念/笔记模板。
- `Templates/weekly-review.md`：周复盘模板。
- `Templates/monthly-review.md`：月复盘模板。
- `Templates/quarterly-review.md`：季度复盘模板。
- `Templates/yearly-review.md`：年度复盘模板。

没有 `Templates/clipping.md`：剪藏内容应遵循 Obsidian Web Clipper 插件自己的格式，并直接写入 `Clippings/`。

## Obsidian 设置

- Core Daily Notes 使用 `Templates/daily.md` 创建 `Daily/YYYYMMDD.md`。
- Calendar 使用相同的每日笔记设置。
- QuickAdd 提供 `创建{{日期}}.md`、`记录闪念` 和 `创建 Source`。
- Templater 对 `Daily/`、`Notes/`、`Sources/inbox/` 和复盘文件夹使用文件夹模板。
- `Clippings/` 由 Obsidian Web Clipper 管理，不由 QuickAdd 或 Templater 管理。

## AI 辅助

AI 可以帮助摘要、分析、组织、分类、评分、复盘，以及准备可公开分享的输出，但不能编造每日事实，也不能覆盖用户自己的 Daily 记录。工作规则见 `AGENTS.md`。

常用 AI 工作流：

- 每日收尾：总结今天的输入、输出、执行、生活时间线、学习、阻碍和明天第一步。
- Source 链接整理：给定 URL 后，读取公开资料，填元数据，分类、打标签、评分、摘要、链接到 Daily，并创建或提议 Source 记录。
- Inbox 分诊：把每一项分到 Daily、Notes、Sources、Clippings 或外部项目。
- 周/月/季/年复盘：提取主题、反复阻碍、兴趣、值得记住的片段、未完成承诺和下周期重点。
- 兴趣挖掘：从看/读/听/去/练的记录推断当前兴趣，并建议值得深入探索的方向。
- 公开导出审查：判断哪些 Daily/Source 记录安全且值得发布到博客。

## 服务访问层

`Server/` 将 DailyVault 暴露给本地 agent 和脚本，但不替代 Markdown 作为事实来源。

- 面向 AI 客户端的 MCP stdio 工具：读取/追加 Daily、整理 Source URL、搜索 Sources、导出公开安全记录，并生成 Nervia/ZNorth 提升候选。
- 面向脚本或应用的本地 HTTP API，默认绑定到 `127.0.0.1`。
- 写入保持保守：追加操作默认 dry-run，URL 整理只有 `save: true` 才保存，审计日志写入 `Server/logs/audit/`。
- 跨项目桥接默认只生成候选，不会自动把事实来源同步到 Nervia 或 ZNorth。

见 `Server/README.md`。

## 博客 / API 方向

DailyVault 可以成为个人博客的数据来源：每日片段、电影/书/音乐、训练/路线、去过的地点、喜欢的工具和年度记忆。可导出的记录必须使用明确的可见性字段：

```yaml
visibility: private # private | summary | public
public_title:
public_summary:
public_tags: []
```

未来导出器应以 `Daily/` 为主要输入，在存在链接时用 `Sources/` 和 `Clippings/` 补充信息，然后在 `Exports/public/` 下生成公开 JSON/API 负载。见 `Exports/README.md`。
