const n=`---
slug: fish
title: Fish 配置
date: 2026-04-12 00:17:32
authors: yuluo
tags: [Fish]
keywords: [Fish]
image: /img/fish/6.png

---

<!-- truncate -->

之前的主力 shell 模拟器一直是 Zsh。为了给 typo 适配下 Fish。准备研究下 fish 看看，早都听闻许久，一直没机会实践。

Github：https://github.com/fish-shell/fish-shell 现在是 33.1k star，由 Rust 编写。

官网：https://fishshell.com/

## Fish 介绍

名字由来：Fish 的译文是 鱼，但并不是真的鱼的意思。而是 the **f**riendly **i**nteractive **sh**ell 取得首字母而来。

Fish 自带输入建议，语法高亮，可视化 Web 页面配置，Tab 补全等功能，无需配置，开箱即用，这点上比 Zsh 方便得多。

在 Mac 上，可以直接用 \`brew install fish\` 安装。（Tips：brew 源版本有点落后，可以从 github release 下载安装）下面介绍几个相关的 shell 命令并安装 fish。

\`\`\`shell
# 查看当前 shell
echo $SHELL

# 查看系统安装的 shell
cat /etc/shells

# 切换系统默认 shell 为 zsh
chsh -s /bin/zsh

# 将 fish 设置为默认 shell，这里用的是 mac 的 brew 安装的 fish，所以需要将其添加到 /etc/shells 里去，避免 chsh 切换 fish 时找不到的问题
command -v fish | sudo tee -a /etc/shells

# 设为默认 shell 模拟器
chsh -s "$(command -v fish)"

# fish version
fish --version
fish, version 4.0.2
\`\`\`

## Fish 配置

### Fish 配置目录结构

按照惯例，配置之前先理解下各个目录的作用和意义，方便之后配置各个功能。

\`\`\`shell
fish
├── completions
├── conf.d
├── config.fish
├── fish_variables
└── functions
    └── fish_prompt.fish

4 directories, 3 files
\`\`\`

文件说明：

| 路径             | 当前作用                                                     |
| ---------------- | ------------------------------------------------------------ |
| \`config.fish\`    | 主配置文件。                                                 |
| \`conf.d/\`        | 启动片段目录。用于拆分环境变量、路径、缩写、工具初始化等模块。 |
| \`functions/\`     | 自动加载函数目录。当前保存了 \`fish_prompt.fish\`。每个函数单独一个同名 \`.fish\` 文件，例如 \`ll.fish\` 定义 \`function ll\`。 |
| \`completions/\`   | 自定义补全目录，放命令补全文件，例如 \`bun.fish\`、\`git-foo.fish\`。 |
| \`fish_variables\` | fish 通用变量文件。保存了颜色变量和按键绑定。                |

例如这样的命令会写入到 \`fish_variables\` 中：

\`\`\`shell
╰─>$ fish_add_path /Users/shown/.local/bin/
set -U fish_user_paths /Users/shown/.local/bin

╰─>$ cat fish_variables | grep .local
SETUVAR fish_user_paths:/Users/shown/\\x2elocal/bin
\`\`\`

### Zsh -> Fish 的迁移

从 zsh 迁移 Fish 的时候，需要有一个注意的点是：**PATH 变量不会同步到 fish**。fish 的配置文件默认在 \`~/.config/fish/config.fish\` ，可以使用此命令将 zsh 的变量添加到 fish。或者手动设置到 config.fish 文件中去。

\`\`\`shell
# 添加一个路径到 fish path
fish_add_path /opt/homebrew/bin
\`\`\`

剩余其他点重新配置就行。

### Fish 简单配置

Fish 自带一个 fish_config 的本地配置面板。切换 fish 之后在终端输入 fish_config 启动，会启动一个本地 web 服务，而后打开浏览器的 web 页面以配置 fish。

![](/img/fish/1.png)

fish 每次登录 shell 时都会出现条欢迎语：

![](/img/fish/2.png)

可以使用 \`set -U fish_greeting\` 关闭。fish 默认使用 Emacos 按键模式，这里改成 vim：\`set -g fish_key_bindings fish_vi_key_bindings\`。

因为 fish 的天然集成高亮，补全等其他功能，加上 web 页面的配置已经够用了。

![](/img/fish/3.png)

当然，本着折腾的心智，继续往下！

### 配置框架

Zsh 有一款很经典的配置框架，oh-my-zsh：https://github.com/ohmyzsh/ohmyzsh star 186k。

Fish 同样也有一个类型的配置框架，用来管理主题和插件等，oh-my-fish：https://github.com/oh-my-fish/oh-my-fish star 11.3k。比起 zsh 略逊一筹。

#### Oh-my-fish 配置

> ***Oh-my-fish 的维护者已经无力再维护了，在 github README 中贴了招募贡献者的公告。***

![](/img/fish/4.png)

安装和 oh-my-zsh 一样，执行下面的命令：

\`\`\`shell
curl https://raw.githubusercontent.com/oh-my-fish/oh-my-fish/master/bin/install | fish

# 查看版本
omf -v
Oh My Fish version 8
\`\`\`

##### omf 配置

使用上也和 omz 一致。

\`\`\`shell
# 列出可用的主题
# omf 的主题预览地址：https://github.com/oh-my-fish/oh-my-fish/blob/master/docs/Themes.md
omf theme

# 列出已安装的theme和plugin
omf list

# 搜索 plugins 或者 theme
omf search xxx

# 例如搜索 fzf
> omf search fzf
Plugins
fzf - Ef-fish-ient fish keybindings for fzf
fzf-autojump - Fish shell plugin for autojump and fzf integration
makeme - Easing the usage of Makefiles with the power of fzf

Themes

# 安装 packages
omf install xxx

# 移除
omf remove xxx
\`\`\`

安装之后的插件在 \`/Users/shown/.local/share/omf/pkg/xxx\` 目录下。

### Prompt 配置

##### 配置框架

用 oh-my-posh 或者 starship，并不太喜欢这类东西。这里跳过，有兴趣可以研究下。

oh-my-posh：https://github.com/jandedobbeleer/oh-my-posh

starship：https://github.com/starship/starship

##### Fish 原生配置

这里改下 fish 原生的 Prompt：

参考文档：http://fishshell.com/docs/current/prompt.html#writing-your-own-prompt

主要修改的 function 是：fish_prompt。

\`\`\`shell
function fish_prompt
    set -l last_status $status
    set -l prompt_color 00FFAF
    set -l hash_color FF5FD7
    set -l identity_color 00D7FF
    set -l phrase_color FFD700
    set -l path_color 5FD7FF
    set -l git_color AF87FF
    set -l branch_color 87FF5F
    set -l time_color D7D7FF

    if test $last_status -ne 0
        set prompt_color FF5F5F
    end

    set_color --bold $hash_color
    echo -n '# '
    set_color --bold $identity_color
    echo -n 'shown@Mac-mini'
    set_color --bold $phrase_color
    echo -n ' Everything wins 🚀 '
    set_color $prompt_color
    echo -n 'in '
    set_color $path_color
    echo -n (pwd)

    # 仅在 git 仓库内显示分支；detached HEAD 时回退为短提交号。
    if command git rev-parse --is-inside-work-tree >/dev/null 2>/dev/null
        set -l branch (command git branch --show-current 2>/dev/null)

        if test -z "$branch"
            set branch (command git rev-parse --short HEAD 2>/dev/null)
        end

        if test -n "$branch"
            set_color $git_color
            echo -n ' on git:['
            set_color --bold $branch_color
            echo -n $branch
            set_color $git_color
            echo -n ']'
        end
    end

    set_color $git_color
    echo -n ' ['
    set_color $time_color
    echo -n (date '+%H:%M:%S')
    set_color $git_color
    echo ']'
    set_color --bold $prompt_color
    echo -n '> '
    set_color normal
    return 0
end
\`\`\`

配置效果如下：

![](/img/fish/5.png)

### Function 配置

fish 使用 function 定义扩展命令，在 \`~/.config/fish/functions\` 目录下。这里演示下，常见一个开启和关闭 proxy 的 function：

\`\`\`shell
function proxy
    set -Ux all_proxy http://127.0.0.1:17897
    set -Ux http_proxy http://127.0.0.1:17897
    set -Ux https_proxy http://127.0.0.1:17897
    echo all_proxy=$all_proxy
    echo http_proxy=$http_proxy
    echo https_proxy=$https_proxy
end

function noproxy
    set -e all_proxy
    set -e http_proxy
    set -e https_proxy
end
\`\`\`

在 fish 中使用 \`proxy 和 onproxy\` 打开和关闭代理。

常用的一些 alias 别名等，简单些的可以通过 \`abbr --add g git\` 这样的方式定义，可以通过 function 定义。

\`\`\`shell
# 创建目录并进入
function mkcd --description 'Create a directory and enter it'
    mkdir -p $argv[1]
    and cd $argv[1]
end
\`\`\`

## Fish SheBang 配置

\`\`\`shell
# 从 env 中寻找 fish，用于分发之后的 fish 脚本
#!/usr/bin/env fish

echo "hi fish!"
\`\`\`
`;export{n as default};
