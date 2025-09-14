---
id: 12_observer
slug: /design-pattern/observer
title: 12 观察者模式（Observer Design Pattern）
date: 2025-09-14 17:52:00
authors: yuluo
tags: ['Design-Pattern', Golang, Java]
keywords: ['Design-Pattern', Golang, Java]
---

观察者模式定义对象间的一种一对多依赖关系，当一个对象状态发生改变时，相关依赖对象得到通知并自动更新，因此又叫做发布-订阅模式。

### 使用场景

当一个对象状态的改变需要改变其他对象，或实际对象是事先未知的或动态变化的时；
当应用中的一些对象必须观察其他对象状态时。

## 1. 应用

1. Spring Application Context 事件机制；
2. JDK 自生提供了 Observer 观察者接口。

### 1.1 优点

1. 符合开闭原则，无需修改发布者对象引入新的订阅类。

### 1.2 缺点

1. 订阅者的通知顺序是随机的。
