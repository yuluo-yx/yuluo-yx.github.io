"use strict";(self.webpackChunkblog=self.webpackChunkblog||[]).push([[9017],{96970:(n,e,t)=>{t.r(e),t.d(e,{assets:()=>s,contentTitle:()=>l,default:()=>d,frontMatter:()=>o,metadata:()=>r,toc:()=>c});var r=t(60772),i=t(25105),a=t(89999);const o={slug:"mcp",title:"MCP \u4ecb\u7ecd\u548c\u57fa\u672c\u4f7f\u7528",date:new Date("2025-03-11T21:01:08.000Z"),authors:"yuluo",tags:["AI","Spring AI Alibaba","MCP"],keywords:["AI","Spring AI Alibaba","MCP"],image:"/img/ai/mcp/img.png"},l=void 0,s={authorsImageUrls:[void 0]},c=[{value:"\u5927\u6a21\u578b\u4e13\u680f -- MCP\uff08Model Context Protocol\uff09",id:"\u5927\u6a21\u578b\u4e13\u680f----mcpmodel-context-protocol",level:2},{value:"1. MCP \u4ecb\u7ecd",id:"1-mcp-\u4ecb\u7ecd",level:2},{value:"1.1 \u4ec0\u4e48\u662f MCP",id:"11-\u4ec0\u4e48\u662f-mcp",level:3},{value:"1.2 MCP \u7ec4\u6210",id:"12-mcp-\u7ec4\u6210",level:3},{value:"1.3 MCP \u89e3\u51b3\u4e86\u4ec0\u4e48\u95ee\u9898",id:"13-mcp-\u89e3\u51b3\u4e86\u4ec0\u4e48\u95ee\u9898",level:3},{value:"2. MCP \u5f00\u53d1",id:"2-mcp-\u5f00\u53d1",level:2},{value:"2.1 \u73af\u5883\u51c6\u5907",id:"21-\u73af\u5883\u51c6\u5907",level:3},{value:"2.2 \u4ee3\u7801\u5f00\u53d1",id:"22-\u4ee3\u7801\u5f00\u53d1",level:3},{value:"2.2.1 MCP \u670d\u52a1\u7aef\u5f00\u53d1",id:"221-mcp-\u670d\u52a1\u7aef\u5f00\u53d1",level:4},{value:"2.2.2 MCP \u5ba2\u6237\u7aef\u5f00\u53d1",id:"222-mcp-\u5ba2\u6237\u7aef\u5f00\u53d1",level:4},{value:"2.3 \u8bf7\u6c42\u6d4b\u8bd5",id:"23-\u8bf7\u6c42\u6d4b\u8bd5",level:3},{value:"3. \u603b\u7ed3",id:"3-\u603b\u7ed3",level:2}];function p(n){const e={a:"a",blockquote:"blockquote",code:"code",h2:"h2",h3:"h3",h4:"h4",img:"img",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,a.R)(),...n.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(e.h2,{id:"\u5927\u6a21\u578b\u4e13\u680f----mcpmodel-context-protocol",children:"\u5927\u6a21\u578b\u4e13\u680f -- MCP\uff08Model Context Protocol\uff09"}),"\n",(0,i.jsx)(e.p,{children:"\u672c\u6587\u7ae0\u4e2d\uff0c\u5c06\u4ecb\u7ecd\u4ec0\u4e48\u662f\u5927\u6a21\u578b\u7684 MCP\uff0c\u4ee5\u53ca\u5982\u4f55\u4f7f\u7528 MCP\u3002"}),"\n",(0,i.jsx)(e.h2,{id:"1-mcp-\u4ecb\u7ecd",children:"1. MCP \u4ecb\u7ecd"}),"\n",(0,i.jsx)(e.h3,{id:"11-\u4ec0\u4e48\u662f-mcp",children:"1.1 \u4ec0\u4e48\u662f MCP"}),"\n",(0,i.jsx)(e.p,{children:"MCP\uff08Model Context Protocol\uff1a\u6a21\u578b\u4e0a\u4e0b\u6587\u534f\u8bae\uff09 \u662f\u4e00\u79cd\u5f00\u653e\u534f\u8bae\uff0c\u5236\u5b9a\u4e86\u5e94\u7528\u7a0b\u5e8f\u5411 LLM \u63d0\u4f9b\u4e0a\u4e0b\u6587\u7684\u6807\u51c6\u3002\u53ef\u4ee5\u5c06 MCP \u89c6\u4e3a AI \u5e94\u7528\u7a0b\u5e8f\u7684 USB-C \u7aef\u53e3\u3002\u6b63\u5982 USB-C \u63d0\u4f9b\u4e86\u4e00\u79cd\u5c06\u8bbe\u5907\u8fde\u63a5\u5230\u5404\u79cd\u5916\u56f4\u8bbe\u5907\u548c\u914d\u4ef6\u7684\u6807\u51c6\u5316\u65b9\u5f0f\u4e00\u6837\uff0cMCP \u63d0\u4f9b\u4e86\u4e00\u79cd\u5c06 AI \u6a21\u578b\u8fde\u63a5\u5230\u4e0d\u540c\u6570\u636e\u6e90\u548c\u5de5\u5177\u7684\u6807\u51c6\u5316\u65b9\u5f0f\u3002"}),"\n",(0,i.jsx)(e.h3,{id:"12-mcp-\u7ec4\u6210",children:"1.2 MCP \u7ec4\u6210"}),"\n",(0,i.jsx)(e.p,{children:"MCP \u7684\u6838\u5fc3\u662f\u5ba2\u6237\u7aef-\u670d\u52a1\u5668\u67b6\u6784\uff0c\u5176\u4e2d\u4e3b\u673a\u5e94\u7528\u7a0b\u5e8f\u53ef\u4ee5\u8fde\u63a5\u5230\u591a\u4e2a\u670d\u52a1\u5668\uff1a"}),"\n",(0,i.jsx)(e.p,{children:(0,i.jsx)(e.img,{alt:"MCP \u67b6\u6784\u56fe",src:t(57104).A+"",width:"881",height:"612"})}),"\n",(0,i.jsxs)(e.ul,{children:["\n",(0,i.jsxs)(e.li,{children:[(0,i.jsx)(e.strong,{children:"MCP \u4e3b\u673a"}),"\uff1a\u5e0c\u671b\u901a\u8fc7 MCP \u8bbf\u95ee\u6570\u636e\u7684\u7a0b\u5e8f\uff0c\u4f8b\u5982 Claude Desktop\u3001IDE \u6216 AI \u5de5\u5177"]}),"\n",(0,i.jsxs)(e.li,{children:[(0,i.jsx)(e.strong,{children:"MCP \u5ba2\u6237\u7aef"}),"\uff1a\u4e0e\u670d\u52a1\u5668\u4fdd\u6301 1:1 \u8fde\u63a5\u7684\u534f\u8bae\u5ba2\u6237\u7aef"]}),"\n",(0,i.jsxs)(e.li,{children:[(0,i.jsx)(e.strong,{children:"MCP \u670d\u52a1\u5668"}),"\uff1a\u8f7b\u91cf\u7ea7\u7a0b\u5e8f\uff0c\u6bcf\u4e2a\u7a0b\u5e8f\u90fd\u901a\u8fc7\u6807\u51c6\u5316\u6a21\u578b\u4e0a\u4e0b\u6587\u534f\u8bae\u516c\u5f00\u7279\u5b9a\u529f\u80fd"]}),"\n",(0,i.jsxs)(e.li,{children:[(0,i.jsx)(e.strong,{children:"\u672c\u5730\u6570\u636e\u6e90"}),"\uff1aMCP \u670d\u52a1\u5668\u53ef\u4ee5\u5b89\u5168\u8bbf\u95ee\u7684\u60a8\u7684\u8ba1\u7b97\u673a\u6587\u4ef6\u3001\u6570\u636e\u5e93\u548c\u670d\u52a1"]}),"\n",(0,i.jsxs)(e.li,{children:[(0,i.jsx)(e.strong,{children:"\u8fdc\u7a0b\u670d\u52a1"}),"\uff1aMCP \u670d\u52a1\u5668\u53ef\u901a\u8fc7\u4e92\u8054\u7f51\uff08\u4f8b\u5982\u901a\u8fc7 API\uff09\u8fde\u63a5\u5230\u7684\u5916\u90e8\u7cfb\u7edf"]}),"\n"]}),"\n",(0,i.jsx)(e.h3,{id:"13-mcp-\u89e3\u51b3\u4e86\u4ec0\u4e48\u95ee\u9898",children:"1.3 MCP \u89e3\u51b3\u4e86\u4ec0\u4e48\u95ee\u9898"}),"\n",(0,i.jsx)(e.p,{children:"\u5927\u6a21\u578b\u5f80\u5f80\u4f5c\u4e3a\u4e00\u4e2a\u72ec\u7acb\u4e2a\u4f53\u8fd0\u884c\uff0c\u96be\u4ee5\u76f4\u63a5\u8bbf\u95ee\u5b9e\u65f6\u6570\u636e\u6e90\uff08\u5982\u4f01\u4e1a\u5185\u90e8\u6570\u636e\u5e93\u3001\u5b9e\u65f6\u6587\u6863\u3001\u5728\u7ebf\u670d\u52a1\u7b49\uff09\u3002"}),"\n",(0,i.jsx)(e.p,{children:"\u5f00\u53d1\u8005\u901a\u5e38\u9700\u8981\u4e3a\u6bcf\u4e2a\u5e94\u7528\u573a\u666f\u5b9a\u5236\u4e13\u7528\u7684\u9002\u914d\u5668\u6216\u63d2\u4ef6\uff0c\u8fd9\u65e2\u8017\u65f6\u8d39\u529b\uff0c\u53c8\u7f3a\u4e4f\u53ef\u6269\u5c55\u6027\u3002MCP \u6b63\u662f\u4e3a\u4e86\u89e3\u51b3\u8fd9\u4e00\u75db\u70b9\u3002\u901a\u8fc7\u5b9a\u4e49\u4e00\u4e2a\u6807\u51c6\u5316\u7684\u534f\u8bae\uff0c\u5b83\u5141\u8bb8\u5f00\u53d1\u8005\u5728\u65e0\u9700\u91cd\u590d\u5f00\u53d1\u7684\u60c5\u51b5\u4e0b\u5feb\u901f\u8fde\u63a5\u6a21\u578b\u4e0e\u6570\u636e\u6e90\uff0c\u63d0\u5347\u6a21\u578b\u7684\u901a\u7528\u6027\u548c\u843d\u5730\u6548\u7387\u3002\u4e30\u5bcc\u5927\u6a21\u578b\u77e5\u8bc6\uff0c\u63d0\u4f9b\u66f4\u4e13\u4e1a\u6709\u6548\u7684\u56de\u7b54\u3002"}),"\n",(0,i.jsx)(e.h2,{id:"2-mcp-\u5f00\u53d1",children:"2. MCP \u5f00\u53d1"}),"\n",(0,i.jsx)(e.p,{children:"\u4ecb\u7ecd\u5b8c\u4e86 MCP \u4e4b\u540e\uff0c\u73b0\u5728\u6765\u4f7f\u7528 MCP \u7684 java SDK \u548c Spring AI Alibaba \u5f00\u53d1\u4e00\u4e2a MCP \u670d\u52a1\u793a\u4f8b\uff0c\u4f7f\u7528 mcp \u7684 STDIO \u65b9\u5f0f\u3002"}),"\n",(0,i.jsx)(e.h3,{id:"21-\u73af\u5883\u51c6\u5907",children:"2.1 \u73af\u5883\u51c6\u5907"}),"\n",(0,i.jsxs)(e.p,{children:["MCP Java SDK repo\uff1a",(0,i.jsx)(e.a,{href:"https://github.com/modelcontextprotocol/java-sdk",children:"https://github.com/modelcontextprotocol/java-sdk"})]}),"\n",(0,i.jsxs)(e.p,{children:["MCP Java SDK Docs\uff1a",(0,i.jsx)(e.a,{href:"https://modelcontextprotocol.io/sdk/java/mcp-overview",children:"https://modelcontextprotocol.io/sdk/java/mcp-overview"})]}),"\n",(0,i.jsxs)(e.p,{children:["Spring AI MCP Integration\uff1a",(0,i.jsx)(e.a,{href:"https://docs.spring.io/spring-ai/reference/api/mcp/mcp-client-boot-starter-docs.html",children:"https://docs.spring.io/spring-ai/reference/api/mcp/mcp-client-boot-starter-docs.html"})]}),"\n",(0,i.jsxs)(e.p,{children:["Spring AI Alibaba\uff1a",(0,i.jsx)(e.a,{href:"https://github.com/alibaba/spring-ai-alibaba",children:"alibaba/spring-ai-alibaba: An Application Framework for Java Developers"})]}),"\n",(0,i.jsx)(e.h3,{id:"22-\u4ee3\u7801\u5f00\u53d1",children:"2.2 \u4ee3\u7801\u5f00\u53d1"}),"\n",(0,i.jsxs)(e.blockquote,{children:["\n",(0,i.jsx)(e.p,{children:"\u8fd9\u91cc\u4f7f\u7528 spring ai \u96c6\u6210\u7684 MCP starter\u3002"}),"\n",(0,i.jsxs)(e.p,{children:["server\uff1a",(0,i.jsx)(e.code,{children:"spring-ai-mcp-server-spring-boot-starter"})]}),"\n",(0,i.jsxs)(e.p,{children:["client\uff1a",(0,i.jsx)(e.code,{children:"spring-ai-mcp-client-spring-boot-starter"})]}),"\n"]}),"\n",(0,i.jsx)(e.h4,{id:"221-mcp-\u670d\u52a1\u7aef\u5f00\u53d1",children:"2.2.1 MCP \u670d\u52a1\u7aef\u5f00\u53d1"}),"\n",(0,i.jsx)(e.p,{children:"application.yml \u6587\u4ef6\u5b9a\u4e49"}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-yml",children:"spring:\n  main:\n    web-application-type: none\n    banner-mode: off\n\n  # mcp \u914d\u7f6e\n  ai:\n    mcp:\n      server:\n        name: my-mcp-example-server\n        version: 0.0.1\n\n  # \u4e1a\u52a1\u6570\u636e\u5e93\u7cfb\u7edf\u914d\u7f6e\n  datasource:\n    driver-class-name: com.mysql.cj.jdbc.Driver\n    url: jdbc:mysql://localhost:3306/data?useSSL=false&serverTimezone=UTC\n    username: root\n    password: root\n\nlogging:\n  pattern:\n    console:\n\n# \u5173\u95ed mybatis-plus \u7684 banner \u8f93\u51fa\nmybatis-plus:\n  global-config:\n    banner: off\n"})}),"\n",(0,i.jsx)(e.p,{children:"pom.xml"}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-xml",children:"<dependencies>\n    <dependency>\n        <groupId>org.springframework.boot</groupId>\n        <artifactId>spring-boot-starter-web</artifactId>\n        <version>3.4.2</version>\n    </dependency>\n\n    <dependency>\n        <groupId>org.springframework.ai</groupId>\n        <artifactId>spring-ai-mcp-server-spring-boot-starter</artifactId>\n        <version>${spring-ai.version}</version>\n    </dependency>\n\n    <dependency>\n        <groupId>com.mysql</groupId>\n        <artifactId>mysql-connector-j</artifactId>\n        <version>8.0.33</version>\n    </dependency>\n\n    <dependency>\n        <groupId>com.baomidou</groupId>\n        <artifactId>mybatis-plus-spring-boot3-starter</artifactId>\n        <version>3.5.10.1</version>\n    </dependency>\n\n    <dependency>\n        <groupId>com.google.code.gson</groupId>\n        <artifactId>gson</artifactId>\n        <version>2.12.1</version>\n    </dependency>\n</dependencies>\n\n\x3c!-- spring boot \u5de5\u7a0b\u5fc5\u987b\u8981\uff0c\u4e0d\u7136 mcp-serve \u65e0\u6cd5\u542f\u52a8 jar \u5305\uff0c\u4f1a\u5931\u8d25 --\x3e\n<build>\n    <plugins>\n        <plugin>\n            <groupId>org.springframework.boot</groupId>\n            <artifactId>spring-boot-maven-plugin</artifactId>\n            <executions>\n                <execution>\n                    <goals>\n                        <goal>repackage</goal>\n                    </goals>\n                </execution>\n            </executions>\n        </plugin>\n    </plugins>\n</build>\n"})}),"\n",(0,i.jsx)(e.p,{children:"Spring Boot \u542f\u52a8\u7c7b\uff1a"}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-java",children:'@SpringBootApplication\n@MapperScan("indi.yuluo.repository")\npublic class MCPServerApplication {\n\n\tpublic static void main(String[] args) {\n\n\t\tSpringApplication.run(MCPServerApplication.class, args);\n\t}\n\n  // mcp Tool \u5b9a\u4e49\n\t@Bean\n\tpublic ToolCallbackProvider dataTools(ToolsDefinitionService dataService) {\n\n\t\treturn MethodToolCallbackProvider.builder().toolObjects(dataService).build();\n\t}\n\n\t/**\n\t * \u8f93\u51fa\u6570\u636e\u5e93\u67e5\u8be2\u786e\u8ba4\u670d\u52a1\u7aef\u542f\u52a8\u6210\u529f\n\t */\n\t// @Resource\n\t// private MySQLDataService mySQLDataServiceImpl;\n\t//\n\t// @Bean\n\t// public Void run() {\n\t//\n\t// \tSystem.out.println(mySQLDataServiceImpl.getContextData("zhangsan"));\n\t// \treturn null;\n\t// }\n\n}\n'})}),"\n",(0,i.jsx)(e.p,{children:"ToolsDefinitionService.java"}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-java",children:'// \u5b9a\u4e49 tool service \u5728\u542f\u52a8\u7c7b\u4e2d\u6ce8\u5165 bean\n@Service\npublic class ToolsDefinitionService {\n\n  // \u4e00\u4e2a\u666e\u901a\u7684 mysql \u6570\u636e\u5e93\u670d\u52a1\n\t@Resource\n\tprivate MySQLDataService dataService;\n\n\t@Tool(description = "\u8c03\u7528\u6b64\u5de5\u5177\u51fd\u6570\uff0c\u5c06\u53c2\u6570\u8f6c\u4e3a\u5168\u5927\u5199\u5e76\u8fd4\u56de")\n\tpublic String test(String test) {\n\n\t\treturn test.toLowerCase();\n\t}\n\n\t@Tool(description = "\u8c03\u7528\u6b64\u5de5\u5177\u51fd\u6570\uff0c\u4ece mysql \u6570\u636e\u67e5\u8be2\u6307\u5b9a\u59d3\u540d\u7684\u8054\u7cfb\u4eba\u4fe1\u606f")\n\tpublic String queryContact(String name) {\n\n    // \u6839\u636e\u7528\u6237\u540d\u67e5\u8be2\u7528\u6237\u4fe1\u606f\n\t\treturn dataService.getContextData(name);\n\t}\n\n}\n'})}),"\n",(0,i.jsx)(e.p,{children:"\u81f3\u6b64\uff0cMCP server \u5f00\u53d1\u5b8c\u6210\u3002"}),"\n",(0,i.jsx)(e.h4,{id:"222-mcp-\u5ba2\u6237\u7aef\u5f00\u53d1",children:"2.2.2 MCP \u5ba2\u6237\u7aef\u5f00\u53d1"}),"\n",(0,i.jsx)(e.p,{children:"\u73b0\u5728\uff0c\u6784\u5efa MCP client \u7aef\uff0c\u8c03\u7528 server \u7aef MCP Tool\u3002"}),"\n",(0,i.jsxs)(e.blockquote,{children:["\n",(0,i.jsx)(e.p,{children:"\u6b64\u4f8b\u4e2d\u4f7f\u7528 web api \u7684\u65b9\u5f0f\uff0c\u4e5f\u53ef\u4ee5\u4f7f\u7528 CommandLineRunner \u7684\u65b9\u5f0f\u3002"}),"\n"]}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-yml",children:"spring:\n  application:\n    name: mcp-client-example\n\n  mandatory-file-encoding: UTF-8\n\n  ai:\n    dashscope:\n      api-key: ${AI_DASHSCOPE_API_KEY}\n\n    mcp:\n      client:\n        stdio:\n          servers-configuration: classpath:mcp-servers-config.json\n\n\nserver:\n  servlet:\n    encoding:\n      charset: UTF-8\n      enabled: true\n      force: true\n\nlogging:\n  charset:\n    file: UTF-8\n\n  # \u6253\u5370 mcp \u65e5\u5fd7\u4fe1\u606f\uff0c\u65b9\u4fbf\u67e5\u770b MCP Serve \u7684\u65e5\u5fd7\u4fe1\u606f\n  level:\n    io.modelcontextprotocol.client: debug\n    io.modelcontextprotocol.spec: debug\n\n    org.springframework.ai: debug\n"})}),"\n",(0,i.jsx)(e.p,{children:"mcp-servers-config.json"}),"\n",(0,i.jsxs)(e.blockquote,{children:["\n",(0,i.jsx)(e.p,{children:"MCP Server \u7684\u914d\u7f6e\u6587\u4ef6\uff0c\u653e\u5728 resources \u76ee\u5f55\u4e0b\u3002"}),"\n"]}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-json",children:'{\n  "mcpServers": {\n    "my-mcp-example-server": {\n      "command": "java",\n      "args": [\n        "-jar",\n        "-Dspring.ai.mcp.server.stdio=true",\n        "-Dspring.main.web-application-type=none",\n        "-Dlogging.pattern.console=",\n        "-Dspring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver",\n        "-Dspring.datasource.url=jdbc:mysql://localhost:3306/data?useSSL=false&serverTimezone=UTC",\n        "-Dspring.datasource.username=root",\n        "-Dspring.datasource.password=root",\n        "D:\\\\AI\\\\examples\\\\mcp-example\\\\mcp-server-example\\\\target\\\\mcp-server-example-1.0-SNAPSHOT.jar"\n      ],\n      "env": {}\n    }\n  }\n}\n\n'})}),"\n",(0,i.jsx)(e.p,{children:"\u542f\u52a8\u7c7b\uff1a"}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-java",children:'@SpringBootApplication\npublic class MCPClientApplication {\n\n\tpublic static void main(String[] args) {\n\n\t\tSpringApplication.run(MCPClientApplication.class, args);\n\t}\n\n\t// @Bean\n\t// public CommandLineRunner predefinedQuestions(ChatClient.Builder chatClientBuilder, ToolCallbackProvider tools,\n\t// \t\tConfigurableApplicationContext context) {\n\t//\n\t// \treturn args -> {\n\t//\n\t// \t\tvar chatClient = chatClientBuilder\n\t// \t\t\t\t.defaultTools(tools)\n\t// \t\t\t\t.build();\n\t//\n\t// \t\tSystem.out.println("\\n>>> QUESTION: " + "\u5e2e\u6211\u67e5\u8be2\u4e00\u4e0b wangwu \u7684\u4fe1\u606f");\n\t// \t\tSystem.out.println("\\n>>> ASSISTANT: " + chatClient.prompt("\u5e2e\u6211\u67e5\u8be2\u4e00\u4e0b wangwu \u7684\u4fe1\u606f").call().content());\n\t//\n\t// \t\tcontext.close();\n\t// \t};\n\t// }\n\n}\n'})}),"\n",(0,i.jsx)(e.p,{children:"controller"}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-java",children:'@RestController\n@RequestMapping("/mcp")\npublic class MCPClientController {\n\n\tprivate final ChatClient client;\n\n\tpublic MCPClientController(\n\t\t\tChatModel chatModel,\n\t\t\tToolCallbackProvider tools\n\t) {\n    // \u8f93\u51fa MCP server \u7684\u4e24\u4e2a tools\n\t\tArrays.stream(tools.getToolCallbacks()).map(FunctionCallback::getName).forEach(System.out::println);\n\n\t\tthis.client = ChatClient.builder(chatModel)\n\t\t\t\t.defaultTools(tools)\n\t\t\t\t.build();\n\t}\n\n\t@GetMapping("/chat")\n\tpublic Flux<String> chat(\n\t\t\t@RequestParam("prompt") String prompt,\n\t\t\tHttpServletResponse response\n\t) {\n\n\t\tresponse.setCharacterEncoding("UTF-8");\n\n    // \u8f93\u51fa\u54cd\u5e94\n\t\treturn client.prompt().user(prompt).stream().content();\n\t}\n\n}\n'})}),"\n",(0,i.jsx)(e.h3,{id:"23-\u8bf7\u6c42\u6d4b\u8bd5",children:"2.3 \u8bf7\u6c42\u6d4b\u8bd5"}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-http",children:'### Test API\nGET http://127.0.0.1:8080/mcp/chat?prompt="\u5c06 user \u8f6c\u4e3a\u5927\u5199"\n\n\u8f6c\u4e3a\u5927\u5199\u7684\u7ed3\u679c\u662f\uff1aUSER\n\n### MySQL API\nGET http://127.0.0.1:8080/mcp/chat?prompt="\u5e2e\u6211\u4ece\u6570\u636e\u5e93\u67e5\u8be2\u4e00\u4e0b wangwu \u7684\u8054\u7cfb\u4fe1\u606f"\n\n\u67e5\u8be2\u7ed3\u679c\u663e\u793a\uff0c\u8054\u7cfb\u4eba wangwu \u7684\u4fe1\u606f\u5982\u4e0b\uff1a\n\n- ID: 3\n- \u5e74\u9f84: 24\n- \u7535\u5b50\u90ae\u4ef6: 789@gmail.com\n\n\u8fd9\u662f\u5173\u4e8e wangwu \u7684\u8be6\u7ec6\u8054\u7cfb\u4fe1\u606f\u3002\n'})}),"\n",(0,i.jsx)(e.h2,{id:"3-\u603b\u7ed3",children:"3. \u603b\u7ed3"}),"\n",(0,i.jsxs)(e.p,{children:["Example Code\uff1a",(0,i.jsx)(e.a,{href:"https://github.com/deigmata-paideias/deigmata-paideias/tree/main/ai/mcp-example",children:"https://github.com/deigmata-paideias/deigmata-paideias/tree/main/ai/mcp-example"})]}),"\n",(0,i.jsx)(e.p,{children:"\u5728\u672c\u6587\u4e2d\uff0c\u4ecb\u7ecd\u4e86\u4ec0\u4e48\u662f MCP \u4ee5\u53ca MCP \u7684\u4f5c\u7528\u548c\u89e3\u51b3\u7684\u95ee\u9898\u3002\u7f16\u5199\u4e86\u4e00\u4e2a\u7b80\u5355\u7684\u4f8b\u5b50\u6765\u4f53\u9a8c MCP \u7684\u80fd\u529b\u3002"}),"\n",(0,i.jsx)(e.p,{children:"\u5728 MCP \u4e2d\uff0c\u9664\u4e86 STDIO \u7684\u65b9\u5f0f\u4e4b\u5916\uff0c\u8fd8\u652f\u6301 SSE \u7684\u65b9\u5f0f\u3002\u66f4\u597d\u7684\u6ee1\u8db3\u4e0d\u540c\u7684\u4e1a\u52a1\u573a\u666f\u3002"})]})}function d(n={}){const{wrapper:e}={...(0,a.R)(),...n.components};return e?(0,i.jsx)(e,{...n,children:(0,i.jsx)(p,{...n})}):p(n)}},57104:(n,e,t)=>{t.d(e,{A:()=>r});const r=t.p+"assets/images/img-f60f77238e85c577be6c5335e5ebc55a.png"},89999:(n,e,t)=>{t.d(e,{R:()=>o,x:()=>l});var r=t(58101);const i={},a=r.createContext(i);function o(n){const e=r.useContext(a);return r.useMemo((function(){return"function"==typeof n?n(e):{...e,...n}}),[e,n])}function l(n){let e;return e=n.disableParentContext?"function"==typeof n.components?n.components(i):n.components||i:o(n.components),r.createElement(a.Provider,{value:e},n.children)}},60772:n=>{n.exports=JSON.parse('{"permalink":"/blog/mcp","editUrl":"https://github.com/yuluo-yx/blog/edit/master/blog/AI-large-models/MCP.md","source":"@site/blog/AI-large-models/MCP.md","title":"MCP \u4ecb\u7ecd\u548c\u57fa\u672c\u4f7f\u7528","description":"\u5927\u6a21\u578b\u4e13\u680f -- MCP\uff08Model Context Protocol\uff09","date":"2025-03-11T21:01:08.000Z","tags":[{"inline":true,"label":"AI","permalink":"/blog/tags/ai"},{"inline":true,"label":"Spring AI Alibaba","permalink":"/blog/tags/spring-ai-alibaba"},{"inline":true,"label":"MCP","permalink":"/blog/tags/mcp"}],"readingTime":4.516666666666667,"hasTruncateMarker":true,"authors":[{"name":"\u7267\u751f","title":"Java & go developer","url":"https://github.com/yuluo-yx","email":"yuluo08290126@gmail.com","socials":{"x":"https://x.com/yuluo","github":"https://github.com/yuluo-yx"},"imageURL":"https://kuizuo.cn/img/logo.png","key":"yuluo","page":null}],"frontMatter":{"slug":"mcp","title":"MCP \u4ecb\u7ecd\u548c\u57fa\u672c\u4f7f\u7528","date":"2025-03-11T21:01:08.000Z","authors":"yuluo","tags":["AI","Spring AI Alibaba","MCP"],"keywords":["AI","Spring AI Alibaba","MCP"],"image":"/img/ai/mcp/img.png"},"unlisted":false,"nextItem":{"title":"\u4f7f\u7528 Spring AI Aliabab Module RAG \u6784\u5efa Web Search \u5e94\u7528","permalink":"/blog/spring-cloud-alibaba-module-rag"}}')}}]);