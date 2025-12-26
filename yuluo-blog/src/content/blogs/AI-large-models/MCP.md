---
slug: mcp
title: MCP 介绍和基本使用
date: 2025-03-11 21:01:08
authors: yuluo
tags: [AI, Spring AI Alibaba, MCP]
keywords: [AI, Spring AI Alibaba, MCP]
image: /img/ai/mcp/img.png
---

<!-- truncate -->

## 大模型专栏 -- MCP（Model Context Protocol）

本文章中，将介绍什么是大模型的 MCP，以及如何使用 MCP。

## 1. MCP 介绍

### 1.1 什么是 MCP 

MCP（Model Context Protocol：模型上下文协议） 是一种开放协议，制定了应用程序向 LLM 提供上下文的标准。可以将 MCP 视为 AI 应用程序的 USB-C 端口。正如 USB-C 提供了一种将设备连接到各种外围设备和配件的标准化方式一样，MCP 提供了一种将 AI 模型连接到不同数据源和工具的标准化方式。

### 1.2 MCP 组成

MCP 的核心是客户端-服务器架构，其中主机应用程序可以连接到多个服务器：

![MCP 架构图](/img/ai/mcp/img.png)

- **MCP 主机**：希望通过 MCP 访问数据的程序，例如 Claude Desktop、IDE 或 AI 工具
- **MCP 客户端**：与服务器保持 1:1 连接的协议客户端
- **MCP 服务器**：轻量级程序，每个程序都通过标准化模型上下文协议公开特定功能
- **本地数据源**：MCP 服务器可以安全访问的您的计算机文件、数据库和服务
- **远程服务**：MCP 服务器可通过互联网（例如通过 API）连接到的外部系统

### 1.3 MCP 解决了什么问题

大模型往往作为一个独立个体运行，难以直接访问实时数据源（如企业内部数据库、实时文档、在线服务等）。

开发者通常需要为每个应用场景定制专用的适配器或插件，这既耗时费力，又缺乏可扩展性。MCP 正是为了解决这一痛点。通过定义一个标准化的协议，它允许开发者在无需重复开发的情况下快速连接模型与数据源，提升模型的通用性和落地效率。丰富大模型知识，提供更专业有效的回答。

## 2. MCP 开发

介绍完了 MCP 之后，现在来使用 MCP 的 java SDK 和 Spring AI Alibaba 开发一个 MCP 服务示例，使用 mcp 的 STDIO 方式。

### 2.1 环境准备

MCP Java SDK repo：https://github.com/modelcontextprotocol/java-sdk

MCP Java SDK Docs：https://modelcontextprotocol.io/sdk/java/mcp-overview

Spring AI MCP Integration：https://docs.spring.io/spring-ai/reference/api/mcp/mcp-client-boot-starter-docs.html

Spring AI Alibaba：[alibaba/spring-ai-alibaba: An Application Framework for Java Developers](https://github.com/alibaba/spring-ai-alibaba)

### 2.2 代码开发

> 这里使用 spring ai 集成的 MCP starter。
>
> server：`spring-ai-mcp-server-spring-boot-starter`
>
> client：`spring-ai-mcp-client-spring-boot-starter`

#### 2.2.1 MCP 服务端开发

application.yml 文件定义

```yml
spring:
  main:
    web-application-type: none
    banner-mode: off

  # mcp 配置
  ai:
    mcp:
      server:
        name: my-mcp-example-server
        version: 0.0.1

  # 业务数据库系统配置
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/data?useSSL=false&serverTimezone=UTC
    username: root
    password: root

logging:
  pattern:
    console:

# 关闭 mybatis-plus 的 banner 输出
mybatis-plus:
  global-config:
    banner: off
```

pom.xml

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <version>3.4.2</version>
    </dependency>

    <dependency>
        <groupId>org.springframework.ai</groupId>
        <artifactId>spring-ai-mcp-server-spring-boot-starter</artifactId>
        <version>${spring-ai.version}</version>
    </dependency>

    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <version>8.0.33</version>
    </dependency>

    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
        <version>3.5.10.1</version>
    </dependency>

    <dependency>
        <groupId>com.google.code.gson</groupId>
        <artifactId>gson</artifactId>
        <version>2.12.1</version>
    </dependency>
</dependencies>

<!-- spring boot 工程必须要，不然 mcp-serve 无法启动 jar 包，会失败 -->
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <executions>
                <execution>
                    <goals>
                        <goal>repackage</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

Spring Boot 启动类：

```java
@SpringBootApplication
@MapperScan("indi.yuluo.repository")
public class MCPServerApplication {

	public static void main(String[] args) {

		SpringApplication.run(MCPServerApplication.class, args);
	}

  // mcp Tool 定义
	@Bean
	public ToolCallbackProvider dataTools(ToolsDefinitionService dataService) {

		return MethodToolCallbackProvider.builder().toolObjects(dataService).build();
	}

	/**
	 * 输出数据库查询确认服务端启动成功
	 */
	// @Resource
	// private MySQLDataService mySQLDataServiceImpl;
	//
	// @Bean
	// public Void run() {
	//
	// 	System.out.println(mySQLDataServiceImpl.getContextData("zhangsan"));
	// 	return null;
	// }

}
```

ToolsDefinitionService.java

```java
// 定义 tool service 在启动类中注入 bean
@Service
public class ToolsDefinitionService {

  // 一个普通的 mysql 数据库服务
	@Resource
	private MySQLDataService dataService;

	@Tool(description = "调用此工具函数，将参数转为全大写并返回")
	public String test(String test) {

		return test.toLowerCase();
	}

	@Tool(description = "调用此工具函数，从 mysql 数据查询指定姓名的联系人信息")
	public String queryContact(String name) {

    // 根据用户名查询用户信息
		return dataService.getContextData(name);
	}

}
```

至此，MCP server 开发完成。

#### 2.2.2 MCP 客户端开发

现在，构建 MCP client 端，调用 server 端 MCP Tool。

> 此例中使用 web api 的方式，也可以使用 CommandLineRunner 的方式。

```yml
spring:
  application:
    name: mcp-client-example

  mandatory-file-encoding: UTF-8

  ai:
    dashscope:
      api-key: ${AI_DASHSCOPE_API_KEY}

    mcp:
      client:
        stdio:
          servers-configuration: classpath:mcp-servers-config.json


server:
  servlet:
    encoding:
      charset: UTF-8
      enabled: true
      force: true

logging:
  charset:
    file: UTF-8

  # 打印 mcp 日志信息，方便查看 MCP Serve 的日志信息
  level:
    io.modelcontextprotocol.client: debug
    io.modelcontextprotocol.spec: debug

    org.springframework.ai: debug
```

mcp-servers-config.json

> MCP Server 的配置文件，放在 resources 目录下。

```json
{
  "mcpServers": {
    "my-mcp-example-server": {
      "command": "java",
      "args": [
        "-jar",
        "-Dspring.ai.mcp.server.stdio=true",
        "-Dspring.main.web-application-type=none",
        "-Dlogging.pattern.console=",
        "-Dspring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver",
        "-Dspring.datasource.url=jdbc:mysql://localhost:3306/data?useSSL=false&serverTimezone=UTC",
        "-Dspring.datasource.username=root",
        "-Dspring.datasource.password=root",
        "D:\\AI\\examples\\mcp-example\\mcp-server-example\\target\\mcp-server-example-1.0-SNAPSHOT.jar"
      ],
      "env": {}
    }
  }
}

```

启动类：

```java
@SpringBootApplication
public class MCPClientApplication {

	public static void main(String[] args) {

		SpringApplication.run(MCPClientApplication.class, args);
	}

	// @Bean
	// public CommandLineRunner predefinedQuestions(ChatClient.Builder chatClientBuilder, ToolCallbackProvider tools,
	// 		ConfigurableApplicationContext context) {
	//
	// 	return args -> {
	//
	// 		var chatClient = chatClientBuilder
	// 				.defaultTools(tools)
	// 				.build();
	//
	// 		System.out.println("\n>>> QUESTION: " + "帮我查询一下 wangwu 的信息");
	// 		System.out.println("\n>>> ASSISTANT: " + chatClient.prompt("帮我查询一下 wangwu 的信息").call().content());
	//
	// 		context.close();
	// 	};
	// }

}
```

controller

```java
@RestController
@RequestMapping("/mcp")
public class MCPClientController {

	private final ChatClient client;

	public MCPClientController(
			ChatModel chatModel,
			ToolCallbackProvider tools
	) {
    // 输出 MCP server 的两个 tools
		Arrays.stream(tools.getToolCallbacks()).map(FunctionCallback::getName).forEach(System.out::println);

		this.client = ChatClient.builder(chatModel)
				.defaultTools(tools)
				.build();
	}

	@GetMapping("/chat")
	public Flux<String> chat(
			@RequestParam("prompt") String prompt,
			HttpServletResponse response
	) {

		response.setCharacterEncoding("UTF-8");

    // 输出响应
		return client.prompt().user(prompt).stream().content();
	}

}
```

### 2.3 请求测试

```http
### Test API
GET http://127.0.0.1:8080/mcp/chat?prompt="将 user 转为大写"

转为大写的结果是：USER

### MySQL API
GET http://127.0.0.1:8080/mcp/chat?prompt="帮我从数据库查询一下 wangwu 的联系信息"

查询结果显示，联系人 wangwu 的信息如下：

- ID: 3
- 年龄: 24
- 电子邮件: 789@gmail.com

这是关于 wangwu 的详细联系信息。
```

## 3. 总结

Example Code：https://github.com/deigmata-paideias/deigmata-paideias/tree/main/ai/mcp-example

在本文中，介绍了什么是 MCP 以及 MCP 的作用和解决的问题。编写了一个简单的例子来体验 MCP 的能力。

在 MCP 中，除了 STDIO 的方式之外，还支持 SSE 的方式。更好的满足不同的业务场景。
