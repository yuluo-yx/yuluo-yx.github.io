const n=`---
slug: trace-transfer
title: 异构服务链路追踪
date: 2025-09-14 20:49:08
authors: yuluo
tags: [Java, Go, OpenTelemetry, Zipkin]
keywords: [Java, Go, OpenTelemetry, Zipkin, Gateway, Spring Boot]
---

<!-- truncate -->

文中使用的框架和服务：

网关：Spring Cloud Gateway

服务上游：Spring Boot 3.5.1 Spring Cloud 2025.0.0.0（Java）

服务下游：Kratos 2.8.0（Go）

链路追踪工具：Zipkin

Demo 地址：https://github.com/deigmata-paideias/deigmata-paideias/trace-transfer

## Zipkin 启动

\`\`\`yml
services:

  zipkin:
    image: 'openzipkin/zipkin:latest'
    container_name: "spring-ai-alibaba-zipkin"
    ports:
      - '9411:9411'
\`\`\`

\`docker compose up -d\` 浏览器访问 9411.

## 关键性配置

### SCG

pom.xml

> tracing 组件

\`\`\`xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing</artifactId>
</dependency>

<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-brave</artifactId>
</dependency>

<dependency>
    <groupId>io.zipkin.reporter2</groupId>
    <artifactId>zipkin-reporter-brave</artifactId>
</dependency>
\`\`\`

> Gateway 

\`\`\`xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>

<!-- Spring Cloud Gateway -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway-server-webflux</artifactId>
</dependency>
\`\`\`

application.yml

 \`\`\`yml
 management:
   endpoints:
     web:
       exposure:
         include: '*'
   endpoint:
     health:
       show-details: ALWAYS
     logfile:
       external-file: ./logs/\${spring.application.name}/console.log
   tracing:
     enabled: true
     sampling.probability: 1.0
     propagation:
       type: w3c
   zipkin:
     tracing:
       endpoint: http://localhost:9411/api/v2/spans
 
 \`\`\`

### user-service

pom.xml 和 application.yml 相同。

pom 差异：

>  openfeign 远程调用

\`\`\`xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
\`\`\`

FeignB3HeaderInterceptorConfig.java

> 如果不配置此请求拦截，openfeign 在 rpc 调用时不会自动透传请求头。

\`\`\`
@Configuration
public class FeignB3HeaderInterceptorConfig {

    @Bean
    public RequestInterceptor b3HeaderInterceptor() {
        return template -> {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                String b3 = request.getHeader("traceparent");
                if (b3 != null) {
                    template.header("traceparent", b3);
                }
            }
        };
    }
}
\`\`\`

OpenFeign Client

\`\`\`java
@FeignClient(name = "kratos-user-svc", url = "http://localhost:8000")
public interface UserAPI {

    @GetMapping(value = "/api/v1/user/{id}")
    User getUser(@PathVariable("id") String id);

}
\`\`\`

主类添加 \`@EnableFeignClients\` 注解，开启 FeignClient。

### Kratos 

main.go

> Zipkin Init.

\`\`\`go
func zipkinTrace() {

    exporter, _ := zipkin.New("http://localhost:9411/api/v2/spans")

    otel.SetTracerProvider(trace.NewTracerProvider(
       trace.WithBatcher(exporter),
       trace.WithSampler(trace.AlwaysSample()),
    ))
}
\`\`\`

> **zipkingTrace**  函数放在 wireApp 之前。否则会导致 trace 失败？

## Zipkin trace 截图

![image-20250914200501689](/img/tracing/trace.png)

## 其他问题

1. \`tracing.propagation.type: w3c\` 要写 \`w3c\` ，\`b3\` 会导致请求头传递失败，串联不起来链路？

   这可能和下面代码有关，初始化成 zipkin b3.

   \`\`\`go
   otel.SetTracerProvider(trace.NewTracerProvider(
     trace.WithBatcher(exporter),
     trace.WithSampler(trace.AlwaysSample()),
   ))
   \`\`\`

2. OpenFeign 必须要手动转发 \`tracing\` header？

3. kratos http & grpc 中间件添加 \`tracing.Server()\`？
`;export{n as default};
