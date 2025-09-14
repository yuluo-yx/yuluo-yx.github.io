---
id: 1_open_close
slug: /design-pattern/principle/open-close
title: 1. 开放封闭原则（Open Close Principle）
date: 2025-09-14 17:52:00
authors: yuluo
tags: ['Design-Pattern', 'Design-Principle']
keywords: ['Design-Pattern', 'Design-Principle']
---

开闭原则的定义是：一个软件实体：类 or 模块 or 函数等应该对扩展开放，对修改关闭。简而言之就是**不允许修改**。

- 对扩展开放：意味着有新的需求时，可以对现有代码进行扩展，以适应新的需求场景；
- 对修改关闭：类或模块一旦设计完成，就可以独立完成功能，不再允许更新。

## 1.1 如何实现

面向对象编程是将代码中所有事物都类比成现实世界中的对象。世界上没有一个事物是一成不变的。
换言之，需求总是变化的。对于软件系统来说，如何在能不修改原有系统的前提下，实现灵活扩展。这是开闭原则需要实现的。

在 Java 中，有抽象类和接口的概念，一般将

抽象的概念（名词）设计成抽象类，对类整体进行抽象；
抽象的动作/功能（动词）设计成接口，对类的行为抽象。

如何理解呢？例如：

鸟和飞机都可以飞，飞是一个动词，应该被设计为接口，接口约定了实现类的基本行为。
飞机有许多种类：战斗机，直升机，民用飞机等，它们是一类具体的事物。

对此，可以写出下面的代码：

```java
interface Fly {

    // 定义飞行动作约束，只有会飞的对象才能实现此接口
    void fly()
}

// 抽象飞机类
abstract class Airplane {

    // 定义一些飞机类的固有属性约束
    protected String name;

    protected Airplane(String name) {
        this.name = name;
    }
}

// 具体飞机类
class PassengerAirplane extends Airplane implements Fly {

    public PassengerAirplane(String name) {
        super(name);
    }

    @Override
    public void fly() {

        System.out.println(name + " is flying with passengers.");
    }

}
```

可见，在实现开闭原则中，主要的思想是对抽象编程，而不是对具体事物编程。通过继承或覆盖来改变固有行为，实现新的扩展方法。
因此，对于扩展是开放的。

## 1.2 设计模式中的应用

1. 策略模式：定义一组算法族，分别封装在不同的类中，使得它们之间可以互相替换，策略模式允许算法独立于使用它的客户代码变化；
2. 装饰器模式：动态地给对象添加职责，提供比继承更灵活的替代方案，允许在运行时改变对象的行为；
3. 工厂模式：创建对象的接口，让子类决定实例化哪一个类。系统在不修改自身的情况下扩展产品类型。
