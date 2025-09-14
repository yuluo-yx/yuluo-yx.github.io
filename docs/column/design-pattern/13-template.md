---
id: 13_template
slug: /design-pattern/template
title: 13 模版方法设计模式（Template Method Design Pattern）
date: 2025-09-14 17:52:00
authors: yuluo
tags: ['Design-Pattern', Golang, Java]
keywords: ['Design-Pattern', Golang, Java]
---

模板方法模式是一种行为设计模式。在父类中定义了一个算法的框架，允许子类在不修改结构的情况下重写算法的某些特定步骤。

> 父类定义算法流程，子类实现差异化步骤

### 使用场景

1. 当只希望客户端扩展某个特定算法步骤，而不是整个算法或其结构时，可使用模板方法模式；
2. 当多个类的算法除一些细微不同之外几乎完全一样时，可使用该模式。但其后果就是，只要算法发生变化，就可能需要修改所有的类。

## 1. 应用

1. JDBCTemplate：JdbcTemplate 是一个非常常见的类，用于简化 JDBC 操作。它通过模板方法设计模式，将数据库操作的通用部分（如连接管理、异常处理等）封装在基类中，而将具体的 SQL 执行逻辑留给子类或回调函数实现
2. RestTemplate：RestTemplate是 Spring 框架中用于简化 RESTful API 调用的类。它通过模板方法设计模式，将 HTTP 请求的通用逻辑封装在基类中，而将具体的业务逻辑留给子类或回调函数实现。
3. JMSTemplate & RedisTemplate etc.

### 1.1 优点

1. 将相同部分提取到父类中，简化逻辑；
2. 开发者在扩展功能时，只关注具体实现即可，减少心智负担。

### 1.2 缺点

1. 父类中的某些算法模版可能会限制部分子类的实现方式。

## 2. 实现分析

举个例子：系统中的配置文件可能是 json，yaml，properties，env 等等。它们的核心逻辑都是读取文件然后转换成 Java 中的配置对象。这其中的检查文件是否存在，内容读取，配置字段检查等是通用的模版方法。不同点（可变部分）只是在读取文件时因为后缀不同也选择不同的库读取文件。
