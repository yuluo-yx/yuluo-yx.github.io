---
title: Github Action 开发教程
date: 2024-04-29 15:37:21
index_img: /img/githubaction/github-action.png
banner_img: /img/githubaction/github-action.png
tags:
- Github Actions
- Golang
categories:
- Technology 
- Github
---

在使用 Github 时，你可能在一些著名的开源项目，例如 Kubernetes，Istio 中看到如下的一些评论：

```bash
/lgtm
/retest
/area bug
/asssign @xxxx
...
```

等等，诸如此类的一些功能性评论。在这些评论出现时，往往会出现一个 Github-bot 给问题添加一些 label，将 issue 分配给指定的人等等。类似注入此类的动作都是通过 Github Action 完成的。在本篇文章中，我们将介绍如何开发一个 Github Action Bot。

## 功能调研

要实现的 Action 动作为在 PR 下面评论 `/retest` 触发 action，自动收集运行失败的工作流 job，并重新运行。我们借鉴已有的 Action：

- https://github.com/envoyproxy/toolshed/tree/main/gh-actions/retest

envoy 的实现是通过 ts 结合 Github 的 Rest API 完成：

- https://docs.github.com/en/rest/pages/pages?apiVersion=2022-11-28

## 实现

本项目使用 Go 语言编写，通过 Github API Golang 实现和 Github 交互，编写完成之后，发布到 Github Action Marketplace。

- https://github.com/actions-go/toolkit
- https://github.com/google/go-github

### 大致思路

> 1. 根据传入的 pr url，获取 pr 的信息；
> 2. 之后根据 comment id 获取 comment 内容，判断是否为 `/retest` 是，则收集失败的 job，再次运行；
> 3. 判断 job rerun 是否成功，成功给 comment 加入  `🚀` 响应。（注意：这里的成功是指创建 rerun-job 成功，不是指 job 本身成功！
> 4. 运行结束。

### 代码目录结构

```bash
│  .gitignore
│  action.yml					# action.yml 配置
│  Dockerfile					# 项目运行需要的 Dockerfile
│  go.mod
│  go.sum
│  LICENSE
│  main.go						# 入口 main.go 文件
│  README.md
│
├─.github
│  └─workflows
│          build-and-test.yml		
│          retest.yml
└─retest						# retest 逻辑实现
        retest.go
        retest_test.go
        types.go
```

### Github Action 配置

创建 action.yml 配置文件：

```yml
name: "Github Pull Request Retest"
description: 'Re-run failed GitHub Workflow runs on PRs by commenting "/retest".'
author: "yuluo"
branding:
  color: blue
  icon: activity
inputs:
  token:
    description: >
      GitHub token used to create and remove comments. By default, this uses the
      repository token provided by GitHub Actions. You can customize the user by
      replacing this token with a user token which has write-access to your
      repository. Note that the token will be accessible to all repository
      collaborators.
    default: ${{ github.token }}
  comment-id:
    description: >-
      ID of comment for response
    required: true
    type: number
  pr-url:
    description: >-
      URL to fetch PR information
    required: true

runs:
  using: 'docker'
  image: 'Dockerfile'
  args:
    - ${{ inputs.token }}
    - ${{ inputs.comment-id }}
    - ${{ inputs.pr-url }}
    - ${{ inputs.args }}
```

此配置文件中主要参数如下：文档 https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions

作者，名字，描述等式必须的。inputs 参数描述如下：

```yml
inputs: # 参数的字典
  milliseconds: # change this # 参数名,
    required: true # 是否是必填
    description: "input description here" # 参数的说明
    default: "default value if applicable" # 默认值
```

**注意：inputs 参数是需要在 .github/workflows/action-ci.yml 中配置的输入参数，如果不配置，获取到的输入是空值！**

runs 参数：

```yml
runs:
  # 运行 action 的方式，envoy 通过 nodejs 运行
  using: 'docker'
  # 在项目中需要编写 Dockerfile，作为镜像入口，envoy 使用 ts 编写，所以入口为 main: index.js
  image: 'Dockerfile'
  # 运行时输入到 Docker container 内部的参数。
  args:
    - ${{ inputs.token }}
    - ${{ inputs.comment-id }}
    - ${{ inputs.pr-url }}
    - ${{ inputs.args }}
```

本次编写中主要用到的配置项为以上两个，更多的参数可以参考文档。

### 发布

Github Action Marketplace：https://github.com/marketplace/new

项目在编写完成之后，建立一个 github repo，将代码上传到仓库，之后点击上述地址，就会出现 actions 选择。发布需要创建版本，根据要求创建一个对应版本即可。在发布时会检测 action.yml 配置，在合法之后才会允许发布。

发布成功如下：

https://github.com/marketplace/actions/github-pull-request-retest

![Github Action 发布预览c](/img/githubaction/images1.png)

## 使用

之后在任意仓库的 .github/workflows/command.yml 中配置如下内容即可使用：

```yml
name: Retest Action on PR Comment

on:
  issue_comment:
    types: [created]

permissions:
  contents: read

jobs:
  retest:
    name: Retest
    runs-on: ubuntu-22.04
    permissions:
      pull-requests: write
      actions: write
    steps:
      - uses: yuluo-yx/gh-retest@v1.0.0-RC1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          comment-id: ${{ github.event.comment.id }}
          pr-url: ${{ github.event.issue.pull_request.url }}
```

> 在此仓库对应的 pr 下面输入 `/retest` ，观察仓库 Action 即可看到 job 自动 rerun。

项目地址：https://github.com/yuluo-yx/gh-retest.git，欢迎 star。🚀🚀
