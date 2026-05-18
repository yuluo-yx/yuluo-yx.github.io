const n=`---
title: 工作流（Workflow）
description: 使用 Spring AI Alibaba Graph 构建智能工作流应用，包括自定义 Node、Agent 作为 Node、流式执行和同步执行
date: 2025-12-28
tags: [Spring AI Alibaba, Workflow, StateGraph, Node, Agent, Graph]
keywords: [Spring AI Alibaba, Workflow, StateGraph, Node, Agent, 工作流, Graph]
---

Graph 是 Agent Framework 的底层运行时。**我们建议开发者使用Agent Framework，但直接使用Graph API也是完全可行的。**
Graph 是一个低级工作流和多智能体编排框架，使开发者能够实现复杂的应用程序编排。

## Agent 编排的核心引擎

Spring AI Alibaba Graph 是 Agent 编排背后的核心引擎，在底层，Spring AI Alibaba 框架会将 Agent 编排为 Graph，组成一个由节点串联而成的 DAG 图。

### Graph 引擎核心概念与定义

Spring AI Alibaba Graph 有以下三个核心概念：

- **状态（State）**：定义了在 Node 与 Edge 之间传递的数据结构，是整个 Agent 上下文传递的核心载体，具体实现上是一个 \`Map<String, Object>\`。
- **节点（Node）**：Graph 中的每个 Node 是执行逻辑单元，接受当前 State 作为输入，执行某些操作（如调用 LLM 或自定义逻辑），并返回对 State 的更新。
- **边（Edge）**：定义 Node 间的控制流，可为固定连接，也可依据状态条件动态决定下一步执行路径，实现分支逻辑。

通过组合 Node 和 Edge，开发者可以创建复杂的循环工作流，随着时间的推移不断更新 State 状态。

### Graph 引擎提供的 Low-level API

Spring AI Alibaba 同时提供了声明式的 Agentic API 与底层原子化的 Graph API。相比于 Agentic API，Graph API 可以让开发者对流程有更全面的控制，开发者可以独立定义每个 Node 的逻辑、每条边的逻辑，最终按照业务需要编排成完整的流程图。

### Graph 引擎提供更多运行时特性

除了流程编排之外，Graph 引擎还原生支持：
- **Streaming**：流式响应，将每个 Node 节点的运行情况、LLM Token 实时发送到用户端
- **Human In the Loop**：对 Agent 运行过程中的工具调用进行评估、修改、批准
- **Memory & Context**：处理短期记忆与长期记忆

## 定义自己的 Node

在 Spring AI Alibaba Graph 中，Node 是工作流的基本执行单元。

### Node 接口

自定义 Node 需要实现 \`NodeAction\` 或 \`NodeActionWithConfig\` 接口：

\`\`\`java
public interface NodeAction {
    Map<String, Object> apply(OverAllState state) throws Exception;
}

public interface NodeActionWithConfig {
    Map<String, Object> apply(OverAllState state, RunnableConfig config) throws Exception;
}
\`\`\`

**主要区别**：
- \`NodeAction\`：只接收状态作为参数，适用于简单的业务逻辑
- \`NodeActionWithConfig\`：额外接收运行配置，可以访问元数据、线程ID等信息

### 基础 Node 示例

\`\`\`java
import com.alibaba.cloud.ai.graph.OverAllState;
import com.alibaba.cloud.ai.graph.action.NodeAction;

public class TextProcessorNode implements NodeAction {
    @Override
    public Map<String, Object> apply(OverAllState state) throws Exception {
        String input = state.value("query", "").toString();
        String processedText = input.toUpperCase().trim();
        Map<String, Object> result = new HashMap<>();
        result.put("processed_text", processedText);
        return result;
    }
}
\`\`\`

### 高级 Node 示例：带配置的 AI Node

\`\`\`java
import com.alibaba.cloud.ai.graph.OverAllState;
import com.alibaba.cloud.ai.graph.RunnableConfig;
import com.alibaba.cloud.ai.graph.action.NodeActionWithConfig;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.PromptTemplate;

public class QueryExpanderNode implements NodeActionWithConfig {
    private final ChatClient chatClient;
    private final PromptTemplate promptTemplate;

    public QueryExpanderNode(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
        this.promptTemplate = new PromptTemplate(
            "你是一个搜索优化专家。请为以下查询生成 {number} 个不同的变体。\\n" +
            "原始查询：{query}\\n\\n查询变体：\\n"
        );
    }

    @Override
    public Map<String, Object> apply(OverAllState state, RunnableConfig config) throws Exception {
        String query = state.value("query", "").toString();
        Integer number = state.value("expanderNumber", 3);

        String result = chatClient.prompt()
            .user(user -> user
                .text(promptTemplate.getTemplate())
                .param("query", query)
                .param("number", number))
            .call()
            .content();

        String[] variants = result.split("\\n");
        Map<String, Object> output = new HashMap<>();
        output.put("queryVariants", Arrays.asList(variants));
        return output;
    }
}
\`\`\`

### 条件评估 Node

用于工作流中的条件分支判断：

\`\`\`java
public class ConditionEvaluatorNode implements NodeAction {
    @Override
    public Map<String, Object> apply(OverAllState state) throws Exception {
        String input = state.value("input", "").toString().toLowerCase();
        String route;
        if (input.contains("错误") || input.contains("异常")) {
            route = "error_handling";
        } else if (input.contains("数据") || input.contains("分析")) {
            route = "data_processing";
        } else if (input.contains("报告") || input.contains("总结")) {
            route = "report_generation";
        } else {
            route = "default";
        }
        Map<String, Object> result = new HashMap<>();
        result.put("_condition_result", route);
        return result;
    }
}
\`\`\`

### Node 开发最佳实践

1. **单一职责**：每个 Node 应该只负责一个明确的任务
2. **状态不可变**：不要直接修改输入的 state，而是返回新的状态更新
3. **异常处理**：在 Node 内部处理可预见的异常，避免中断整个流程
4. **日志记录**：添加适当的日志以便调试和监控
5. **参数验证**：在处理前验证从状态中获取的参数

\`\`\`java
public class RobustNode implements NodeAction {
    private static final Logger logger = LoggerFactory.getLogger(RobustNode.class);

    @Override
    public Map<String, Object> apply(OverAllState state) throws Exception {
        try {
            String input = state.value("input")
                .orElseThrow(() -> new IllegalArgumentException("Missing 'input' in state"));
            logger.info("Processing input: {}", input);
            String result = processInput(input);
            Map<String, Object> output = new HashMap<>();
            output.put("output", result);
            return output;
        } catch (Exception e) {
            logger.error("Error in RobustNode", e);
            Map<String, Object> errorOutput = new HashMap<>();
            errorOutput.put("error", e.getMessage());
            return errorOutput;
        }
    }
}
\`\`\`

## Agent 作为 Node

在复杂的工作流场景中，可以将 \`ReactAgent\` 作为 Node 集成到 StateGraph 中。\`ReactAgent\` 可以通过 \`asNode()\` 方法转换为可以嵌入到父 Graph 中的 Node。

### ReactAgent 作为 SubGraph Node

\`\`\`java
import com.alibaba.cloud.ai.graph.agent.ReactAgent;
import com.alibaba.cloud.ai.graph.StateGraph;
import com.alibaba.cloud.ai.graph.CompileConfig;
import com.alibaba.cloud.ai.graph.CompiledGraph;
import com.alibaba.cloud.ai.graph.NodeOutput;
import com.alibaba.cloud.ai.graph.streaming.StreamingOutput;

// 创建专门的数据分析 Agent
ReactAgent analysisAgent = ReactAgent.builder()
    .name("data_analyzer")
    .model(chatModel)
    .instruction("你是一个数据分析专家，负责分析数据并提供洞察，请分析以下输入数据：\\n {input}")
    .outputKey("analysis_result")
    .build();

// 创建报告生成 Agent
ReactAgent reportAgent = ReactAgent.builder()
    .name("report_generator")
    .model(chatModel)
    .instruction("你是一个报告生成专家，负责将分析结果 "{analysis_result}" 转化为专业报告")
    .outputKey("final_report")
    .build();

// 构建包含 Agent 的工作流
StateGraph workflow = new StateGraph(keyStrategyFactory);

// 将 Agent 作为 SubGraph Node 添加
workflow.addNode(analysisAgent.name(), analysisAgent.asNode(
    true,   // includeContents: 是否传递父图的消息历史
    false   // returnReasoningContents: 是否返回推理过程
));
workflow.addNode(reportAgent.name(), reportAgent.asNode(true, false));

// 定义流程
workflow.addEdge(StateGraph.START, analysisAgent.name());
workflow.addEdge(analysisAgent.name(), reportAgent.name());
workflow.addEdge(reportAgent.name(), StateGraph.END);

// 编译并执行
CompiledGraph compiledGraph = workflow.compile(CompileConfig.builder().build());
compiledGraph.stream(Map.of("input", "2025年全年销量100亿..."))
    .doOnNext(output -> {
        if (output instanceof StreamingOutput<?> streamingOutput) {
            System.out.println("Output from node " + streamingOutput.node() + ": " + streamingOutput.message().getText());
        }
    })
    .blockLast();
\`\`\`

### SubGraph Node 参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| \`includeContents\` | boolean | 是否将父图的 messages 传递给子 Agent（默认 true） |
| \`returnReasoningContents\` | boolean | 是否返回完整的推理过程，false 则只返回最终结果（默认 false） |

### Agent Node 与普通 Node 混合使用

在实际应用中，可以将 Agent Node 和自定义 Node 混合使用：

\`\`\`java
// 创建自定义预处理 Node
class PreprocessorNode implements NodeAction {
    @Override
    public Map<String, Object> apply(OverAllState state) throws Exception {
        String input = state.value("input", "").toString();
        String cleaned = input.trim().toLowerCase();
        return Map.of("cleaned_input", cleaned);
    }
}

// 构建混合工作流
workflow.addNode("preprocess", node_async(new PreprocessorNode()));
workflow.addNode("validate", node_async(new ValidatorNode()));
workflow.addNode(qaAgent.name(), qaAgent.asNode(true, false));

// 定义流程：预处理 -> Agent处理 -> 验证
workflow.addEdge(StateGraph.START, "preprocess");
workflow.addEdge("preprocess", qaAgent.name());
workflow.addEdge(qaAgent.name(), "validate");

// 条件边：验证通过则结束，否则重新处理
workflow.addConditionalEdges(
    "validate",
    edge_async(state -> (Boolean) state.value("is_valid", false) ? "end" : qaAgent.name()),
    Map.of("end", StateGraph.END, qaAgent.name(), qaAgent.name())
);
\`\`\`

## 执行工作流

Spring AI Alibaba Graph 支持两种执行方式：
1. **流式执行**：使用 \`compiledGraph.stream()\` 方法，实时获取每个节点的输出
2. **同步执行**：使用 \`compiledGraph.invoke()\` 方法，等待整个工作流执行完成后返回最终结果

### 流式执行

\`\`\`java
CompiledGraph compiledGraph = workflow.compile(CompileConfig.builder().build());

NodeOutput lastOutput = compiledGraph.stream(Map.of("input", "请分析2024年AI行业发展趋势"))
    .doOnNext(output -> {
        if (output instanceof StreamingOutput<?> streamingOutput) {
            if (streamingOutput.message() != null) {
                System.out.println("Streaming: " + streamingOutput.message().getText());
            } else {
                System.out.println("Node output: " + streamingOutput.state().data());
            }
        }
    })
    .blockLast();

System.out.println("最终结果: " + lastOutput.state().data());
\`\`\`

### 同步执行

\`\`\`java
CompiledGraph compiledGraph = workflow.compile(CompileConfig.builder().build());

Map<String, Object> input = Map.of("input", "请分析2024年AI行业发展趋势");
RunnableConfig runnableConfig = RunnableConfig.builder()
    .threadId("workflow-001")
    .build();

Optional<OverAllState> result = compiledGraph.invoke(input, runnableConfig);

result.ifPresent(state -> {
    System.out.println("输入: " + state.value("input").orElse("无"));
    System.out.println("输出: " + state.value("output").orElse("无"));
});
\`\`\`

## 并行执行

对于相互独立的 Agent，使用并行节点提高效率：

\`\`\`java
// 添加多个并行 Agent
workflow.addNode("agent1", agent1.asNode(true, false));
workflow.addNode("agent2", agent2.asNode(true, false));
workflow.addNode("agent3", agent3.asNode(true, false));

// 聚合结果
workflow.addNode("aggregator", node_async(new ParallelResultAggregatorNode("merged_result")));

// 设置并行执行
workflow.addEdge(StateGraph.START, "parallel_start");
workflow.addEdge("parallel_start", List.of("agent1", "agent2", "agent3"));
workflow.addEdge(List.of("agent1", "agent2", "agent3"), "aggregator");
workflow.addEdge("aggregator", StateGraph.END);
\`\`\``;export{n as default};
