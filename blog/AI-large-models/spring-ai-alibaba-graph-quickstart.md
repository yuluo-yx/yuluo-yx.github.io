---
slug: spring-ai-alibaba-graph-quickstart
title: spring ai alibaba graph quickstart
date: 2025-06-14 23:40:21
authors: yuluo
tags: [spring ai alibaba graph, agent]
keywords: [spring ai alibaba, graph, agents]
---

<!-- truncate -->

本文中将阐述下 AI 流程编排框架和 Spring AI Alibaba Graph 以及如何使用。

## 1. Agent 智能体

结合 Google 和 Authropic 对 Agent 的定义：Agent 的定义为：智能体（Agent）是能够独立运行，感知和理解现实世界并使用工具来实现最终目标的应用程序。

从架构上，可以将 Agent 分为两类：

1. Workflows 系统：人类干预做整体决策，LLMs 作为 workflows 链路的节点。
   1. 具有明确语义的系统，预先定义好 workflows 流程；
   2. LLMs 通过各个 Node 节点对 Workflows 路径编排来达到最终效果。
2. 智能体系统（Agents）：LLMs 作为大脑决策，自驱动完成任务。
   1. LLMs 自己编排和规划工具调用；
   2. 适用于模型驱动决策的场景。

**以上两种架构都在 Spring AI Alibaba 项目中有体现：一是 JManus 系统。二是基于 spring ai alibaba graph 构建的 DeepResearch 系统。**

## 1. AI 智能体框架介绍

在过去一年中，AI Infra 快速发展，涌现了一系列以 LangChain 为代码的 AI 应用开发框架，到最基础的应用开发框架到智能体编排，AI 应用观测等。此章节中主要介绍下 AI 应用的智能体编排框架。

### 1.1 Microsoft AutoGen

Github  地址：https://github.com/microsoft/autogen

由微软开源的智能体开发框架：**AutoGen** 是一个用于创建可自主行动或与人类协同工作的多智能体 AI 应用程序的框架。

### 1.2 LangGraph

Github 地址：https://github.com/langchain-ai/langgraph

以 LangGraph 为基础，使用图结构的 AI 应用编排框架。由 LangChain 社区开发，社区活跃。

### 1.3 CrewAI

Github 地址：https://github.com/crewAIInc/crewAI

CrewAI 是一个精简、快速的 Python 框架，完全从零构建，完全**独立于 LangChain 或其他代理框架**。它为开发人员提供了高级的简洁性和精确的底层控制，非常适合创建适合任何场景的自主 AI 代理。

## 2. Spring AI Alibaba Graph

Github 地址：https://github.com/alibaba/spring-ai-alibaba/tree/main/spring-ai-alibaba-graph

> Spring AI Alibaba Graph 是一款面向 Java 开发者的**工作流、多智能体框架**，用于构建由多个 AI 模型或步骤组成的复杂应用。通过图结构的定义，来描述智能体中的状态流转逻辑。
>
> 框架核心包括：**StateGraph**（状态图，用于定义节点和边）、**Node**（节点，封装具体操作或模型调用）、**Edge**（边，表示节点间的跳转关系）以及 **OverAllState**（全局状态，贯穿流程共享数据）

### 2.1 快速入门

Demo 地址：https://github.com/deigmata-paideias/deigmata-paideias/tree/main/ai/exmaple/spring-ai-alibaba-graph-demo

#### pom.xml

```xml
<dependencies>
    <dependency>
        <groupId>com.alibaba.cloud.ai</groupId>
        <artifactId>spring-ai-alibaba-starter-dashscope</artifactId>
    </dependency>

    <dependency>
        <groupId>com.alibaba.cloud.ai</groupId>
        <artifactId>spring-ai-alibaba-graph-core</artifactId>
        <version>1.0.0.2</version>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <dependency>
        <groupId>com.google.code.gson</groupId>
        <artifactId>gson</artifactId>
    </dependency>
</dependencies>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>3.4.5</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <dependency>
            <groupId>com.alibaba.cloud.ai</groupId>
            <artifactId>spring-ai-alibaba-bom</artifactId>
            <version>1.0.0.2</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

#### application.yml

```yml
server:
  port: 8081

spring:
  ai:
    dashscope:
      api-key: ${AI_DASHSCOPE_API_KEY}

```

#### Config 

```java

import com.alibaba.cloud.ai.graph.GraphRepresentation;
import com.alibaba.cloud.ai.graph.OverAllState;
import com.alibaba.cloud.ai.graph.OverAllStateFactory;
import com.alibaba.cloud.ai.graph.StateGraph;
import com.alibaba.cloud.ai.graph.action.EdgeAction;
import com.alibaba.cloud.ai.graph.exception.GraphStateException;
import com.alibaba.cloud.ai.graph.node.QuestionClassifierNode;
import com.alibaba.cloud.ai.graph.state.strategy.ReplaceStrategy;
import indi.yuluo.graph.customnode.RecordingNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.alibaba.cloud.ai.graph.StateGraph.END;
import static com.alibaba.cloud.ai.graph.StateGraph.START;
import static com.alibaba.cloud.ai.graph.action.AsyncEdgeAction.edge_async;
import static com.alibaba.cloud.ai.graph.action.AsyncNodeAction.node_async;

/**
 * Graph Demo：首先判断评价正负，其次细分负面问题，最后输出处理方案。
 *
 * @author yuluo
 * @author <a href="mailto:yuluo08290126@gmail.com">yuluo</a>
 */

@Configuration
public class GraphAutoConfiguration {

    private static final Logger logger = LoggerFactory.getLogger(GraphAutoConfiguration.class);

    /**
     * 定义一个工作流 StateGraph Bean.
     */
    @Bean
    public StateGraph workflowGraph(ChatClient.Builder builder) throws GraphStateException {

        // LLMs Bean
        ChatClient chatClient = builder.defaultAdvisors(new SimpleLoggerAdvisor()).build();

        // 定义一个 OverAllStateFactory，用于在每次执行工作流时创建初始的全局状态对象。通过注册若干 Key 及其更新策略来管理上下文数据
        // 注册三个状态 key 分别为
        // 1. input：用户输入的文本
        // 2. classifier_output：分类器的输出结果
        // 3. solution：最终输出结论
        // 使用 ReplaceStrategy（每次写入替换旧值）策略处理上下文状态对象中的数据，用于在节点中传递数据
        OverAllStateFactory stateFactory = () -> {
            OverAllState state = new OverAllState();
            state.registerKeyAndStrategy("input", new ReplaceStrategy());
            state.registerKeyAndStrategy("classifier_output", new ReplaceStrategy());
            state.registerKeyAndStrategy("solution", new ReplaceStrategy());
            return state;
        };

        // 创建 workflows 节点
        // 使用 Graph 框架预定义的 QuestionClassifierNode 来处理文本分类任务

        // 评价正负分类节点
        QuestionClassifierNode feedbackClassifier = QuestionClassifierNode.builder()
                .chatClient(chatClient)
                .inputTextKey("input")
                .categories(List.of("positive feedback", "negative feedback"))
                .classificationInstructions(
                        List.of("Try to understand the user's feeling when he/she is giving the feedback."))
                .build();

        // 负面评价具体问题分类节点
        QuestionClassifierNode specificQuestionClassifier = QuestionClassifierNode.builder()
                .chatClient(chatClient)
                .inputTextKey("input")
                .categories(List.of("after-sale service", "transportation", "product quality", "others"))
                .classificationInstructions(List
                        .of("What kind of service or help the customer is trying to get from us? Classify the question based on your understanding."))
                .build();

        // 编排 Node 节点，使用 StateGraph 的 API，将上述节点加入图中，并设置节点间的跳转关系
        // 首先将节点注册到图，并使用 node_async(...) 将每个 NodeAction 包装为异步节点执行（提高吞吐或防止阻塞，具体实现框架已封装）
        StateGraph stateGraph = new StateGraph("Consumer Service Workflow Demo", stateFactory)

                // 定义节点
                .addNode("feedback_classifier", node_async(feedbackClassifier))
                .addNode("specific_question_classifier", node_async(specificQuestionClassifier))
                .addNode("recorder", node_async(new RecordingNode()))

                // 定义边（流程顺序）
                .addEdge(START, "feedback_classifier")
                .addConditionalEdges("feedback_classifier",
                        edge_async(new FeedbackQuestionDispatcher()),
                        Map.of("positive", "recorder", "negative", "specific_question_classifier"))
                .addConditionalEdges("specific_question_classifier",
                        edge_async(new SpecificQuestionDispatcher()),
                        Map.of("after-sale", "recorder", "transportation", "recorder", "quality", "recorder", "others",
                                "recorder"))

                // 图的结束节点
                .addEdge("recorder", END);

        GraphRepresentation graphRepresentation = stateGraph.getGraph(GraphRepresentation.Type.PLANTUML,
                "workflow graph");

        System.out.println("\n\n");
        System.out.println(graphRepresentation.content());
        System.out.println("\n\n");

        return stateGraph;
    }

    public static class FeedbackQuestionDispatcher implements EdgeAction {

        @Override
        public String apply(OverAllState state) {

            String classifierOutput = (String) state.value("classifier_output").orElse("");
            logger.info("classifierOutput: {}", classifierOutput);

            if (classifierOutput.contains("positive")) {
                return "positive";
            }
            return "negative";
        }

    }

    public static class SpecificQuestionDispatcher implements EdgeAction {

        @Override
        public String apply(OverAllState state) {

            String classifierOutput = (String) state.value("classifier_output").orElse("");
            logger.info("classifierOutput: {}", classifierOutput);

            Map<String, String> classifierMap = new HashMap<>();
            classifierMap.put("after-sale", "after-sale");
            classifierMap.put("quality", "quality");
            classifierMap.put("transportation", "transportation");

            for (Map.Entry<String, String> entry : classifierMap.entrySet()) {
                if (classifierOutput.contains(entry.getKey())) {
                    return entry.getValue();
                }
            }

            return "others";
        }

    }

}
```

#### 自定义 RecordingNode 节点

```java
public class RecordingNode implements NodeAction {

    private static final Logger logger = LoggerFactory.getLogger(RecordingNode.class);

    @Override
    public Map<String, Object> apply(OverAllState state) {

        String feedback = (String) state.value("classifier_output").get();

        Map<String, Object> updatedState = new HashMap<>();
        if (feedback.contains("positive")) {
            logger.info("Received positive feedback: {}", feedback);
            updatedState.put("solution", "Praise, no action taken.");
        }
        else {
            logger.info("Received negative feedback: {}", feedback);
            updatedState.put("solution", feedback);
        }

        return updatedState;
    }

}
```

#### Controller

```java
@RestController
@RequestMapping("/graph/demo")
public class GraphController {

    private final CompiledGraph compiledGraph;

    public GraphController(@Qualifier("workflowGraph") StateGraph stateGraph) throws GraphStateException {

        this.compiledGraph = stateGraph.compile();
    }

    @GetMapping("/chat")
    public String simpleChat(@RequestParam("query") String query) {

        return compiledGraph.invoke(Map.of("input", query)).flatMap(input -> input.value("solution")).get().toString();
    }

}
```

### 2.2 访问测试

```text
### 正面
GET http://localhost:8081/graph/demo/chat?query="This product is excellent, I love it!"

# Praise, no action taken.

### 负面 1
GET http://localhost:8081/graph/demo/chat?query="这东西真垃圾啊，天呐，太难用了！"

# ```json
# {"keywords": ["东西", "垃圾", "难用"], "category_name": "product quality"}
# ```

### 负面 2
GET http://localhost:8081/graph/demo/chat?query="The product broke after one day, very disappointed."

# ```json
# {"keywords": ["product", "broke", "one day", "disappointed"], "category_name": "product quality"}
# ```
```

## 3. 参考资料

1. Google Agent 白皮书：https://www.kaggle.com/whitepaper-agents
2. Authropic Agent：https://www.anthropic.com/engineering/building-effective-agents
3. IBM Agents 智能体编排： https://www.ibm.com/cn-zh/think/topics/ai-agent-orchestration
4. Spring AI Alibaba Graph：https://github.com/alibaba/spring-ai-alibaba/blob/main/spring-ai-alibaba-graph/README-zh.md
