const n=`---
title: 检索增强生成（RAG）
description: 了解如何使用检索增强生成(RAG)技术为LLM提供外部知识，构建知识库，实现两步RAG和Agentic RAG
date: 2025-12-28
tags: [Spring AI Alibaba, ReactAgent, RAG, 检索增强生成, 知识库, 向量存储, Agentic RAG]
keywords: [RAG, 检索增强生成, 知识库, 向量存储, 文档检索, Agentic RAG, 两步RAG, 语义搜索]
---

# 检索增强生成（RAG）

大型语言模型（LLM）虽然强大，但有两个关键限制：

- **有限的上下文**——它们无法一次性摄取整个语料库
- **静态知识**——它们的训练数据在某个时间点被冻结

检索通过在查询时获取相关的外部知识来解决这些问题。这是**检索增强生成（RAG）**的基础：使用特定上下文的信息来增强 LLM 的回答。

## 构建知识库

**知识库**是用于检索的文档或结构化数据的存储库。

如果你需要自定义知识库，可以使用 Spring AI Alibaba 的文档加载器和向量存储从你自己的数据构建。

> 如果你已经有一个知识库（例如 SQL 数据库、CRM 或内部文档系统），你**不需要**重建它。你可以将其连接为 Agent 的**工具**用于 Agentic RAG，或查询它并将检索到的内容作为上下文提供给 LLM（两步 RAG）。

### 构建模块

在 Spring AI Alibaba 中，你可以使用以下组件构建 RAG 系统：

- **文档加载器和解析器**：从外部源摄取数据，支持 PDF、Word、Markdown、GitHub、Notion、语雀等多种数据源
- **文本分割器**：将大型文档分解为更小的块，适合模型的上下文窗口
- **嵌入模型**：将文本转换为数字向量，支持 DashScope、OpenAI、Ollama 等
- **向量存储**：存储和搜索嵌入的专用数据库，支持 Milvus、Pinecone、Redis、Elasticsearch 等
- **检索器**：给定非结构化查询返回文档的接口

## RAG 架构

RAG 可以以多种方式实现，具体取决于你的系统需求：

| 架构 | 描述 | 控制性 | 灵活性 | 延迟 | 使用场景示例 |
| ---- | ---- | ------ | ------ | ---- | ------------ |
| **两步 RAG** | 检索总是在生成之前发生。简单且可预测 | ✅ 高 | ❌ 低 | ⚡ 快 | FAQ、文档机器人 |
| **Agentic RAG** | LLM 驱动的 Agent 决定*何时*以及*如何*在推理过程中检索 | ❌ 低 | ✅ 高 | ⏳ 可变 | 具有多工具访问的研究助手 |
| **混合 RAG** | 结合两种方法的特点，包含验证步骤 | ⚖️ 中 | ⚖️ 中 | ⏳ 可变 | 带质量验证的领域特定问答 |

### 两步 RAG

在**两步 RAG**中，检索步骤总是在生成步骤之前执行。

#### 使用 MessagesModelHook 实现

通过 \`MessagesModelHook\` 在模型调用前检索文档并添加到消息中：

\`\`\`java
import com.alibaba.cloud.ai.graph.agent.ReactAgent;
import com.alibaba.cloud.ai.graph.agent.hook.messages.MessagesModelHook;
import com.alibaba.cloud.ai.graph.agent.hook.messages.AgentCommand;
import com.alibaba.cloud.ai.graph.agent.hook.messages.UpdatePolicy;
import com.alibaba.cloud.ai.graph.agent.hook.HookPosition;
import com.alibaba.cloud.ai.graph.agent.hook.HookPositions;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;

// 假设你已经有一个配置好的向量存储
VectorStore vectorStore = ...;

// 创建 RAG Hook：在模型调用前检索文档并添加到消息中
@HookPositions({HookPosition.BEFORE_MODEL})
class RAGMessagesHook extends MessagesModelHook {
    private final VectorStore vectorStore;
    private static final int TOP_K = 5;

    public RAGMessagesHook(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    @Override
    public String getName() {
        return "rag_messages_hook";
    }

    @Override
    public AgentCommand beforeModel(List<Message> previousMessages, RunnableConfig config) {
        // 从消息中提取用户问题
        String userQuestion = extractUserQuestion(previousMessages);
        if (userQuestion == null || userQuestion.isEmpty()) {
            return new AgentCommand(previousMessages);
        }

        // Step 1: 检索相关文档
        List<Document> relevantDocs = vectorStore.similaritySearch(
            org.springframework.ai.vectorstore.SearchRequest.builder()
                .query(userQuestion)
                .topK(TOP_K)
                .build()
        );

        // Step 2: 构建上下文
        String context = relevantDocs.stream()
            .map(Document::getText)
            .collect(Collectors.joining("\\n\\n"));

        // Step 3: 构建增强的消息列表
        List<Message> enhancedMessages = new ArrayList<>();
        String systemPrompt = String.format("""
            你是一个有用的助手。基于以下上下文回答问题。
            如果上下文中没有相关信息，请说明你不知道。
            
            上下文：
            %s
            """, context);
        enhancedMessages.add(new SystemMessage(systemPrompt));
        enhancedMessages.addAll(previousMessages);

        return new AgentCommand(enhancedMessages, UpdatePolicy.REPLACE);
    }
}

// 创建带有 RAG Hook 的 Agent
ReactAgent ragAgent = ReactAgent.builder()
    .name("rag_agent")
    .model(chatModel)
    .hooks(new RAGMessagesHook(vectorStore))
    .build();
\`\`\`

#### 使用 AgentHook 实现（只检索一次）

如果不想在每次 Agent reasoning 循环中都检索 RAG，可以使用 \`AgentHook\` 在 Agent 开始时只检索一次：

\`\`\`java
@HookPositions({HookPosition.BEFORE_AGENT})
class RAGAgentHook extends AgentHook {
    private final VectorStore vectorStore;
    private static final int TOP_K = 5;
    private static final String RAG_CONTEXT_KEY = "rag_context";

    @Override
    public CompletableFuture<Map<String, Object>> beforeAgent(OverAllState state, RunnableConfig config) {
        // 提取用户查询 → 检索文档 → 存储到 metadata 中
        // 后续 ModelInterceptor 可以从 config.metadata 中读取 RAG 上下文
        config.metadata().ifPresent(meta -> {
            meta.put(RAG_CONTEXT_KEY, context);
        });
        return CompletableFuture.completedFuture(Map.of());
    }
}
\`\`\`

**三种方式对比**：

| 方式 | 执行时机 | 检索次数 | 适用场景 |
|------|---------|---------|---------|
| **MessagesModelHook** | 每次模型调用前 | 每次 reasoning 循环 | 需要根据每次推理动态检索 |
| **ModelInterceptor** | 每次模型调用前 | 每次 reasoning 循环 | 需要访问完整请求信息 |
| **AgentHook** | Agent 开始时 | **只检索一次** | 优化性能，避免重复检索 |

### Agentic RAG

**Agentic 检索增强生成（RAG）**将检索增强生成的优势与基于 Agent 的推理相结合。Agent 逐步推理并决定在交互过程中**何时**以及**如何**检索信息。

> Agent 启用 RAG 行为所需的唯一条件是访问一个或多个可以获取外部知识的**工具**——例如文档加载器、Web API 或数据库查询。

\`\`\`java
import com.alibaba.cloud.ai.graph.agent.ReactAgent;
import org.springframework.ai.document.Document;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.function.FunctionToolCallback;
import org.springframework.ai.vectorstore.VectorStore;

// 创建文档检索工具
class DocumentSearchTool {
    private final VectorStore vectorStore;

    public record Request(String query) {}
    public record Response(String content) {}

    public Response search(Request request) {
        List<Document> docs = vectorStore.similaritySearch(request.query());
        String combinedContent = docs.stream()
            .map(Document::getText)
            .collect(Collectors.joining("\\n\\n"));
        return new Response(combinedContent);
    }
}

DocumentSearchTool searchTool = new DocumentSearchTool(vectorStore);

ToolCallback searchCallback = FunctionToolCallback.builder("search_documents",
    (Function<DocumentSearchTool.Request, DocumentSearchTool.Response>)
    request -> searchTool.search(request))
    .description("搜索文档以查找相关信息")
    .inputType(DocumentSearchTool.Request.class)
    .build();

// 创建带有检索工具的Agent
ReactAgent ragAgent = ReactAgent.builder()
    .name("rag_agent")
    .model(chatModel)
    .instruction("你是一个智能助手。当需要查找信息时，使用search_documents工具。" +
               "基于检索到的信息回答用户的问题，并引用相关片段。")
    .tools(searchCallback)
    .build();

// Agent会自动决定何时调用检索工具
ragAgent.invoke("Spring AI Alibaba支持哪些向量数据库？");
\`\`\`

在这个例子中：
1. Agent 接收用户问题
2. Agent 推理并决定是否需要检索文档
3. 如果需要，Agent 调用 \`search_documents\` 工具
4. Agent 使用检索到的信息生成答案
5. 如果信息不足，Agent 可以再次调用工具

### 混合 RAG

混合 RAG 结合了两步 RAG 和 Agentic RAG 的特点。它引入了中间步骤，如查询预处理、检索验证和生成后检查。

典型组件包括：
- **查询增强**：修改输入问题以提高检索质量
- **检索验证**：评估检索到的文档是否相关且充分
- **答案验证**：检查生成的答案的准确性、完整性以及与源内容的一致性

\`\`\`java
// 混合 RAG 示例架构：
// 1. 多工具检索（Agentic RAG）
// 2. 查询增强 Hook（两步 RAG）
// 3. 答案验证 Interceptor（两步 RAG）

ReactAgent hybridRAGAgent = ReactAgent.builder()
    .name("hybrid_rag_agent")
    .model(chatModel)
    .instruction("""
        你是一个智能助手，可以访问多个信息源来回答问题。
        1. 优先使用 document_search 搜索文档库
        2. 如果需要最新信息，使用 web_search
        3. 基于检索到的信息生成准确、完整的答案
        """)
    .tools(documentSearchCallback, webSearchCallback)
    .hooks(new QueryEnhancementHook(chatModel))
    .interceptors(new AnswerValidationInterceptor(chatModel))
    .build();
\`\`\`

**混合 RAG 的特点**：
1. **多工具检索**：Agent 可以自主选择使用文档搜索、网络搜索等工具
2. **查询增强**：在 Agent 开始时通过 \`AgentHook\` 增强查询（只执行一次）
3. **答案验证**：在生成后通过 Interceptor 验证答案质量
4. **灵活组合**：结合了 Agentic RAG 的灵活性和两步 RAG 的质量控制

## 最佳实践

1. **选择合适的架构**：
   - 简单 FAQ → 两步 RAG
   - 复杂研究任务 → Agentic RAG
   - 需要质量保证 → 混合 RAG

2. **优化检索质量**：
   - 使用合适的文本分割策略
   - 选择高质量的嵌入模型
   - 实现查询重写和扩展

3. **控制上下文大小**：
   - 限制检索到的文档数量
   - 使用文档排序和过滤
   - 考虑模型的上下文窗口限制

4. **性能优化**：
   - 缓存常见查询的检索结果
   - 使用异步检索
   - 批量处理文档嵌入

## Spring AI Alibaba RAG 组件

Spring AI Alibaba 提供了构建 RAG 系统的核心组件和模块化架构：

- **Pre-Retrieval（检索前）**：查询转换（重写、压缩、翻译）、查询扩展（多查询扩展）
- **Retrieval（检索）**：文档搜索、文档连接
- **Post-Retrieval（检索后）**：文档后处理（重排序、去重、压缩）
- **Generation（生成）**：查询增强、上下文注入

这种模块化设计允许你根据需求灵活组合不同的组件，构建适合特定场景的 RAG 流程。`;export{n as default};
