---
title: 事项跟踪：GitHub
type: documentation
dc_type: Text
identifier: dailyvault:docs/agents/issue-tracker.md
description: Repository agent configuration and operating guidance.
category: operations
subject:
- operations
- agent-configuration
tags:
- topic/operations
- topic/agent-configuration
last_checked: '2026-09-01'
status: active
---

# 事项跟踪：GitHub

本仓库的事项与规格记录在 GitHub Issues 中。所有操作使用 `gh` CLI。

## 约定

- **创建 issue**：`gh issue create --title "..." --body "..."`。多行正文使用 heredoc。
- **读取 issue**：`gh issue view <number> --comments`，使用 `jq` 过滤评论，并同时获取标签。
- **列出 issue**：`gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`，并按需添加 `--label` 和 `--state` 过滤条件。
- **评论 issue**：`gh issue comment <number> --body "..."`
- **添加或移除标签**：`gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **关闭 issue**：`gh issue close <number> --comment "..."`

仓库从 `git remote -v` 推断；在 clone 内运行时，`gh` 会自动完成该推断。

## 将 Pull Request 作为分流入口

**PRs as a request surface: no.** _（如果本仓库将外部 PR 视为功能请求，可改为 `yes`；`/triage` 会读取此标志。）_

设为 `yes` 后，PR 使用与 issue 相同的标签和状态，并使用对应的 `gh pr` 命令：

- **读取 PR**：使用 `gh pr view <number> --comments`，并通过 `gh pr diff <number>` 获取 diff。
- **列出待分流的外部 PR**：运行 `gh pr list --state open --json number,title,body,labels,author,authorAssociation,comments`，只保留 `authorAssociation` 为 `CONTRIBUTOR`、`FIRST_TIME_CONTRIBUTOR` 或 `NONE` 的 PR；排除 `OWNER`、`MEMBER` 和 `COLLABORATOR`。
- **评论、标记或关闭 PR**：使用 `gh pr comment`、`gh pr edit --add-label` / `--remove-label` 和 `gh pr close`。

GitHub 的 issue 与 PR 共用同一个编号空间。裸编号 `#42` 可能指向任一类型：先运行 `gh pr view 42`，失败时再运行 `gh issue view 42`。

## 当技能要求“发布到 issue tracker”

创建一个 GitHub issue。

## 当技能要求“读取相关 ticket”

运行 `gh issue view <number> --comments`。

## Wayfinding 操作

供 `/wayfinder` 使用。**Map** 是一个主 issue，**child ticket** 是其子 issue。

- **Map**：带有 `wayfinder:map` 标签的单个 issue，用于保存 Notes、Decisions-so-far 和 Fog；使用 `gh issue create --label wayfinder:map` 创建。
- **Child ticket**：通过 sub-issues API（`gh api`）关联到 Map 的 issue。若仓库未启用 sub-issues，则将 child 加入 Map 正文的任务列表，并在 child 正文顶部写入 `Part of #<map>`。标签格式为 `wayfinder:<type>`，其中类型为 `research`、`prototype`、`grilling` 或 `task`。认领后，将 ticket 分配给执行开发者。
- **Blocking**：优先使用 GitHub 原生 issue dependencies，作为规范且在 UI 中可见的阻塞关系。通过 `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>` 添加关系，其中 `<blocker-db-id>` 是阻塞 issue 的数字 database ID，可通过 `gh api repos/<owner>/<repo>/issues/<n> --jq .id` 获取；它不是 `#number` 或 `node_id`。GitHub 通过 `issue_dependencies_summary.blocked_by` 报告尚未关闭的阻塞项。若 dependencies 不可用，则在 child 正文顶部使用 `Blocked by: #<n>, #<n>`。全部阻塞 issue 关闭后，ticket 才算解除阻塞。
- **Frontier query**：列出 Map 下仍开放的 child issue；排除存在开放 blocker（`issue_dependencies_summary.blocked_by > 0`，或 `Blocked by` 行引用了开放 issue）以及已有 assignee 的项；按 Map 中的顺序选择第一项。
- **Claim**：运行 `gh issue edit <n> --add-assignee @me`；这是会话中的首次写操作。
- **Resolve**：运行 `gh issue comment <n> --body "<answer>"`，再运行 `gh issue close <n>`，最后把 context pointer（gist + link）追加到 Map 的 Decisions-so-far。
