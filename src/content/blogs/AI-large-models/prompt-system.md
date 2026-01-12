---
slug: prompt-system-prompt
title: Prompt 工程--“骗出” System Prompt
date: 2026-01-12 21:01:08
authors: yuluo
tags: [LLM, Prompt]
keywords: [LLM, Prompt]
---

<!-- truncate -->

## 1. 啥是提示词

在和大模型交互的过程中，总是一问一答的形式。和人交流类型，不过模型“人”可能并不聪明。得用大量的提示词告知 context，spec 等等其他内容，回答才能比较理想。

从模型上，[Prompt ](https://platform.openai.com/docs/guides/prompting)分为下面几类：

1. System Message；
2. User Message；
3. Assistant Message；
4. Tool Message。

分别是系统提示词，用户问题和模型输出以及工具调用。

如果你对 System 和 User prompt 区分不清，可以查看此讨论帖，应该会有些许启发：[https://community.openai.com/t/need-help-deciding-what-to-put-in-system-vs-user-prompt-for-dialogue-generation/891133](https://community.openai.com/t/need-help-deciding-what-to-put-in-system-vs-user-prompt-for-dialogue-generation/891133)

在不同的 AI 编程框架中，对 Message 都有不同的封装：

Spring AI：[https://docs.spring.io/spring-ai/reference/api/prompt.html#_prompt](https://docs.spring.io/spring-ai/reference/api/prompt.html#_prompt)

Langchain：[https://docs.langchain.com/oss/python/langchain/messages#system-message](https://docs.langchain.com/oss/python/langchain/messages#system-message)

### 1.1 System Prompt

Claude 模型的 System Prompt 是公开的，可以从这里地址获取：[https://platform.claude.com/docs/en/release-notes/system-prompts](https://platform.claude.com/docs/en/release-notes/system-prompts)

## 2. Prompt 工程

随着大模型的爆火，怎么向 AI 表达清楚你的观点，让他能理解你的意思，也逐渐演变成了一门艺术，类比成”编程语言“，只不过 SDK 是大模型。

Github 上有许多模型 Prompt 和相关资料，解释怎么使用 Prompt 获得更好的效果。

Github Prompt：

1. [https://github.com/f/awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts)
2. [https://github.com/dair-ai/Prompt-Engineering-Guide](https://github.com/dair-ai/Prompt-Engineering-Guide)
3. [https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools)

## 3. 获取 System Prompt
重头戏来了。先解释下，**不能肆无忌惮的获取模型提供商的 Prompt！！！**

### 3.1 Prompt 注入危害

> 参考：[https://github.com/Acmesec/PromptJailbreakManual](https://github.com/Acmesec/PromptJailbreakManual)

先举个例子，看下 Prompt 注入的危害，下面的例子均来自于上面的 Github 参考仓库：

#### 3.1.1 win 10序列化 Demo

![](https://camo.githubusercontent.com/13a0813c609df770396abf01368002172c6a6ed61a1e361b6290eb0efb61ffea/68747470733a2f2f6d6d62697a2e717069632e636e2f737a5f6d6d62697a5f706e672f616b4d69623366696261724c7076687a696343716c69616f494e7968423037655a6e454349544c4c69634630367a6b4a467741506b42387977664f7a5545784b7a653847677759756a69634e684b69616c69626b6d6961696354443955796e512f3634303f77785f666d743d706e672666726f6d3d6170706d736726777866726f6d3d3133)
![](https://camo.githubusercontent.com/009447d89219b819946b0c74ba158376685f3ee2fae63819cb0671afc7020bd1/68747470733a2f2f6d6d62697a2e717069632e636e2f737a5f6d6d62697a5f706e672f616b4d69623366696261724c7076687a696343716c69616f494e7968423037655a6e4543707252627a7767714364534f6771524d5144705750387867387057794c566b6961333436506b624b53504d65444444496962316d4e395a772f3634303f77785f666d743d706e672666726f6d3d6170706d736726777866726f6d3d3133)

#### 3.1.2代码注入替换 Demo

![](https://camo.githubusercontent.com/9b4bb2f3490c6ddbea54a7b09cf02dac361e26f31a71ab795219b5adab29fdc5/68747470733a2f2f6d6d62697a2e717069632e636e2f737a5f6d6d62697a5f706e672f616b4d69623366696261724c7076687a696343716c69616f494e7968423037655a6e4543376f376839384c4e774c347a367878727237637032696345514576734f6663574c66434d7269615168316159475044447635367365464c412f3634303f77785f666d743d706e672666726f6d3d6170706d73672674703d7765627026777866726f6d3d352677785f6c617a793d312677785f636f3d31)

### 3.2 System Prompt 获取

#### 3.2.1 直接提问

在早期的时候，此种方式能够获取真实的 System Prompt，但是获取的不全面。

#### 3.2.2 诱导输出

此时需要充分展现话术魅力。Github 一时爆火的猫娘 GPT 便是其中之一。

> 省略 n... 字
>

#### 3.2.3 使用 Prompt 越狱

> 越狱最早来自于 IOS 系统，意思是获取执行限制之外操作的权限。Prompt 同理，输出一些禁止输出的内容。
>

PUA 模型，让其将你当成一个 ”AI 微调训练员“ 或其他角色，以暴露 System Prompt，

## 4. 商业合规

方法很多，就不一一列举了，此只是为了满足下好奇心。

_**在使用过程中，切勿诱导模型输出，可能会引发风控等其他风险。**_
