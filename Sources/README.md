# Sources

`Sources/` 存放由 AI 辅助整理的资料记录，覆盖链接、媒体、活动、工具、训练/身体记录、地点和数据集。`Daily/YYYYMMDD.md` 仍然是事实时间线；当一个链接或活动需要元数据、标签、评分、来源引用或未来导出数据时，Sources 用来增强 Daily 行。

核心体验：用户可以只给一个 URL，AI 读取公开资料、分类、填写所有可观察元数据、评分、摘要、链接到 Daily，并创建或提议 Source 记录。未知字段留空；不确定结论在正文中标为 `[推断]`。

`Clippings/` 存放原始 Obsidian Web Clipper 剪藏。Web Clipper 直接写入 `Clippings/`，不会自动创建 Daily 或 Source 关联；只有当剪藏证明有用时，`Sources/` 才作为后续清理、分类和链接后的资料记录。

## 目录布局

文件夹保持简洁，围绕生活场景组织：

```text
Sources/
├── inbox/      # 分类不明确时的默认落点
├── reading/    # 文章、随笔、论文、书、newsletter
├── watching/   # 电影、剧集、视频、演讲
├── listening/  # 音乐、播客、专辑、现场录音
├── learning/   # 课程、文档、教程、学习路径
├── tools/      # 网站、App、CLI、仓库、工作流
├── places/     # 餐厅、城市、路线、场馆、旅行
├── events/     # 演唱会、展览、讲座、演出、票务
└── fitness/    # 手动记录的训练、路线、训练笔记、身体信号
```

## 链接整理流程

当用户给出链接、剪藏路径，或要求保存/分类/整理成 Source：

1. 先读取公开 URL 或用户指定的本地剪藏。不要假设每个剪藏都已有 Daily 或 Source 关系。
2. 如果页面私有、被阻止、不可读，或剪藏路径未知，说明限制，只使用用户提供的事实。
3. 选择 `source_type`、`category`、目标文件夹、文件名、tags 和 `interest_tags`。
4. 填写可观察元数据：title、canonical_url、site/platform、author/creator、published_at、updated_at、captured_at、language，以及可用时的 source_ref/raw_source_path。
5. 总结资料并提取关键点。
6. 按 1-5 分给出 AI 推荐分：质量、相关性、行动性、记忆价值、公开价值。
7. 链接回 `Daily/YYYYMMDD.md`；如果没有指定日期，使用今天的 Daily。
8. 如果用户要求执行，则创建文件；否则返回提议的 Source 记录。

不要编造元数据、评分、地点、创作者姓名、时长或完成状态。

## 分类

| 条目类型 | 放到 | source_type 示例 |
| --- | --- | --- |
| 文章 / 博客 / newsletter / 论文 / 书 | `Sources/reading/` | `article`, `paper`, `book`, `newsletter` |
| 电影 / 剧集 / 视频 / 演讲 | `Sources/watching/` | `movie`, `show`, `video`, `talk` |
| 音乐 / 播客 / 专辑 / 演出录音 | `Sources/listening/` | `music`, `album`, `podcast` |
| 课程 / 教程 / 文档 / 学习计划 | `Sources/learning/` | `course`, `tutorial`, `docs` |
| App / 网站 / CLI / GitHub 仓库 / 工作流 | `Sources/tools/` | `tool`, `repo`, `workflow` |
| 餐厅 / 城市 / 路线 / 场馆 / 旅行 | `Sources/places/` | `place`, `route`, `trip`, `venue` |
| 演唱会 / 展览 / 讲座 / 票务页 | `Sources/events/` | `event`, `concert`, `exhibition` |
| 用户已记录的训练 / 路线 / 身体信号 | `Sources/fitness/` | `workout`, `route`, `body-metric` |
| 不确定 | `Sources/inbox/` | `link`, `unknown` |

## 元数据契约

每个 Source 都应有 Daily 回链，并保留足够的元数据，便于以后使用：

```yaml
source_id:
date:
week:
month:
quarter:
year:
time:
module: Sources
note_type: source
source_type:
category:
status:
url:
canonical_url:
title:
site_name:
platform:
author:
creator:
published_at:
updated_at:
captured_at:
language:
tags: []
interest_tags: []
quality_score:
relevance_score:
actionability_score:
memory_score:
public_score:
rating:
visibility: private
public_title:
public_summary:
public_tags: []
related_daily: [[Daily/YYYYMMDD]]
daily_path: Daily/YYYYMMDD.md
source_ref:
raw_source_path:
reviewed: false
```

## 标签

使用小写 kebab 命名。优先使用带前缀的标签，方便 AI 和导出器分组。

```yaml
tags:
  - type/article
  - domain/frontend
  - domain/ai
  - life/movie
  - life/fitness
  - life/travel
  - format/video
  - status/to-read
  - status/used
  - source/manual
  - source/clipper
  - public/candidate
interest_tags:
  - frontend-engineering
  - strength-training
  - singapore-life
```

规则：

- `tags` 描述分类和工作流。
- `interest_tags` 描述用户的个人兴趣。
- 每个 Source 使用 3-8 个标签。如果需要更多标签，通常说明这个 Source 需要笔记摘要。
- 只有可能分享到博客时，才使用 `public/candidate`。

## 评分

使用 1-5 分。空白表示未知。

| 字段 | 含义 |
| --- | --- |
| `quality_score` | 信息质量、可信度、制作水准 |
| `relevance_score` | 与当前生活、工作、兴趣的相关度 |
| `actionability_score` | 是否能触发行动、学习、购买、观看、训练、出行 |
| `memory_score` | 年终回看是否值得记住 |
| `public_score` | 是否适合公开分享到博客 |

建议解释：

- 5 = 很突出，复盘时应再次出现。
- 4 = 有用或值得记住。
- 3 = 普通，相关时保留。
- 2 = 较弱，除非需要否则归档。
- 1 = 删除或拒绝。

## 公开 / 博客导出

默认私有。

只有 `visibility: summary` 或 `visibility: public` 的记录才应导出到 `Exports/public/` 或博客 API。优先使用 `public_summary`，不要导出原始私密笔记。
