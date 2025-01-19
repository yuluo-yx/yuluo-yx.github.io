---
title: 大模型专栏--Spring AI Chat Memory 源码分析
date: 2024-12-09 22:55:22
index_img: /img/ai/llm.jpg
banner_img: /img/ai/llm.jpg
tags:
- AI，LLM
categories:
- AI 专栏
---

LLM 模型本身是一个无状态的模型，没有临时记忆的能力。当发生如下场景时，就会产生错误回答：

```java
@RestController
@RequestMapping("/ai")
public class AIController {

    private final ChatClient chatClient;

    public AIController(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }


    @RequestMapping("/chat/{msg}")
    public String chat(@PathVariable String msg) {

        return this.chatClient.prompt(new Prompt(msg)).call().chatResponse().getResult().getOutput().getContent();
    }

}
```

启动项目，访问接口时会出现：

```shell
# 1
input：你好，我的名字叫牧生
output：你好，牧生！很高兴认识你。我叫通义千问，是阿里云开发的超大规模语言模型。我可以帮助你解答问题、提供信息或进行各种话题的讨论。有什么我可以帮到你的吗？

# 2
input：我叫什么名字
output：您没有告诉我您的名字，所以我无法直接回答。如果您愿意分享，可以告诉我您的名字是什么。
```

第二次调用 llm 发送 prompt，大模型无法记住第一轮的上下文，所以无法给出正确的答案。

要实现一个可以让大模型具有聊天记忆能力，根据之前的聊天信息进行回答，应该如何如何实现呢？

## 手动实现一个 Chat Memory

在实现之前，先了解下 Spring AI 的 Message 类型，确保塞到正确的 Message 类型中，避免出现错误。

![Message](/img/ai/ai-20.png)

其中：

- UserMessage：用户消息，指用户输入的 prompt；
- SystemMessage：系统限制性消息，通常用于指定 LLM 角色，一般只会设置一次；
- AssistantMessage：LLM 输出；
- FunctionMessage：函数调用时的消息。

为此，可以写出如下的代码：

```java
@RestController
@RequestMapping("/ai")
public class AIController {

	List<Message> historyMessage = new ArrayList<>();

	private final ChatClient chatClient;

	public AIController(ChatClient.Builder builder) {
		this.chatClient = builder.build();
	}


	@RequestMapping("/chat/{msg}")
	public String chat(@PathVariable String msg) {

		// 添加用户消息
		historyMessage.add(new UserMessage(msg));

		// 调用大模型时，传入 list
		AssistantMessage output = this.chatClient.prompt(new Prompt(historyMessage)).call().chatResponse().getResult().getOutput();

		// 添加模型消息
		historyMessage.add(output);

		return output.getContent();
	}

}
```

```shell
# 1
input：你好，我的名字叫牧生
output：你好，牧生！很高兴认识你。我叫通义千问，是阿里云研发的超大规模语言模型。我可以帮助你解答问题、提供信息或者进行聊天。有什么我可以帮到你的吗？

# 2
input：我叫什么名字
output：你刚才提到你的名字叫牧生。如果你有其他问题或需要进一步的帮助，请告诉我！
```

至此，已经实现了一个简单的 chat memory 功能。然后，我们来分析一波这种写法存在的问题：

1. historyMessage 的大小是无限的吗？

   在 java 代码中无限，但是 llm 的输入 Token 有限，例如 GPT，通义等模型的 Token 限制：

    ![Token 限制](/img/ai/ai-21.png)

2. 文本内容：在传递给 llm 的内容中，可能存在无关的文本，影响 llm 的输出，使其产生幻觉或者占用大量 token。
3. 没有和对话关联，直接从 list 中获取，正常应该是每次会话一个历史消息。
4. 数据不持久，在服务器关机重启之后数据丢失。
5. 没有相关策略合理组织 Message。

之后，来看下 Spring AI 的 chat Memory 实现

## Spring AI Chat Memory

### ChatMemory 接口

Spring AI 中提供的对 Message 存取的接口。

```java
public interface ChatMemory {
    default void add(String conversationId, Message message) {
        this.add(conversationId, List.of(message));
    }

    // conversationId：会话ID， message：消息（包括用户消息和回复消息）
    // 将 Message 添加到会话中
    void add(String conversationId, List<Message> messages);

    // conversationId：会话ID， 
    // 取最新的几条数据，以此可以控制一次会话窗口的大小，比如对于 qwen-plsu 的 30720 token 限制
    List<Message> get(String conversationId, int lastN);

    // conversationId：会话ID
	// 清除对话历史消息
    void clear(String conversationId);
}
```

### InMemoryChatMemory

ChatMemory 的实现，表示为聊天对话历史记录提供内存存储；

```java
public class InMemoryChatMemory implements ChatMemory {
    
    // 主要数据结构
    Map<String, List<Message>> conversationHistory = new ConcurrentHashMap();

    public InMemoryChatMemory() {
    }

    public void add(String conversationId, List<Message> messages) {
        this.conversationHistory.putIfAbsent(conversationId, new ArrayList());
        ((List)this.conversationHistory.get(conversationId)).addAll(messages);
    }

    public List<Message> get(String conversationId, int lastN) {
        List<Message> all = (List)this.conversationHistory.get(conversationId);
        return all != null ? all.stream().skip((long)Math.max(0, all.size() - lastN)).toList() : List.of();
    }

    public void clear(String conversationId) {
        this.conversationHistory.remove(conversationId);
    }
}
```

### 使用方式

Spring AI 框架提供了三种Advisor来使用ChatMeomry。

![MessageChatMemoryAdvisor](/img/ai/ai-22.png)

- MessageChatMemoryAdvisor：查询对象会话ID的历史消息添加到提示词文本中，核心代码如下；
- PromptChatMemoryAdvisor：检索到的内存中的历史消息将添加到提示的系统文本中；
- VectorStoreChatMemoryAdvisor：检索向量数据库中的历史消息将添加到提示的系统文本中。

```java
@RestController
@RequestMapping("/ai")
public class AIController {

	private final ChatClient chatClient;

	private final ChatModel chatModel;

	public AIController(ChatClient.Builder builder, ChatModel chatModel) {

		this.chatModel = chatModel;
		this.chatClient = ChatClient.builder(chatModel)
				.defaultAdvisors(
						new MessageChatMemoryAdvisor(new InMemoryChatMemory())
				).build();
	}

	@GetMapping("/chatWithChatMemory")
	public String chatWithChatMemory(String chatId, String prompt) {

		return chatClient.prompt()
				.user(prompt)
				.advisors(
						a -> a
								.param(CHAT_MEMORY_CONVERSATION_ID_KEY, chatId)
								.param(CHAT_MEMORY_RETRIEVE_SIZE_KEY, 100)
				).call().chatResponse().getResult().getOutput().getContent();
	}

}
```

访问：

```shell
# 1
input: http://localhost:8080/ai/chatWithChatMemory?chatId=10001&prompt=你好，我是牧生
output：你好，牧生！很高兴认识你。有什么我可以帮到你的吗？

# 2
input：http://localhost:8080/ai/chatWithChatMemory?chatId=10001&prompt=我是谁
output：您是这次对话的发起者，您之前提到您的名字叫牧生。如果您有其他身份或角色想要分享，或者有任何问题和需要帮助的地方，都欢迎告诉我！

# 当切换 chatId 时
input：http://localhost:8080/ai/chatWithChatMemory?chatId=10002&prompt=我叫什么名字
output：您好！您刚才没有提到您的名字，所以我无法直接回答您的问题。如果您愿意分享，可以告诉我您的名字，或者如果您是在某种特定情境下问这个问题，也可以提供更多背景信息，这样我可能能更好地帮助您。如果这是一个私人问题，您也可以选择不回答。我在这里是为了支持您，有任何问题都可以问我。
```

其中参数`chatId` 表示会话 ID，实现上下文与会话绑定。`CHAT_MEMORY_RETRIEVE_SIZE_KEY` 表示历史会话最多100条发给AI。

## 问题

通过两种方式都可以实现 chat memory，相比 spring ai 更加完善。

但是也存在以下问题：

1. 数据不持久，在服务器关机重启之后数据丢失；

2. 没有相关策略合理组织 Message。

## Spring AI Alibaba

> Tips: Spring AI Alibaba 的 Chat Memory 功能正在开发中......
