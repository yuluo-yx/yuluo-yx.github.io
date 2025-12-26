---
slug: case-by-unit-test
title: 由单元测试发现的代码 Bug
date: 2024-08-05 15:51:51
authors: yuluo
tags: [Spring Data JPA]
keywords: [Spring Data JPA, Pageable]
---

<!-- truncate -->

## 背景概述

背景来自于给 Apache Hertzbeat 编写单元测试，发现的一个问题。这个问题也是历史遗留问题，之前的测试类是注释的状态。

```shell
15:18:38.013 [main] WARN org.springframework.web.servlet.mvc.support.DefaultHandlerExceptionResolver -- Resolved [org.springframework.http.converter.HttpMessageNotWritableException: Could not write JSON: (was java.lang.UnsupportedOperationException)]

java.lang.AssertionError: Status expected:<200> but was:<500>
Expected :200
Actual   :500
```

没有任何其他信息，报错如上。

单元测试和代码如下：

```java
@GetMapping
@Operation(summary = "Example Query the alarm definition list",
           description = "You can obtain the list of alarm definitions by querying filter items")
public ResponseEntity<Message<Page<AlertDefine>>> getAlertDefines(
    @Parameter(description = "Alarm Definition ID", example = "6565463543") @RequestParam(required = false) List<Long> ids,
    @Parameter(description = "Search-Target Expr Template", example = "x") @RequestParam(required = false) String search,
    @Parameter(description = "Alarm Definition Severity", example = "6565463543") @RequestParam(required = false) Byte priority,
    @Parameter(description = "Sort field, default id", example = "id") @RequestParam(defaultValue = "id") String sort,
    @Parameter(description = "Sort mode: asc: ascending, desc: descending", example = "desc") @RequestParam(defaultValue = "desc") String order,
    @Parameter(description = "List current page", example = "0") @RequestParam(defaultValue = "0") int pageIndex,
    @Parameter(description = "Number of list pages", example = "8") @RequestParam(defaultValue = "8") int pageSize) {

    Page<AlertDefine> alertDefinePage = alertDefineService.getAlertDefines(ids, search, priority, sort, order, pageIndex, pageSize);
    return ResponseEntity.ok(Message.success(alertDefinePage));
}
```

测试类：

```java
@Test
void getAlertDefines() throws Exception {

    when(alertDefineService.getAlertDefines(List.of(1L), "Test", (byte) 1, "id", "desc", 1, 10))
        .thenReturn(new PageImpl<>(Collections.singletonList(alertDefine)));

    mockMvc.perform(MockMvcRequestBuilders.get(
        "/api/alert/defines")
                    .param("ids", "1")
                    .param("search", "Test")
                    .param("priority", "1")
                    .param("sort", "id")
                    .param("order", "desc")
                    .param("pageIndex", "1")
                    .param("pageSize", "10")
                    .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value((int) CommonConstants.SUCCESS_CODE))
        .andExpect(jsonPath("$.data.content[0].app").value("linux"))
        .andExpect(jsonPath("$.data.content[0].id").value("9"))
        .andExpect(jsonPath("$.data.content[0].metric").value("disk"))
        .andReturn();
}
```

## 分析

经过 google 确定了可能发生问题的原因：

1. 使用了 Arrays.asList(T t) 方法
2. 实体类种属性为 null 值，而没有使用 `@JsonIgnore` 等注解
3. 没有使用包装类型而使用了 int，long 等基元类型
4. 在 spring 反向解析对象时，会调用 is 开头返回 boolean 类型的方法

总共 google 到了以上四种原因，经过和项目中的其他实体类对比和分析，进行逐一排除。最后发现都没有符合上述问题的选项。

继而看到了返回值的对象类型，发现不是单独的实体类型，而是一个 `Page<T>` 类型的对象，想到，会不会是 Page 中某个属性为空造成的 Json 序列化异常。

在 Controller 中加入以下代码片段：

```java
Page<AlertDefine> alertDefinePage = alertDefineService.getAlertDefines(ids, search, priority, sort, order, pageIndex, pageSize);

// 模拟序列化过程进行调试
String json = JsonUtil.toJson(alertDefinePage);
System.out.println(json);

return ResponseEntity.ok(Message.success(alertDefinePage));
}
```

运行测试，发现确实报错：

```shell
15:32:00.342 [main] ERROR org.apache.hertzbeat.common.util.JsonUtil -- (was java.lang.UnsupportedOperationException) (through reference chain: org.springframework.data.domain.PageImpl["pageable"]->org.springframework.data.domain.Unpaged["offset"])
com.fasterxml.jackson.databind.JsonMappingException: (was java.lang.UnsupportedOperationException) (through reference chain: org.springframework.data.domain.PageImpl["pageable"]->org.springframework.data.domain.Unpaged["offset"])
```

这样，我们就从控制台看到了更多的错误信息，`Unpaged 中的 offset` 貌似有点问题。输出它看看

```java
System.out.println(alertDefinePage.getPageable().getOffset());

jakarta.servlet.ServletException: Request processing failed: java.lang.UnsupportedOperationException
```

果不其然，确实有问题。再次 google 之后，找到了社区 issue：https://github.com/spring-projects/spring-data-commons/issues/2987，其中一位应该是社区维护者，更是说出 Pageable 从未打算被序列化。🥲

![Spring Data 社区回复](/img/bug/1.png)

## 修复

确定了问题之后，寻找修复的办法。

根据社区 issue 进展，总共有两种修复办法：

1. 通过 PageImpl 重新包装 Page 对象：

   ```java
   Pageable pageable = PageRequest.of(0, 10);
   PageImpl page = new PageImpl<>(myArraylist, pageable, myArraylist.size());
   ```

2. 将 **SpringDataJacksonConfiguration.PageModule** 添加到 **Jackson2ObjectMapperBuilder** 

   ```java
   @Bean
   public Jackson2ObjectMapperBuilder objectMapperBuilder(SpringDataJacksonConfiguration.PageModule pageModule) {
          Jackson2ObjectMapperBuilder builder = new Jackson2ObjectMapperBuilder();
          builder.modules(pageModule);
         return builder;
   }
   ```
