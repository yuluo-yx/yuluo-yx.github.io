const n=`---
title: 人工介入 (Human-in-the-Loop) 概述
description: 了解 HITL 机制如何在 Agent 工具调用时引入人工干预和决策，提高系统整体性能和可靠性
date: 2025-12-28
tags: [Spring AI Alibaba, ReactAgent, HITL, Human-in-the-Loop]
keywords: [HITL, Human-in-the-Loop, 人工介入, Agent监督, 工具审批, 中断恢复]
---

# 人工介入 (Human-in-the-Loop)

HITL(Human in the loop)，直译为：人类参与，指在自动化系统或流程中引入人工干预和决策的机制。HITL 的目的是结合人类的判断力和机器的效率，以提高系统的整体性能和可靠性。

在 React Agent 中，HITL 可以在 Agent 调用工具时引入人工介入，当 Agent 执行到可能需要审核步骤时（例如：写入文件，执行 SQL，执行特殊 shell 命令时），暂时并等待人类确认。

## Spring AI Alibaba 中的 HITL

在 Spring AI Alibaba 中，通过检查每个工具调用并与可配置的 HITL 规则进行比较来实现 HITL 功能。如果工具调用符合任何 HITL 规则，则 Agent 会暂停执行并等待人工确认。

此时，HITL Hook 会发出 interrupt 以暂停 agent 执行。Agent 底层 graph 的状态通过 Spring AI Alibaba 的 CheckPoint 机制来保存。并在得到人类确认结果之后恢复执行。

Spring AI Alibaba 中 HITL Hook 支持的几种终端决策类型：

| 决策类型 | 描述 | 使用场景示例 |
| -------- | ---- | ------------ |
| ✅ approve | 操作被原样批准并执行，不做任何更改 | 完全按照写好的内容发送电子邮件 |
| ✏️ edit | 工具调用将被修改后执行 | 在发送电子邮件之前更改收件人 |
| ❌ reject | 工具调用被拒绝，并向对话中添加解释 | 拒绝电子邮件草稿并解释如何重写 |

Agent 中的每次 Tool call 的人类决策类型都取决于在 approvalOn 中配置的策略。当多个 tool call 同时暂停时，每个 tool 都需要人类单独决策。

> **Tips:** 在 Agent 中编辑 Tool 参数时，对原始参数有比较大的修改时，模型可能会重新审视 tool call 的合理性，从而导致多次 HITL 中断。建议在编辑时尽量保持对原始参数的相似性。

## HITL Hook 实战

要在 Agent 中使用 HITL，需要在 Agent 中添加 HITL Hook。下面是一个使用 HITL Hook 的示例：

\`\`\`java
import com.alibaba.cloud.ai.graph.agent.ReactAgent;
import com.alibaba.cloud.ai.graph.agent.hook.hip.HumanInTheLoopHook;
import com.alibaba.cloud.ai.graph.agent.hook.hip.ToolConfig;
import com.alibaba.cloud.ai.graph.checkpoint.savers.MemorySaver;

MemorySaver memorySaver = new MemorySaver();

HumanInTheLoopHook humanInTheLoopHook = HumanInTheLoopHook.builder()
    .approvalOn("write_file", ToolConfig.builder()
        .description("文件写入操作需要审批")
        .build())
    .approvalOn("execute_sql", ToolConfig.builder()
        .description("SQL执行操作需要审批")
        .build())
    .build();

ReactAgent agent = ReactAgent.builder()
    .name("approval_agent")
    .model(chatModel)
    .tools(writeFileTool, executeSqlTool, readDataTool)
    .hooks(List.of(humanInTheLoopHook))
    .saver(memorySaver)
    .build();
\`\`\`

> **Tips:** 在生产环境中，使用持久化类型的 CheckPoint 更合适些，在测试和 POC 场景下，可以使用 MemorySaver 进行快速验证。

### HITL 中断响应

当 Agent 被调用时，如果执行到了需要中断的 tool call 且匹配到了在 HITL Hook 中配置的策略时，Agent 会触发中断。Agent 框架会返回 InterruptionMetadata，其中包含了当前 Tool Call 的信息和描述。

\`\`\`java
import com.alibaba.cloud.ai.graph.RunnableConfig;
import com.alibaba.cloud.ai.graph.NodeOutput;
import com.alibaba.cloud.ai.graph.action.InterruptionMetadata;

String threadId = "user-session-123";
RunnableConfig config = RunnableConfig.builder()
    .threadId(threadId)
    .build();

Optional<NodeOutput> result = agent.invokeAndGetOutput(
    "删除数据库中的旧记录", config
);

if (result.isPresent() && result.get() instanceof InterruptionMetadata) {
    InterruptionMetadata interruptionMetadata = (InterruptionMetadata) result.get();
    List<InterruptionMetadata.ToolFeedback> toolFeedbacks =
        interruptionMetadata.toolFeedbacks();

    for (InterruptionMetadata.ToolFeedback feedback : toolFeedbacks) {
        System.out.println("工具: " + feedback.getName());
        System.out.println("参数: " + feedback.getArguments());
        System.out.println("描述: " + feedback.getDescription());
    }
}
\`\`\`

## HITL 生命周期

HITL Hook 定义了一个在模型生成响应后但在执行任何工具调用之前运行的 afterModel Hook：

- Agent 调用模型生成响应；
- Hook 检查响应中的工具调用；
- 如果任何调用需要人工输入，Hook 会构建包含工具反馈信息的 InterruptionMetadata 并触发中断；
- Agent 等待人工决策；
- 基于 InterruptionMetadata 中的决策，Hook 执行批准或编辑的调用，为拒绝的调用合成工具响应消息，并恢复执行。`;export{n as default};
