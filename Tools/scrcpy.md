---
title: scrcpy
type: tool-introduction
dc_type: Software
identifier: https://github.com/genymobile/scrcpy
source_type: website
source: https://github.com/genymobile/scrcpy
url: https://github.com/genymobile/scrcpy
canonical_url: https://github.com/genymobile/scrcpy
description: 通过 USB 或 TCP/IP 镜像 Android 设备画面与音频，并用电脑键鼠控制；无需 root、无需在手机上安装常驻应用，支持 Linux、Windows 与 macOS。
category: developer-tools
subject:
- developer-tools
- software
tags:
- kind/tool
- topic/developer-tools
- topic/software
platform: Linux / Windows / macOS
content_scope: Android screen mirroring and remote control
creator: Genymobile
captured_at: '2026-09-16'
last_checked: '2026-09-16'
status: active
---

# scrcpy

[GitHub](https://github.com/genymobile/scrcpy) · [文档](https://github.com/genymobile/scrcpy/tree/master/doc)

## 基本信息

| 项目 | 信息 |
| --- | --- |
| 平台 | Linux、Windows、macOS；Android 设备需 API 21+（Android 5.0） |
| 内容 | 屏幕/音频镜像、键鼠控制、录屏、虚拟显示、摄像头镜像等 |
| 浏览方式 | 本机 CLI；通过 USB 或 TCP/IP 连接 Android 设备 |
| 许可 | Apache License 2.0（以仓库声明为准） |
| 当前版本 | v4.1（README 标注） |

## 它是什么

scrcpy（读作 screen copy）是 Genymobile 维护的开源工具，把已连接的 Android 设备画面与音频投到电脑上，并允许用键盘、鼠标（以及可选的游戏手柄）操作设备。它不需要 root，也不在手机上留下常驻应用；官方强调应从 [GitHub 仓库](https://github.com/genymobile/scrcpy) 获取发布包，勿从非官方站点下载。

## 为什么值得收藏

- 轻量原生客户端，专注低延迟投屏（官方称约 35–70ms、首帧约 1 秒内），适合调试、演示与日常操控 Android。
- 功能覆盖广：录屏、双向剪贴板、可调画质、Android 11+ 音频转发、Android 12+ 摄像头镜像、Linux 下 V4L2 虚拟摄像头、OTG 模式等。
- 免费开源、无账号与广告，离线可用；连接方式支持 USB 与无线 TCP/IP。

## 适合什么时候使用

- 需要在电脑上查看并操作 Android 真机或模拟器时。
- 要录屏、演示 App，或在不碰手机屏幕的情况下输入文字时。
- 开发调试需要快速镜像、截屏或测试物理键鼠/手柄映射时。

## 我的判断

- 首选官方 GitHub 发布与文档；无线连接、音频转发、摄像头镜像等对 Android 版本有要求，部署前核对 [连接](https://github.com/genymobile/scrcpy/blob/master/doc/connection.md) 与 [音频](https://github.com/genymobile/scrcpy/blob/master/doc/audio.md) 说明。
- 部分机型（如小米）除 USB 调试外可能还需开启「USB 调试（安全设置）」才能注入键鼠事件。
- 降低分辨率（如 `scrcpy -m1024`）往往能明显改善性能；更多选项见仓库 `doc/` 与用户文档章节。
