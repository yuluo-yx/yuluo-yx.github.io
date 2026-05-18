---
title: SAA ReactAgent Hooks 和 Interceptors
description: 深入了解 Spring AI Alibaba Agent 框架中的 Hooks 和 Interceptors 扩展机制，包括内置实现、自定义扩展和执行顺序
date: 2025-12-28
tags: [Spring AI Alibaba, ReactAgent, Hooks, Interceptors, ModelHook, AgentHook]
keywords: [Spring AI Alibaba, ReactAgent, Hooks, Interceptors, ModelHook, MessagesModelHook, AgentHook, ToolInterceptor]
---

# Hooks 和 Interceptors

在 Agent 的运行过程中，我们经常需要"插入"一些自定义逻辑，例如：

* **监控**：记录每一步的输入输出，用于调试或审计；
* **修改**：在发送给模型之前修改 Prompt，或者在工具执行前修改参数；
* **控制**：在关键步骤暂停，等待人工确认（Human-in-the-Loop）；
* **优化**：当对话历史过长时，自动进行压缩或摘要。

Spring AI Alibaba 提供了 **Hooks** 和 **Interceptors** 机制来实现这些需求。它们就像是 Agent 执行流程中的"切面"（Aspect）。

## 核心概念

Agent 的执行流程通常是一个循环：
1. **Model Node**: 调用大模型；
2. **Tool Node**: 如果模型决定调用工具，则执行工具；
3. **Loop**: 重复上述过程，直到任务完成。

Hooks 和 Interceptors 允许你在这些节点的前后插入代码。

## 如何在 Agent 中使用 Hooks 和 Interceptors

在构建 Agent 时，通过 `hooks()` 和 `interceptors()` 方法添加。

```java
ReactAgent agent = ReactAgent.builder()
    .name("my-agent")
    .model(chatModel)
    .tools(tools)
    .hooks(new LoggingHook()) // 添加日志 Hook
    .interceptors(new RetryInterceptor()) // 添加重试拦截器
    .build();
```

## 内置实现 & 自定义扩展

Spring AI Alibaba Agent 框架提供了一些常用的 Hooks 和 Interceptors，便于开箱即用，减少开发负担：

| 名称 | 说明 |
|------|------|
| Summarization | 接近 Token 限制时自动压缩对话历史 |
| Human-in-the-Loop | 暂停 Agent 执行以获得人工批准、编辑或拒绝工具调用 |
| Model Call Limit | 限制模型调用次数以防止无限循环或过度成本 |
| Personally Identifiable Information | 检测和处理对话中的个人身份信息 |
| Tool Retry | 自动重试失败了的工具调用 |
| Planning | 在执行工具之前强制执行一个规划步骤，以概述 Agent 将要采取的步骤 |
| LLM Tool Selector | 使用一个 LLM 来决定在多个可用工具之间选择哪个工具 |
| LLM Tool Emulator | 在没有实际执行工具的情况下，使用 LLM 模拟工具的输出 |
| Context Editing | 在将上下文发送给 LLM 之前对其进行修改，以注入、删除或修改信息 |

### 使用示例

#### Hooks

在 Hooks 示例中，分为 Spring AI Alibaba 自带 Hooks 和扩展 Hooks 两部分：

> **Tips:** HITL Hook 和 ContextEditingInterceptor，将在 ReactAgent 高阶章节中介绍。这里暂时跳过。此示例中只演示自定义扩展 ModelInterceptor 和 ModelHook，其他内置 Hooks 和 Interceptors 扩展请参考 example 实现。

```java
public class Hooks {

    public static void main(String[] args) throws GraphRunnerException {

        // First conversation, no hooks
        System.out.println(ReactAgent.builder()
                .name("HookAgent")
                .model(DashScopeChatModel.builder()
                        .dashScopeApi(DashScopeApi.builder()
                                .apiKey("sk-xxxx")
                                .build()
                        ).defaultOptions(DashScopeChatOptions.builder()
                                .model(DashScopeChatModel.DEFAULT_MODEL_NAME)
                                .temperature(0.7)
                                .build()
                        ).build()
                ).systemPrompt("You are a helpful assistant")
                .build()
                .call("Hi")
                .getText()
        );

        System.out.println("\n === Second: SummarizationHook ===\n");

        // 1. SummarizationHook
        System.out.println(ReactAgent.builder()
                .name("HookAgent")
                .model(DashScopeChatModel.builder()
                        .dashScopeApi(DashScopeApi.builder()
                                .apiKey("sk-xxxx")
                                .build()
                        ).defaultOptions(DashScopeChatOptions.builder()
                                .model(DashScopeChatModel.DEFAULT_MODEL_NAME)
                                .temperature(0.7)
                                .build()
                        ).build()
                ).systemPrompt("You are a helpful assistant")
                .hooks(SummarizationHook.builder()
                        // 这里的 model 用来总结对话内容，可以和主模型不同
                        .model(DashScopeChatModel.builder()
                                .dashScopeApi(DashScopeApi.builder()
                                        .apiKey("sk-xxxx")
                                        .build()
                                ).defaultOptions(DashScopeChatOptions.builder()
                                        .model(DashScopeChatModel.DEFAULT_MODEL_NAME)
                                        .temperature(0.7)
                                        .build()
                                ).build())
                        .maxTokensBeforeSummary(4000)
                        .messagesToKeep(20)
                        .build())
                .build()
                .call("hi")
                .getText()
        );

        System.out.println("\n === Three: SummarizationHook ===\n");

        // ModelCallLimitHook：用于限制模型调用次数，防止推理轮数过多
        ModelCallLimitHook modelCallLimitHook = ModelCallLimitHook.builder()
                // 限制模型调用次数为 1 次
                // 为了演示效果，我们需要为此引入一个 tools，来制造多轮调用的现场
                // 当改为 2 时，将得到以下输出
                //  ===========>>>>>> Model Call Limit Hook:
                //  杭州和上海的天气都不错。
                .runLimit(1)
                .build();
        ReactAgent agent = ReactAgent.builder()
                .name("HookAgent")
                .model(DashScopeChatModel.builder()
                        .dashScopeApi(DashScopeApi.builder()
                                .apiKey("sk-xxxx")
                                .build()
                        ).defaultOptions(DashScopeChatOptions.builder()
                                .model(DashScopeChatModel.DEFAULT_MODEL_NAME)
                                .temperature(0.7)
                                .build()
                        ).build()
                ).systemPrompt("You are a helpful assistant")
                .hooks(modelCallLimitHook)
                .tools(ToolCallbacks.from(new TestMcpServiceImpl()))
                .saver(new MemorySaver())
                .build();

        // 连续调用多次来触发限制
        System.out.println("===========>>>>>> Model Call Limit Hook: ");
        System.out.println(agent.call("杭州天气怎么样？上海呢？").getText());

        System.out.println("\n === Four: PIIDetectionHook ===\n");

        // PIIDetectionHook：用于检测和处理个人身份信息（PII），保护用户隐私
        System.out.println(ReactAgent.builder()
                .name("HookAgent")
                .model(DashScopeChatModel.builder()
                        .dashScopeApi(DashScopeApi.builder()
                                .apiKey("sk-xxxx")
                                .build()
                        ).defaultOptions(DashScopeChatOptions.builder()
                                .model(DashScopeChatModel.DEFAULT_MODEL_NAME)
                                .temperature(0.7)
                                .build()
                        ).build()
                ).systemPrompt("You are a helpful assistant. If you see PII information, handle it properly.")
                .hooks(PIIDetectionHook.builder()
                        .piiType(PIIType.EMAIL)
                        .strategy(RedactionStrategy.REDACT)
                        .applyToInput(true)
                        .build())
                .saver(new MemorySaver())
                .build()
                .call("My email is john.doe@example.com and my phone number is 138-0000-0000")
                .getText()
        );
    }

}

class TestMcpServiceImpl {

    @Tool(name = "getWeatherByCity", description = "Get weather information by city  name", returnDirect = false)
    public String getWeatherByCity(@ToolParam(description = "城市地址列表") List<String> cityNameList) {

        StringBuilder builder = new StringBuilder();

        for (String cityName : cityNameList) {
            builder.append(cityName).append("天气不错");
        }

        return builder.toString();
    }
}
```

运行上述代码，将得到以下输出：

```
Hello! How can I assist you today?

        === Second: SummarizationHook ===

Hello! How can I assist you today?

        === Three: SummarizationHook ===

        ===========>>>>>> Model Call Limit Hook:
Model call limits exceeded: run limit (1/1)

 === Four: PIIDetectionHook ===

For your privacy and security, I've redacted your personal information. It's great that you're being cautious—never share sensitive details like email addresses or phone numbers publicly. If you need help with something, feel free to ask without including personal data!
```

接下来是扩展 Hooks 示例：

```java
@HookPositions({HookPosition.BEFORE_MODEL, HookPosition.AFTER_MODEL})
public class LoggingModelHook extends ModelHook {

    @Override
    public String getName() {
        return "logging_model_hook";
    }

    @Override
    public HookPosition[] getHookPositions() {
        return new HookPosition[] {HookPosition.BEFORE_MODEL, HookPosition.AFTER_MODEL};
    }

    @Override
    public CompletableFuture<Map<String, Object>> beforeModel(OverAllState state, RunnableConfig config) {
        System.out.println("==============> Before model call");
        return CompletableFuture.completedFuture(Map.of());
    }

    @Override
    public CompletableFuture<Map<String, Object>> afterModel(OverAllState state, RunnableConfig config) {
        System.out.println("==============> After model call");
        return CompletableFuture.completedFuture(Map.of());
    }
}

class Main {

    public static void main(String[] args) throws GraphRunnerException {
        // Second conversation with custom logging hook
        ModelHook loggingHook = new LoggingModelHook();

        System.out.println(ReactAgent.builder()
                .name("HookAgent")
                .model(DashScopeChatModel.builder()
                        .dashScopeApi(DashScopeApi.builder()
                                .apiKey("sk-xxxx")
                                .build()
                        ).defaultOptions(DashScopeChatOptions.builder()
                                .model(DashScopeChatModel.DEFAULT_MODEL_NAME)
                                .temperature(0.7)
                                .build()
                        ).build()
                ).systemPrompt("You are a helpful assistant")
                .hooks(loggingHook)
                .build()
                .call("hi")
                .getText()
        );
    }
}
```

运行上述代码，将得到以下输出：

```
==============> Before model call
Hello! How can I help you today?
==============> After model call
```

#### Interceptors

```java

public class Interceptors {

    public static void main(String[] args) throws GraphRunnerException {

        // First conversation, no hooks
        System.out.println(ReactAgent.builder()
                .name("HookAgent")
                .model(DashScopeChatModel.builder()
                        .dashScopeApi(DashScopeApi.builder()
                                .apiKey("sk-xxxx")
                                .build()
                        ).defaultOptions(DashScopeChatOptions.builder()
                                .model(DashScopeChatModel.DEFAULT_MODEL_NAME)
                                .temperature(0.7)
                                .build()
                        ).build()
                ).systemPrompt("You are a helpful assistant")
                .build()
                .call("Hi")
                .getText()
        );

        System.out.println("\n === Second: ToolRetryInterceptor ===\n");

        // ToolRetryInterceptor：自动重试失败的工具调用，具有可配置的指数退避。
        System.out.println(ReactAgent.builder()
                .name("InterceptorAgent")
                .model(DashScopeChatModel.builder()
                        .dashScopeApi(DashScopeApi.builder()
                                .apiKey("sk-xxxx")
                                .build()
                        ).defaultOptions(DashScopeChatOptions.builder()
                                .model(DashScopeChatModel.DEFAULT_MODEL_NAME)
                                .temperature(0.7)
                                .build()
                        ).build()
                ).systemPrompt("You are a helpful assistant.")
                .tools(
                        // Tools 1
                        FunctionToolCallback.builder("searchTool", (String input) -> "Search results")
                        .description("Search the web")
                        .inputType(String.class)
                        .build(),
                        // Tools 2
                        FunctionToolCallback.builder("databaseTool", (String input) -> "Database query results")
                                .description("Query database")
                                .inputType(String.class)
                                .build()
                ).interceptors(ToolRetryInterceptor.builder()
                        // 最大重拾次数配置
                        .maxRetries(2)
                        .onFailure(ToolRetryInterceptor.OnFailureBehavior.RETURN_MESSAGE)
                        .build()
                ).build()
                .call("帮我搜索一下最新的科技新闻，然后查询数据库获取相关信息。")
                .getText()
        );

        System.out.println("\n === Three: TodoListInterceptor ===\n");

        // TodoListInterceptor：在执行工具之前强制执行一个规划步骤，以概述 Agent 将要采取的步骤。
        System.out.println(ReactAgent.builder()
                .name("InterceptorAgent")
                .model(DashScopeChatModel.builder()
                        .dashScopeApi(DashScopeApi.builder()
                                .apiKey("sk-xxxx")
                                .build()
                        ).defaultOptions(DashScopeChatOptions.builder()
                                .model(DashScopeChatModel.DEFAULT_MODEL_NAME)
                                .temperature(0.7)
                                .build()
                        ).build()
                ).systemPrompt("You are a helpful assistant.")
                .interceptors(TodoListInterceptor.builder().build())
                .build()
                .call("编写一个 kubernetes 系统")
                .getText()
        );

        System.out.println("\n === Four: ToolSelectionInterceptor ===\n");

        // ToolSelectionInterceptor：使用一个 LLM 来决定在多个可用工具之间选择哪个工具
        System.out.println(ReactAgent.builder()
                .name("InterceptorAgent")
                .model(DashScopeChatModel.builder()
                        .dashScopeApi(DashScopeApi.builder()
                                .apiKey("sk-xxxx")
                                .build()
                        ).defaultOptions(DashScopeChatOptions.builder()
                                .model(DashScopeChatModel.DEFAULT_MODEL_NAME)
                                .temperature(0.7)
                                .build()
                        ).build()
                ).systemPrompt("You are a helpful assistant.")
                .tools(
                        // Tools 1
                        FunctionToolCallback.builder("searchTool-1", (String input) -> "Search results")
                                // 在 description 中加入提示，帮助模型更好地选择工具
                                .description("Search the web, when user prompt contains 'google', effective is good")
                                .inputType(String.class)
                                .build(),
                        // Tools 2
                        FunctionToolCallback.builder("searchTool-2", (String input) -> "Search results")
                                .description("Search the web, not google, is baidu.")
                                .inputType(String.class)
                                .build()
                ).interceptors(
                        ToolSelectionInterceptor.builder()
                                .selectionModel(DashScopeChatModel.builder()
                                .dashScopeApi(DashScopeApi.builder()
                                        .apiKey("sk-xxxx")
                                        .build()
                                ).defaultOptions(DashScopeChatOptions.builder()
                                        // 用小模型来做选择
                                        .model("qwen-flash")
                                        .temperature(0.7)
                                        .build()
                                ).build())
                        .build(),
                        // 加入一个 model 拦截器，来打印选择的 tools 信息，便于观察
                        new LoggingModelInterceptor()
                        )
                .build()
                .call("帮我 google 一下艾菲尔铁塔的高度是多少？")
                .getText()
        );

        System.out.println("\n === Five: ToolEmulatorInterceptor ===\n");
        // ToolEmulatorInterceptor：模拟工具调用的行为，适用于测试和调试场景
        System.out.println(ReactAgent.builder()
                .name("InterceptorAgent")
                .model(DashScopeChatModel.builder()
                        .dashScopeApi(DashScopeApi.builder()
                                .apiKey("sk-xxxx")
                                .build()
                        ).defaultOptions(DashScopeChatOptions.builder()
                                .model(DashScopeChatModel.DEFAULT_MODEL_NAME)
                                .temperature(0.7)
                                .build()
                        ).build()
                ).systemPrompt("You are a helpful assistant.")
                // 配置需要 mock 的工具
                .tools(ToolCallbacks.from(new TestMcpServiceImpl()))
                .interceptors(ToolEmulatorInterceptor.builder().model(
                        // 配置选择哪个模型来模拟工具执行
                        DashScopeChatModel.builder()
                            .dashScopeApi(DashScopeApi.builder()
                                    .apiKey("sk-xxxx")
                                    .build()
                            ).defaultOptions(DashScopeChatOptions.builder()
                                    .model("qwen-flash")
                                    .temperature(0.7)
                                    .build()
                            ).build())
                        .build())
                .build()
                .call("杭州天气怎么样？")
                .getText()
        );

    }

}

class TestMcpServiceImpl {

    @Tool(name = "getWeatherByCity", description = "Get weather information by city  name", returnDirect = false)
    public String getWeatherByCity(@ToolParam(description = "城市地址列表") List<String> cityNameList) {

        StringBuilder builder = new StringBuilder();

        for (String cityName : cityNameList) {
            builder.append(cityName).append("天气不错");
        }

        return builder.toString();
    }
}
```

运行代码，将会得到如下输出：

```
Hello! How can I assist you today?

        === Second: ToolRetryInterceptor ===

根据最新的科技新闻和数据库信息，目前科技领域有以下动态：

        1. **人工智能进展**：多家科技公司发布了新一代AI模型，这些模型在自然语言处理和图像识别方面取得了显著突破。
        2. **量子计算**：研究人员在量子比特稳定性方面取得重要进展，这可能加速量子计算机的商业化进程。
        3. **5G和6G技术**：5G网络在全球范围内持续扩展，同时多个国家已经开始6G技术的研发和标准化工作。
        4. **可持续科技**：绿色能源技术和碳捕捉创新受到更多关注，多家企业推出了新的环保解决方案。

如果您对某个具体领域感兴趣，我可以提供更详细的信息。

        === Three: TodoListInterceptor ===

正在调研 Kubernetes 系统的基本架构和核心组件，以确保后续设计和开发工作的顺利进行。Kubernetes 是一个开源的容器编排平台，用于自动化部署、扩展和管理容器化应用。其核心架构包括控制平面（Control Plane）和工作节点（Node），以及一系列关键组件如 API Server、etcd、Scheduler、Controller Manager、Kubelet 和 Kube Proxy。

接下来，我将深入了解这些组件的功能及其相互之间的交互方式，为设计和实现打下坚实基础。

        === Four: ToolSelectionInterceptor ===

        00:14:25.027 [main] INFO com.alibaba.cloud.ai.graph.agent.interceptor.toolselection.ToolSelectionInterceptor -- Selected 1 tools from 2 available: [searchTool-1]
发送请求到模型: 1 条消息
模型响应耗时: 946ms
00:14:26.292 [main] INFO com.alibaba.cloud.ai.graph.agent.interceptor.toolselection.ToolSelectionInterceptor -- Selected 1 tools from 2 available: [searchTool-1]
发送请求到模型: 3 条消息
模型响应耗时: 679ms
艾菲尔铁塔的高度为300米（不含天线），如果包括顶部的天线，总高度约为330米。

        === Five: ToolEmulatorInterceptor ===

        00:14:27.679 [main] INFO com.alibaba.cloud.ai.graph.agent.interceptor.toolemulator.ToolEmulatorInterceptor -- Emulating tool call: getWeatherByCity
杭州目前的天气情况如下：

        - 温度：23°C
- 天气状况：多云
- 湿度：65%
        - 风速：3.2 m/s

这是截至2024年4月17日上午10点的数据。
```

接下来是扩展 Interceptors 示例：

```java
public class LoggingModelInterceptor extends ModelInterceptor {

    @Override
    public ModelResponse interceptModel(ModelRequest request, ModelCallHandler handler) {
        // 请求前记录
        System.out.println("发送请求到模型: " + request.getMessages().size() + " 条消息");

        long startTime = System.currentTimeMillis();

        // 执行实际调用
        ModelResponse response = handler.call(request);

        // 响应后记录
        long duration = System.currentTimeMillis() - startTime;
        System.out.println("模型响应耗时: " + duration + "ms");

        // 打印响应中的工具信息
        Arrays.toString(response.getChatResponse().getResult().getOutput().getToolCalls().toArray());

        return response;
    }

    @Override
    public String getName() {
        return "LoggingInterceptor";
    }

}

class Main {

    public static void main(String[] args) throws GraphRunnerException {

        System.out.println(ReactAgent.builder()
                .name("InterceptorAgent")
                .model(DashScopeChatModel.builder()
                        .dashScopeApi(DashScopeApi.builder()
                                .apiKey("sk-xxxx")
                                .build()
                        ).defaultOptions(DashScopeChatOptions.builder()
                                .model(DashScopeChatModel.DEFAULT_MODEL_NAME)
                                .temperature(0.7)
                                .build()
                        ).build()
                ).systemPrompt("You are a helpful assistant.")
                .interceptors(new LoggingModelInterceptor())
                .build()
                .call("1+1=？")
                .getText()
        );
    }

}
```

运行代码，将会得到如下输出：

```
发送请求到模型: 1 条消息
模型响应耗时: 1093ms
1 + 1 = 2。
```

### 扩展 Hooks 和 Interceptors

在使用 Agent 框架时，可以通过以下方式扩展：

- MessagesModelHook - 在模型调用前后执行，专注于消息操作（推荐）；
- ModelHook - 在模型调用前后执行，可访问完整状态；
- AgentHook - 在 Agent 开始和结束时执行；
- ModelInterceptor - 拦截和修改模型请求/响应；
- ToolInterceptor - 拦截和修改工具调用。

#### MessagesModelHook

MessagesModelHook 是一个专门用于操作消息列表的 Hook，使用更简单，更推荐。它直接接收和返回消息列表，无需处理复杂的 OverAllState。

适用场景：

- 消息修剪、过滤或转换；
- 添加系统提示或上下文消息；
- 消息压缩和摘要；
- 简单的消息操作需求。

下面是一个示例，展示如何使用 MessagesModelHook：

```java
import com.alibaba.cloud.ai.graph.agent.hook.messages.MessagesModelHook;
import com.alibaba.cloud.ai.graph.agent.hook.messages.AgentCommand;
import com.alibaba.cloud.ai.graph.agent.hook.messages.UpdatePolicy;
import com.alibaba.cloud.ai.graph.agent.hook.HookPosition;
import com.alibaba.cloud.ai.graph.agent.hook.HookPositions;
import com.alibaba.cloud.ai.graph.RunnableConfig;
import org.springframework.ai.chat.messages.Message;

@HookPositions({HookPosition.BEFORE_MODEL})
public class MessageTrimmingHook extends MessagesModelHook {
    private static final int MAX_MESSAGES = 10;

    @Override
    public String getName() {
        return "message_trimming";
    }

    @Override
    public AgentCommand beforeModel(List<Message> previousMessages, RunnableConfig config) {
        // 如果消息数量超过限制，只保留最后 MAX_MESSAGES 条消息
        if (previousMessages.size() > MAX_MESSAGES) {
            List<Message> trimmedMessages = previousMessages.subList(
                    previousMessages.size() - MAX_MESSAGES,
                    previousMessages.size()
            );

            // 使用 REPLACE 策略替换所有消息
            return new AgentCommand(trimmedMessages, UpdatePolicy.REPLACE);
        }

        // 如果消息数量未超过限制，返回原始消息（不进行修改）
        return new AgentCommand(previousMessages);
    }
}
```

##### AgentCommand 和 UpdatePolicy

MessagesModelHook 通过 AgentCommand 返回操作结果：

- REPLACE 策略：替换所有现有消息；
- APPEND 策略：将新消息追加到现有消息列表。

```java
import com.alibaba.cloud.ai.graph.agent.hook.messages.MessagesModelHook;
import com.alibaba.cloud.ai.graph.agent.hook.messages.AgentCommand;
import com.alibaba.cloud.ai.graph.agent.hook.messages.UpdatePolicy;
import com.alibaba.cloud.ai.graph.agent.hook.HookPosition;
import com.alibaba.cloud.ai.graph.agent.hook.HookPositions;
import com.alibaba.cloud.ai.graph.RunnableConfig;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import java.util.ArrayList;
import java.util.List;

@HookPositions({HookPosition.BEFORE_MODEL})
public class ContextEnhancementHook extends MessagesModelHook {

    @Override
    public String getName() {
        return "context_enhancement";
    }

    @Override
    public AgentCommand beforeModel(List<Message> previousMessages, RunnableConfig config) {

        // 示例 1: 使用 REPLACE 策略替换所有消息
        List<Message> newMessages = new ArrayList<>();
        newMessages.add(new SystemMessage("你是一个专业的助手"));
        newMessages.addAll(previousMessages);
        return new AgentCommand(newMessages, UpdatePolicy.REPLACE);

        // 示例 2: 使用 APPEND 策略追加消息
        // List<Message> additionalMessages = List.of(
        // new UserMessage("请记住：保持友好和专业")
        // );
        // return new AgentCommand(additionalMessages, UpdatePolicy.APPEND);
    }
}
```

##### 跳转控制

在 MessagesModelHook 中，也支持通过 JumpTo 实现提前退出：

```java
import com.alibaba.cloud.ai.graph.agent.hook.JumpTo;
import com.alibaba.cloud.ai.graph.agent.hook.messages.MessagesModelHook;
import com.alibaba.cloud.ai.graph.agent.hook.messages.AgentCommand;
import com.alibaba.cloud.ai.graph.agent.hook.HookPosition;
import com.alibaba.cloud.ai.graph.agent.hook.HookPositions;
import com.alibaba.cloud.ai.graph.RunnableConfig;
import org.springframework.ai.chat.messages.Message;
import java.util.List;

@HookPositions({HookPosition.BEFORE_MODEL})
public class EarlyExitHook extends MessagesModelHook {

    @Override
    public String getName() {
        return "early_exit";
    }

    @Override
    public List<JumpTo> canJumpTo() {
        return List.of(JumpTo.end);
    }

    @Override
    public AgentCommand beforeModel(List<Message> previousMessages, RunnableConfig config) {

        // 检查某些条件，如果满足则提前退出
        if (shouldExit(previousMessages)) {
            return new AgentCommand(JumpTo.end, previousMessages);
        }
        return new AgentCommand(previousMessages);
    }

    private boolean shouldExit(List<Message> messages) {

        // 实现退出逻辑
        return false;
    }
}
```

### ModelHook

ModelHook 提供了在模型调用前后执行自定义逻辑的功能。

```java
import com.alibaba.cloud.ai.graph.agent.hook.ModelHook;
import com.alibaba.cloud.ai.graph.agent.hook.HookPosition;
import com.alibaba.cloud.ai.graph.agent.hook.HookPositions;
import java.util.concurrent.CompletableFuture;

@HookPositions({HookPosition.BEFORE_MODEL, HookPosition.AFTER_MODEL})
public class CustomModelHook extends ModelHook {

    @Override
    public String getName() {
        return "custom_model_hook";
    }

    @Override
    public CompletableFuture<Map<String, Object>> beforeModel(OverAllState state, RunnableConfig config) {
        // 在模型调用前执行
        System.out.println("准备调用模型...");

        // 可以修改状态
        // 例如：添加额外的上下文
        return CompletableFuture.completedFuture(Map.of("extra_context", "某些额外信息"));
    }

    @Override
    public CompletableFuture<Map<String, Object>> afterModel(OverAllState state, RunnableConfig config) {
        // 在模型调用后执行
        System.out.println("模型调用完成");

        // 可以记录响应信息
        return CompletableFuture.completedFuture(Map.of());
    }
}
```

#### 删除消息

使用 ModelHook 时，可以通过 RemoveByHash 来删除 messages 中的消息。重要提示：返回的消息列表必须保持原消息列表的顺序，不能打乱顺序。由于 ModelHook 的复杂度，因此更推荐直接使用 MessagesModelHook。

```java
import com.alibaba.cloud.ai.graph.agent.hook.ModelHook;
import com.alibaba.cloud.ai.graph.agent.hook.HookPosition;
import com.alibaba.cloud.ai.graph.agent.hook.HookPositions;
import com.alibaba.cloud.ai.graph.OverAllState;
import com.alibaba.cloud.ai.graph.RunnableConfig;
import com.alibaba.cloud.ai.graph.state.RemoveByHash;
import org.springframework.ai.chat.messages.Message;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@HookPositions({HookPosition.BEFORE_MODEL})
public class MessageDeletionHook extends ModelHook {

    @Override
    public CompletableFuture<Map<String, Object>> beforeModel(OverAllState state, RunnableConfig config) {
        Optional<Object> messagesOpt = state.value("messages");
        if (!messagesOpt.isPresent()) {
            return CompletableFuture.completedFuture(Map.of());
        }

        List<Message> messages = (List<Message>) messagesOpt.get();

        // 构建新的消息列表，保持原顺序
        List<Object> newMessages = new ArrayList<>();
        for (Message msg : messages) {
            // 根据条件决定保留或删除
            if (shouldKeep(msg)) {
                newMessages.add(msg); // 保留消息
            } else {
                newMessages.add(RemoveByHash.of(msg)); // 标记删除
            }
        }

        return CompletableFuture.completedFuture(Map.of("messages", newMessages));
    }

    private boolean shouldKeep(Message msg) {
        // 实现你的保留逻辑
        return true;
    }
}
```

### MessagesModelHook vs ModelHook

通过上面的例子，我们发现：通过 MessagesModelHook 和 ModelHook 都可以在模型调用前后执行自定义逻辑的功能，那么在日常开发中，我们应该如何选择使用哪一个呢？

在框架设计时，它们都有不同的设计目标和适用场景：

#### 核心区别

| 特性 | MessagesModelHook | ModelHook |
|------|-------------------|-----------|
| 易用性 | ⭐⭐⭐⭐⭐ 更简单，直接操作消息列表 | ⭐⭐⭐ 需要理解 OverAllState |
| 灵活性 | ⭐⭐⭐ 专注于消息操作 | ⭐⭐⭐⭐⭐ 可访问和修改完整状态 |
| 推荐场景 | 消息修剪、过滤、添加系统提示 | 需要访问全局状态、自定义状态管理 |
| API 复杂度 | 简单：AgentCommand 返回消息列表 | 复杂：返回 Map<String, Object> 更新状态 |

#### 使用建议

如果需要以下操作时，选择 MessagesModelHook：

- ✅ 简单的消息操作（修剪、过滤、转换）；
- ✅ 添加或修改系统提示；
- ✅ 消息压缩和摘要；
- ✅ 快速实现消息相关的 Hook；

如果需要下面这些操作时，选择 ModelHook：

- ✅ 访问和修改 OverAllState 中的其他数据；
- ✅ 在状态中存储自定义信息（如计数器、缓存等）；
- ✅ 基于全局状态做复杂决策；
- ✅ 需要查看 Agent 执行过程中的完整上下文。

在日常开发中，推荐优化使用 MessagesModelHook，因为它更简单易用，且覆盖了大部分常见的消息操作需求。只有在需要访问和修改完整状态时，才考虑使用 ModelHook。

### AgentHook

在 Agent 整体执行的开始和结束时执行：

```java
import com.alibaba.cloud.ai.graph.agent.hook.AgentHook;
import com.alibaba.cloud.ai.graph.agent.hook.HookPosition;
import com.alibaba.cloud.ai.graph.agent.hook.HookPositions;
import java.util.concurrent.CompletableFuture;

@HookPositions({HookPosition.BEFORE_AGENT, HookPosition.AFTER_AGENT})
public class CustomAgentHook extends AgentHook {

    @Override
    public String getName() {
        return "custom_agent_hook";
    }

    @Override
    public CompletableFuture<Map<String, Object>> beforeAgent(OverAllState state, RunnableConfig config) {

        System.out.println("Agent 开始执行");

        // 可以初始化资源、记录开始时间等
        return CompletableFuture.completedFuture(Map.of("start_time", System.currentTimeMillis()));
    }

    @Override
    public CompletableFuture<Map<String, Object>> afterAgent(OverAllState state, RunnableConfig config) {

        System.out.println("Agent 执行完成");

        // 可以清理资源、计算执行时间等
        Optional<Object> startTime = state.value("start_time");
        if (startTime.isPresent()) {
            long duration = System.currentTimeMillis() - (Long) startTime.get();
            System.out.println("执行耗时: " + duration + "ms");
        }

        return CompletableFuture.completedFuture(Map.of());
    }
}
```

### ModelInterceptor

拦截和修改模型请求和响应。

使用场景：

- 根据用户权限动态添加或移除工具；
- 根据对话上下文临时启用特定工具；
- 实现工具的动态加载和卸载；
- 在特定条件下限制可用的工具集。

```java
import com.alibaba.cloud.ai.graph.agent.interceptor.ModelInterceptor;
import com.alibaba.cloud.ai.graph.agent.interceptor.ModelRequest;
import com.alibaba.cloud.ai.graph.agent.interceptor.ModelResponse;
import com.alibaba.cloud.ai.graph.agent.interceptor.ModelCallHandler;

public class LoggingInterceptor extends ModelInterceptor {

    @Override
    public ModelResponse interceptModel(ModelRequest request, ModelCallHandler handler) {
        // 请求前记录
        System.out.println("发送请求到模型: " + request.getMessages().size() + " 条消息");

        long startTime = System.currentTimeMillis();

        // 执行实际调用
        ModelResponse response = handler.call(request);

        // 响应后记录
        long duration = System.currentTimeMillis() - startTime;
        System.out.println("模型响应耗时: " + duration + "ms");

        return response;
    }

    @Override
    public String getName() {
        return "LoggingInterceptor";
    }
}
```

#### 动态工具管理

ModelInterceptor 支持在模型调用前动态管理工具：

- dynamicToolCallbacks：动态添加工具回调，可以在运行时根据上下文添加新的工具；
- tools：动态筛选工具，指定本次调用可用的工具名称列表。如果为空，则使用所有默认工具。

```java
import com.alibaba.cloud.ai.graph.agent.interceptor.ModelInterceptor;
import com.alibaba.cloud.ai.graph.agent.interceptor.ModelRequest;
import com.alibaba.cloud.ai.graph.agent.interceptor.ModelResponse;
import com.alibaba.cloud.ai.graph.agent.interceptor.ModelCallHandler;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.function.FunctionToolCallback;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class DynamicToolInterceptor extends ModelInterceptor {

    // 示例：根据上下文动态创建的工具
    private ToolCallback createContextualTool(String context) {

        return FunctionToolCallback.builder("contextual_tool", (String input) -> {
            return "处理上下文: " + context + ", 输入: " + input;
        }).description("根据上下文动态创建的工具")
        .build();
    }

    @Override
    public ModelResponse interceptModel(ModelRequest request, ModelCallHandler handler) {
        // 从上下文中获取信息，决定添加哪些工具
        Map<String, Object> context = request.getContext();
        String userRole = (String) context.getOrDefault("user_role", "default");

        // 构建修改后的请求
        ModelRequest.Builder builder = ModelRequest.builder(request);

        // 示例 1: 动态添加工具回调
        List<ToolCallback> dynamicTools = new ArrayList<>();
        if ("premium".equals(userRole)) {
            // 为高级用户添加额外工具
            dynamicTools.add(createContextualTool("premium_feature"));
        }
        builder.dynamicToolCallbacks(dynamicTools);

        // 示例 2: 动态筛选工具（只允许使用指定的工具）
        if (shouldRestrictTools(context)) {
            // 只允许使用 search 和 calculator 工具
            builder.tools(List.of("search", "calculator"));
        }
        // 如果 tools 为空列表，则使用所有默认工具

        ModelRequest modifiedRequest = builder.build();
        return handler.call(modifiedRequest);
    }

    private boolean shouldRestrictTools(Map<String, Object> context) {
        // 根据上下文决定是否限制工具
        return context.containsKey("restrict_tools");
    }

    @Override
    public String getName() {
        return "DynamicToolInterceptor";
    }
}
```

### ToolInterceptor

拦截和修改工具调用。

```java
import com.alibaba.cloud.ai.graph.agent.interceptor.ToolInterceptor;
import com.alibaba.cloud.ai.graph.agent.interceptor.ToolCallRequest;
import com.alibaba.cloud.ai.graph.agent.interceptor.ToolCallResponse;
import com.alibaba.cloud.ai.graph.agent.interceptor.ToolCallHandler;

public class ToolMonitoringInterceptor extends ToolInterceptor {

    @Override
    public ToolCallResponse interceptToolCall(ToolCallRequest request, ToolCallHandler handler) {
        String toolName = request.getToolName();
        long startTime = System.currentTimeMillis();

        System.out.println("执行工具: " + toolName);

        try {
            ToolCallResponse response = handler.call(request);

            long duration = System.currentTimeMillis() - startTime;
            System.out.println("工具 " + toolName + " 执行成功 (耗时: " + duration + "ms)");

            return response;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            System.err.println("工具 " + toolName + " 执行失败 (耗时: " + duration + "ms): " + e.getMessage());

            return ToolCallResponse.of(
                request.getToolCallId(),
                request.getToolName(),
                "工具执行失败: " + e.getMessage()
            );
        }
    }

    @Override
    public String getName() {
        return "ToolMonitoringInterceptor";
    }
}
```

## 执行顺序

使用多个 Hooks 和 Interceptors 时，理解执行顺序有助于正确编排 hooks 和 interceptors，形成一个链式结构。

```java
ReactAgent agent = ReactAgent.builder()
    .name("my_agent")
    .model(chatModel)
    .hooks(hook1, hook2, hook3)
    .interceptors(interceptor1, interceptor2)
    .interceptors(toolInterceptor1, toolInterceptor2)
    .build();
```

执行流程：

1. Before Agent Hooks（按顺序）:

   - hook1.beforeAgent()
   - hook2.beforeAgent()
   - hook3.beforeAgent()

2. Agent 循环开始

3. Before Model Hooks（按顺序）:

   - hook1.beforeModel()
   - hook2.beforeModel()
   - hook3.beforeModel()

4. Model Interceptors（嵌套调用）:

    interceptor1 → interceptor2 → 模型调用

5. After Model Hooks（逆序）:

   - hook3.afterModel()
   - hook2.afterModel()
   - hook1.afterModel()

6. Tool Interceptors（如果有工具调用，嵌套调用）:

    toolInterceptor1 → toolInterceptor2 → 工具执行

7. Agent 循环结束

8. After Agent Hooks（逆序）:

    - hook3.afterAgent()
    - hook2.afterAgent()
    - hook1.afterAgent()

### 关键规则：

- before_* hooks: 从第一个到最后一个；
- after_* hooks: 从最后一个到第一个（逆序）；
- Interceptors: 嵌套调用（第一个拦截器包装所有其他的）。

## 典型场景示例

### 内容审核 Interceptor

```java
public class ContentModerationInterceptor extends ModelInterceptor {

    private static final List<String> BLOCKED_WORDS =
        List.of("敏感词1", "敏感词2", "敏感词3");

    @Override
    public ModelResponse interceptModel(ModelRequest request, ModelCallHandler handler) {

        // 检查输入
        for (Message msg : request.getMessages()) {
            String content = msg.getText().toLowerCase();
            for (String blocked : BLOCKED_WORDS) {
                if (content.contains(blocked)) {
                    return ModelResponse.of(AssistantMessage.builder().content("检测到不适当的内容，请修改您的输入").build());
                }
            }
        }

        // 执行模型调用
        ModelResponse response = handler.call(request);

        // 检查输出
        String output = response.getContent();
        for (String blocked : BLOCKED_WORDS) {
            if (output.contains(blocked)) {
            // 清理输出
                output = output.replaceAll(blocked, "[已过滤]");
                return response.withContent(output);
            }
        }

        return response;
    }

    @Override
    public String getName() {
        return "ContentModerationInterceptor";
    }
}
```

### 性能监控 - 使用 Interceptor

使用 ModelInterceptor 和 ToolInterceptor 监控模型和工具调用的性能：

```java
// 模型调用性能监控
public class ModelPerformanceInterceptor extends ModelInterceptor {

    @Override
    public ModelResponse interceptModel(ModelRequest request, ModelCallHandler handler) {
        // 请求前记录
        System.out.println("发送请求到模型: " + request.getMessages().size() + " 条消息");

        long startTime = System.currentTimeMillis();

        // 执行实际调用
        ModelResponse response = handler.call(request);

        // 响应后记录
        long duration = System.currentTimeMillis() - startTime;
        System.out.println("模型响应耗时: " + duration + "ms");

        return response;
    }

    @Override
    public String getName() {
        return "ModelPerformanceInterceptor";
    }
}

// 工具调用性能监控
public class ToolPerformanceInterceptor extends ToolInterceptor {

    @Override
    public ToolCallResponse interceptToolCall(ToolCallRequest request, ToolCallHandler handler) {
        String toolName = request.getToolName();
        long startTime = System.currentTimeMillis();

        System.out.println("执行工具: " + toolName);

        try {
            ToolCallResponse response = handler.call(request);

            long duration = System.currentTimeMillis() - startTime;
            System.out.println("工具 " + toolName + " 执行成功 (耗时: " + duration + "ms)");

            return response;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            System.err.println("工具 " + toolName + " 执行失败 (耗时: " + duration + "ms): " + e.getMessage());

            return ToolCallResponse.of(
                request.getToolCallId(),
                request.getToolName(),
                "工具执行失败: " + e.getMessage()
            );
        }
    }

    @Override
    public String getName() {
        return "ToolPerformanceInterceptor";
    }
}

// 使用示例
ReactAgent agent = ReactAgent.builder()
    .name("monitored_agent")
    .model(chatModel)
    .tools(tools)
    .interceptors(new ModelPerformanceInterceptor())
    .interceptors(new ToolPerformanceInterceptor())
    .build();
```

## 实现原理剖析

得益于 Spring AI Alibaba Graph 引擎的强大能力，为 Agent 提供了灵活的扩展机制。

### Hooks 和 Interceptor 的区别

看到这里，相信大家都有一个疑惑，似乎 Hook 和 Interceptor 很相似，都可以实现相同的功能。那么它们到底有什么区别呢？

### Hooks 执行时机

正如前面章节中说到的那样，ReactAgent 是一个循环，底层是由 Graph 编排而成的一个 DAG 图。

1. **Model Node**: 调用大模型
2. **Tool Node**: 如果模型决定调用工具，则执行工具
3. **Loop**: 重复上述过程，直到任务完成

Hooks 被设计用于在 Agent 执行的关键节点插入自定义逻辑。主要关注于 **Agent 生命周期**：在 Agent 开始和结束时执行（AgentHook）；

### Interceptors 执行时机

Interceptors 的设计遵从责任链设计模式，使用洋葱模型。在调用模型前后加入自定义逻辑。

下面的图示例，可以说明他们的关系：

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                            Agent 执行流程                                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  START                                                                               │
│    │                                                                                 │
│    ▼                                                                                 │
│  ┌─────────────────────────────────────┐                                            │
│  │  Hook: beforeAgent()                │  ◄── Hook 是独立的 Graph 节点              │
│  │  (作为独立节点执行)                  │                                            │
│  └─────────────────────────────────────┘                                            │
│    │                                                                                 │
│    ▼                                                                                 │
│  ┌─────────────────────────────────────┐                                            │
│  │  Hook: beforeModel()                │  ◄── Hook 节点                             │
│  │  (作为独立节点执行)                  │                                            │
│  └─────────────────────────────────────┘                                            │
│    │                                                                                 │
│    ▼                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐│
│  │                          model 节点 (AgentLlmNode)                              ││
│  │  ┌───────────────────────────────────────────────────────────────────────────┐ ││
│  │  │                    Interceptor Chain (洋葱模型)                            │ ││
│  │  │                                                                           │ ││
│  │  │   interceptor1.interceptModel(request, ─►                                │ ││
│  │  │       interceptor2.interceptModel(request, ─►                            │ ││
│  │  │           interceptor3.interceptModel(request, ─►                        │ ││
│  │  │               ChatModel.call()  ◄── 实际模型调用                          │ ││
│  │  │           ) ◄─ response                                                   │ ││
│  │  │       ) ◄─ response                                                       │ ││
│  │  │   ) ◄─ response                                                           │ ││
│  │  │                                                                           │ ││
│  │  └───────────────────────────────────────────────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────────────────────────┘│
│    │                                                                                 │
│    ▼                                                                                 │
│  ┌─────────────────────────────────────┐                                            │
│  │  Hook: afterModel()                 │  ◄── Hook 节点                             │
│  │  (作为独立节点执行)                  │                                            │
│  └─────────────────────────────────────┘                                            │
│    │                                                                                 │
│    ▼                                                                                 │
│  END                                                                                 │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## 章节总结

Hooks 和 Interceptors 提供了强大的机制来控制和自定义 Agent 的执行流程：

- Hooks: 在 Agent 执行的关键点插入自定义逻辑（before/after）；
- Interceptors: 拦截和修改模型调用和工具执行；
- 灵活组合: 可以组合多个 Hooks 和 Interceptors；
- 执行顺序: 理解执行顺序对于构建正确的功能至关重要；
- 跳转控制: 支持提前退出和条件跳转。

通过合理使用扩展机制，可以构建更具有监控，安全，性能优化等特性的智能 Agent。满足生产场景中的各种需求。