---
slug: github-account
title: Github 账号惊魂
date: 2025-12-24 23:34:54
authors: yuluo
tags: [Github]
keywords: [Github]
---

<!-- truncate -->

## 背景经过

alibaba/spring-ai-alibaba 项目经常收到垃圾 issue 攻击，会被不明身份的 Github 账号创建大量垃圾 issue，像下面这样：

![Github spam issue](/img/githubaction/image.png)

刚开始的前段时间，用 ai 写了一个 Github action，根据 spam issue 的特征来关闭 issue。过了一段时间之后，spam issue 不见了，于是删除了 GHA。

好景不长，过了一段时间，又出现了，于是我在本地用 Github api + 之前 ai 写的 python 脚本手动关闭 issue。这样持续了两三天。

......

在 1219 晚执行完 python 脚本之后（频率较高，差不多 10 分钟 100 次左右），在 1220 中午我发现 Github 账号被封禁了。emmm～

随即开始网上找帖子看相关问题，最后反思了前一天晚上的行为，最后得出结论是 API 调太频繁了，被 Github 的风控系统自动封号了。在 20 号晚开始申诉。

## 申诉经过

先是在 https://support.github.com/contact-next 上用邮箱验证，验证完成之后，还要手机号验证？？？

![Github spam issue](/img/githubaction/image2.png)

sms-active 接码平台选 Any Service 开始接码，老是出现上面的问题，换 IP 和换地区，找别人试都不行。。。。。

最后在 saa 社区同学的帮助下，发现只要邮箱验证了，不用短信验证也可以？

点击下面的地址就好了：https://support.github.com/contact-next/product-selection/account-restrictions

一点，果然是。🥲

然后组织语言提了工单：

等了两天之后，收到了回信：

![Github spam issue](/img/githubaction/image3.png)

随后账号顺利解封！前后历时 4 天。
