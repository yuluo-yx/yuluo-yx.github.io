---
id: ai-gateway
slug: /ai-gateway
title: AI Gateway 介绍
date: 2025-06-16 23:46:00
authors: yuluo
tags: [AI Gateway]
keywords: [AI Gateway]
---

<!-- truncate -->

## AI 网关和传统的 API 网关

### API 网关发展

在最开始的时候，互联网通过电话线连接上网，通过“调制解调器（Modem）”将计算机信号和电话线信号“调制”与“调解”以实现上网功能。当今时代大多使用宽带上网，拨号上网已被逐渐淘汰。

流量网关得雏形来自于路由器，交换机和中转站等技术，在网络流量传输中，帮助优化流量，提高安全性和流量管理能力。

#### 传统流量代理

随着互联网越来越普及和规模化，需要解决得问题越来越多，例如：

- 跨域访问；
- 性能；
- 安全等。

**正向代理（Forward Proxy）**

正向代理是客户端（用户）和目标服务器之间的中继代理，客户端通过正向代理发送请求，代理服务器将请求转发给目标服务器，并将响应返回给客户端。如下图所示：

![image-20250620235721953](/img/ai/ai-gateway/image-20250620235721953.png)

> 正向代理服务器一般部署在客户端内网环境中，内部用户通过其来访问外部资源。

如图所示，正向代理解决了以下问题：

1. 安全：保护用户 IP 地址安全，防止 IP 追踪；
2. 突破封锁：在一些情况下，客户端无法直接访问某些服务器，此时可以使用代理服务突破地理/IP 封锁限制；
3. 流量过滤：过滤流量内包含的不良信息，例如学校内网或者图书馆网络等。

**反向代理（Reverse Proxy）**

反向代理是目标服务器的中继节点，客户端的请求首先到达反向代理，由它转发到实际的目标服务器。目标服务器的响应同样通过反向代理返回给客户端，如下图所示：

![image-20250621000605783](/img/ai/ai-gateway/image-20250621000605783.png)

> 反向代理服务器一般部署在服务端内网环境中，用来接受客户端流量并转发给服务器。

如图所示，反向代理解决了以下问题：

1. 安全：保护服务器的真实 IP 地址，抵御 DDos 攻击；
2. 性能优化：采用 LB 策略，静态资源缓存等加速访问；
3. 统一服务入口。

应用场景如 WAF（Web Application Firewall，Web应用防火墙）、CDN 等。

#### API 网关代理

微服务架构的核心枢纽，统一管理 API 生命周期，实现流量管理，服务治理，安全防护等特性。

![image-20250621103344144](/img/ai/ai-gateway/image-20250621103344144.png)

在没有 Web API Gateway 组件时，client 流量直接打在服务器上，对后端服务器压力较大，且流量处理逻辑集中在后端上，使得后端服务不能专注于处理业务，同时还要处理和网络日志等相关代码逻辑。

加入 API gw 之后，统一将 API 流量管理分离到 API gw 来完成，其核心能力主要为：

1. 服务治理：熔断，限流，重试，healthCheck，金丝雀发布，可观测支持等；
2. 安全防护：高级认证，API 鉴权，黑白名单等；
3. 流量管理：流量染色，多种路由策略，协议转换等。

### AI 网关

大模型时代的 AI API 流量调度中心，连接 AI 服务和应用客户端。这里借用 Higress 的 AI 网关架构图来展示。

![img](https://framerusercontent.com/images/Tq5OTIrnDjn9K6bHAMXw9BYVgw.png)

AI 网关核心能力：

1. AI 流量调度，提高 TTFT（Time To First Token）并提高系统吞吐量；
2. MCP 生态集成，通过 AI 网关，集成 MCP Server；
3. 保障大模型的内容安全，对输入和输出进行过滤；
4. 屏蔽底层协议，对外暴露统一 endpoint。例如 OpenAI API 和 Dashscope API ；
5. 实现 Token 限流功能；
6. 实现 AI 可观测集成等。

从 OpenAI GPT 爆火之后，企业级 AI 应用需求大幅增长，AI API 调用量激增， 通过 AI Gateway 可以大幅度提升 AI 接入体验。以上几点在 Higress AI 中都有体现，细节参考 [Higress AI](https://higress.ai/) 。

## AI 网关的理解

在上文中，介绍了 AI 网关的核心能力主要有以下几点，其作为 API Gateway 的一个变种实现，主要为 AI 调用提供便利：

AI 流量调度

- **感知流量调度**：通过 LLM（大语言模型）感知的流量调度，利用 Prefix Cache、Lora Adapter、KVCache 等策略，实现 TTFT（响应时间）的大幅降低。
- **公平调度**：采用 VTC（虚拟时间控制）策略，确保流量的公平分配。

AI 服务治理

- **多租户限流**：基于输入/输出 Token 实现的限流机制，确保不同用户的请求得到合理处理。
- **自动故障转移**：根据服务优先级进行推理服务的自动切换，提升系统的稳定性。
- **超时重试**：设置超时重试机制，确保请求的可靠性。

AI 安全防护

- **证书管理**：管理 LLM 供应商的证书，确保安全性。
- **安全校验**：对请求的 prompt 进行安全校验，防止恶意内容。
- **内容过滤**：实现不当内容的过滤，保障使用安全。

AI 可观测性

- **细粒度指标**：提供对 LLM 服务访问的细致指标，便于监控和分析。

AI 扩展插件

- **插件机制**：支持用户面向 LLM 场景的插件，如语义缓存和 Prompt 改写，增强功能灵活性。

AI 生态交互

- **协议转换**：实现 MCP（模型控制协议）到 HTTP 的转换，便于无缝对接。
- **统一 API 管理**：支持多 LLM 供应商的接入，简化 API 管理流程。

### AI 网关架构

下面以 Envoy AI Gatwway 为例，来分析下 AI 网关架构。其分为数据面（CP control plane）和控制面（DP data plane）。

- CP：将用户配置 CRD 等转流量配置规则，下发至 DP；
- DP：应用 CP 下发的规则，转发给指定的 AI 后端。

![image-20250621105650752](/img/ai/ai-gateway/image-20250621105650752.png)

从架构图可以看到，请求流量经过 External processor，通常在这里会给流量染色，加入后端服务特征，后续 DP 基于此特征转发流量。

![image-20250621110056249](/img/ai/ai-gateway/image-20250621110056249.png)

上图为 Envoy AI Gateway DP 面和流量示意图。可以看出 Envoy AI Gateway 提供的 AI Gateway 发生在请求流量的那一步。

### AI 网关功能详解

#### LLM 感知的流量调度

**基于 Prefix  Cache 的调度**

LLM 推理计算主要分为两个过程：Prefill 阶段（Prompt 计算）和 **Decode 阶段**。在 Prefill 阶段计算所有 Token 的 KV Cache，通常 KVCache 只是为单次推理的，当推理结束，对应的 KV-Cache 就会清除。此时，AI Gateway 就可以保存并复用对应的 KV Cache。

在某些 LLM 业务场景下，多次请求的 Prompt 可能会共享同一个前缀（Prefix），比如少量**样本学习，多轮对话**等。在这些情况下，很多请求 Prompt 的前缀的 KV Cache 计算的结果是相同的，可以被缓存起来，给之后的请求复用。

> 这里既然要复用对应的 KV Cache，KV Cache 又是在同一个 AI 后端 pod 中产生的，那么自然要求 Prefix Cache 的优化要调度到同一个 Pod 上去。

**基于 VTC 公平推理调度**

> 参考地址 Arxiv：https://arxiv.org/pdf/2501.14312

虚拟令牌计数器（VTC）是基于 “大型语言模型服务的公平性” 的 LLM 服务公平调度算法。

VTC 的目的是通过跟踪每个客户获得的服务（加权令牌计数），优先处理获得服务较少的客户，从而实现客户之间的公平性。它集成了连续批处理功能，并能处理 LLM 服务所面临的独特挑战，如可变的令牌成本和未知的输出长度。

其他的调度策略不一一描述。

#### MCP 转换

Higress 支持将存量的 API 服务转为 MCP Server，并基于 Higress 进行服务调用。

#### Token 限流

- https://higress.cn/ai/scene-guide/token-management/

AI Gateway 能够对大模型使用的 Token 数量进行追踪，在消费者使用超额时进行限制，从而更好管理调用 AI 应用的用户额度，为 Token 使用分析提供数据支持

#### 自动故障转移

相关概念可以参考：https://help.aliyun.com/zh/api-gateway/ai-gateway/user-guide/ai-fallback 

结合服务发现机制，为 AI 后端服务根据 Region 和 Zone 设立优先级，当某个 AI 后端服务不可用时，短暂从可用列表中摘除，使用小流量探测的手段，直至 AI 后端服务恢复时继续提供服务。

#### AI 内容安全

基于此机制，API Gateway 可以通过进入阿里云的[内容安全审核服务](https://www.aliyun.com/product/lvwang)对用户的 Prompt 进行检测，以组织不安全的输入：

![image-20250621110823545](/img/ai/ai-gateway/image-20250621110823545.png)

#### 自定义扩展

可扩展是 API Gateway 的一个重要特性，支持用户根据自己的流量场景，使用不同的语言定制化 API Gateway 插件，例如 Kong 和 APISIX 支持 Lua 插件集成。

在此处同样参考 Higress 的架构图，其基于 WASM 机制，提供了一系列的 AI 插件：

![image-20250621110535050](/img/ai/ai-gateway/image-20250621110535050.png)

## 参考资料

1. Envoy AI Gateway：https://aigateway.envoyproxy.io/docs/concepts/architecture/system-architecture
2. Higress AI：https://higress.ai/
3. 阿里云内容审核服务：https://www.aliyun.com/product/lvwang
4. K8s Gateway API 推理扩展：https://kubernetes.io/zh-cn/blog/2025/06/05/introducing-gateway-api-inference-extension/
5. VTC 公平推理调度：https://arxiv.org/pdf/2501.14312
