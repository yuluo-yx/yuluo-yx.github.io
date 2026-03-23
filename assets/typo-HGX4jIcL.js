const n=`---
slug: typo
title: Typo Tools
date: 2026-03-23 23:34:54
authors: yuluo
tags: [Typo]
keywords: [Typo]
image: /img/typo/shows.png
---

![Typo Logo](/img/typo/logo.svg)

每个开发者都有过这样的经历：手指飞快地敲下一串命令，回车执行，然后屏幕上赫然显示：

\`\`\`bash
$ gut stattus
zsh: command not found: gut
\`\`\`

明明想打 \`git status\`，结果手一抖，全错了。重新输入？浪费时间。复制粘贴？更麻烦。

**Typo** 就是为解决这个问题而生的命令行自动纠错工具。按两次 \`Esc\`，命令自动修正。

---

## TheFuck ？

实际使用中，theFuck 存在一些问题：

1. 依赖 Python 版本，会出现安装报错问题；
2. git commit -s -m "sss" 修正时，会吞掉引号； https://github.com/nvbn/thefuck/issues/1543
3. 仓库不更新了。

为此，有了 Go 编写的 Typo 。
## 快速上手

![Typo Show](/img/typo/typo-demo.gif)

### 安装

**方式一：Go 安装（推荐）**

\`\`\`bash
go install github.com/yuluo-yx/typo/cmd/typo@latest
\`\`\`

**方式二：下载二进制**

从 [GitHub Releases](https://github.com/yuluo-yx/typo/releases) 下载对应平台的二进制文件：

| 平台 | 文件 |
|------|------|
| macOS ARM64 | \`typo-darwin-arm64\` |
| macOS AMD64 | \`typo-darwin-amd64\` |
| Linux AMD64 | \`typo-linux-amd64\` |
| Linux ARM64 | \`typo-linux-arm64\` |
| Windows | \`typo-windows-amd64.exe\` |

\`\`\`bash
# 以 macOS ARM64 为例
curl -LO https://github.com/yuluo-yx/typo/releases/latest/download/typo-darwin-arm64
chmod +x typo-darwin-arm64
sudo mv typo-darwin-arm64 /usr/local/bin/typo
\`\`\`

**方式三：源码编译**

\`\`\`bash
git clone https://github.com/yuluo-yx/typo.git
cd typo
make install
\`\`\`

### 配置 Shell 集成

在 \`~/.zshrc\` 中添加一行：

\`\`\`bash
eval "$(typo init zsh)"
\`\`\`

重启终端，完成！

### 使用

1. 输错命令时，按 \`Esc\` \`Esc\`，命令自动修正
2. 命令执行失败后，按 \`Esc\` \`Esc\`，修正上一条命令

\`\`\`bash
$ gut stattus<Esc><Esc>   # 自动变成 → git status
$ dcoker ps<Esc><Esc>      # 自动变成 → docker ps
\`\`\`

---

## 核心功能

### 1. 多层级智能纠错

Typo 按优先级依次尝试四种纠错策略：

| 优先级 | 策略 | 说明 |
|--------|------|------|
| 1 | 错误解析 | 提取工具自身的 "did you mean" 建议 |
| 2 | 历史记录 | 使用你之前学过的纠正 |
| 3 | 规则匹配 | 内置 50+ 规则 + 自定义规则 |
| 4 | 编辑距离 | 基于键盘布局的模糊匹配 |

### 2. 键盘布局感知

不同于简单的字符串匹配，Typo 知道你的键盘布局。

打 \`gut\` 时，\`u\` 和 \`i\` 在键盘上相邻，所以 \`gut\` → \`git\` 的可能性很高。而 \`got\` → \`git\` 就没那么确定，因为 \`o\` 和 \`i\` 距离较远。

这种基于 QWERTY 键盘布局的算法让纠错更精准。

### 3. 子命令智能修正

不仅修正主命令，还能修正子命令：

\`\`\`bash
$ git stattus   → git status
$ docker biuld  → docker build
$ npm isntall   → npm install
\`\`\`

支持的工具：git、docker、npm、yarn、kubectl、cargo、go、pip、brew、terraform、helm

### 4. 错误输出解析

当你执行一个命令失败后，工具本身可能会提示正确命令。Typo 能捕捉这些提示：

\`\`\`bash
$ git pshh
git: 'pshh' is not a git command. See 'git --help'.
Did you mean this?
        push
\`\`\`

按 \`Esc\` \`Esc\`，Typo 会直接用 \`git push\` 替换。

### 5. 自定义规则

你可以教 Typo 学习新的纠正规则：

\`\`\`bash
# 学习一条规则
typo learn "gut" "git"

# 查看所有规则
typo rules list

# 添加自定义规则
typo rules add "dcoker" "docker"
\`\`\`

---

## 便捷命令

| 命令 | 功能 |
|------|------|
| \`typo fix "gut stauts"\` | 直接修正命令 |
| \`typo learn "gut" "git"\` | 学习纠正规则 |
| \`typo rules list\` | 列出所有规则 |
| \`typo history list\` | 查看修正历史 |
| \`typo doctor\` | 诊断配置问题 |
| \`typo uninstall\` | 完全卸载 |

---

## 为什么选择 Typo？

| 特性 | Typo | 其他纠错工具 |
|------|------|--------------|
| 按键触发 | \`Esc\` \`Esc\` | 需要特定命令 |
| 键盘布局感知 | 支持 | 大多不支持 |
| 子命令修正 | 支持 | 部分支持 |
| 错误输出解析 | 支持 | 少见 |
| 自定义规则 | 支持 | 部分支持 |
| 安装复杂度 | 一行命令 | 可能需要额外配置 |

---

## 配置文件

Typo 的数据存储在 \`~/.typo/\` 目录：

\`\`\`
~/.typo/
├── history.json       # 修正历史（自动记录）
├── rules.json         # 自定义规则
└── subcommands.json   # 子命令缓存
\`\`\`

---

## 遇到问题？

运行 \`typo doctor\` 诊断配置状态：

\`\`\`bash
$ typo doctor
Checking typo configuration...

[1/4] typo command: ✓ available (/usr/local/bin/typo)
[2/4] config directory: ✓ /Users/you/.typo
[3/4] shell integration: ✓ loaded
[4/4] Go bin PATH: ✓ configured

All checks passed!
\`\`\`

---

## 立即尝试

\`\`\`bash
go install github.com/yuluo-yx/typo/cmd/typo@latest
echo 'eval "$(typo init zsh)"' >> ~/.zshrc
\`\`\`

**GitHub**: [https://github.com/yuluo-yx/typo](https://github.com/yuluo-yx/typo)

如果觉得有用，欢迎 Star 支持！
`;export{n as default};
