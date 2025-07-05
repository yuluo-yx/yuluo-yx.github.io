---
slug: java-and-go-sdk-manager
title: Java & Go SDK 管理实践
date: 2025-07-05 21:19:22
authors: yuluo
tags: [Java, Go]
keywords: [Java, Go]
---

<!-- truncate -->


## 流行的版本管理工具
| <font style="color:rgb(27, 28, 29);">类别</font> | <font style="color:rgb(27, 28, 29);">工具名称</font> | <font style="color:rgb(27, 28, 29);">GitHub链接</font> | <font style="color:rgb(27, 28, 29);">Star数</font> |
| --- | --- | --- | --- |
| <font style="color:rgb(27, 28, 29);">Java SDK</font> | <font style="color:rgb(27, 28, 29);">Jabba</font> | [<font style="color:rgb(22, 119, 255);">https://github.com/shyiko/jabba</font>](https://github.com/shyiko/jabba) | <font style="color:rgb(27, 28, 29);">3.2k</font> |
| <font style="color:rgb(27, 28, 29);"></font> | <font style="color:rgb(27, 28, 29);">Jenv</font> | [<font style="color:rgb(22, 119, 255);">https://github.com/jenv/jenv</font>](https://github.com/jenv/jenv) | <font style="color:rgb(27, 28, 29);">6.2k</font> |
| <font style="color:rgb(27, 28, 29);"></font> | <font style="color:rgb(27, 28, 29);">SDKMan</font> | [<font style="color:rgb(22, 119, 255);">https://github.com/sdkman/sdkman-cli</font>](https://github.com/sdkman/sdkman-cli) | <font style="color:rgb(27, 28, 29);">6.4k</font> |
| <font style="color:rgb(27, 28, 29);">Go SDK</font> | <font style="color:rgb(27, 28, 29);">GVM</font> | [<font style="color:rgb(22, 119, 255);">https://github.com/moovweb/gvm</font>](https://github.com/moovweb/gvm) | <font style="color:rgb(27, 28, 29);">10.9k</font> |
| <font style="color:rgb(27, 28, 29);"></font> | <font style="color:rgb(27, 28, 29);">voidint/g</font> | [<font style="color:rgb(22, 119, 255);">https://github.com/voidint/g</font>](https://github.com/voidint/g) | <font style="color:rgb(27, 28, 29);">2.2k</font> |
| <font style="color:rgb(27, 28, 29);"></font> | <font style="color:rgb(27, 28, 29);">Goenv</font> | [<font style="color:rgb(22, 119, 255);">https://github.com/go-nv/goenv</font>](https://github.com/go-nv/goenv) | <font style="color:rgb(27, 28, 29);">2.3k</font> |


## <font style="color:rgb(27, 28, 29);">Java SDK 管理工具实践</font>

开始之前先看下自己本地的 JDK 版本：

```shell
# yuluo @ 💯 Everything wins. in ~ [17:26:49]
$ java -version
openjdk version "23.0.2" 2025-01-21
OpenJDK Runtime Environment Homebrew (build 23.0.2)
OpenJDK 64-Bit Server VM Homebrew (build 23.0.2, mixed mode, sharing)

# 卸载 通过 brew install 的 java 和 mvn
brew uninstall --ignore-dependencies java
brew uninstall mvn

# 如果不想卸载，需要建立软链接让 sdkman 可以识别到已经安装的 java
# 参考 https://blog.csdn.net/gp_911014/article/details/138579268
```

> 这里选择使用 star 数最高的 sdkman。
>

### SDKMan 
#### 安装
```shell
# 终端中执行
curl -s "https://get.sdkman.io" | bash

# 输出如下：
All done!


You are subscribed to the STABLE channel.

Please open a new terminal, or run the following in the existing one:

    source "/Users/yuluo/.sdkman/bin/sdkman-init.sh"

Then issue the following command:

    sdk help

Enjoy!!!

# 新开一个终端执行：
source "$HOME/.sdkman/bin/sdkman-init.sh"

# 检查
$ sdk version

SDKMAN!
script: 5.19.0
native: 0.7.4 (macos aarch64)
```

#### 使用
##### Java SDK
```shell
# 查看帮助
sdk help
sdk help install

# 查看当前的 java sdk
sdk current

# 列出可安装的 java sdk
sdk list java

 Oracle        |     | 24.0.1       | oracle  |            | 24.0.1-oracle
               |     | 24           | oracle  |            | 24-oracle
               |     | 23.0.2       | oracle  |            | 23.0.2-oracle
               |     | 22.0.2       | oracle  |            | 22.0.2-oracle
               |     | 21.0.7       | oracle  |            | 21.0.7-oracle
               |     | 21.0.6       | oracle  |            | 21.0.6-oracle

# 安装一个 java sdk 选择 oracle jdk
# 分别安装 17 和 24 版本
sdk install java 24-oracle
sdk install java 17.0.12-oracle

# 使用 java 17
sdk use java 17.0.12-oracle

Using java version 17.0.12-oracle in this shell

# 查看当前的 java sdk
sdk current

# 切换至 24 版本
sdk use java 24-oracle

# 卸载
sdk uninstall java 17.0.12-oracle
```

##### Maven
sdkman 还能管理 maven 和 gradle，scala，groovy 等。

```shell
# 列出可用的 maven
sdk list maven

# 安装
sdk install maven

# 查看
mvn -v
```

> 如果安装的 sdk 命令没有出现时，执行 
>
> `source "$HOME/.sdkman/bin/sdkman-init.sh"`
>
> 即可。
>

##### Gradle
gradle 和 maven 同理。

## Go SDK 管理工具实践
选择使用 star 数最多的 <font style="color:rgb(27, 28, 29);">GVM</font>

### <font style="color:rgb(27, 28, 29);">安装</font>
```shell
zsh < <(curl -s -S -L https://raw.githubusercontent.com/moovweb/gvm/13b10b604255360a9a559c2ea23ba42e75cb536e/binscripts/gvm-installer)

source ~/.gvm/scripts/gvm
```

### 参数设置
```shell
# GVM 的安装包获取地址
export GVM_GO_GET='https://golang.google.cn/dl/'

# Go proxy https://goproxy.cn/
export GO111MODULE=on
export GOPROXY=https://goproxy.cn
```

### 命令使用
如遇到下载慢等，可以参考：[https://blog.csdn.net/Narutolxy/article/details/143017169](https://blog.csdn.net/Narutolxy/article/details/143017169)

```plain
# 直接在终端中输入 gvm 可以看到提供的命令
gvm

# 安装 SDK 拉取源码包编译安装
gvm install go1.24.2

# 直接下载二进制安装
gvm install go1.24.2 --binary

# 显示版本
$ gvm list

gvm gos (installed)

   go1.24.2
=> go1.24.4
   system

# 切换临时版本
gvm use go1.22.11

# 设置某个版本为默认 SDK
gvm use go1.22.11 --default

# 验证
go version
```
