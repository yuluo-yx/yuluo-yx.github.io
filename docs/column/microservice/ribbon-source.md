---
id: ribbons-source
slug: /ribbon-source
title: Ribbon 负载均衡
date: 2024-11-24 19:56:15
authors: yuluo
tags: [MicroService, Ribbon]
keywords: [MicroService, Ribbon]
---

<!-- truncate -->

# Ribbon 源码分析

## Ribbon Debug 分析

1. 断点 LoadBalancerInterceptor
	1.  `LoadBalancerInterceptor` 实现了 `ClientHttpRequestInterceptor` 接口，重写了其中的 `intercept` 方法，用来拦截请求；

	2. 获取原始的 uri 和 服务名，调用 `LoadBalancerClient` 中的 `execute` 方法；![\[外链图片转存失败,源站可能有防盗链机制,建议将图片保存下来直接上传(img-Wm2pe9wo-1692369980696)(D:\开源之夏活动\源码及流程分析\gateway.assets\image-20230818212017568.png)\]](https://i-blog.csdnimg.cn/blog_migrate/5b82ec68fd40e289788b6e5525e85be7.png)

4. 追踪 `LoadBalancer` 的实现 `RibbonLoadBalancerClient` 

   1. 这里根据上面传入的服务名字作为服务的 `ID`去获取负载均衡器；

   2. 再根据负载均衡器去选择服务实例，继续执行 `execute` 方法。
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/9d4366298a9329c6511a5df9525af898.png)


3. 追踪 `this.getServer` 方法

   调用 `loadBalancer.chooseServer` 实现负载均衡，选择一个具体服务发起服务调用。
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/b99a1cf1d9cdeccf3bc88b46571521b6.png)

  

 4. 进入 `chooseServer` 方法

    发现有三个实现类，进入第一个实现
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/791a86957c690dc7fcecfa2ab678bc37.png)


5. 追踪 `BaseLoadBalancer`

   1. 这里调用 `IRule` 接口的 `choose` 方法选择服务实例；

   2. 进入 `rule` 的 `choose` 方法。
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/2d28bfb06d9d1d3ddd5f8ba13ff37471.png)

6. 查看 `IRule`

   这里 `IRule` 的实现类是 `ZoneAvoidLoadBalancer`。
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/f2e764c4f0a13557e702410e045a76b2.png)


7. 到此为止，就走完了整个 ribbon 的负载均衡流程，发起服务调用
8. **Demo地址：https://github.com/yuluo-yx/ribbon-source.git**

9. 调用流程总结如下

   > 1. `LoadBalancerInterceptor` 拦截请求；
   > 2. `RibbonLoadBalancerClient` 替换拦截到的请求 uri，并获取服务名字做为服务`ID`:
   > 3. `chooseServer` 选择服务；
   > 4. `BaseLoadBalancer` 的子类 `DynamicServerListLoadBalancer` 从注册中心拉取服务列表；
   > 5. `IRule` 根据负载均衡算法，选择服务实例；
   > 6. `RibbonLoadBalancerClient` 修改请求，发起真实服务调用。

## 负载均衡器接口
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/d6983874440a4a39d5b8249f472e4b95.png)


`ILoadBalancer` 接口中有以下方法：

```java
public interface ILoadBalancer {
    //往该ILoadBalancer中添加服务
    void addServers(List<Server> var1);

    //选择一个可以调用的实例，keyb不是服务名称，而是zone的id
    Server chooseServer(Object var1);

    //标记下线服务
    void markServerDown(Server var1);

    /** @deprecated */
    @Deprecated
    List<Server> getServerList(boolean var1);

    //获取可用服务列表
    List<Server> getReachableServers();

    //获取所有服务列表
    List<Server> getAllServers();
}
```

类关系说明：

> 1. `AbstractLoadBalancer`：定义了一个关于服务实例的分组枚举类 `ServerGroup`，定义了一个 `chooseServer` 方法去调用 `ILoadBalancer` 接口中的 `chooseServer`方法，抽象的 `getServerList` 方法来获取获取的服务，定义抽象方法 `getLoadBalancerStats` 获取 `LoadBalancer` 相关的统计信息
> 2. `BaseLoadBalancer` 类是 `Ribbon` 负载均衡器的基础实现类，在该类中定义了很多关于负载均衡器相关的基础内容。
> 3. `DynamicServerListLoadBalancer` 类继承了 `BaseLoadBalance`r，它是对基础负载均衡器的扩展。在该负载均衡器中，实现了服务实例清单在运行期的动态更新能力，同时，它还具备了对服务实例清单的过滤功能，也就是说，我们可以通过过滤器来选择性的获取一批服务实例清单。

## 负载均衡规则接口

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/365c50c08bb28173061367e91d3da15e.png)




IRule：负载均衡规则的顶层接口。

各个内置的负载均衡规则类如下：（其中 `ZoneAvoidanceRule` 是默认实现，根据可用去对服务进行分类）

| **内置负载均衡规则类**    | **规则描述**                                                 |
| ------------------------- | ------------------------------------------------------------ |
| RoundRobinRule            | 简单轮询服务列表来选择服务器。它是Ribbon默认的负载均衡规则。 |
| AvailabilityFilteringRule | 对以下两种服务器进行忽略： （1）在默认情况下，这台服务器如果3次连接失败，这台服务器就会被设置为“短路”状态。短路状态将持续30秒，如果再次连接失败，短路的持续时间就会几何级地增加。 （2）并发数过高的服务器。如果一个服务器的并发连接数过高，配置了AvailabilityFilteringRule规则的客户端也会将其忽略。并发连接数的上限，可以由客户端的..ActiveConnectionsLimit属性进行配置。 |
| WeightedResponseTimeRule  | 为每一个服务器赋予一个权重值。服务器响应时间越长，这个服务器的权重就越小。这个规则会随机选择服务器，这个权重值会影响服务器的选择。 |
| **ZoneAvoidanceRule**     | 以区域可用的服务器为基础进行服务器的选择。使用Zone对服务器进行分类，这个Zone可以理解为一个机房、一个机架等。而后再对Zone内的多个服务做轮询。 |
| BestAvailableRule         | 忽略那些短路的服务器，并选择并发数较低的服务器。             |
| RandomRule                | 随机选择一个可用的服务器。                                   |
| RetryRule                 | 重试机制的选择逻辑看了一下 前端项目 docusurnse 的项目结构，做了一些撰写文档的准备工作，熟悉了一些编写流程，预计今天可以写完 concept 部分的文档。 |
