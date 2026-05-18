const e=`---
title: SAA ReactAgent 消息机制
description: 了解 Spring AI Alibaba Agent 框架中的消息（Messages）系统，包括消息类型、在 Agent 中的集成方式以及多模态支持
date: 2025-12-28
tags: [Spring AI Alibaba, ReactAgent, Messages, 多模态]
keywords: [Spring AI Alibaba, ReactAgent, Messages, UserMessage, AssistantMessage, SystemMessage, 多模态]
---

# 消息 (Messages)

消息（Messages）是 Agent 与模型交互的基本单元。它们不仅承载了对话的内容（文本、图片等），还包含了角色的元数据（是谁在说话，User 还是 Assistant？）。

Spring AI 定义了一套标准的消息接口，确保无论底层使用哪个模型提供商，开发者都能以统一的方式构建对话上下文。

## Messages 在 Agent 框架中的集成

> **Tips:** 此章节作为 Spring AI Alibaba Agent Framework 框架的基础部分，只介绍 Agent Framework 中如何使用 Messages，以及 Messages 如何集成到 Agent 框架中，关于 Spring AI 的 Messages 其他信息，请参阅 Spring AI Alibaba Basic 部分的 Message 章节。

Messages 作为 Agent 框架中与模型交互的核心组件，贯穿于 Agent 的各个环节。无论是系统提示（System Prompt）、用户输入（User Input），还是模型输出（Model Output），都以消息的形式进行传递和处理。

在 Agent 框架中，用户的输入全部封装成 UserMessage，LLM 模型的输出全部封装成 AssistantMessage，系统提示则封装成 SystemMessage，工具响应消息封装为 ToolResponseMessage。

通过这种方式，Agent 能够清晰地区分不同来源的消息，并根据角色的不同进行相应的处理。

\`\`\`java
public static void main(String[] args) throws GraphRunnerException {

    var systemMessages = SystemMessage.builder().text("你是一个 Dashscope AI 小助手，帮助回答用户问题！").build();

    ReactAgent dashScopeModels = ReactAgent.builder()
            .name("DashScopeReactAgentApp")
            .model(DashScopeChatModel.builder()
                    .dashScopeApi(DashScopeApi.builder()
                            .apiKey("sk-xxxx")
                            .build())
                    .defaultOptions(DashScopeChatOptions.builder()
                            .model(DashScopeModel.ChatModel.QWEN_PLUS.getName())
                            .build())
                    .build())
            .instruction("你是一个 Dashscope AI 小助手")
            .systemPrompt(systemMessages.getText())
            .build();

    // First conversation
    System.out.println("=== First Conversation ===");
    AssistantMessage message = dashScopeModels.call("hi, who are u?");
    System.out.println("Type of message: " + message.getClass().getName());
    System.out.println("Content: " + message.getText());

    // Two conversations
    System.out.println("=== Second Conversation ===");
    var userMessages = UserMessage.builder().text("what is dashscope?").build();
    System.out.println("Type of message: " + userMessages.getClass().getName());
    AssistantMessage message2 = dashScopeModels.call(userMessages);
    System.out.println("Type of message: " + message2.getClass().getName());
    System.out.println("Content: " + message2.getText());
}
\`\`\`

## 多模态集成

多模态性指的是处理不同形式数据的能力，如文本、音频、图像和视频。Spring AI Alibaba 包含这些数据的标准类型，可以跨提供商使用。

Spring AI 的 Messages 设计支持多模态内容（如图像、音频等）。通过扩展消息类型，开发者可以轻松地将多模态数据集成到对话中。`;export{e as default};
