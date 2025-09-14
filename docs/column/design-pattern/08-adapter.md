---
id: 08_adapter
slug: /design-pattern/adapter
title: 08 适配器模式（Adapter Design Pattern）
date: 2025-09-14 17:52:00
authors: yuluo
tags: ['Design-Pattern', Golang, Java]
keywords: ['Design-Pattern', Golang, Java]
---

从名字就能看出来，为了适配不同的使用条件，做兼容用。
使得由于接口不兼容不能一起用的类可以一起使用。

### 使用场景

适配器模式允许创建一个中间层类， 其可作为代码与遗留类、 第三方类或提供怪异接口的类之间的转换器。欧美国家和国产插座不同，USB 设备适配等。

> 举个例子：k8s 是一个应用运维框架，因为每家云厂商的基础设施都不同。
> 架构不同，机器版本不同等等。此时为了众多云厂商为了适配 k8s，就会作 adapter 来适配自己的云环境。
> 1. https://aws.amazon.com/cn/eks/
> 2. https://www.aliyun.com/product/kubernetes

### 适配器分类

适配器分为两种，一种是对象适配器，一种是类适配器。

对象适配器，适配器类实现其中一个对象的接口，并对另一个对象进行封装，所有语言通用。

类适配器：适配器类同时继承两个对象。这种适配器模式只能在支持多重继承的语言中使用，例如 C++ 和 Java。

## 1. 应用

Spring MVC 中的 HandlerAdapter 是经典的适配器设计模式。
参考文章：https://blog.csdn.net/zxd1435513775/article/details/103000992

### 1.1 优点

1. 符合单一职责和开闭原则；
2. 代码解耦合，扩展性良好。

### 1.2 缺点

1. 整体复杂度增加，难以理解。

## 2. 实现分析

一个场景：遗留的老设备输出是 xml 数据。现代新系统都使用 json 输入。

[代码参考](https://github.com/yuluo-yx/design-pattern/struct-type/08-adapter)
