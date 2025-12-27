const n=`---
slug: google-adk-java-quickstart
title: Google ADK Java QuickStart
date: 2025-06-27 23:34:54
authors: yuluo
tags: [LLM, Java, Gemini]
keywords: [LLM, Java, Gemini]
---

<!-- truncate -->

## 1. ADK 介绍

Agent Development Kit (ADK) 是一个灵活的模块化框架，用于开发和部署 AI Agent。ADK 对 Gemini 和 Google 生态系统进行了优化。同时与模型和部署无关，并且与其他框架兼容。ADK 旨在使 Agent 开发更像软件开发那样，使开发者能够更轻松地创建、部署和编排从简单任务到复杂工作流的 Agent 应用。

主要特点

- **丰富的工具生态系统**：利用预先构建的工具、自定义功能、OpenAPI 规范或集成现有工具，为代理提供多样化的功能，所有这些都是为了与 Google 生态系统紧密集成。
- **代码优先开发**：直接在 Python 中定义代理逻辑、工具和编排，以实现最大的灵活性、可测试性和版本控制。
- **模块化多代理系统**：通过将多个专门的代理组合成灵活的层次结构来设计可扩展的应用程序。
- **随处部署**：轻松在 Cloud Run 上容器化和部署代理，或使用 Vertex AI Agent Engine 无缝扩展。

## 2. ADK Java

而 ADK Java 则是 ADK Python 的 Java 实现。

## 3. ADK Java Examples

编写示例之前需要获取到 Google Genmini 模型的 ak 并配置到环境变量中：

\`\`\`shell
export GOOGLE_GENAI_USE_VERTEXAI=FALSE
export GOOGLE_API_KEY=AK
\`\`\`

### 3.1 代码

此示例使用 ADK Java 文档中的代码：https://google.github.io/adk-docs/get-started/quickstart/#create-agent-project

\`\`\`java
package indi.yuluo.java.agent.multitool;

import com.google.adk.agents.BaseAgent;
import com.google.adk.agents.LlmAgent;
import com.google.adk.events.Event;
import com.google.adk.runner.InMemoryRunner;
import com.google.adk.sessions.Session;
import com.google.adk.tools.Annotations.Schema;
import com.google.adk.tools.FunctionTool;
import com.google.genai.types.Content;
import com.google.genai.types.Part;
import io.reactivex.rxjava3.core.Flowable;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Scanner;

/**
 * @author yuluo
 * @author <a href="mailto:yuluo08290126@gmail.com">yuluo</a>
 */

public class MultiToolAgent {

    private static String USER_ID = "student";
    private static String NAME = "multi_tool_agent";

    // The run your agent with Dev UI, the ROOT_AGENT should be a global public static variable.
    public static BaseAgent ROOT_AGENT = initAgent();

    public static BaseAgent initAgent() {
        return LlmAgent.builder()
                .name(NAME)
                .model("gemini-2.0-flash")
                .description("Agent to answer questions about the time and weather in a city.")
                .instruction(
                        "You are a helpful agent who can answer user questions about the time and weather"
                                + " in a city.")
                .tools(
                        FunctionTool.create(MultiToolAgent.class, "getCurrentTime"),
                        FunctionTool.create(MultiToolAgent.class, "getWeather"))
                .build();
    }

    public static Map<String, String> getCurrentTime(
            @Schema(description = "The name of the city for which to retrieve the current time")
            String city) {
        String normalizedCity =
                Normalizer.normalize(city, Normalizer.Form.NFD)
                        .trim()
                        .toLowerCase()
                        .replaceAll("(\\\\p{IsM}+|\\\\p{IsP}+)", "")
                        .replaceAll("\\\\s+", "_");

        return ZoneId.getAvailableZoneIds().stream()
                .filter(zid -> zid.toLowerCase().endsWith("/" + normalizedCity))
                .findFirst()
                .map(
                        zid ->
                                Map.of(
                                        "status",
                                        "success",
                                        "report",
                                        "The current time in "
                                                + city
                                                + " is "
                                                + ZonedDateTime.now(ZoneId.of(zid))
                                                .format(DateTimeFormatter.ofPattern("HH:mm"))
                                                + "."))
                .orElse(
                        Map.of(
                                "status",
                                "error",
                                "report",
                                "Sorry, I don't have timezone information for " + city + "."));
    }

    public static Map<String, String> getWeather(
            @Schema(description = "The name of the city for which to retrieve the weather report")
            String city) {
        if (city.toLowerCase().equals("new york")) {
            return Map.of(
                    "status",
                    "success",
                    "report",
                    "The weather in New York is sunny with a temperature of 25 degrees Celsius (77 degrees"
                            + " Fahrenheit).");

        } else {
            return Map.of(
                    "status", "error", "report", "Weather information for " + city + " is not available.");
        }
    }

    public static void main(String[] args) {
        InMemoryRunner runner = new InMemoryRunner(ROOT_AGENT);

        Session session =
                runner
                        .sessionService()
                        .createSession(NAME, USER_ID)
                        .blockingGet();

        try (Scanner scanner = new Scanner(System.in, StandardCharsets.UTF_8)) {
            while (true) {
                System.out.print("\\nYou > ");
                String userInput = scanner.nextLine();

                if ("quit".equalsIgnoreCase(userInput)) {
                    break;
                }

                Content userMsg = Content.fromParts(Part.fromText(userInput));
                Flowable<Event> events = runner.runAsync(USER_ID, session.id(), userMsg);

                System.out.print("\\nAgent > ");
                events.blockingForEach(event -> System.out.println(event.stringifyContent()));
            }
        }
    }
}
\`\`\`

### 3.2 运行

1. **AdkWebServer** 不能更改。
2. 运行此命令需要跳转到项目根目录（既 pom.xml 所在的目录执行）

\`\`\`shell
mvn exec:java \\
    -Dexec.mainClass="com.google.adk.web.AdkWebServer" \\
    -Dexec.args="--adk.agents.source-dir=src/main/java" \\
    -Dexec.classpathScope="compile" 
\`\`\`

### 3.3 访问

浏览器打开 localhost:8080 访问前端页面，可以看到 Dev UI：

![image-20250626233522684](/img/ai/adk/image-20250626233522684.png)
`;export{n as default};
