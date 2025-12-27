const n=`---
slug: gemini-fullstack-langgraph-quickstart
title: 谷歌开源 gemini-fullstack-langgraph-quickstart 体验
date: 2025-06-13 23:34:54
authors: yuluo
tags: [LLM, Gemini]
keywords: [LLM, Gemini]
---

<!-- truncate -->

- Github 地址：https://github.com/google-gemini/gemini-fullstack-langgraph-quickstart

## 1. 环境准备

1. Node.js and npm (or yarn/pnpm)；
2. Python 3.8+；
3. Genmini 模型 APIKEY，在 [Google AI Studio](https://aistudio.google.com/app/apikey) 中申请。

## 2. 本地启动

在第一步环境准备完成之后，开始此步骤。

### 2.1 Clone 项目

\`\`\`shell
git clone https://github.com/google-gemini/gemini-fullstack-langgraph-quickstart.git
\`\`\`

### 2.2 模型 AK 设置

复制 backend 目录下的 .env.example 并重命名为 .env

写入在第一步获得的 Genmini AK。

### 2.3 项目依赖安装

安装前端依赖：

\`\`\`shell
cd gemini-fullstack-langgraph-quickstart/frontend
npm i
\`\`\`

安装后端依赖：

\`\`\`shell
cd backend
pip install .
\`\`\`

### 2.4 启动运行

通过运行以下命令，将会同时启动前后端：

\`\`\`shell
make dev
\`\`\`

或者分开运行：

- 后端：\`langgraph dev\`（默认开放接口于 \`http://127.0.0.1:2024\`）
- 前端：\`npm run dev\`（默认在 \`http://localhost:5173\`）

## 3. 访问测试

在运行 \`make dev\` 之后，打开 \`http://localhost:5173\` 地址，

> PS：如果出现如下报错，手动将 @ 改为 ../ 的相对路径，emmm~ 没找到原因。
>
> \`\`\`text
> [vite] Internal server error: Failed to resolve import "@/components/WelcomeScreen" from "src/App.tsx". Does the file exist?
> \`\`\`

在浏览器页面输入问题：\`spring ai alibaba 是什么？如何用他开发一个 ai 应用\`

等待一段时间之后，将会看到研究报告输出。

## 4. 参考文章

1. https://gist.github.com/JimLiu/ca25ba4e4fccac2b6a16270c8e82b11a
2. https://ai.google.dev/gemini-api/docs/api-key?hl=zh-cn
`;export{n as default};
