# 文档模板

## 工具卡（Tools/）

```markdown
---
title: <产品或项目名>
type: tool-introduction
dc_type: Software
identifier: <canonical URL>
source_type: website
source: <主要来源 URL>
url: <主要来源 URL>
canonical_url: <官网或首选入口；GitHub 仓库可写官网，identifier 仍用仓库 URL>
description: <一句可验证摘要，来自 README 或 meta>
category: <subject[0]>
subject:
- <subject-1>
- <subject-2>
tags:
- kind/tool
- topic/<subject-1>
- topic/<subject-2>
platform: <如 Web / macOS / Linux / Self-hosted>
content_scope: <简短英文或中文范围词>
creator: <页面公开的创建者/组织；无则省略>
captured_at: 'YYYY-MM-DD'
last_checked: 'YYYY-MM-DD'
status: active
---

# <标题>

[官方网站](<url>) · [GitHub](<repo>)   <!-- 按实际存在的链接调整 -->

## 基本信息

| 项目 | 信息 |
| --- | --- |
| 平台 | |
| 内容 | |
| 浏览方式 | |
| 许可 | <!-- 仅当页面明确写出 --> |

## 它是什么

<2–4 句，基于 README / 官网，不夸大>

## 为什么值得收藏

-

## 适合什么时候使用

-

## 我的判断

- <使用边界、与替代品对比、需现场核验的项>
```

`dc_type: Service` 用于纯 Web 服务且无可分发的软件包时。

## 剪藏（Inputs/）

```markdown
---
title: <文章标题>
type: clipping
dc_type: Text
identifier: <URL>
source: <URL>
canonical_url: <URL>
description: <摘要；来自 meta 或首段>
category: <subject[0]>
subject:
- <subject-1>
tags:
- kind/article
- topic/<subject-1>
created: 'YYYY-MM-DD'
last_checked: 'YYYY-MM-DD'
status: active
---

> [!abstract] 摘要
> <同上 description 或略展开>

[阅读原文](<URL>)

## 来源信息

- 本次读取日期：YYYY-MM-DD
- 作者和发布日期：<页面有则写；无则写「页面未公开」>

## 适合什么时候回看

-

## 适用边界

- 本文件记录入口与公开元信息，不替代对正文与版本的现场核验。
```

## GitHub 仓库补充字段（写入正文「基本信息」表）

尽量从 README 提取并写入正文（非 frontmatter 臆造）：

- 主要用途与核心命令
- 支持平台（Android / Windows / …）
- License
- 安装方式（brew / scoop / 下载页）
- Stars / 活跃度仅作参考，且必须来自页面当时可见数据
