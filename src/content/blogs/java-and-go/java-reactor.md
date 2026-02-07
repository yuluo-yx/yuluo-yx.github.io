---
slug: java-reactor
title: Java Reactor
date: 2026-02-07 15:51:00
authors: yuluo
tags: [Java]
keywords: [Java]
---

<!-- truncate -->

一直对响应式编程和 Reactor 等等搞不清楚？写个文章总结下看看。

在代码中，常见的编程范式有以下几种：

+ _**命令式编程 ：直接描述执行步骤，C 等**_；
+ _**声明式编程：描述想要的结果，而不是具体步骤 SQL**_；
+ _**面向对象编程：使用对象模拟，Java**_；
+ _**函数式编程：将程序执行视为数学函数求值，**_Haskell_；
+ _**逻辑编程：基于形式逻辑的编程方式**_；
+ _**事件驱动编程：程序流由事件（用户动作、传感器等）决定，用于 GUI 开发，JavaScript**_；
+ _**并发编程：_并发编程：处理并发任务_，Go Routine**_。

## 响应式编程（_Reactive_ Programming）
主要关注数据流和变化的传播。简单来说，就是当数据发生变化时，相关的部分会自动做出响应。响应式编程是一种**编程范式**，强调在**数据流**和**变化传播**上进行编程。它结合了声明式编程（how to transform）、函数式编程思想（immutable、composable）和事件驱动模型（when to respond）

### 响应式和阻塞式区别
阻塞式是较为传统的编程模型。以 Web 请求为例，会为其单独分配一个线程来处理请求，且在处理过程中保持阻塞，直至返回结果。适合同步任务处理。

响应式在 Web 请求过程中，不会一直阻塞线程，通过调度器+线程复用 使用少量线程处理多个请求。适应高并发场景。

```java
阻塞式：1个请求 → 1个线程 → 阻塞等待 → N个请求需要N个线程

响应式：N个请求 → M个线程（M << N） → 异步处理 → 线程可复用
```

### 响应式和流式
响应式和我们平时说的流式（Stream）有什么关系呢？

Stream 主要用于集合处理，同步执行。响应式是流式处理的超集，在 Stream 之上支持更多的特性操作。

例如可订阅，持续等。

```java
// Stream：同步、一次性、集合处理
list.stream()
    .filter(x -> x > 10)
    .map(x -> x * 2)
    .forEach(System.out::println);  // 立即执行

// Reactor：异步、可重复订阅、持续的数据流
Flux.create(sink -> {
    // 可以随时发出数据
    sink.next(1);
    sink.next(2);
})
.filter(x -> x > 10)
.map(x -> x * 2)
.subscribe(System.out::println);  // 延迟执行
```

## 网络 Reactor （反应器）模型
Reactor 是响应式编程范式的一种实现，基于 IO 多路复用。

### 网络 IO 发展
网络请求先后经历：服务器网卡、内核、连接建立、数据读取、业务处理、数据写回等一系列过程。

其中，连接建立 (accept)、数据读取 (read)、数据写回 (write) 等操作都需要操作系统内核提供的系统调用，最终由内核与网卡进行数据交互，这些 IO 调用消耗一般是比较高的，比如 IO 等待、数据传输等。

最初的处理方式是，每个连接都用独立的一个线程来处理这一系列的操作，

即 建立连接、数据读写、业务逻辑处理；这样一来最大的弊端在于，N 个连接就需要 N 个线程资源，消耗巨大。

所以，在网络模型演化过程中，不断的对这几个阶段进行拆分。

比如，将建立连接、数据读写、业务逻辑处理等关键阶段分开处理；这样一来，每个阶段都可以考虑使用单线程或者线程池来处理，极大的节约线程资源；同时，又能获得超高性能。

#### 四种常见的 IO 模型
**（1）同步阻塞IO（Blocking IO）**：即传统的IO模型。

**（2）同步非阻塞IO（Non-blocking IO）**：默认创建的socket都是阻塞的，非阻塞IO要求socket被设置为NONBLOCK。注意这里所说的NIO并非Java的NIO（New IO）库。

**（3）IO多路复用（IO Multiplexing）**：即经典的Reactor设计模式，有时也称为异步阻塞IO，Java中的Selector和Linux中的epoll都是这种模型。

**（4）异步IO（Asynchronous IO）**：即经典的Proactor设计模式，也称为异步非阻塞IO。

#### Select、poll 和 epoll 机制。
I/O多路复用是指：通过一种机制，可以**监视多个描述符**，一旦某个文件描述符（fd）就绪（一般是读就绪或者写就绪），能够通知程序进行相应的读写操作。

三种机制都是 IO 多路复用的实现方式，但是他们彼此有一些差别。

##### select
知乎看到的例子，感觉很形象。住校时，你的朋友来找你：

+ select版宿管阿姨，带着你的朋友挨个房间找，直到找到（线性轮询）；
+ epoll 版阿姨记住了所有同学的房间，**当你的朋友敲门时，阿姨立即通知你**（被动通知）

单个进程可监视的 fd 数量被限制，即能监听端口的数量有限 单个进程能打开的最大连接数由FD_SETSIZE 宏定义，FD_SETSIZE 限制了 select 能监听的最大文件描述符数量，通常为1024（32位）或2048（64位），可以修改但需要重新编译内核。当然也可对其修改，然后重新编译内核，但性能可能受影响，这需要进一步测试。一般该数和系统内存关系很大，具体数目可以  `cat /proc/sys/fs/file-max`察看。32 位机默认 1024 个，64 位默认 2048。最大只支持 1024，随着并发数增大，效率降低；

```shell
~ # cat /proc/sys/fs/file-max
9223372036854775807
```

##### pop
相比于 select，只是描述 fd 集合的方式不同。且无最大文件句柄限制。

##### epoll
epoll模型修改主动轮询为被动通知（基于回调），当有事件发生时，被动接收通知。

### 阻塞和非阻塞 IO 模型
继续下去之前，先了解下操作系统的用户线程和内核线程。内核线程是操作系统内核来管理的线程，受内核调度，主要负责系统内核的任务处理。

用户线程由用户自己管理，由语言层面实现，处理用户编写的应用程序。

模糊来说，内核线程来处理系统资源，用户线程只能向内核申请使用资源。

#### 阻塞 IO 模型
上面了解了用户线程和内核线程之后，我们知道程序员编写的代码线程都是用户级别的线程。在一个程序里面为了应对高并发，往往有很多线程。

那举个例子就是：阻塞 IO 模型就是在用户线程在处理网络调用时会一直卡住，等待网卡数据准备就绪之后，在继续其他的处理。在这个过程中，线程一直阻塞，造成资源浪费。

#### 非阻塞 IO 模型
顾名思义，非阻塞 IO 模型就是不卡住，使用一个轻量级线程来轮询网卡的事件状态，如果网卡 IO 事件准备好了，可以读写数据了，在开始数据读写。

这种一个线程就可以监听所有网络连接的IO事件是否准备就绪的模式，就是大名鼎鼎的`IO多路复用`。

`Reactor模型`的实现方式之一是基于IO多路复用构建。

### 事件驱动
（维基百科）**事件驱动程序设计**（英语：**Event-driven programming**）是一种电脑[编程范型](https://zh.wikipedia.org/wiki/%E7%BC%96%E7%A8%8B%E8%8C%83%E5%9E%8B)。这种模型的程序执行流程是由用户的动作（如[鼠标](https://zh.wikipedia.org/wiki/%E6%BB%91%E9%BC%A0)的按键，键盘的按键动作）或者是由其他程序的[消息](https://zh.wikipedia.org/wiki/%E8%A8%8A%E6%81%AF)来决定的。

其核心是：应用程序以事件为连接点，当有事件准备就绪时，以事件的形式通知相关线程进行任务处理。在这期间，任务线程不必一直费时等待，转而处理其他操作。提高资源利用效率。

**Reactor 模型**的核心便是**事件驱动**，前面提到 Reactor 模型是基于 **IO多路复用**构建起来的，其实，IO多路复用本身就是借助于事件驱动模型。因此，Reactor 模型实则是通过IO多路复用来达到自己的事件驱动。

### Reactor 模型
okay，在看完了上文之后。Reactor 模型就不难理解了：核心是事件驱动，可以理解成 Reactor 模型中的反应器角色，类似于事件转发器（承接连接建立、IO处理以及事件分发）。

Reactor 模型的核心组件包括三个部分：

1. **Reactor**：负责监听和分发事件，通常基于 I/O 多路复用技术，如 epoll；
2. **Acceptor**：负责接收新的客户端连接，并将其注册到 Reactor 中；
3. **Handler**：负责处理具体的 I/O 事件和业务逻辑。

在 Acceptor 中。通过 accept 接受连接，并注册到 Reactor 中，之后创建一个 Handler 处理后续事件。

```java
// Acceptor：接收连接
ServerSocketChannel serverSocket = ServerSocketChannel.open();
serverSocket.bind(new InetSocketAddress(8080));

while (true) {
    // Reactor：监听事件
    SelectionKey key = selector.select();

    if (key.isAcceptable()) {
        // Acceptor 处理
        SocketChannel client = serverSocket.accept();
        client.register(selector, SelectionKey.OP_READ);
    }

    if (key.isReadable()) {
        // Handler 处理
        handle((SocketChannel) key.channel());
    }
}
```

## 网络 Reactor 和应用层 Reactor
上面说了很多，从基本的 Reactor 编程的本质概念到网络 Reactor，操作系统层面的网络 IO，stream 处理等。有点晕晕乎乎的了。是不是有下面几个问题：

1. 网络 Reactor 和应用层 Reactor啥区别？
2. 响应式编程在网络 Reactor 和普通 Reactor 中是什么角色？
3. Spring WebFlux 是响应式编程框架，用了网络 Reactor 还是普通 Reactor？

下面来解释下问题一和二，第三个问题将在第五节中解释。

### 网络 Reactor 和应用层 Reactor 的区别
他们本质上是两个不同层级的东西。**网络 Reactor 模型**基于 select/epoll 等 IO 多路复用技术实现，核心是：一个线程通过 Reactor 监听多个网络连接的事件，当事件就绪时分发给对应的 Handler 处理。

例如：Netty 框架，基于网络 Reactor 实现。

```go

```

应用层 Reactor，就是 Java Reactor Core，是应用层面的 reactor 框架。基于 Java8 的函数式编程，处理的是业务逻辑数据流。代表项目就是下节要说到的 reactor-core，除此之外还有 RXJava 等。

例如，可以用来处理网络数据流：

```java
// 使用 Reactor 处理异步 HTTP 响应
WebClient.create()
    .get()
    .uri("https://api.example.com/data")
    .retrieve()
    .bodyToFlux(User.class)  // 响应式数据流
    .map(user -> user.getName())
    .filter(name -> name.length() > 3)
    .subscribe(System.out::println);
```

到了这里，不难猜出，他们是可以互相结合使用的，结合的框架就是 Spring WebFlux。

### 响应式编程在网络 Reactor 和应用层 Reactor 中是什么角色
#### 网络 Reactor
网络 Reactor 本身并不是响应式编程，而是响应式编程的底层基础设施。可以让开发者简化异步调用流程，不用处理回调地狱，自动背压，统一流式处理接口等。

```java
// 传统网络 Reactor（回调地狱）
channel.readObject(response -> {
    parseJson(response, json -> {
        saveToDb(json, result -> {
            sendResponse(result, response2 -> {
                // 嵌套回调，难以维护
            });
        });
    });
});

// 响应式编程方式（链式、易读）
Mono.from(channel.readObject())
    .map(this::parseJson)
    .flatMap(this::saveToDb)
    .flatMap(this::sendResponse)
    .subscribe();
```

#### 应用层 Reactor
提供流式处理数据的能力，处理业务数据。**Java Reactor Core 本身就是响应式编程的实现。**

> 但这里有个容易混淆的地方：**Reactor Core 不一定需要网络 Reactor！**
>

```java
// 纯数据处理，零网络操作
Flux.range(1, 1000)
    .filter(i -> i % 2 == 0)
    .map(i -> i * 2)
    .collectList()
    .subscribe(System.out::println);

// 响应式的数据流处理
userService.getAllUsers()  // 返回 Flux<User>
    .filter(user -> user.getAge() > 18)
    .map(User::getName)
    .flatMap(name -> saveToCache(name))  // 异步操作
    .subscribe(
        name -> System.out.println("Saved: " + name),
        error -> System.err.println("Error: " + error)
    );
```

## Java Reactor Core
上面介绍完了所有相关的概念，现在来看下 Java Reactor Core 这个库怎么使用，对 Reactive

 编程做了哪些封装处理。

Reactor Core 提供了两个非常有用的操作，他们是 Flux 和 Mono。

其中Flux 代表的是 0 to N 个响应式序列，而Mono代表的是0或者1个响应式序列。

### Flux & Mono
Flux 的定义如下：

```java
public abstract class Flux<T> implements Publisher<T>
```

可以看到，本身是一个 Publisher，就是消息发布（生产）者，用来生产数据序列。

Mono 的定义如下：

```java
public abstract class Mono<T> implements Publisher<T>
```

本身也是一个发布者，不过只有 0 或者 1 个元素，因此没有 OnNext 方法，只有 onComplete 和 OnError 方法。可以将其看作为 Flux 的一个子集。

### 为什么要用 Reactor 而不是直接用 CompletableFuture
JDK8 中提供了 Future 和 CallBacks 用来处理异步编程，因为 CallBacks 会有回调地狱的问题。所以都用 Future，这其中主要用 CompletableFuture。

而不用 CompletableFuture 的原因是，提供的方法并不多且操作符种类较少。

```java
// CompletableFuture：只能处理单个值
CompletableFuture<User> future = getUser(1);

// Reactor：可以处理数据流 + 背压 + 更多操作符
Flux<User> users = getUsers();  // 获取所有用户
```

### 背压（Backpressure）
Reactor 中最为核心的一个概念，举个简单例子：

> 消费者：我处理不了这么多，你慢一点！
>
> 生产者：收到！
>

好处是可以控制内存占用，避免消息堆积。**生产速度=消费速度**

```java
// 消费者速度慢，告诉生产者减速
Flux.range(1, 1000)
    .subscribe(new Subscriber<Integer>() {
        @Override
        public void onSubscribe(Subscription s) {
            s.request(10);  // 只要 10 个，其他等着
        }
    });
```

### 参考链接
Gtihub：[https://github.com/reactor/reactor-core](https://github.com/reactor/reactor-core)

参考文档：[https://easywheelsoft.github.io/reactor-core-zh/index.html](https://easywheelsoft.github.io/reactor-core-zh/index.html)

## Spring WebFlux 和 Spring MVC
经过上面的一些介绍，用途和两者的区别应该挺明显了，总结下就是：

| **维度** | **WebMVC** | **WebFlux** |
| --- | --- | --- |
| IO 模型 | 阻塞 | 非阻塞 |
| 内嵌服务器 | Tomcat | Netty |
| 线程模型 | 一线程一请求 | 少量线程处理多请求 |
| 吞吐量 | 中等 | 高（高并发） |
| 复杂度 | 低 | 中等 |
| 学习曲线 | 简单 | 复杂 |


## 参考链接
1. [https://juejin.cn/post/7092436770519777311#heading-4](https://juejin.cn/post/7092436770519777311#heading-4)
2. [https://zh.wikipedia.org/wiki/%E5%8F%8D%E5%BA%94%E5%99%A8%E6%A8%A1%E5%BC%8F](https://zh.wikipedia.org/wiki/%E5%8F%8D%E5%BA%94%E5%99%A8%E6%A8%A1%E5%BC%8F)
3. [https://zhuanlan.zhihu.com/p/272891398](https://zhuanlan.zhihu.com/p/272891398)
