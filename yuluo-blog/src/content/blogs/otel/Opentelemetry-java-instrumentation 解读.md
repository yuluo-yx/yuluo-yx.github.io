---
slug: opentelemetry-project
title: Opentelemetry 项目解读
date: 2025-04-19 17:44:00
authors: yuluo
tags: [Opentelemetry-java-instrumentation, OT, Java, OTEL]
keywords: [OT, Java, OTEL]
image: /img/otel/ot-1.png
---

<!-- truncate -->

# Opentelemetry-java-instrumentation 解读

## 1. 什么是 Opentelmetry 

Ot 统一了可观测的三个重要维度：分别是 Trace，Log，Metrics。

在没有 ot 之前，不同维度的可观测组件都是不同的：

1. 在 Trace 领域：skywalking 一直很受欢迎；
2. 在 Metrics 领域：主要以 Prometheus 为主，VictoriaMetric 也很受欢迎，占用资源更少；
3. 在 Log 领域：ELK 经久不衰。

不过为了解决可观测这一问题，同时引入三个组件，导致技术栈众多，维护麻烦。ot 便是为了解决这个问题，让开发者能花费少量精力完成可观测建设。

由  OpenTracing，OpenCensus 合并共同发展而来。现在已经是 CNCF 的顶级项目了，并且受到了很多大厂的支持。

### 1.1 OpenTelmetry 架构

![ot 架构](/img/otel/ot-1.png)

从上图中看到，整个 Oentelmetry 系统可以分为三个组成部分。

### 1.1.1 客户端

客户端就是我们编写得业务系统的服务，用 Go 或者 Java 编写。如果是 Java 应用，在 ot 中，只需要挂载一个 agent 就可以采集到系统的指标，链路和日志数据上传到 Collector 中。既架构图中的左边部分。

#### 1.1.2 Otel Collector

![ot collector](/img/otel/ot-2.png)

ot 在设计最初的目的是要做到厂商无关性，不和任意一个厂商或者产品绑定。因此在 collector 做了更高层的抽象设计。

如图中的数据接受和导出组件，Receiver和 Exporter。都采用可插拔的设计方式。第三方的开发者可以基于 ot 的标准协议开发不同的 Receiver和 Exporter 组件来兼容不同的产品，从而做到厂商无关性。

Receiver：用于接受客户端上报的数据，不止是来自 agent 的数据，也有可能来自不同的服务产品。例如 k8s，kafka 等。

Exporter：在接收到 Receiver的数据，由 collector 处理之后可以将其输出到不同的组件中，比如：Kafka，Jaeger 等。

在使用 ot 时，我们可以使用 Nginx Receiver接受来自 nginx 的数据，使用 MySQL Receiver接受来自 MySQL 的数据等。通常使用最多的是 otel Receiver，ot 官方的 OTLP 协议的数据接收器，接受来自 ot 的一些指标。例如只使用了 Java agent 上报可观测数据时。

Exporter 主要负责将不同的指标数据写入到不同的组件中，例如将指标相关数据写入到 Prometheus，日志写入到 es 等。

对比之下，ot collector 的 Receiver 和 Exporter 可以非常灵活的搭配，数据存储的变更，不会直接影响到业务系统。业务系统只需要按照 OTLP 协议的格式上报数据即可。

## 2. Opentelmetry 项目

从上面的架构图了解到：ot 的整个项目主要分为客户端和 collector 端。除了 java 之外，ot 还支持其他语言的客户端。大部分都达到了生产可用的程度。

接下来，深入了解下 opentelemetry-java 和 opentelemetry-java-instrumentation。

在日常使用中，用到最多的项目是：opentelemetry-java-instrumentation。提供了 ot 的 java agent 。

在启动项目时，只需要加上 java agent 就可以自动实现可观测数据的上报：

```shell
java -javaagent:path/to/opentelemetry-javaagent.jar -jar myapp.jar
```

### 2.1 opentelemetry-java

opentelemetry-java-instrumentation 基于 opentelemetry-java 创建。是 ot Java 版本的核心基础库。

### 2.2 opentelemetry-java-instrumentation

集成了常用的 Java 的不同框架，库的可观测数据。

其他项目大致结构类似。例如 collector 分为：**OpenTelemetry Collector** 和 **OpenTelemetry Collector Contrib**

opentelemetry-collector：由 ot 官方维护，提供最基础的核心能力；比如只包含了最基本的 otlp 的 receiver 和 exporter。

opentelemetry-collector-contrib：包含了官方的 collector，同时维护了社区提供的各种 receiver 和 exporter；就如上文提到的，一些社区组件（pulsar、MySQL、Kafka）等都维护在这个仓库。

## 3. 总结

 OpenTelemetry 想要解决的是整个可观测领域的所有需求，做到真正的厂商无关性，因此自身有非常多的 Receiver 和 Exporter。

下一篇文章中，将会介绍如何在 opentelemetry-java-instrumentation 仓库中为 Java 库和框架提供可观测支持。

### 3.1 参考链接：

https://juejin.cn/post/7358450927110357026?from=search-suggest

https://opentelemetry.io/ecosystem/registry/

[open-telemetry/opentelemetry-java-instrumentation: OpenTelemetry auto-instrumentation and instrumentation libraries for Java](https://github.com/open-telemetry/opentelemetry-java-instrumentation)

https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md#libraries--frameworks
