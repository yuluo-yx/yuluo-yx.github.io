---
slug: wine-for-mac
title: Mac Mini 用 Wine 运行 Windows 经典游戏
date: 2026-01-31 21:01:08
authors: yuluo
tags: [Wine, Mac]
keywords: [Wine, Mac]
image: /img/wine/3.png
---

<!-- truncate -->

Mac 因为原生限制，不能运行 windows 游戏。尝试下在 Mac Mini 上玩下 `抗日-上海滩`。

> 之前在 windows 用 VMWare 安装过 MacOS 系统，成功了。理论上在 Mac 上用 VMWare 跑一个 windows 虚拟机也可以。

## Whiskly

https://getwhisky.app/

> 25 年 4 月已经停止维护了。

### 运行原理

底层也是基于 Wine，提供了一个 Bottle（瓶子）的概念来单独解释一个 windows 容器。相比于独立用 wine，提供了更友好的使用方式？

### 结论

折腾了下跑起来，但是运行游戏的时候，特别卡，卡成 PPT 那种卡。

## Wine

https://www.winehq.org/about?status

### 运行原理

Wine 不是像虚拟机或者模拟器一样模仿内部的 Windows 逻辑，而是將 Windows API 调用翻译成为动态的 POSIX 调用，免除了性能和其他一些行为的内存占用，让你能够干净地集合 Windows 应用到你的桌面

### 安装

使用 brew 安装。

```shell
# 允许未知来源的软件安装
sudo spctl --master-disable

brew tap gcenx/wine

brew install --cask --no-quarantine wine-crossover
```

Wine 运行需要 XQuartz，https://www.xquartz.org/ 下载

### XQuartz 作用

XQuartz 是一个开源的 X11 服务器，专为 macOS 设计，用于提供对 X11 图形协议的支持。许多在 macOS 上运行的 Linux 或 Unix 应用程序（尤其是那些从 Windows 移植过来的软件）依赖 X11 来显示图形用户界面。

### Wine 配置

使用 GUI 配置并设置路径：`WINEPREFIX=$HOME/workspace/windows/wine winecfg`

1.  跳出来的配置页面中，选择 windows 版本：

![image-20260131184626213](/img/wine/1.png)

2. 使渲染补丁生效。如果不设置渲染补丁，可能无法进入游戏或者其他问题：

![image-20260131184856295](/img/wine/2.png)

3. *Graphics* 选项卡下，**不要**选择虚拟桌面，否则游戏无法全屏运行。默认为选择，可以检查下 。

Wine 各个配置项参考：

- https://www.ljjyy.com/archives/2023/06/100639

- https://www.cnblogs.com/wheel/articles/5930110.html

- https://garywill.github.io/chiblog/post/wine/

配置完成之后的目录结构：

```shell
$ tree -L 2 wine
wine
├── dosdevices
│   ├── c: -> ../drive_c
│   ├── d: -> /System/Library/AssetsV2/com_apple_MobileAsset_PKITrustStore/purpose_auto/6dd55b0d06633a00de6f57ccb910a66a5ba2409a.asset/.AssetData
│   ├── d:: -> /dev/rdisk7s1
│   └── z: -> /
├── drive_c
│   ├── Program Files
│   ├── Program Files (x86)
│   ├── ProgramData
│   ├── users
│   └── windows
├── system.reg
├── user.reg
└── userdef.reg

11 directories, 4 files
```

其他配置，保存在 zsh 或者 bash 中。最后别忘了 source ~/.zshrc

```shell
# 解决报错：terminals database is inaccessible
export TERMINFO=/usr/share/terminfo
# 禁止在终端输出所有调试信息
export WINEDEBUG=-all
# Wine 主目录
export WINEPREFIX=Users/shown/workspace/windows/wine

# 解决中文乱码并创建别名
alias wine="env LC_ALL=zh_CN.UTF-8 wine64"
```

### 配置游戏

在 Wine 目录下 /Users/shown/workspace/windows/wine/drive_c 创建一个 `games` 目录，放游戏安装包等。

```
# shown @ 🚀 Everything wins. in ~/workspace/windows/wine/drive_c [18:59:15]
$ pwd
/Users/shown/workspace/windows/wine/drive_c

# shown @ 🚀 Everything wins. in ~/workspace/windows/wine/drive_c [18:59:21]
$ mkcd games
```

下载游戏 zip 包到 games 目录下，然后启动

```shell
# 给个别名，好启动
alias gosh="cd /Users/shown/workspace/windows/wine/drive_c/games/shanghaitan\ II && wine shanghai.exe -w -direct -txt"

# 启动
gosh
```

### zsh 配置

最终的 zsh 配置：

```shell
$ cat wine.zsh

# 解决报错：terminals database is inaccessible
export TERMINFO=/usr/share/terminfo
# 禁止在终端输出所有调试信息
export WINEDEBUG=-all
# Wine 主目录
export WINEPREFIX=/Users/shown/workspace/windows/wine

export WINEGAMEHOME="$WINEPREFIX/drive_c/games"

# 解决中文乱码并创建别名
alias wine="env LC_ALL=zh_CN.UTF-8 wine64"
alias gosh="cd /Users/shown/workspace/windows/wine/drive_c/games/shanghaitan\ II && wine shanghai.exe -w -direct -txt"
```

### Wine运行体验

流畅 体验较好。

![preview](/img/wine/3.png)

## 参考链接

https://eliu.github.io/2021/03/19/Play-Windows-Classic-Games-on-macOS/
