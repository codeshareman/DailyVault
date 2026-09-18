# 公开软件推荐从工具卡派生，ZNorth 只发生成快照

首页软件推荐继续只渲染 `recommendations.tools` 信封，但条目不再在 ZNorth 里手写。唯一源是本仓的工具卡；公开推荐声明是卡上的 `public_recommendation` 字段。本仓脚本写出完整 Catalog 快照，人再按发布闸显式发布。保存工具卡或 git push 都不发网。

这样改，是因为公开肯定必须和日常收藏同源，而手写 `recommendations.tools` 会变成第二份清单。每日计划、输入、输出不能单独开出一条推荐。

## 考虑过的其他做法

- **继续在 ZNorth 手写推荐清单**：否决。它会和四百多张工具卡分叉，而且你不会去维护一份少用的 JSON。
- **从每日记录自动筛**：否决。推荐是公开肯定，不是「今天发现了三个比价站」。
- **本仓直连数据权威**：否决。现有信封把 provider 钉死为 `znorth.publication`，而且和显式发布闸不一致。
- **人写 toolId**：否决。日常只微调工具卡模板和 Markdown；身份由脚本从 `canonical_url` 派生。

## 后果

- 默认模板只增加可选的 `public_recommendation`；不留覆盖 slug。
- 派生身份撞车时失败闭合，那一张卡才允许可选覆盖。
- 空的公开集合不能发布；要拿掉首页推荐必须对 `recommendations.tools` 显式 disable。
- MRZZZ 的信封、同步和软件推荐模块形状不变。
