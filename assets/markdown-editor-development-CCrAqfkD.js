const n=`---
slug: markdown-editor-development
title: Markdown 文本编辑器开发之路
date: 2026-11-25 13:44:17
authors: yuluo
tags: [Markdown, Mory]
keywords: [Markdown, Mory, Typo, Desktop App]
description: 记录 Markdown 文本编辑器从产品需求、技术选型到开发踩坑与性能优化的折腾过程。
image: /img/markdown-editor-development/fdf44d648bf9b1fdb627839e.jpeg
---

有了 AI 之后，开始兴致勃勃的造一些小工具。折腾了许久，除了两个 skill 之外。

- [https://github.com/yuluo-yx/illustration-logo-skill](https://github.com/yuluo-yx/illustration-logo-skill)
- [https://github.com/yuluo-yx/chinese-document-writing](https://github.com/yuluo-yx/chinese-document-writing)

折腾出来了一个叫 Typo 的工具。

- [https://github.com/yuluo-yx/typo](https://github.com/yuluo-yx/typo)

四个月之前，Typora 破解版突然需要强制升级了（很惭愧没钱支持正版 😅）。之后会有机会的。这里想说下我的折腾史，以及一个文本编辑器都需要什么技术栈，需要什么能力？

放图镇楼：

![Clipboard.png](/img/markdown-editor-development/77bd137ee4cf42a2d8652990.png)



## 编辑器产品分析

### 第一版

当时想要的效果是和 Typora 类似的，即时编译能够随写随看到效果。包括 Typora 的布局功能等等。还问了一些有较多书写需求的人，他们想要什么类型的编辑器：

- 写简历：希望有一个简历模版；
- 希望有飞书的引用关系列表；
- 操作简单，颜值在线，美观即正义；
- 有 Obsidian 的知识图谱；
- 知识库一样的本地文档管理能力；
- 工作区的概念，既可以以本地作为文档目录，也可以用 Git 仓库，S3 存储等；
- 导出能力：将 md 导出为 PDF，JPG，PNG，HTML；
- 内置主题可以自己编辑 CSS 样式文件；
- etc...

大致就是这些需求，因为是我第一次开始写编辑器，也没有对功能做取舍，直接就采纳了他们的建议。后面发现这不是我想要的东西。

由此可见：产品经理也是一个相当重要的角色，一个好的产品经理要在满足用户需求的同时充分考量自身的产品到底需要有什么能力；解决什么问题；满足什么需求。

### 第一版之后的分析

刚开始的时候热情满满，每天都搞。但是搞了两个月，发现在功能上，并不是我最初想的样子：（其实是没啥人用，只提了意见，但是搞出来了没人用 emmm～）

于是我又重新审视了我的需求：

- 颜值在线：受 Quite.md 的启发和来到新公司的影响，我也觉得飞书文档不错；🤣
- 操作简单，日常高频的操作都整理成快捷键，减少心智负担；
- 本地优先：开发了 S3/Git 的存储之后，我发现我根本用不到...
- 有较为简单的知识库能力，我本地只有一个 doc ，根据目录记录不同的文档就行；
- 导出能力，给别人发送文件的时候，PDF 是最好的。

前期就这些了，我觉得能把这些做好都是一件不容易的事情。

## 技术路线

说到这，刚开始的时候我用的是 Electron 内核，就是一个浏览器，外面套了不同系统的适配：Macos 用 swfit，Windows 用了 Go 的 Wails 这样的技术手段实现。当然借助了大模型来完成。

整个项目的安装包很大，因为 Electron 而且还内置了主题文件，包括字体等其他文件。**一个最大的问题是每次在 Macos 上测试都会打开一个 Electron 的弹窗。** 有点忍受不了。加之语言分散，既有 JS，也有 Go 和 Swift。不太利于维护。

于是我开始看一些 Native 的 UI 框架，当时正好 MyGO 在 X 上大火，调研了一番，准备用这个，正好 Go 语言也很熟悉。当然我也看了其他的方案。

### 知识积累

介绍方案之前，先积累下知识，整个桌面App 生态，大概有以下几种路线：

- 系统原生：操作系统绘制 UI 样式组件：Appkit，WinUI，GTK 等，系统原生，体验好；
- 自绘：框架自己绘制，Flutter，GPUI/Qt 等；
- 系统 Webview 组件：HTML/CSS/JS 在系统中提供的 WebView 运行时。Tauri，Wails，WebView；
- 浏览器内核渲染：直接打包一个浏览器引擎，浏览器引擎执行。

“自绘”描述的是渲染方式；“WebView”描述的是用网页技术呈现 UI。Electron 和 Tauri 都写 Web UI，但前者通常自带 Chromium，后者使用系统 WebView。

### 框架选择

然后由此来选择框架。

#### Rust

GPUI：Rust 语言，自绘形式；

Tauri：基于 WebView，Rust 语言。

> Rust 编译太重了，依赖包体积众所周知的大。

#### Go

Wails：同样和 Tauri 一样，使用 WebView；Go 版 Tauri；

MyGO：新生框架，GPU 绘制和 WebView 可混用；

社区比较活跃，伴有 Moejs，用 Go runtime 运行 js，不错的选择；

NSGO：NSH 哲学，平台原生组件绘制，用 Go 编写。

> MyGO  是一个不错的方案。

#### JS/TS

Electron：自带一个浏览器内核，不太想用，体验不好，性能也不好。

## 开发和踩坑之路

选定框架之后，酷酷就开始干，定义样式，选择交互方式。也遇到一些问题：

### 框架踩坑

MyGo 的界面更新会重新构建控件树，写 UI 时要特别留意渲染函数里的逻辑；比如在 mory 标题上已经按了 enter 之后继续输入，预期效果应该后期内容落入正文，但是仍然可能会落到标题。原生输入事件比界面渲染跑的更快。

小细节的不断优化调整，同一个问题在修改了 N 次之后又出现了。我用了 py 做了 e2e。将之前的失败 case 都保存起来之后回放以进行校验。

### 性能问题

某个周末，我心血来潮，想测试下 Mory 的编辑性能，因为 Quite.md 也挂着性能数据。想看看 Mory 的表现怎么样？测试了三个同样的 md 编辑器产品。发生 Quite.md 占用最高。AstroMD 居中，Mory 相对最少，然后对 Mory 进行了一系列的性能优化。最后贴一张图



![Clipboard.png](/img/markdown-editor-development/68061e88e140340342c38597.png)
`;export{n as default};
