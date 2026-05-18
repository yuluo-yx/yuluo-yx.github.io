const n=`---
title: 多智能体（Multi-agent）
description: 了解如何在 Spring AI Alibaba 中实现 Multi-agent 协作，包括 Sequential、Parallel、Routing、Supervisor 模式及自定义 FlowAgent
date: 2025-12-28
tags: [Spring AI Alibaba, ReactAgent, Multi-agent, Sequential, Parallel, Routing, Supervisor]
keywords: [Multi-agent, SequentialAgent, ParallelAgent, LlmRoutingAgent, SupervisorAgent, FlowAgent, Handoffs]
---

# 多智能体（Multi-agent）

**Multi-agent** 将复杂的应用程序分解为多个协同工作的专业化Agent。与依赖单个Agent处理所有步骤不同，**Multi-agent架构**允许你将更小、更专注的Agent组合成协调的工作流。

Multi-agent系统在以下情况下很有用：

* 单个Agent拥有太多工具，难以做出正确的工具选择决策
* 上下文或记忆增长过大，单个Agent难以有效跟踪
* 任务需要**专业化**（例如：规划器、研究员、数学专家）

## Multi-agent模式

Spring AI Alibaba支持以下Multi-agent模式：

| 模式 | 工作原理 | 控制流 | 使用场景 |
| ---- | -------- | ------ | -------- |
| **Tool Calling** | Supervisor Agent将其他Agent作为*工具*调用 | 集中式 | 任务编排、结构化工作流 |
| **Handoffs** | 当前Agent决定将控制权转移给另一个Agent | 去中心化 | 跨领域对话、专家接管 |

## 选择模式

| 问题 | 工具调用 (Agent Tool) | 交接（Handoffs） |
| --- | --- | --- |
| 需要集中控制工作流程？ | ✅ 是 | ❌ 否 |
| 希望Agent直接与用户交互？ | ❌ 否 | ✅ 是 |
| 专家之间复杂的、类人对话？ | ❌ 有限 | ✅ 强 |

> 你可以混合使用两种模式——使用**交接**进行Agent切换，并让每个Agent**将子Agent作为工具调用**来执行专门任务。

## Instruction 占位符

在 Multi-agent 系统中，\`instruction\` 支持使用**占位符**来动态引用状态中的数据。

| 占位符 | 说明 | 使用场景 |
| ------ | ---- | -------- |
| \`{input}\` | 用户输入的原始内容 | 第一个Agent或需要用户输入的 Agent |
| \`{outputKey}\` | 引用其他Agent通过 \`outputKey\` 存储的输出 | 顺序执行中，后续Agent引用前面Agent的输出 |
| \`{stateKey}\` | 引用状态中的任意键值 | 访问状态中的任何数据 |

### 使用示例

\`\`\`java
// 第一个Agent：使用 {input} 获取用户输入
ReactAgent writerAgent = ReactAgent.builder()
    .name("writer_agent")
    .instruction("你是一个知名的作家。请根据用户的提问进行回答：{input}。")
    .outputKey("article")
    .build();

// 第二个Agent：使用 {article} 引用第一个Agent的输出
ReactAgent reviewerAgent = ReactAgent.builder()
    .name("reviewer_agent")
    .instruction("请对文章进行评审修正：\\n{article}，最终返回评审修正后的文章内容")
    .outputKey("reviewed_article")
    .build();
\`\`\`

## 交接（Handoffs）

> **重要参数说明**：
> - **\`instruction\`**：在当前 Agent 节点处插入新的问题说明，支持占位符
> - **\`returnReasoningContent\`**：控制子 Agent 的上下文是否返回父流程中
> - **\`includeContents\`**：控制当前子 Agent 执行时是否带上所有父流程的上下文
> - **\`outputKey\`**：指定输出内容的键名，可被后续 Agent 通过占位符引用
> - **\`systemPrompt\` 和 \`instruction\`**：LlmRoutingAgent 和 SupervisorAgent 支持定制路由行为

在**交接**模式中，Agent可以直接将控制权传递给彼此。

流程：
1. **当前Agent**决定它需要另一个Agent的帮助
2. 它将控制权（和状态）传递给**下一个Agent**
3. **新Agent**直接与用户交互，直到它决定再次交接或完成

### 顺序执行（Sequential Agent）

多个Agent按预定义的顺序依次执行。

\`\`\`java
import com.alibaba.cloud.ai.graph.agent.flow.agent.SequentialAgent;
import com.alibaba.cloud.ai.graph.OverAllState;

ReactAgent writerAgent = ReactAgent.builder()
    .name("writer_agent").model(chatModel)
    .description("专业写作Agent")
    .instruction("你是一个知名的作家，擅长写作和创作。请根据用户的提问进行回答：{input}。")
    .outputKey("article")
    .build();

ReactAgent reviewerAgent = ReactAgent.builder()
    .name("reviewer_agent").model(chatModel)
    .description("专业评审Agent")
    .instruction("你是一个知名的评论家，擅长对文章进行评论和修改。待评论文章：\\n\\n {article}")
    .outputKey("reviewed_article")
    .build();

SequentialAgent blogAgent = SequentialAgent.builder()
    .name("blog_agent")
    .description("根据用户给定的主题写一篇文章，然后将文章交给评论员进行评论")
    .subAgents(List.of(writerAgent, reviewerAgent))
    .build();

Optional<OverAllState> result = blogAgent.invoke("帮我写一个100字左右的散文");
\`\`\`

### 并行执行（Parallel Agent）

多个Agent同时处理相同的输入，结果被收集并合并。

\`\`\`java
import com.alibaba.cloud.ai.graph.agent.flow.agent.ParallelAgent;

ReactAgent proseWriterAgent = ReactAgent.builder()
    .name("prose_writer_agent").model(chatModel)
    .instruction("你是一个知名的散文作家。用户会给你一个主题：{input}，你只需要创作一篇100字左右的散文。")
    .outputKey("prose_result")
    .build();

ReactAgent poemWriterAgent = ReactAgent.builder()
    .name("poem_writer_agent").model(chatModel)
    .instruction("你是一个知名的现代诗人。用户会给你的主题是：{input}，你只需要创作一首现代诗。")
    .outputKey("poem_result")
    .build();

ParallelAgent parallelAgent = ParallelAgent.builder()
    .name("parallel_creative_agent")
    .mergeOutputKey("merged_results")
    .subAgents(List.of(proseWriterAgent, poemWriterAgent))
    .mergeStrategy(new ParallelAgent.DefaultMergeStrategy())
    .build();

Optional<OverAllState> result = parallelAgent.invoke("以'西湖'为主题");
\`\`\`

### 路由（LlmRoutingAgent）

使用 LLM 动态决定将请求路由到哪个子Agent。

\`\`\`java
import com.alibaba.cloud.ai.graph.agent.flow.agent.LlmRoutingAgent;

ReactAgent writerAgent = ReactAgent.builder()
    .name("writer_agent").model(chatModel)
    .description("擅长创作各类文章，包括散文、诗歌等文学作品")
    .instruction("你是一个知名的作家，擅长写作和创作。")
    .outputKey("writer_output")
    .build();

ReactAgent translatorAgent = ReactAgent.builder()
    .name("translator_agent").model(chatModel)
    .description("擅长将文章翻译成各种语言")
    .instruction("你是一个专业的翻译家。")
    .outputKey("translator_output")
    .build();

LlmRoutingAgent routingAgent = LlmRoutingAgent.builder()
    .name("content_routing_agent")
    .description("根据用户需求智能路由到合适的专家Agent")
    .model(chatModel)
    .subAgents(List.of(writerAgent, translatorAgent))
    .build();
\`\`\`

LlmRoutingAgent 还支持通过 \`systemPrompt\` 和 \`instruction\` 自定义路由决策行为。

### 监督者（SupervisorAgent）

使用 LLM 作为监督者，支持**多步骤循环路由**。子Agent执行完成后返回监督者，监督者可根据结果继续路由或返回 FINISH 完成任务。

\`\`\`java
import com.alibaba.cloud.ai.graph.agent.flow.agent.SupervisorAgent;

SupervisorAgent supervisorAgent = SupervisorAgent.builder()
    .name("content_supervisor")
    .description("内容管理监督者，负责协调写作、翻译等任务")
    .model(chatModel)
    .subAgents(List.of(writerAgent, translatorAgent))
    .build();

Optional<OverAllState> result = supervisorAgent.invoke("帮我写一篇关于春天的短文");
\`\`\`

| 特性 | LlmRoutingAgent | SupervisorAgent |
| --- | --- | --- |
| 路由次数 | 单次路由 | 支持多步骤循环路由 |
| 子Agent返回 | 直接结束 | 返回监督者继续决策 |
| 多步骤任务 | ❌ 不支持 | ✅ 支持 |
| Instruction占位符 | ❌ 不支持 | ✅ 支持 |

### 自定义（Customized）

通过继承 \`FlowAgent\` 抽象类并实现 \`buildSpecificGraph\` 方法，可以创建任意复杂的多Agent协作模式。

## 混合模式示例

可以组合不同的模式创建复杂的工作流：

\`\`\`java
// 并行研究 → 分析 → 路由生成报告
SequentialAgent hybridWorkflow = SequentialAgent.builder()
    .name("research_workflow")
    .description("完整的研究工作流：并行收集 -> 分析 -> 路由生成报告")
    .subAgents(List.of(researchAgent, analysisAgent, reportAgent))
    .build();

Optional<OverAllState> result = hybridWorkflow.invoke("研究AI技术趋势并生成HTML报告");
\`\`\``;export{n as default};
