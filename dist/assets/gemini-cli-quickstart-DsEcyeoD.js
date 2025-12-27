const n=`---
slug: gemini-cli-quickstart
title: Gemini CLI QuickStart
date: 2025-06-27 23:34:00
authors: yuluo
tags: [LLM, Gemini]
keywords: [LLM, Gemini]
---

<!-- truncate -->

Github 仓库：https://github.com/google-gemini/gemini-cli

## 介绍

Gemini CLI 是一个用于与 Google Gemini 大型语言模型交互的命令行工具。（据相关消息，逆向了 Claude Code）

为开发者、研究员以及任何需要通过命令行与 Gemini 模型交互的用户提供了强大而灵活的功能。

Gemini 是 Google DeepMind 开发的一系列多模态人工智能模型，具备语言、音频、代码和视频理解能力，能够处理多种任务，包括文本生成、多模态对话、代码生成等。

在 6 月 25 日，谷歌正式推出了**Gemini CLI** ，将 Gemini 大模型的强大能力直接融入到开发者日常命令行界面中。

#### Star 走势

不得不提 Github star 走势。在 26 号，Gemini CLI 项目 star 爆发式增长，截止 6 月 26 日 晚，已经到了 26k star。

![image-20250626235009715](/img/ai/gemini-cli/image-20250626235009715.png)

## 安装

\`\`\`shell
# 安装
npm install -g @google/gemini-cli 
\`\`\`

## 配置

同时，Gemini CLI 可以使用 Google 账号登陆，允许每分钟最多 60 个模型请求，每天最多 1000 个模型请求。

> 在此之前，需要有 Gemini 的 AK。如果体验高级功能或者特定模型需要此配置。

## 启动

1. 在 terminal 中输入 \`gemini\` 启动 cli；

2. 选择主题：**（通过 tab + 方向上下键选择）**

    在输入 gemini 之后，将会看到如下页面

    ![image-20250626235840772](/img/ai/gemini-cli/image-20250626235840772.png)

    遗憾的是，个别主题对 windows 终端适配有 bug：像下面这样：

    ![image-20250626235953023](/img/ai/gemini-cli/image-20250626235953023.png)

   这里也是选了最火的 Atom One 主题。

3. 身份验证，出现时使用 google 账号登录即可。

## 使用体验

如果一切正常，将会看到如下的终端输入框：

![image-20250627000142982](/img/ai/gemini-cli/image-20250627000142982.png)

有趣的是，在等待过程中，gemini cli 会输出一些变换的 message：

![image-20250627000907701](/img/ai/gemini-cli/image-20250627000907701.png)

gemini cli 还支持其他功能：生成一个项目，解析本地文件数据，联网搜索等。

## 问题排查

如果访问失败，那么就用魔法：

Windows Powershell：\`$env:https_proxy="http://127.0.0.1:7890"\`

Mac/Linux: \`$env:https_proxy="http://127.0.0.1:7890\`
`;export{n as default};
