const n=`---
slug: ghostty-terminal
title: Mac Ghostty Terminal 配置
date: 2026-03-15 21:01:08
authors: yuluo
tags: [Ghostty, Mac]
keywords: [Ghostty, Mac]
image: /img/ghostty/icon.png
---

# Ghostty 终端模拟器 配置指南

网上都说，ghostty 配置 cc 更好用，表现比 iTerm2 更好，今天来试试。star 数比 Kitty 多些，由 zig 编写。

- https://ghostty.org/

- https://github.com/ghostty-org/ghostty

仍然用包管理器的方式安装：\`brew install --cask ghostty\`

> Tips: 一些使用快捷键
> cmd + D 分屏
> cmd + shift + D 向下分屏
> cmd + w 关闭当前分屏

## 配置

> Mac 配置参考文档：https://ghostty.org/docs/config/reference
>
> 配置项参考：https://blog.axiaoxin.com/post/ghostty-config-guide/
>
> **ghostty 官网的描述是开箱即用，无需多余配置。符合绝大多数人需求，意味着不改配置就可以用起来了。**
>
> 解释下名词：
>
> 1. GTK：终端 GTK (GIMP Toolkit) 是用于在 Linux 等 Unix-like 系统上创建**图形用户界面 (GUI)** 的开源工具包。
>
> 2. Terminfo：终端信息（Terminfo）用于告知应用软件当前终端的功能，以便正确控制。Ghostty 自带终端信息列表，用于展示其特性。

okay 安装完成，按照惯例来配置下，更花哨些。默认配置目录在 \`$HOME/.config/ghostty/config\`。也可以通过 \`$XDG_CONFIG_HOME\` 更改，更新路径之后为 \`$XDG_CONFIG_HOME/ghostty/config\`。两个路径都存在配置时，按照配置惯例，优先级覆盖原则。

配置更新完，生效有两种方案，一是 \`ctrl+shift+,\` 二是传统方式，新开一个 terminal。

### 字体

ghostty 内置默认字体是 \`JetBrains Mono\`，使用 \`ghostty +list-fonts\` 查看所有字体。

\`\`\`shell
# font settings
font-size = 16
\`\`\`

但是默认的字体对中文似乎不太友好？

![Font](/img/ghostty/1.png)

解决上述问题，可以改为以下配置：

\`\`\`shell
font-family = Symbols Nerd Font Mono
font-family = PragmataPro Liga
font-family = Sarasa Mono SC
font-family-bold = PragmataPro Liga
font-family-italic = PragmataPro Liga
font-family-bold-italic        = PragmataPro Liga
\`\`\`

开启一些 ghostty 的连字配置和一些字体特性

\`\`\`shell
font-feature                   = calt
# 连字
font-feature                   = liga
font-feature                   = ss13

window-inherit-font-size       = true
\`\`\`

总体感觉还阔以，截图展示：

![Font-Preview](/img/ghostty/2.png)

### 屏幕宽度和高度

> 不配置，使用默认也可。

\`\`\`shell
window-height                  = 30
window-width                   = 100
\`\`\`

### 主题

主题配置同样遵守上述的配置规则，默认路径为 \`~/.config/ghostty/themes\`。

Ghostly 自带许多主题，总共有 395 个，都在 \`/Applications/Ghostty.app/Contents/Resources/ghostty/themes\` 路径下。

 在 ghostty 终端下，执行 \`ghostty +list-themes\` 会出现对应的主题预览，以便查看和选择主题。

个人感觉：

- Blue Matrix 和 BuiltinDark，Bright Lights，Pro 似乎都不错

\`\`\`shell
theme = Pro
\`\`\`

#### 美化配置

\`\`\`shell
window-vsync = true
adjust-cursor-thickness        = 3
adjust-underline-position      = 3
bold-is-bright                 = true

cursor-invert-fg-bg            = true
cursor-opacity                 = 0.8
cursor-style                   = bar

mouse-hide-while-typing        = true

window-vsync                   = true
background-opacity             = 0.9
background-blur                = true

macos-icon = custom-style
macos-icon-ghost-color = #D8D0E8
macos-icon-screen-color = #000000
macos-icon-frame = plastic
\`\`\`

### 快捷键

使用 \`ghostty +list-keybinds --default\` 列出所有可用的快捷键。

## 功能性配置

\`\`\`shell
copy-on-select = clipboard
link-url = true
link-previews = true
\`\`\`

## 配置概览

\`\`\`
# ============================================
# 字体设置
# ============================================
font-family = Symbols Nerd Font Mono
font-family = PragmataPro Liga
font-family = Sarasa Mono SC
font-family-bold = PragmataPro Liga
font-family-italic = PragmataPro Liga
font-family-bold-italic = PragmataPro Liga

# 上下文替代
font-feature = calt
# 连字
font-feature = liga
# Stylistic Set 13
font-feature = ss13

font-size = 16
window-inherit-font-size = true

# ============================================
# 窗口设置
# ============================================
window-height = 30
window-width = 100
# 垂直同步，仅 macOS 支持
window-vsync = true

# ============================================
# 光标设置
# ============================================
cursor-style = bar
# 反转前景/背景色
cursor-invert-fg-bg = true
cursor-opacity = 0.8
adjust-cursor-thickness = 3
adjust-underline-position = 3
adjust-cell-height = 2

# ============================================
# 外观设置
# ============================================
theme = Catppuccin Mocha
background-opacity = 0.8
background-blur-radius = 30
background-blur = true
# background-image = /Users/shown/Downloads/ghostty-bgc.jpeg
# background-image-fit = stretch
bold-is-bright = true

# ============================================
# 行为设置
# ============================================
# 自动识别链接
copy-on-select = clipboard
link-url = true
link-previews = true
mouse-hide-while-typing = true
shell-integration = zsh

# ============================================
# macOS 专用设置
# ============================================
macos-icon = custom-style
macos-icon-ghost-color = #D8D0E8
macos-icon-screen-color = #000000
macos-icon-frame = plastic
\`\`\`

配置的效果大概是：

![Shows](/img/ghostty/3.png)

## 注意事项

在 ghostty 中，如果 vim 或者 tmux 高亮不生效，需要下面这样的配置：

>  https://github.com/tmux/tmux/issues/1246

\`\`\`shell
# .vimrc
" Enable true color 启用终端24位色
if exists('+termguicolors')
  let &t_8f = "\\<Esc>[38;2;%lu;%lu;%lum"
  let &t_8b = "\\<Esc>[48;2;%lu;%lu;%lum"
  set termguicolors
endif

# .tmux.conf
# important 开启24 bit color 其他方式都无效
set -g default-terminal "tmux-256color"
set -ga terminal-overrides ",*256col*:Tc"
\`\`\`
`;export{n as default};
