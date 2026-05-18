const o=`---
title: SAA ReactAgent 工具机制
description: 了解 Spring AI Alibaba Agent 框架中的工具（Tools）系统，包括 7 种工具提供方式、内置工具和 ToolContext 机制
date: 2025-12-28
tags: [Spring AI Alibaba, ReactAgent, Tools, ToolCallback, FunctionCallback]
keywords: [Spring AI Alibaba, ReactAgent, Tools, 工具, ToolCallback, ToolContext, methodTools, ToolCallbackProvider]
---

# 工具 (Tools)

大模型本身是封闭的，它们无法访问实时信息（如现在的天气），也无法执行操作（如发送邮件）。

**工具 (Tools)** 赋予了 Agent "手脚"，让它能够与外部世界进行交互。

在 Spring AI Alibaba Agent 框架中，同样利用了 Spring AI 中对 Tools 的底层抽象封装，可以像 ChatModel 那样为 Agent 添加 Tools。

Tools 本质上是 **Java 函数**。通过特定的注解，框架会自动将这些函数的描述（名称、参数、用途）提供给大模型。模型会根据用户的意图，决定是否调用以及如何调用这些函数。

> **Tips:** 关于 Tools 的更多描述，请参考 Spring AI Alibaba 中的 Tools 章节。关于如何定义工具，以及怎么在 Spring AI Alibaba 使用 Tools，本章节不在赘述。此章节中只讨论如何在 Agent 框架中使用 Tools。

## Agent 中对 Tools 的封装

在 Spring AI Alibaba Agent 框架中，提供了 Tools API 来集成 Tools。

\`\`\`java
public static void main(String[] args) throws GraphRunnerException {

    var agent = ReactAgent.builder()
            .name("demoReactAgent")
            .model(DashScopeChatModel.builder()
                    .dashScopeApi(DashScopeApi.builder()
                            .apiKey("sk-xxxx")
                            .build()
                    ).defaultOptions(DashScopeChatOptions.builder()
                            .model(DashScopeChatModel.DEFAULT_MODEL_NAME)
                            .temperature(DashScopeChatModel.DEFAULT_TEMPERATURE)
                            .build()
                    ).build())
            .instruction("地点为: {target_topic}")
            .tools(ToolCallbacks.from(new TestMcpServiceImpl()))
            .systemPrompt("你是一个天气预报助手，帮我查看指定地点的天气预报")
            .build();

    System.out.println(agent.call("北京").getText());
}

static class TestMcpServiceImpl {

    @Tool(name = "getWeatherByCity", description = "Get weather information by city  name", returnDirect = false)
    public String getWeatherByCity(@ToolParam(description = "城市地址列表") List<String> cityNameList) {

        StringBuilder builder = new StringBuilder();

        for (String cityName : cityNameList) {
            builder.append(cityName).append("天气不错");
        }

        return builder.toString();
    }
}
\`\`\`

### 工具提供方式

#### 1. 直接工具（Tools）

正如上面例子展示的那样，最简单的例子是直接使用 tools API 来为 Agent 接入工具。其适合工具数量较少，工具定义明确的场景。

适用场景：

- 工具数量较少（通常少于 5 个）；
- 工具定义在编译时已知；
- 需要类型安全的工具定义。

#### 2. 方法工具（methodTools）

使用 methodTools() 方法传入带有 @Tool 注解方法的对象。这种方式让工具定义更加简洁，适合将工具逻辑组织在类中。

\`\`\`java
import com.alibaba.cloud.ai.graph.agent.ReactAgent;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;

// 定义工具类，使用 @Tool 注解
public class CalculatorTools {
    @Tool(description = "Add two numbers together")
    public String add(
        @ToolParam(description = "First number") int a,
        @ToolParam(description = "Second number") int b) {

        return String.valueOf(a + b);
    }

    @Tool(description = "Multiply two numbers together")
    public String multiply(
        @ToolParam(description = "First number") int a,
        @ToolParam(description = "Second number") int b) {

        return String.valueOf(a * b);
    }
}

// 使用 methodTools() 方法
CalculatorTools calculatorTools = new CalculatorTools();

ReactAgent agent = ReactAgent.builder()
    .name("calculator_agent")
    .model(chatModel)
    .description("An agent that can perform calculations")
    .instruction("You are a helpful calculator assistant.")
    .methodTools(calculatorTools) // 传入带有 @Tool 注解方法的对象
    .saver(new MemorySaver())
    .build();

// 可以传入多个 methodTools 对象
WeatherTools weatherTools = new WeatherTools();
ReactAgent multiAgent = ReactAgent.builder()
    .name("multi_tool_agent")
    .model(chatModel)
    .methodTools(calculatorTools, weatherTools) // 多个工具对象
    .build();
\`\`\`

适用场景：

- 工具逻辑组织在类中；
- 需要将相关工具分组；
- 工具方法需要访问类成员变量。

#### 3. 工具提供者（toolCallbackProviders）

使用 ToolCallbackProvider 接口动态提供工具。这种方式适合需要根据运行时条件动态决定提供哪些工具的场景。

\`\`\`java
import com.alibaba.cloud.ai.graph.agent.ReactAgent;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.function.FunctionToolCallback;
import java.util.List;

// 实现 ToolCallbackProvider 接口
public class CustomToolCallbackProvider implements ToolCallbackProvider {
    private final List<ToolCallback> toolCallbacks;

    public CustomToolCallbackProvider(List<ToolCallback> toolCallbacks) {
        this.toolCallbacks = toolCallbacks;
    }

    @Override
    public ToolCallback[] getToolCallbacks() {
        return toolCallbacks.toArray(new ToolCallback[0]);
    }
}

// 创建工具
ToolCallback searchTool = FunctionToolCallback.builder("search", new SearchToolWithContext())
    .description("Search for information")
    .inputType(String.class)
    .build();

// 创建 ToolCallbackProvider
ToolCallbackProvider toolProvider = new CustomToolCallbackProvider(List.of(searchTool));

// 使用 toolCallbackProviders() 方法
ReactAgent agent = ReactAgent.builder()
    .name("search_agent")
    .model(chatModel)
    .description("An agent that can search for information")
    .instruction("You are a helpful assistant with search capabilities.")
    .toolCallbackProviders(toolProvider) // 使用 ToolCallbackProvider
    .saver(new MemorySaver())
    .build();
\`\`\`

适用场景：

- 需要根据运行时条件动态提供工具；
- 工具来自外部系统或配置；
- 需要实现工具的动态加载和卸载。

#### 4. 工具名称解析（toolNames + resolver）

使用 toolNames() 方法指定工具名称，配合 resolver() 方法提供的 ToolCallbackResolver 来解析工具。这种方式适合工具定义和工具使用分离的场景。

\`\`\`java
import com.alibaba.cloud.ai.graph.agent.ReactAgent;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.function.FunctionToolCallback;
import org.springframework.ai.tool.resolution.StaticToolCallbackResolver;
import java.util.List;

// 创建工具（使用复合类型）
ToolCallback searchTool = FunctionToolCallback.builder("search", new SearchFunctionWithRequest())
    .description("Search for information")
    .inputType(SearchRequest.class)
    .build();

ToolCallback calculatorTool = FunctionToolCallback.builder("calculator", new CalculatorFunctionWithRequest())
    .description("Perform arithmetic calculations")
    .inputType(CalculatorRequest.class)
    .build();

// 创建 StaticToolCallbackResolver，包含所有工具
StaticToolCallbackResolver resolver = new StaticToolCallbackResolver(
List.of(calculatorTool, searchTool));

// 使用 toolNames() 指定要使用的工具名称，必须配合 resolver() 使用
ReactAgent agent = ReactAgent.builder()
    .name("multi_tool_agent")
    .model(chatModel)
    .description("An agent with multiple tools")
    .instruction("You are a helpful assistant with access to calculator and search tools.")
    .toolNames("calculator", "search") // 使用工具名称而不是 ToolCallback 实例
    .resolver(resolver) // 必须提供 resolver 来解析工具名称
    .saver(new MemorySaver())
    .build();
\`\`\`

> **Tips:** 重要提示：toolNames() 方法必须与 resolver() 方法配合使用，否则会抛出异常。

适用场景：

- 工具定义和工具使用分离；
- 需要从配置或外部系统读取工具名称；
- 工具可能动态变化，但名称保持稳定。

#### 5. 工具解析器（resolver）

直接使用 resolver() 方法提供 ToolCallbackResolver。解析器可以用于工具节点，也可以与 toolNames() 配合使用。

\`\`\`java
import com.alibaba.cloud.ai.graph.agent.ReactAgent;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.function.FunctionToolCallback;
import org.springframework.ai.tool.resolution.StaticToolCallbackResolver;
import java.util.List;

// 创建工具
ToolCallback calculatorTool = FunctionToolCallback.builder("calculator", new CalculatorFunctionWithContext())
    .description("Perform arithmetic calculations")
    .inputType(String.class)
    .build();

// 创建 resolver
StaticToolCallbackResolver resolver = new StaticToolCallbackResolver(
List.of(calculatorTool));

// 使用 resolver，可以直接在 tools 中使用，也可以仅通过 resolver 提供
ReactAgent agent = ReactAgent.builder()
    .name("resolver_agent")
    .model(chatModel)
    .description("An agent using ToolCallbackResolver")
    .instruction("You are a helpful calculator assistant.")
    .tools(calculatorTool) // 直接指定工具
    .resolver(resolver) // 同时设置 resolver 供工具节点使用
    .saver(new MemorySaver())
    .build();
\`\`\`

适用场景：

- 需要自定义工具解析逻辑；
- 工具来自多个来源需要统一管理；
- 需要实现工具的动态查找和加载。

#### 6. 组合使用

可以组合使用上述多种方式来提供工具，以满足复杂的需求。例如，可以同时使用 methodTools() 和 toolCallbackProviders() 来提供工具。

#### 7. 选择建议

| 方式 | 适用场景 | 优点 | 缺点 |
|------|----------|------|------|
| tools() | 工具数量少、定义明确 | 简单直接、类型安全 | 工具多时代码冗长 |
| methodTools() | 工具逻辑组织在类中 | 代码组织清晰、易于维护 | 需要创建工具类 |
| toolCallbackProviders() | 动态提供工具 | 灵活、支持运行时决策 | 需要实现接口 |
| toolNames() + resolver() | 工具定义和使用分离 | 解耦、支持配置化 | 必须配合 resolver |
| resolver() | 自定义解析逻辑 | 高度灵活 | 需要实现解析器 |
| 组合使用 | 复杂场景 | 最大灵活性 | 可能增加复杂度 |

### Agent 框架内置工具

1. GlobSearchTool.java 全局搜索工具，在本地文件系统中搜索内容；
2. GrepSearchTool.java 文本搜索工具，在指定文本文件中搜索内容；
3. ShellTool.java 执行 Shell 命令工具，执行系统命令并返回结果；
4. WriteTodosTool.java 写待办事项工具，写入待办事项列表。

## Agent ToolContext

在 Agent 中，ToolContext 提供了对工具调用的上下文支持。它允许在工具函数中访问 Agent 的运行时信息，例如对话历史、用户输入等。使得工具能够做出上下文感知的决策，个性化响应。

工具可以通过 ToolContext 参数访问运行时信息，该参数提供：

- State（状态） - 通过执行流动的可变数据（消息、计数器、自定义字段）；
- Context（上下文） - 不可变配置，如用户 ID、会话详细信息或应用程序特定配置；
- Store（存储） - 跨对话的持久长期记忆；
- Config（配置） - 执行的 RunnableConfig；
- Tool Call ID - 当前工具调用的 ID。

> **Tips:** 本章节是基础章节，关于 ToolContext 的更多信息，请参考 Spring AI Alibaba Agent 高级教程中的 ToolContext 章节。`;export{o as default};
