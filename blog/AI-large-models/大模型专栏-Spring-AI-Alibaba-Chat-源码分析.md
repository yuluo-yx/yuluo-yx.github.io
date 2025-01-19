---
slug: LLMs-AI-Spring-AI-Alibaba-chat-source
title: 大模型专栏--Spring AI Alibaba Chat 源码分析
date: 2024-12-08 21:24:56
authors: yuluo
tags: [AI, Spring AI Alibabe, chat]
keywords: [AI, Spring AI Aliabab, chat source]
---

<!-- truncate -->

Chat 功能是 LLMs 应用的最基础功能，任何功能都要向 LLMs 应用给输入，之后将获得 LLMs 的返回。其底层是 NLP 的实现。这篇文章中不会分析 LLMs 的底层实现，会分析一波 Spring AI Albaba 的 Chat 功能实现和 Spring AI 提供的 Chat 接口实现。

## Spring AI Chat 接口定义

从之前的 Spring AI Alibaba 使用示例中，我们可以看到，Spring AI 提供了两种 Chat Model 的实现，一种是比较低级的 ChatModel API，一种是高级的 ChatClient API。

其两者的区别是：ChatModel 是针对于各个模型的客户端，而 ChatClient 是屏蔽底层模型差异性的客户端接口，基于 ChatClient，Spring AI 提供了强大的 Advisors 机制来扩展功能。Advisors API 的实现类似于 Spring 的 AOP，应用了 AOP 的编程思想。

### ChatModel API

下面以 Spring AI Alibaba 的 DashScope ChatModel 为例来了解一下 ChatModel 的源码设计。

![ChatModel](/img/ai/ai-10.png)

从 IDEA 生成的关系图来看：DashScopeChatModel 继承了 AbstractToolCallSupport 实现了 ChatModel 接口。其中 AbstractToolCallSupport 实现了 工具函数调用的 抽象逻辑，ChatModel 提供了 call() 和 stream() 方法，用来和 LLMs 进行交互。从四个维度来理解一下 ChatModel 做的事情：

1. Options，模型配置参数的处理；
2. call 和 stream 的调用；
3. Function 处理；
4. 可观测处理。

#### Options 处理

在 Spring AI 中，将大模型的一些参数抽象成了 Options 的概念，其类结构如下图：

![DashScopeChatOptions](/img/ai/ai-11.png)

在 Spring AI Alibaba 中，对 ChatOptions 的参数支持在 application.yml 中指定，也支持在代码中通过 DashScopeChatOptions 提供的 Builder 方法进行构建：

在 Spring AI Alibaba DascopeChatModel#createRequest 方法中：

```java
DashScopeChatOptions options = DashScopeChatOptions.builder().build();
if (prompt.getOptions() != null) {
    DashScopeChatOptions updatedRuntimeOptions = ModelOptionsUtils.copyToTarget(prompt.getOptions(),
          ChatOptions.class, DashScopeChatOptions.class);

    enabledToolsToUse.addAll(this.runtimeFunctionCallbackConfigurations(updatedRuntimeOptions));
    options = ModelOptionsUtils.merge(updatedRuntimeOptions, options, DashScopeChatOptions.class);
}

if (!CollectionUtils.isEmpty(this.defaultOptions.getFunctions())) {
    enabledToolsToUse.addAll(this.defaultOptions.getFunctions());
}

options = ModelOptionsUtils.merge(options, this.defaultOptions, DashScopeChatOptions.class);

if (!CollectionUtils.isEmpty(enabledToolsToUse)) {
    options.setTools(this.getFunctionTools(enabledToolsToUse));
}
```

对 模型调用参数进行了一系列的 merge 操作。以通过代码设置的 options 为准，其次是以 application.yml 中配置的 options 参数。也就是说，通过代码设置的参数优先级高于配置文件。

#### Call 和 Stream 方法

> 在之前的版本中，Spring AI Alibaba 通过 SDK 来适配通义大模型，现在都使用 openapi 规范的接口去调用大模型。

在 ChatModel 中，定义了 Call 和 Stream 方法，用来调用大模型，前者是朴素的调用方式，后者是流式调用。

在 Model 接口中定义了 Call 方法：

```java
public interface Model<TReq extends ModelRequest<?>, TRes extends ModelResponse<?>> {

 TRes call(TReq request);
}
```

在 StreamingModel 中定义了 stream 方法：

```java
public interface StreamingModel<TReq extends ModelRequest<?>, TResChunk extends ModelResponse<?>> {

 Flux<TResChunk> stream(TReq request);
}
```

通过代码可以看到在默认的 ChatModel 中组合了 Model 和 StreamingModel：

```java
public interface ChatModel extends Model<Prompt, ChatResponse>, StreamingChatModel {

    @Override
    ChatResponse call(Prompt prompt);

    ChatOptions getDefaultOptions();

    default Flux<ChatResponse> stream(Prompt prompt) {
       throw new UnsupportedOperationException("streaming is not supported");
    }
}
```

有了接口，且适配了不同模型之后，通过 createRequest 构造一个 DashScopeApi#ChatCompletionRequest 的 request 对象，用于发起调用：（）其中包含对 options 参数的处理和对 function 的处理）

```java
# 构建请求参数
DashScopeApi.ChatCompletionRequest request = createRequest(prompt, false);

# 调用 LLMs API
ResponseEntity<ChatCompletion> completionEntity = this.retryTemplate
    .execute(ctx -> this.dashscopeApi.chatCompletionEntity(request));

# 准备接受 LLMs 响应
var chatCompletion = completionEntity.getBody();
```

在对 stream 方法的调用中，和 call 相同，细心的同学们，肯定发现了 createRequest 方法有两个参数，第一个是 prompt，第二个就是决定此次请求是否是流式调用：

```java
ChatCompletionRequest request = createRequest(prompt, true);
```

继而，再去调用 dashScopeApi 的 chatCompletionStream 方法完成请求。最后接受响应。

至此我们已经完成了对 call 和 stream 请求方式的解析，从源码实现上非常简单。现在来分析一下 Spring AI 中定义的用来接受模型响应的类 ChatResponse：

![ChatResponse](/img/ai/ai-12.png)

其中元数据接口专注于提供 AI 模型生成结果的更多背景信息和见解。它可能包括计算时间、模型版本和 Usage 等其他相关详细信息，以增强对各种应用中的 AI 模型输出的理解和管理。

Generation 类是一个记录 AI 返回信息的实体类。有两个类成员：一个为 ChatGenerationMetadata，一个是 AssistantMessage。

其中 AssistantMessage 是让 LLMs 知晓此类型的消息类型是作为用户响应生成的。实现了 Message 和 Content 类型：类图如下：

![AbstractMessage](/img/ai/ai-13.png)

我们可以看到有四种类型的实现，这里我们不讨论实现，后续文章会介绍。

至此便是整个 Spring AI 的 ChatReponse 的源码实现，可以看到 Spring AI 定义了一系列的接口来约束实现类的行为。使得整个 Spring AI 体系逻辑更加严密。

#### Function 处理

在 LLMs 中为了解决实时性的问题，提供了函数调用的方式，可以调用外部的一些工具函数来补充自身知识，给用户正确的响应。在 Spring AI 中也提供了对函数调用的集成。

下面以 DashScope 的 ChatModel 中的 Function 实现来分析一波具体的实现。在 IDEA 中关系图如下：

![Spring AI Alibaba Function](/img/ai/ai-14.png)

我们可以看到 Spring AI 主要通过 AbstractToolCallSupport 这个抽象类来完成整个函数调用的工具链抽象。通过构造组合相关的类，其中类说明如下：

1. AbstractToolCallSupport：（此类已经经过好几轮迭代，不知道后续会不会在变动，之前的名字是 AbstractFunctionCallSupport）其中维护一组 Map 集合的 FunctionCallback 对象，提供用于处理函数回调和运行函数的功能；

2. FunctionCallback：接口实现，内部定义了一个 Function 必须要的一些属性和方法，如 Name，Desc 等；

   ```java
   public interface FunctionCallback {
       String getName();
       String getDescription();
       String getInputTypeSchema();
       String call(String functionInput);
   }
   ```

3. FunctionCallbackContext：实现 Spring 的 ApplicationContextAware 接口，从 Spring context 中获取 Function Bean；

4. AbstractFunctionCallback：承上启下，对大模型需要转换为大模型需要的函数调用协议，对于3rd，需要包装调用第三方服务或者函数。在使用上对该类是无感知的；

5. FunctionCallbackWrapper：将输出转换为模型可以使用的格式，默认实现是将输出发送给模型之前将其转换为字符串。可以提供一个自定义的函数`responseConverter`实现来覆盖此操作。

此小节中，将从以下几个方面来分析：

1. 函数是如何定义以及如何被 LLMs 感知到的？
2. Spring AI 在调用 LLMs 时对 Function 做了那些处理？
3. 一个完整的 Function 调用流程。

##### 1. Function 定义和 LLMs 感知

通过上面的类说明，可以知道 Spring AI 的 Function Bean 通过 Spring 提供的 IOC 机制来发现和注册 Function，在 FunctionCallbackContext 中：

```java
public FunctionCallback getFunctionCallback(@NonNull String beanName, @Nullable String defaultDescription) {
        Type beanType = FunctionContextUtils.findType(this.applicationContext.getBeanFactory(), new String[]{beanName});
        if (beanType == null) {
            throw new IllegalArgumentException("Functional bean with name: " + beanName + " does not exist in the context.");
        } else if (!Function.class.isAssignableFrom(FunctionTypeUtils.getRawType(beanType)) && !BiFunction.class.isAssignableFrom(FunctionTypeUtils.getRawType(beanType))) {
            throw new IllegalArgumentException("Function call Bean must be of type Function or BiFunction. Found: " + beanType.getTypeName());
        } else {
            Type functionInputType = TypeResolverHelper.getFunctionArgumentType(beanType, 0);
            Class<?> functionInputClass = FunctionTypeUtils.getRawType(functionInputType);
            String functionDescription = defaultDescription;
            if (!StringUtils.hasText(defaultDescription)) {
                Description descriptionAnnotation = (Description)this.applicationContext.findAnnotationOnBean(beanName, Description.class);
                if (descriptionAnnotation != null) {
                    functionDescription = descriptionAnnotation.value();
                }

                if (!StringUtils.hasText(functionDescription)) {
                    JsonClassDescription jsonClassDescriptionAnnotation = (JsonClassDescription)functionInputClass.getAnnotation(JsonClassDescription.class);
                    if (jsonClassDescriptionAnnotation != null) {
                        functionDescription = jsonClassDescriptionAnnotation.value();
                    }
                }

                if (!StringUtils.hasText(functionDescription)) {
                    throw new IllegalStateException("Could not determine function description.Please provide a description either as a default parameter, via @Description annotation on the bean or @JsonClassDescription annotation on the input class.");
                }
            }

            Object bean = this.applicationContext.getBean(beanName);
            if (bean instanceof Function) {
                Function<?, ?> function = (Function)bean;
                return FunctionCallbackWrapper.builder(function).withName(beanName).withSchemaType(this.schemaType).withDescription(functionDescription).withInputType(functionInputClass).build();
            } else if (bean instanceof BiFunction) {
                BiFunction<?, ?, ?> biFunction = (BiFunction)bean;
                return FunctionCallbackWrapper.builder(biFunction).withName(beanName).withSchemaType(this.schemaType).withDescription(functionDescription).withInputType(functionInputClass).build();
            } else {
                throw new IllegalArgumentException("Bean must be of type Function");
            }
        }
    }
```

可以看到：

1. 先通过 FunctionContextUtils.findType() 获取 bean 类型；
2. 检查 Bean 类型是否为 Function 或者 BiFunction 类型；
3. 获取 Function 参数类型并转换为对应的 Bean 类型；
4. 获取函数描述：如果 `defaultDescription` 为空，尝试从 bean 的注解（如 `@Description` 或 `@JsonClassDescription`）获取描述。找不到描述，则抛出 `IllegalStateException`。
5. 获取 Bean 创建 FunctionCallbackWrapper 对象。

至此，便有了一个包装的 FunctionCallbackWrapper 实例对象，在 DashScopeChatModel#createRequest() 整合 Function 信息，

```java
List<ChatCompletionMessage> chatCompletionMessages = prompt.getInstructions().stream().map(message -> {
    if (message.getMessageType() == MessageType.USER || message.getMessageType() == MessageType.SYSTEM) {
        Object content = message.getContent();
        if (message instanceof UserMessage userMessage) {
            if (!CollectionUtils.isEmpty(userMessage.getMedia())) {
                content = convertMediaContent(userMessage);
            }
        }

        return List.of(new ChatCompletionMessage(content,
                ChatCompletionMessage.Role.valueOf(message.getMessageType().name())));
    }
    else if (message.getMessageType() == MessageType.ASSISTANT) {
        var assistantMessage = (AssistantMessage) message;
        List<ToolCall> toolCalls = null;
        if (!CollectionUtils.isEmpty(assistantMessage.getToolCalls())) {
            toolCalls = assistantMessage.getToolCalls().stream().map(toolCall -> {
                var function = new ChatCompletionFunction(toolCall.name(), toolCall.arguments());
                return new ToolCall(toolCall.id(), toolCall.type(), function);
            }).toList();
        }
        return List.of(new ChatCompletionMessage(assistantMessage.getContent(),
                ChatCompletionMessage.Role.ASSISTANT, null, null, toolCalls));
    }
    else if (message.getMessageType() == MessageType.TOOL) {
        ToolResponseMessage toolMessage = (ToolResponseMessage) message;

        toolMessage.getResponses().forEach(response -> {
            Assert.isTrue(response.id() != null, "ToolResponseMessage must have an id");
            Assert.isTrue(response.name() != null, "ToolResponseMessage must have a name");
        });

        return toolMessage.getResponses()
            .stream()
            .map(tr -> new ChatCompletionMessage(tr.responseData(), ChatCompletionMessage.Role.TOOL, tr.name(),
                    tr.id(), null))
            .toList();
    }
    else {
        throw new IllegalArgumentException("Unsupported message type: " + message.getMessageType());
    }
}).flatMap(List::stream).toList();
```

之后传给 LLMs，在 LLMs 判断需要调用函数的时候给 Spring AI 发送信号，完成调用。

##### 2. Spring AI Functions

上面我们已经基本分析完成了 Function 的大部分能力。接下来分析以下在 Spring AI 中是如何调用 Function ，以及 LLMs 给了 Spring AI 什么信号来调用 Function。我们来分析一波 DashScopeChatModel#call() 方法可以看到如下的代码，Spring AI 会根据 `finishReason` 来判断是否需要执行函数。具体代码如下：

```java
# DashScopeChatModel.java

if (isToolCall(chatResponse,
               Set.of(ChatCompletionFinishReason.TOOL_CALLS.name(), ChatCompletionFinishReason.STOP.name()))) {
    var toolCallConversation = handleToolCalls(prompt, chatResponse);
    // Recursively call the call method with the tool call message
    // conversation that contains the call responses.
    return this.call(new Prompt(toolCallConversation, prompt.getOptions()));
}

return chatResponse;

# AbstractToolCallSupport.java

protected boolean isToolCall(ChatResponse chatResponse, Set<String> toolCallFinishReasons) {
    Assert.isTrue(!CollectionUtils.isEmpty(toolCallFinishReasons), "Tool call finish reasons cannot be empty!");
    if (chatResponse == null) {
        return false;
    } else {
        List<Generation> generations = chatResponse.getResults();
        return CollectionUtils.isEmpty(generations) ? false : generations.stream().anyMatch((g) -> {
            return this.isToolCall(g, toolCallFinishReasons);
        });
    }
}

protected boolean isToolCall(Generation generation, Set<String> toolCallFinishReasons) {
    String finishReason = generation.getMetadata().getFinishReason() != null ? generation.getMetadata().getFinishReason() : "";
    return generation.getOutput().hasToolCalls() && toolCallFinishReasons.stream().map((s) -> {
        return s.toLowerCase();
    }).toList().contains(finishReason.toLowerCase());
}
```

在判断完成，如下需要调用函数，则会执行 AbstractToolCallSupport 中的 handleToolCalls 方法：

```java
 AssistantMessage assistantMessage = ((Generation)toolCallGeneration.get()).getOutput();
    Map<String, Object> toolContextMap = Map.of();
    ChatOptions var7 = prompt.getOptions();
    if (var7 instanceof FunctionCallingOptions) {
        FunctionCallingOptions functionCallOptions = (FunctionCallingOptions)var7;
        if (!CollectionUtils.isEmpty(functionCallOptions.getToolContext())) {
            toolContextMap = functionCallOptions.getToolContext();
        }
    }

    ToolResponseMessage toolMessageResponse = this.executeFunctions(assistantMessage, new ToolContext(toolContextMap));
    return this.buildToolCallConversation(prompt.getInstructions(), assistantMessage, toolMessageResponse);
```

最后执行完成将结果返回。

##### 3. Function Call Debug

经过上面的代码分析我们搞清楚了代码编写，不过纸上看来终觉浅。现在我们来 debug 一波看看怎么个事。

直接使用 Spring Al Alibaba 中的 function-calling-example：

MockWeatherService Function 如下：

```java
public class MockWeatherService implements Function<MockWeatherService.Request, Response> {

    @Override
    public Response apply(Request request) {
        if (request.city().contains("杭州")) {
            return new Response(String.format("%s%s晴转多云, 气温32摄氏度。", request.date(), request.city()));
        }
        else if (request.city().contains("上海")) {
            return new Response(String.format("%s%s多云转阴, 气温31摄氏度。", request.date(), request.city()));
        }
        else {
            return new Response(String.format("暂时无法查询%s的天气状况。", request.city()));
        }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonClassDescription("根据日期和城市查询天气")
    public record Request(
            @JsonProperty(required = true, value = "city") @JsonPropertyDescription("城市, 比如杭州") String city,
            @JsonProperty(required = true, value = "date") @JsonPropertyDescription("日期, 比如2024-08-22") String date) {
    }

}
```

controller 代码如下，构造一个带有 Function 描述的 prompt：

```java
@GetMapping("/weather-service")
public String weatherService(String subject) {
    return chatClient.prompt()
            .function("getWeather", "根据城市查询天气", new MockWeatherService())
            .user(subject)
            .call()
            .content();
}
```

> Tips:  Spring AI Function 提供多种 Function 使用的方式，通过在 prompt 的 function 参数指定或是通直接使用 @Bean 指定都可以达到使用目的，不必拘泥于形式。

我们先从 call 的 FunctionCallbackContext#call() 方法开始打断点：

![image-20241208195709304](/img/ai/ai-15.png)

可以看到 function 信息已经在 chatOptions 对象中，带有 Function 描述等信息，接着往下可以看到第一次的 finishResaon 为 `TOOL_CALLS`，接下来 Spring AI 便会去执行函数

![image-20241208195934104](/img/ai/ai-16.png)

在 AbstractToolCallSupport#executeFunctions() 打断点如下：便可看到 Function 执行的结果：

![image-20241208200708564](/img/ai/ai-17.png)

当继续往下执行时，便会看到 finishReason 的数据为 `STOP`：

![image-20241208201015609](/img/ai/ai-18.png)

至此，便完成了 Function 的调用。

##### 4. 总结

可以看到 Function 是一个非常强大的功能，可以弥补 LLMs 实时数据的缺陷性，给用户更好的回答。Spring AI 为我们提供了一套完整的 Function 解决方案。

#### 可观测

可观测一直是行业内的重点话题，通过应用的各项指标，可以反映应用的健康状态，应用流量等。

在 LLMs 的可观测应用中，可以看到 Token 的使用，每次的 Message 消息，耗时等。来帮助 LLMs 的开发者更好的调试 LLMs 应用的参数设置，来让应用提供最准确的回答。

Spring AI 的可观测通过记录每次的 prompt 和一些元数据参数以及模型返回来达到可观测的目的：

```java
ChatModelObservationContext observationContext = ChatModelObservationContext.builder()
    .prompt(prompt)
    .provider(AiProvider.DASHSCOPE.value())
    .requestOptions(prompt.getOptions() != null ? prompt.getOptions() : this.defaultOptions)
    .build();

ChatResponse chatResponse = ChatModelObservationDocumentation.CHAT_MODEL_OPERATION
    .observation(this.observationConvention, DEFAULT_OBSERVATION_CONVENTION, () -> observationContext,
            this.observationRegistry)
    .observe(() -> {
        DashScopeApi.ChatCompletionRequest request = createRequest(prompt, false);

        ResponseEntity<ChatCompletion> completionEntity = this.retryTemplate
            .execute(ctx -> this.dashscopeApi.chatCompletionEntity(request));

        var chatCompletion = completionEntity.getBody();

        if (chatCompletion == null) {
            logger.warn("No chat completion returned for prompt: {}", prompt);
            return new ChatResponse(List.of());
        }

        List<ChatCompletionOutput.Choice> choices = chatCompletion.output().choices();

        List<Generation> generations = choices.stream().map(choice -> {
    // @formatter:off
                Map<String, Object> metadata = Map.of(
                        "id", chatCompletion.requestId(),
                        "role", choice.message().role() != null ? choice.message().role().name() : "",
                        "finishReason", choice.finishReason() != null ? choice.finishReason().name() : "");
                // @formatter:on
            return buildGeneration(choice, metadata);
        }).toList();

        ChatResponse response = new ChatResponse(generations, from(completionEntity.getBody()));

        observationContext.setResponse(response);

        return response;
    });
```

### ChatClient API

ChatClient 不针对特定的 LLMs 提供商，是一个比 ChatModel 更高级的 API。为 LLMs  提供直接入口，其通过 ChatModel 构建而来：

```java
private final ChatClient chatClient;

private final ChatModel chatModel;

public AIController(ChatClient.Builder builder, ChatModel chatModel) {

    this.chatModel = chatModel;
    this.chatClient = ChatClient.builder(chatModel)
        .defaultAdvisors(
        new MessageChatMemoryAdvisor(new InMemoryChatMemory())
    ).build();
}
```

Spring AI 基于 ChatClient API，提供了一系列的 Advisor API，用来增强 ChatClient 的能力，其内部实现和 Spring AOP 同理。

主要功能有：

- 聊天记忆
- 检索增强生成
- 日志记录等

官网文档地址：https://docs.spring.io/spring-ai/reference/api/chatclient.html
