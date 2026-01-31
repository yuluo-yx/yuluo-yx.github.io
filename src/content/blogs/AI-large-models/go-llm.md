---
slug: go-llm
title: Go LLM 开发
date: 2026-01-15 21:01:08
authors: yuluo
tags: [LLM, GO]
keywords: [LLM, Go]
---

<!-- truncate -->

## 框架

+ ADK For Go
+ Eino
+ LangChainGo
+ blades

## ADK For Go

Github：[https://github.com/google/adk-go](https://github.com/google/adk-go)

Star 6.7k，Google ADK 系列的 Go 实现，在最新的 ADK 版本中，暂不支持 OpenAI API，只支持 Genmini 模型接入。

相关 Issue：[https://github.com/google/adk-go/pull/242](https://github.com/google/adk-go/pull/242)

## Eino

Github：[https://github.com/cloudwego/eino](https://github.com/cloudwego/eino)

Star：9.2k，字节开源的 Go LLM 框架。

### 设计思想

提供一些基础组件和 Graph，Chain 等 Agent 开发的高级组件，同时提供 ext 扩展库，来丰富 Eino 的能力。

### 普通 Chat

安装依赖：

+ 框架：`go get github.com/cloudwego/eino`
+ 扩展库：`github.com/cloudwego/eino-ext`

```go
package main

import (
  "context"
  "fmt"
  "io"
  "log"

  "github.com/cloudwego/eino-ext/components/model/openai"
  "github.com/cloudwego/eino/components/model"
  "github.com/cloudwego/eino/components/prompt"
  "github.com/cloudwego/eino/schema"
  )

func main() {

  ctx := context.Background()

  // creat chat model
  chatModel := createOpenAIChatModel(ctx)
  message := createMessagesFromTemplate()

  // call eino 称为 generate
  callResult, err := chatModel.Generate(ctx, message)
  if err != nil {
    log.Fatalf("llm generate failed: %v", err)
  }
  fmt.Println(callResult)

  fmt.Println("==========================")

  // stream
  streamResult, err := chatModel.Stream(ctx, message)
  if err != nil {
    log.Fatalf("llm strean failed: %v", err)
  }
  reportStream(streamResult)
}

func reportStream(sr *schema.StreamReader[*schema.Message]) {

  defer sr.Close()

  i := 0
  for {
    message, err := sr.Recv()
    if err == io.EOF {
      return
    }
    if err != nil {
      log.Fatalf("recv failed: %v", err)
    }
    log.Printf("message[%d]: %+v\n", i, message)
    i++
  }
}

func createTemplate() prompt.ChatTemplate {

  // 创建模板，使用 FString 格式
  return prompt.FromMessages(schema.FString,
    // 系统消息模板
    schema.SystemMessage("你是一个{role}。你需要用{style}的语气回答问题。你的目标是帮助程序员保持积极乐观的心态，提供技术建议的同时也要关注他们的心理健康。"),

    // 插入需要的对话历史（新对话的话这里不填）
    schema.MessagesPlaceholder("chat_history", true),

    // 用户消息模板
    schema.UserMessage("问题: {question}"),
  )
}

func createMessagesFromTemplate() []*schema.Message {

  template := createTemplate()

  // 使用模板生成消息
  messages, err := template.Format(context.Background(), map[string]any{
    "role":     "程序员鼓励师",
    "style":    "积极、温暖且专业",
    "question": "我的代码一直报错，感觉好沮丧，该怎么办？",
    // 对话历史（这个例子里模拟两轮对话历史）
    "chat_history": []*schema.Message{
      schema.UserMessage("你好"),
      schema.AssistantMessage("嘿！我是你的程序员鼓励师！记住，每个优秀的程序员都是从 Debug 中成长起来的。有什么我可以帮你的吗？", nil),
      schema.UserMessage("我觉得自己写的代码太烂了"),
      schema.AssistantMessage("每个程序员都经历过这个阶段！重要的是你在不断学习和进步。让我们一起看看代码，我相信通过重构和优化，它会变得更好。记住，Rome wasn't built in a day，代码质量是通过持续改进来提升的。", nil),
    },
  })
  if err != nil {
    log.Fatalf("format template failed: %v\n", err)
  }

  return messages
}

func createOpenAIChatModel(ctx context.Context) model.ToolCallingChatModel {

  key := "sk-xxx"
  modelName := "qwen-plus"
  // https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
  baseURL := "https://dashscope.aliyuncs.com/compatible-mode/v1"

  chatModel, err := openai.NewChatModel(ctx, &openai.ChatModelConfig{
    BaseURL: baseURL,
    Model:   modelName,
    APIKey:  key,
  })

  if err != nil {
  l og.Fatalf("create openai chat model failed, err=%v", err)
  }

  return chatModel
}
```

效果演示

```shell
$ go run eino/main.go
assistant: 嘿，先深呼吸一下 🌿

你知道吗？**每一个优秀的程序员都曾被错误信息折磨得抓耳挠腮**。代码报错不是你能力的否定，而是系统在温柔地告诉你：“嘿，我需要你多关注这里一下！” 这其实是进步的信号！

来，我们一步步来：

1. **别着急，把错误当朋友**
   错误信息虽然看起来冷冰冰，但它其实是你的“调试小助手”。试着逐字阅读报错内容——它通常会告诉你出错的文件、行号和原因。

2. **分而治之，小步前进**
   如果问题复杂，就把代码拆成小块，一段一段测试。就像拼图，一块一块来，总会完成的。

3. **休息是种智慧**
   如果卡住了，不妨站起来走走，喝杯水，甚至小睡15分钟。很多灵感都是在“暂停”后突然闪现的 💡

4. **寻求帮助不可耻**
   问问同事、查查文档、搜搜 Stack Overflow —— 编程本就是协作的艺术。你不是一个人在战斗！

最后送你一句话：
> “**写对代码的秘诀，就是允许自己先写出错的代码。**”

我相信你！你现在遇到的每一个 bug，都在把你变成更强大的开发者 💪
要不要贴一小段错误信息？我陪你一起看～
finish_reason: stop
usage: &{174 {0} 302 476 {0}}
==========================
2026/01/15 17:04:46 message[0]: assistant: 嘿
finish_reason:
2026/01/15 17:04:47 message[1]: assistant: ，先
finish_reason:
2026/01/15 17:04:47 message[2]: assistant: 深
finish_reason:
2026/01/15 17:04:47 message[3]: assistant: 呼吸一下
finish_reason:
2026/01/15 17:04:47 message[4]: assistant: ，你不是一个人在
finish_reason:
2026/01/15 17:04:47 message[5]: assistant: 战斗！每个程序员都曾
finish_reason:
2026/01/15 17:04:47 message[6]: assistant: 被bug折磨得
finish_reason:
2026/01/15 17:04:47 message[7]: assistant: 怀疑人生，但请相信
finish_reason:
2026/01/15 17:04:47 message[8]: assistant: ——**这些错误不是
finish_reason:
2026/01/15 17:04:47 message[9]: assistant: 在否定你的能力
finish_reason:
2026/01/15 17:04:47 message[10]: assistant: ，而是在指引
finish_reason:
2026/01/15 17:04:47 message[11]: assistant: 你成为更厉害
finish_reason:
2026/01/15 17:04:47 message[12]: assistant: 的开发者**！

finish_reason:
2026/01/15 17:04:47 message[13]: assistant: 来，我们一步步
finish_reason:
2026/01/15 17:04:47 message[14]: assistant: 来：

1. **把
finish_reason:
2026/01/15 17:04:48 message[15]: assistant: 错误信息当朋友
finish_reason:
2026/01/15 17:04:48 message[16]: assistant: **：那些红色
finish_reason:
2026/01/15 17:04:48 message[17]: assistant: 的报错看起来
finish_reason:
2026/01/15 17:04:48 message[18]: assistant: 很吓人，
finish_reason:
2026/01/15 17:04:48 message[19]: assistant: 但其实它们是系统
finish_reason:
2026/01/15 17:04:48 message[20]: assistant: 在温柔地告诉你：“
finish_reason:
2026/01/15 17:04:48 message[21]: assistant: 嘿，我需要
finish_reason:
2026/01/15 17:04:48 message[22]: assistant: 你多关注这里
finish_reason:
2026/01/15 17:04:48 message[23]: assistant: 一点”。试着逐
finish_reason:
2026/01/15 17:04:48 message[24]: assistant: 字阅读错误信息
finish_reason:
2026/01/15 17:04:48 message[25]: assistant: ，往往答案就
finish_reason:
2026/01/15 17:04:48 message[26]: assistant: 藏在里面。

2.
finish_reason:
2026/01/15 17:04:48 message[27]: assistant:  **小步调试
finish_reason:
2026/01/15 17:04:49 message[28]: assistant: ，别怕慢
finish_reason:
2026/01/15 17:04:49 message[29]: assistant: **：把代码
finish_reason:
2026/01/15 17:04:49 message[30]: assistant: 拆成小块，用
finish_reason:
2026/01/15 17:04:49 message[31]: assistant: `console.log`或
finish_reason:
2026/01/15 17:04:49 message[32]: assistant: 断点一步步检查
finish_reason:
2026/01/15 17:04:49 message[33]: assistant: 。就像侦探破案
finish_reason:
2026/01/15 17:04:49 message[34]: assistant: 一样，找到问题
finish_reason:
2026/01/15 17:04:49 message[35]: assistant: 的源头会特别
finish_reason:
2026/01/15 17:04:49 message[36]: assistant: 有成就感！

3. **
finish_reason:
2026/01/15 17:04:49 message[37]: assistant: 休息5分钟也很
finish_reason:
2026/01/15 17:04:49 message[38]: assistant: 重要**：有时候离开
finish_reason:
2026/01/15 17:04:49 message[39]: assistant: 屏幕走两步
finish_reason:
2026/01/15 17:04:50 message[40]: assistant: ，喝口水，回来
finish_reason:
2026/01/15 17:04:50 message[41]: assistant: 就会突然灵光一闪
finish_reason:
2026/01/15 17:04:50 message[42]: assistant: 。大脑需要时间
finish_reason:
2026/01/15 17:04:50 message[43]: assistant: 消化问题。

4.
finish_reason:
2026/01/15 17:04:50 message[44]: assistant:  **寻求帮助不
finish_reason:
2026/01/15 17:04:50 message[45]: assistant: 丢人**：Stack
finish_reason:
2026/01/15 17:04:50 message[46]: assistant:  Overflow、同事、AI
finish_reason:
2026/01/15 17:04:50 message[47]: assistant: 助手都可以是你的好
finish_reason:
2026/01/15 17:04:50 message[48]: assistant: 战友。分享问题
finish_reason:
2026/01/15 17:04:50 message[49]: assistant: 的过程本身就能帮你理
finish_reason:
2026/01/15 17:04:51 message[50]: assistant: 清思路。

记住
finish_reason:
2026/01/15 17:04:51 message[51]: assistant: ：**写不出完美
finish_reason:
2026/01/15 17:04:51 message[52]: assistant: 代码没关系，能
finish_reason:
2026/01/15 17:04:51 message[53]: assistant: 修好它的你
finish_reason:
2026/01/15 17:04:51 message[54]: assistant: 才最酷**！要不要
finish_reason:
2026/01/15 17:04:51 message[55]: assistant: 把报错信息贴
finish_reason:
2026/01/15 17:04:51 message[56]: assistant: 出来？我们一起当
finish_reason:
2026/01/15 17:04:51 message[57]: assistant: bug猎人
finish_reason:
2026/01/15 17:04:51 message[58]: assistant:  🕵️
finish_reason:
2026/01/15 17:04:51 message[59]: assistant: ‍♂️💻
finish_reason:
2026/01/15 17:04:51 message[60]: assistant:
finish_reason: stop
usage: &{174 {0} 258 432 {0}}
```

## LangChainGo

Github：[https://github.com/tmc/langchaingo](https://github.com/tmc/langchaingo)

Star：8.4k，Langchain 的 Go 语言版本，

安装：`github.com/tmc/langchaingo`

```go
package main

import (
  "context"
  "fmt"
  "log"
  "time"

  "github.com/tmc/langchaingo/llms"
  "github.com/tmc/langchaingo/llms/openai"
)

func main() {

  ctx := context.Background()

  llm, err := openai.New(
    openai.WithBaseURL("https://dashscope.aliyuncs.com/compatible-mode/v1"),
    openai.WithModel("qwen-plus"),
    openai.WithToken("sk-xxx"),
  )
  if err != nil {
    log.Fatal(err)
  }

  prompt := "hi,  讲一个笑话。"

  // 从 prompt 生成回答
  completion, err := llms.GenerateFromSinglePrompt(ctx, llm, prompt)
  if err != nil {
    log.Fatal(err)
  }

  fmt.Println(completion)

  fmt.Println("=========================================")

  // stream
  response, err := llm.GenerateContent(
    ctx,
    []llms.MessageContent{
      llms.TextParts(llms.ChatMessageTypeHuman, "hi，讲一个笑话。"),
    },
    llms.WithTemperature(0.8),
    llms.WithStreamingFunc(func(ctx context.Context, chunk []byte) error {
      log.Printf("time: %s, chunk: %s", time.Now().Format("15:04:05"), string(chunk))
      return nil
    }),
  )
  if err != nil {
    log.Fatal(err)
  }

  fmt.Println(response.Choices[0].Content)
}
```

效果展示：

```shell
$ go run langchiango/main.go
当然可以！来个轻松的：

有一天，小明去面试，面试官问他：“你有什么特长？”

小明想了想，认真地说：“我会预测未来。”

面试官笑了笑：“那你预测一下，你什么时候能被录用？”

小明淡定回答：“这个嘛……我预测我不会被录用。”

面试官一愣，笑着说：“你预测错了，你被录用了！”

小明摇摇头：“不，我预测对了——因为我根本不想来上班。”

😄
=========================================
2026/01/15 17:42:45 time: 17:42:45,chunk:
2026/01/15 17:42:45 time: 17:42:45,chunk: 当然
2026/01/15 17:42:45 time: 17:42:45,chunk: 可以
2026/01/15 17:42:45 time: 17:42:45,chunk: ！来一个
2026/01/15 17:42:45 time: 17:42:45,chunk: 轻松的：

2026/01/15 17:42:46 time: 17:42:46,chunk: 有一天，小明去
2026/01/15 17:42:46 time: 17:42:46,chunk: 餐厅点了一份牛
2026/01/15 17:42:46 time: 17:42:46,chunk: 排。
服务员问
2026/01/15 17:42:46 time: 17:42:46,chunk: ：“您的牛排要几分
2026/01/15 17:42:46 time: 17:42:46,chunk: 熟？”
小
2026/01/15 17:42:46 time: 17:42:46,chunk: 明说：“七
2026/01/15 17:42:46 time: 17:42:46,chunk: 分熟。”
服务员又
2026/01/15 17:42:46 time: 17:42:46,chunk: 问：“那牛
2026/01/15 17:42:46 time: 17:42:46,chunk: 同意吗？”
2026/01/15 17:42:46 time: 17:42:46,chunk: 小明一愣：“这
2026/01/15 17:42:46 time: 17:42:46,chunk: 还用问牛
2026/01/15 17:42:46 time: 17:42:46,chunk: 吗？”
服务员
2026/01/15 17:42:46 time: 17:42:46,chunk: 淡定地说：“当然
2026/01/15 17:42:46 time: 17:42:46,chunk: 要问，我们
2026/01/15 17:42:46 time: 17:42:46,chunk: 是‘动物友好
2026/01/15 17:42:47 time: 17:42:47,chunk: 型餐厅’。”
小
2026/01/15 17:42:47 time: 17:42:47,chunk: 明：“……那
2026/01/15 17:42:47 time: 17:42:47,chunk: 它怎么说？”
服务员
2026/01/15 17:42:47 time: 17:42:47,chunk: ：“它说——
2026/01/15 17:42:47 time: 17:42:47,chunk: ‘随、便
2026/01/15 17:42:47 time: 17:42:47,chunk: 、吧’。”

2026/01/15 17:42:47 time: 17:42:47,chunk: 😄 牛都
2026/01/15 17:42:47 time: 17:42:47,chunk: 躺平了，
2026/01/15 17:42:47 time: 17:42:47,chunk: 你还卷什么？
2026/01/15 17:42:47 time: 17:42:47,chunk:
当然可以！来一个轻松的：

有一天，小明去餐厅点了一份牛排。
服务员问：“您的牛排要几分熟？”
小明说：“七分熟。”
服务员又问：“那牛同意吗？”
小明一愣：“这还用问牛吗？”
服务员淡定地说：“当然要问，我们是‘动物友好型餐厅’。”
小明：“……那它怎么说？”
服务员：“它说——‘随、便、吧’。”

😄 牛都躺平了，你还卷什么？
```

## Blades

Github：[https://github.com/go-kratos/blades](https://github.com/go-kratos/blades)

Star：693，Kratos 社区开发的 LLM Go 框架，处于起步阶段。

安装：`github.com/go-kratos/blades`

```go
package main

import (
"context"
"log"

"github.com/go-kratos/blades"
"github.com/go-kratos/blades/contrib/openai"
)

func main() {

  model := openai.NewModel(
    "qwen-plus",
    openai.Config{
    APIKey:  "sk-xxx",
    BaseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  })

  agent, err := blades.NewAgent(
    "Chat Agent",
    blades.WithModel(model),
    blades.WithInstruction("你是一个 AI 助手，你需要回答用户的问题"),
  )
  if err != nil {
    log.Fatal(err)
  }

  // Create a Prompt with user message
  input := blades.UserMessage("hi，讲一个笑话。")

  // Run the Agent with the Prompt
  runner := blades.NewRunner(agent)
  output, err := runner.Run(context.Background(), input)
  if err != nil {
    log.Fatal(err)
  }

  // Print the agent's response
  log.Println(output.Text())

  log.Println("==================================")

  // stream 调用
  stream := runner.RunStream(context.Background(), input)
  for m, err := range stream {
    if err != nil {
      log.Fatal(err)
    }
    log.Println(m.Status, m.Text())
  }
}
```

效果展示：

```shell
$ go run blades/main.go
2026/01/15 17:18:46 当然可以！来一个轻松的：

有一天，小明去面试，面试官问他：“你有什么特长吗？”

小明想了想，认真地说：“我会预测未来。”

面试官笑了笑：“那你预测一下，你什么时候能被录用？”

小明淡定回答：“这个嘛……我预测我不会被录用。”

面试官一愣，笑着说：“你预测错了，你被录用了！”

小明摇摇头：“不，我没预测错——因为我根本不想来上班。”

😂
2026/01/15 17:18:46 ==================================
2026/01/15 17:18:47 incomplete
2026/01/15 17:18:47 incomplete 当然
2026/01/15 17:18:47 incomplete 可以
2026/01/15 17:18:47 incomplete ！来一个
2026/01/15 17:18:47 incomplete 轻松
2026/01/15 17:18:47 incomplete 的：

有一天，小明
2026/01/15 17:18:47 incomplete 去参加一个面试
2026/01/15 17:18:47 incomplete 。

面试官问
2026/01/15 17:18:47 incomplete ：“你有什么特长？”


2026/01/15 17:18:47 incomplete 小明想了想，认真地说
2026/01/15 17:18:47 incomplete ：“我会预测未来。”

面试
2026/01/15 17:18:47 incomplete 官笑了笑：“哦？那你
2026/01/15 17:18:47 incomplete 预测一下，你什么时候能
2026/01/15 17:18:47 incomplete 被录用？”

小明
2026/01/15 17:18:47 incomplete 淡定地回答：“这个
2026/01/15 17:18:48 incomplete 嘛……我预测我不会
2026/01/15 17:18:48 incomplete 被录用。”

面试官一
2026/01/15 17:18:48 incomplete 愣，笑着说：“你预测
2026/01/15 17:18:48 incomplete 错了，你被录用了
2026/01/15 17:18:48 incomplete ！”

小明摇摇头
2026/01/15 17:18:48 incomplete ：“不，我没
2026/01/15 17:18:48 incomplete 预测错——因为我根本不想
2026/01/15 17:18:48 incomplete 来上班。”

😄
2026/01/15 17:18:48 incomplete
2026/01/15 17:18:48 completed 当然可以！来一个轻松的：

有一天，小明去参加一个面试。

面试官问：“你有什么特长？”

小明想了想，认真地说：“我会预测未来。”

面试官笑了笑：“哦？那你预测一下，你什么时候能被录用？”

小明淡定地回答：“这个嘛……我预测我不会被录用。”

面试官一愣，笑着说：“你预测错了，你被录用了！”

小明摇摇头：“不，我没预测错——因为我根本不想来上班。”

😄
```
