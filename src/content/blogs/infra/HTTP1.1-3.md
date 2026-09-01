---
slug: HTTP 1.0、1.1、2 & 3
title: HTTP 1.0、1.1、2 & 3
date: 2026-08-01 17:10:11
authors: yuluo
tags: [Infra]
keywords: [Infra]
image: /img/infra/http.png
---

HTTP 网络通讯协议最开始建立之初，主要就是为了将超文本标记语言（HTML）文档从 Web 服务器传送到客户端的浏览器。

通俗理解：对于前端来说，前端开发所写的 HTML 页面放在 Web 服务器（Nginx，Apache，Tomcat 等）上，用户端通过浏览器访问 url 地址来获取网页的显示内容。到了 Web2.0 之后，浏览器页面变得越来越复杂，不仅仅是一些简单的文字和图片。为了增强 HTML 的渲染效果和动态战术数据。 HTML 页面有了 CSS，Javascript，来丰富页面展示的内容。当 Ajax 出现之后，又多了一种向服务器端获取数据的方法，这些其实都是基于 HTTP 协议。

同样到了移动互联网时代，前端页面可以跑在手机端浏览器里面。和 PC 相比，手机端的网络情况更加复杂，这使得网络基础设施不得不对 HTTP 进行深入理解并不断优化。

## HTTP 1.0

诞生于 1996 年并作为 RFC 1945 正式发布，主要引入了**请求状态码**、**HTTP 请求/响应头部**以及**多媒体文件传输能力**。在这之前还有 0.9。

### 特点

- 无状态：服务器不跟踪不记录请求过的状态；
- 无连接：浏览器每次请求都需要建立 tcp 连接（链接不复用）；
- 引入了基础的缓存控制，通过响应头中的 `Expires` 字段表示资源的过期时间。

HTTP/1.0 规定浏览器和服务器保持短暂的连接。浏览器的每次请求都需要与服务器建立一个TCP连接，服务器处理完成后立即断开TCP连接（**无连接**），服务器不跟踪每个客户端也不记录过去的请求（**无状态**）

> 无状态导致的问题可以借助 [cookie/session](#cas) 机制来做身份认证和状态记录解决。

### 局限性

然而，无连接特性将会导致以下性能缺陷：

1. 无法复用连接：每次发送请求的时候，都需要进行一次 TCP 连接，而 TCP 的连接释放过程开销很大（三次握手，四次挥手），这种无连接的特性会导致网络的利用率非常低。
2. 队头堵塞（head of line blocking）：由于 HTTP/1.0 规定下一个请求必须在前一个请求响应到达之前才能发送。假设一个请求响应一直不到达，那么下一个请求就不会发送，导致后面请求阻塞。

## HTTP 1.1

HTTP/1.1 于1997年在 RFC 2068 中提出，并在1999年通过 [RFC 2616](https://zhida.zhihu.com/search?content_id=255035793&content_type=Article&match_order=1&q=RFC+2616&zd_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ6aGlkYV9zZXJ2ZXIiLCJleHAiOjE3ODU3NDM1MjgsInEiOiJSRkMgMjYxNiIsInpoaWRhX3NvdXJjZSI6ImVudGl0eSIsImNvbnRlbnRfaWQiOjI1NTAzNTc5MywiY29udGVudF90eXBlIjoiQXJ0aWNsZSIsIm1hdGNoX29yZGVyIjoxLCJ6ZF90b2tlbiI6bnVsbH0.iN9QQDldCqGNdymBTs3Rnn5BaPxs51NGEFEbhrDjhJI&zhida_source=entity) 进行了更新。它成为了互联网发展过程中最长寿的 HTTP 协议版本。

### 特点

HTTP 1.1 基于 TCP 协议，所以工作在 OSI 网络模型的第 6 层。以文本格式传输内容，默认开启 **Keep-alive** 长连接，允许在一个 TCP 上发送多个 HTTP Request。

1. 支持以管道方式同时发送多个请求；在一个请求未结束时发送一个新的请求；TCP 连接未断开，使用同一个管道；
2. 优化了缓存机制，当浏览器请求资源时，先查看本地有没有，没有在去请求，通过字段 cache-control 控制；
3. 支持断点传输，通过在 Header 中添加参数实现，客户端发请求时对应的是 Range 服务器端响应时对应的是 Content-Range。

### 局限性

1. 使用文本协议传输数据，序列化性能差；
2. 不支持并行化发送请求，只能串行；
3. 由于响应顺序依赖，若前一个请求响应速度较慢，后续所有请求都会被阻塞（队头阻塞）；
4. 请求头冗余：每个请求都需要完整的 HTTP 头部信息，重复字段（如 `Host`、`User-Agent`）增加了带宽占用；
5. 在 Chrome 中 HTTP/1.1 对于同一个 [origin](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Origin) ，同一时刻最多只能有 6 个 TCP 连接。

## HTTP 2

HTTP 1.1 之后的通用协议，基于 Google 的 SPDY 设计，同样基于 TCP 协议。

### 特点

1. 使用 Google 的 SPDY 方案，提出了多路复用机制，多个请求 stream 复用同一个 TCP 连接并行处理多个请求和响应，降低延迟，同时提高带宽利用率；
2. 使用二进制格式传输数据，提升数据序列化性能；
3. 引入了 header 压缩机制，HTTP1.1 的 header 带有大量信息，而且每次都要重复发送，HTTP2.0 使用 HPACK 算法对 HTTP 头部进行压缩，减少传输的数据量，部分解决了队头阻塞问题；
4. 支持优先级设置，确保重要资源优先传输；优化页面渲染能力；
5. 服务器主动推送，在页面加载时，主动将 CSS，JS 等资源 push 到客户端，提高响应速度。

### 局限性

1. HTTP 2.0 在应用层协议上解决了队头阻塞问题，但是 TCP 协议在网络丢包时，整个 TCP 连接必须等待重传。依赖存在队头阻塞问题；

   TCP协议在收到数据包之后，这部分数据可能是乱序到达的，但是 TCP 必须将所有数据收集排序整合后给上层使用，如果其中某个包丢失了，就必须等待重传，从而出现某个丢包数据阻塞整个连接的数据使用。

2. 单连接瓶颈：所有请求共用一个 TCP 连接，极端情况下会导致带宽竞争和拥塞控制冲突；

3. TCP 握手延迟，在弱网环境下，握手（三次握手）耗时较长；

## HTTP 3

为了解决 HTTP2.0 的一些局限性问题，HTTP3 问世了，基于 UDP，使用 QUIC 协议传输数据，解决了队头阻塞问题和连接时间长的问题。

### 特点

1. 解决连接问题：HTTP2 连接基本上要花到 2~3 个 RTT（Round Trip Time，往返时延，是指数据包从发端发送到接收到对方的确认 [ACK] 所经历的时间） 才能完成连接，但 QUIC 基本上可以实现 1 或 0RTT 去完成连接。如果是首次需要花 1RTT 去完成连接，但如果非首次连接 0RTT 就可以完成。这是因为首次连接时会缓存配置文件，后续再连接时就可以直接使用，从而跳过 1RTT，实现 0RTT 的业务数据交互。
2. 解决 TCP 队头阻塞问题：QUIC 协议是基于 UDP 协议实现的，在一条链接上可以有多个流，流与流之间是互不影响的，当一个流出现丢包影响范围非常小，从而解决队头阻塞问题。

### 局限性

1. 服务器和浏览器端都没有对 HTTP3 提供完整支持。Chrome 浏览器虽然在数年前就开始支持 Google 版本的 QUIC，但是 Google QUIC 和官方的 QUIC 存在着非常大的差异；
2. 部署 HTTP3 也有非常大的问题。因为系统内核对 UDP 的优化远远没有达到 TCP 的优化程度；
3. 中间设备僵化的问题：这些设备对 UDP 的优化程度远远低于 TCP，据统计使用 QUIC 协议时，大约有 3%～7% 的丢包率。
