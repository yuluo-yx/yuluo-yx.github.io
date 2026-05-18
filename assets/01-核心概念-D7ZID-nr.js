const n=`---
title: 核心概念——什么是 Agent？
description: 深入理解 Agent 的核心概念，包括 ReAct 范式、模型、工具、记忆和规划等核心组件
date: 2025-12-28
tags: [Spring AI Alibaba, ReactAgent, Agent, ReAct]
keywords: [Agent, ReAct, 智能体, Spring AI Alibaba, LLM, 工具, 记忆, 规划]
---

# 核心概念 (Core Concepts)

在深入了解 Spring AI Alibaba Agent 的具体实现之前，我们需要先理解 Agent 的核心概念。Agent（智能体）不仅仅是一个调用大模型的程序，它是一个能够感知环境、进行推理、做出决策并采取行动的系统。

## 什么是 Agent？

简单来说，**Agent = 大语言模型 (LLM) + 规划 (Planning) + 记忆 (Memory) + 工具 (Tools)**。

传统的 LLM 应用通常是"一问一答"的模式，模型根据输入直接生成输出。而 Agent 则引入了"循环"（Loop）的概念：

1.  **感知 (Perception)**：接收用户的任务或指令；
2.  **思考 (Reasoning)**：分析任务，利用大模型的逻辑能力决定是否需要使用工具，以及使用什么工具；
3.  **行动 (Acting)**：执行具体的工具调用（如查询数据库、调用 API）；
4.  **观察 (Observation)**：获取工具执行的结果；
5.  **再思考 (Reasoning)**：根据观察结果，决定下一步行动，或者如果任务已完成，则生成最终答案。

这个循环过程被称为 **ReAct (Reasoning + Acting)** 范式。

## 核心组件

### 1. 模型 (Model) - "大脑"

模型是 Agent 的核心，负责推理和决策。它不仅生成文本，更重要的是它具备逻辑分析能力，能够理解任务意图，并规划解决步骤。

在 Spring AI Alibaba ReactAgent 框架中，支持各种模型厂商（如 Qwen, OpenAI 等）作为 Agent 的大脑。通过不同的参数来优化"大脑"，例如通过配置 \`Temperature\`（温度）、\`Top-P\` 等参数，我们可以控制模型的创造性或严谨性。

### 2. 工具 (Tools) - "手脚"

大模型本身是封闭的，无法获取实时信息或执行外部操作（如修改数据库等）。工具赋予了 Agent 与外部世界交互的能力。

工具可以是：
*   **API 调用**：获取天气、股票价格、搜索网络；
*   **数据库操作**：查询或更新业务数据；
*   **代码执行**：运行 Python/Java 代码进行复杂计算；
*   **自定义函数**：执行任何你定义的业务逻辑。

在 Spring AI Alibaba 中，工具通常通过 \`FunctionCallback\` 机制集成，Agent 可以自动发现并调用这些函数。在 Agent 中，可以交替进行推理和工具调用，最终获得答案。

### 3. 记忆 (Memory) - "海马体"

为了进行多轮对话和复杂的任务处理，Agent 需要记住之前的交互历史、中间推理结果以及用户的偏好习惯等。

*   **短期记忆**：当前的对话上下文，在 Spring AI Alibaba 中表现为 CheckPointer，可以将其持久化到数据库（或者内存）中；
*   **长期记忆**：持久化存储的历史记录，在 Spring AI Alibaba 中表现为 MemoryStore，通过类型 NameSpace 来管理。

Spring AI Alibaba 提供了 \`ChatMemory\` 接口以及多种实现（如 InMemory, Redis, JDBC 等）来管理对话历史，例如上下文裁剪，恢复等。

### 4. 规划 (Planning) - "前额叶"

规划是 Agent 解决复杂问题的关键。它涉及将大目标分解为子目标，并安排执行顺序。

*   **ReAct**：最常用的规划模式，即"推理-行动-观察"的循环。
*   **COT (Chain of Thought)**：思维链，引导模型逐步思考，展示推理过程。

Spring AI Alibaba 的 \`ReactAgent\` 就是基于 ReAct 范式构建的，它内置了处理这种循环的逻辑，使得开发者无需手动编写复杂的循环控制代码。

## 参考文档

- Google Agent 白皮书：https://cloud.google.com/resources/content/ai-agent-handbook?hl=zh-CN
- Anthropic Agent：https://www.anthropic.com/research/building-effective-agents`;export{n as default};
