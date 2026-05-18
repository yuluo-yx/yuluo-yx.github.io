---
title: 人工介入（Human-in-the-Loop）实战
description: 学习如何使用人工介入 Hook 为 Agent 工具调用添加人工监督，支持批准、编辑和拒绝操作
date: 2025-12-28
tags: [Spring AI Alibaba, ReactAgent, HITL, Human-in-the-Loop, ToolConfig, InterruptionMetadata]
keywords: [人工介入, HITL, Human-in-the-Loop, Agent监督, 工具审批, 中断恢复, Hook, 人工审批]
---

# 人工介入（Human-in-the-Loop）

人工介入（HITL）Hook 允许你为 Agent 工具调用添加人工监督。当模型提出需要审查的操作时——例如写入文件或执行 SQL——Hook 可以暂停执行并等待人工决策。

它通过检查每个工具调用并与可配置的策略进行比对来实现。如果需要人工干预，Hook 会发出中断（interrupt）来暂停执行。图的状态会通过 Spring AI Alibaba 的检查点机制保存，因此执行可以安全暂停并在之后恢复。

人工决策决定接下来发生什么：操作可以被原样批准（`approve`）、修改后运行（`edit`）或拒绝并提供反馈（`reject`）。

## 中断决策类型

Hook 定义了三种人工响应中断的内置方式：

| 决策类型 | 描述 | 使用场景示例 |
| -------- | ---- | ------------ |
| ✅ `approve` | 操作被原样批准并执行，不做任何更改 | 完全按照写好的内容发送电子邮件 |
| ✏️ `edit` | 工具调用将被修改后执行 | 在发送电子邮件之前更改收件人 |
| ❌ `reject` | 工具调用被拒绝，并向对话中添加解释 | 拒绝电子邮件草稿并解释如何重写 |

每个工具可用的决策类型取决于你在 `approvalOn` 中配置的策略。当多个工具调用同时暂停时，每个操作都需要单独的决策。

## 配置中断

要使用 HITL，在创建 Agent 时将 Hook 添加到 Agent 的 `hooks` 列表中。

```java
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
```

> **Info:** 你必须配置检查点保存器来在中断期间持久化图状态。在生产环境中，使用持久化的检查点保存器（如基于 Redis 或 PostgreSQL 的实现）。对于测试或原型开发，使用 `MemorySaver`。调用 Agent 时，传递包含**线程 ID**的 `RunnableConfig` 以将执行与会话线程关联。

## 响应中断

```java
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
```

### 决策类型

**✅ approve - 批准**：批准工具调用原样执行：

```java
InterruptionMetadata.Builder feedbackBuilder = InterruptionMetadata.builder()
    .nodeId(interruptionMetadata.node())
    .state(interruptionMetadata.state());

interruptionMetadata.toolFeedbacks().forEach(toolFeedback -> {
    InterruptionMetadata.ToolFeedback approvedFeedback =
        InterruptionMetadata.ToolFeedback.builder(toolFeedback)
            .result(InterruptionMetadata.ToolFeedback.FeedbackResult.APPROVED)
            .build();
    feedbackBuilder.addToolFeedback(approvedFeedback);
});

InterruptionMetadata approvalMetadata = feedbackBuilder.build();

RunnableConfig resumeConfig = RunnableConfig.builder()
    .threadId(threadId)
    .addMetadata(RunnableConfig.HUMAN_FEEDBACK_METADATA_KEY, approvalMetadata)
    .build();

Optional<NodeOutput> finalResult = agent.invokeAndGetOutput("", resumeConfig);
```

**✏️ edit - 编辑**：在执行前修改工具调用：

```java
// 修改工具参数示例
String editedArguments = toolFeedback.getArguments()
    .replace("DELETE FROM records", "DELETE FROM old_records");

InterruptionMetadata.ToolFeedback editedFeedback =
    InterruptionMetadata.ToolFeedback.builder(toolFeedback)
        .arguments(editedArguments)
        .result(InterruptionMetadata.ToolFeedback.FeedbackResult.EDITED)
        .build();
```

> **Tips:** 当**编辑**工具参数时，请保守地进行更改。对原始参数的重大修改可能会导致模型重新评估其方法。

**❌ reject - 拒绝**：拒绝工具调用并提供反馈：

```java
InterruptionMetadata.ToolFeedback rejectedFeedback =
    InterruptionMetadata.ToolFeedback.builder(toolFeedback)
        .result(InterruptionMetadata.ToolFeedback.FeedbackResult.REJECTED)
        .description("不允许删除操作，请使用归档功能代替。")
        .build();
```

## 执行生命周期

Hook 定义了一个在模型生成响应后但在执行任何工具调用之前运行的 `afterModel` 钩子：

1. Agent 调用模型生成响应
2. Hook 检查响应中的工具调用
3. 如果任何调用需要人工输入，Hook 会构建 `InterruptionMetadata` 并触发中断
4. Agent 等待人工决策
5. 基于决策，Hook 执行批准/编辑的调用，或为拒绝的调用合成工具响应消息，并恢复执行

## Workflow 中嵌套 Agent 的人工中断

在复杂的应用场景中，你可以将 ReactAgent 嵌套在 StateGraph 工作流中，并为嵌套的 Agent 配置 HITL 能力。

### 配置要点

1. **检查点配置**: 必须在 `CompileConfig` 中注册检查点保存器
2. **Agent 配置**: 嵌套的 Agent 也需要配置检查点保存器
3. **中断处理**: 使用 `CompiledGraph.invokeAndGetOutput()` 检查中断，使用 `addHumanFeedback()` 恢复执行

### 关键区别

| 特性 | 单独 Agent | Workflow 中的 Agent |
| --- | --- | --- |
| 检查点配置 | Agent 级别配置 | 需要在 `CompileConfig` 中注册 |
| 中断检查 | `agent.invokeAndGetOutput()` | `compiledGraph.invokeAndGetOutput()` |
| 恢复执行 | 直接调用 Agent | 调用 `CompiledGraph` |
| 状态管理 | Agent 内部状态 | 工作流全局状态 |

## 实用工具方法

```java
public class HITLHelper {

    // 批准所有工具调用
    public static InterruptionMetadata approveAll(InterruptionMetadata meta) { /* ... */ }

    // 拒绝所有工具调用
    public static InterruptionMetadata rejectAll(InterruptionMetadata meta, String reason) { /* ... */ }

    // 编辑特定工具的参数
    public static InterruptionMetadata editTool(InterruptionMetadata meta,
        String toolName, String newArguments) { /* ... */ }
}
```

## 最佳实践

1. **始终使用检查点**: 人工介入需要检查点机制来保存和恢复状态
2. **提供清晰的描述**: 在 `ToolConfig` 中提供清晰的描述，帮助审查者理解操作
3. **保守编辑**: 编辑工具参数时，尽量保持最小更改
4. **使用相同的 threadId**: 恢复执行时必须使用相同的线程 ID