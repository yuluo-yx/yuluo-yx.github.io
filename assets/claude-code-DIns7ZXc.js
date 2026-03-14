const n=`---
slug: claude-code
title: 让 Claude Code 更好用
date: 2026-03-07 23:34:54
authors: yuluo
tags: [CC, Skills]
keywords: [CC, Skills]
---

Vibe Coding，探索下怎么配置 Claude Code 会变得更好用一些！

Github: https://github.com/anthropics/claude-code

\`\`\`shell
# 安装
brew install --cask claude-code

# 交互模式启动
claude
\`\`\`

## 1. Claude Code 的目录结构

有一些是我自建的配置，有一些是原本就有的配置。已经眼花撩乱了，下面看下各个目录都是干啥的？为了方便起见，下面 claude code 简称 cl：或者也可以有这样一条 alias 配置：

\`alias cl='claude --dangerously-skip-permissions --append-system-prompt "$(cat ~/.shown_env/claude/system-prompt.txt)"'\`

\`\`\`shell
├── CLAUDE.md						# cl 启动时会自动读取的自定义指令配置文件，作为 system prompt
├── backups							# 文件备份目录
├── cache							# 缓存目录，存储 cl 产生的临时数据文件
├── debug							# 调试日志目录
├── file-history				    # 文件操作历史记录
├── history.jsonl				    # 对话历史记录，方便用户回溯
├── ide								# IDE 集成文件
├── plans							# 存储 plan 模式下的 plan 文件
├── plugins							# cl 插件目录，例如 mcp 插件管理
├── projects						# 项目级别的 cl 配置和 session 数据，在一个项目目录下使用 cl 时，会创建对应的项目文件夹
├── session-env					    # 会话环境变量
├── settings.json				    # cl 的全局配置文件，包含模型，ak，权限，环境变量等配置
├── shell-snapshots			        # shell 状态快照，便于恢复
├── skills							# cl skills 目录，自定义 skills
├── stats-cache.json		        # 统计数据缓存，例如 token 用量
├── statsig							# 功能开关
├── telemetry						# 观测数据，记录使用情况，错误信息等
└── todos							# 存储 todoWriter 工具创建的 todo 项
\`\`\`

除此之外可能还有 hooks/rules 等其他目录，见名知意。

- 前者用来存放 cl hooks 脚本，后者用来存放 cl 项目里的 rules 规则。

## 2. CL Skills

Agent Skills 为 AI 增加了额外的技能包，方便使用。在 CL 中，不用特别配置，只需安装即可。

https://code.claude.com/docs/zh-CN/skills

推荐安装 \`npx skills add vercel-labs/skills@find-skills -g -y\`，需要完成某个功能时来搜索有哪些能用的 skills。比如在安装之后询问：

\`\`\`shell
❯ /skills
  ⎿  Skills dialog dismissed

❯ 我想做一个 React app，帮我找下有哪些能用的 skills

⏺ Skill(find-skills)
  ⎿  Successfully loaded skill

⏺ 正在查找与 React 开发相关的 skills...                                                                                                 …
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  📁 .claude | 🤖 glm-5 | 📊 [█░░░░░░░░░░░░░░] 8.8% (17.7k/200k) | 💰 $0.06
  ⏵⏵ bypass permissions on (shift+tab to cycle)
\`\`\`

另外推荐 \`pua skill\`，鞭策大模型，亲测有效果，使用以下命令安装：

\`\`\`shell
claude plugin marketplace add tanweai/pua
claude plugin install pua@pua-skills
\`\`\`

https://github.com/tanweai/pua

## 3. CL MCP 配置

https://code.claude.com/docs/zh-CN/mcp

在安装了 cl 之后，可以使用 \`claude mcp list\` 查看已经安装的 mcp，像下面这样：

\`\`\`shell
# 安装
claude mcp add playwright npx @playwright/mcp@latest

# list 检查
$ claude mcp list
Checking MCP server health...

fetch: npx -y @kazuph/mcp-fetch - ✓ Connected
github: https://api.githubcopilot.com/mcp/ (HTTP) - ✗ Failed to connect
chrome-devtools: npx chrome-devtools-mcp@latest - ✓ Connected
playwright: npx @playwright/mcp@latest - ✓ Connected
sequential-thinking: npx -y @modelcontextprotocol/server-sequential-thinking - ✓ Connected
filesystem: npx -y @modelcontextprotocol/server-filesystem /Users/shown/ - ✓ Connected
docker: npx -y @modelcontextprotocol/server-docker - ✗ Failed to connect
\`\`\`

打开 cl，输入以下 \`检查当前的操作系统环境，帮我安装列举出的 MCP：fetch，github，chrome-devtools，playwright，sequential-thinking，filesystem，docker。其中 filesystem 的目录是 /User/shown\`，自己安装

## 4. CL Command Lines

https://code.claude.com/docs/zh-CN/cli-reference

 cl 作为一个命令行工具，在启动时自带一些指令启动，让我们来看看。

如果 cl 启动时的参数太长太难记，或许需要一条这样的 alias：\`alias cl='claude --dangerously-skip-permissions --append-system-prompt "$(cat ~/.shown_env/claude/system-prompt.txt)"'\`

常用的可能有以下两个：

1. \`--append-system-prompt/--append-system-prompt-file\` 将自定义文本附加到默认系统提示的末尾（在交互和打印模式中都有效）；
2. \`--dangerously-skip-permissions\` 跳过所有权限提示（谨慎使用）。在配置完成第一次打开时，会有对应的权限信息提示，选择接受即可。

\`\`\`shell
# system-prompt.txt

CRITICAL WORKFLOW REQUIREMENT
- When the user asks for something but there's ambiguity, you must always ask for clarification before proceeding. Provide users some options.
- When giving user responses, give short and concise answers. Avoid unnecessary verbosity.
- Never compliment the user or be affirming excessively (like saying "You're absolutely right!" etc). Criticize user's ideas if it's actually need to be critiqued, ask clarifying questions for a much better and precise accuracy answer if unsure about user's question, and give the user funny insults when you found user did any mistakes
- Avoid getting stuck. After 3 failures when attempting to fix or implement something, stop, note down what's failing, think about the core reason, then continue.
- When asked to make changes, avoid writing comments in the code about that change. Comments should be used to explain complex logic or provide context where necessary.
\`\`\`

> Tips: 这里需要注意的是，\`--append-system-prompt\` 配置并不等同于 CLAUDE.md 配置，CLAUDE.md 配置并不是每次百分百遵守的，很大程度上取决于模型自身的限制。比如：在 CLAUDE.md 中明确指出不要添加行内注释，但是仍然会添加。

这里还有一些其他的 Prompt 参考：

\`\`\`shell
# 输出规范

如果一段话删掉后不影响我做决策，那就不要写。

- 直接给出结论或方案，不要铺垫
- 省略显而易见的上下文和已知信息
- 只在对理解关键逻辑有帮助时才举例
- 追问的代价小于猜错返工的代价时，追问；否则给出最佳判断并标注假设
\`\`\`

## 5. CL Hooks 配置

https://code.claude.com/docs/zh-CN/hooks-guide

在 cl 特定时刻（事件）自动执行的脚本，比如调用工具之前，结束输出之后等，让你能对 CL 的即将要做的事情做 check 或者对编辑完之后的代码自动执行 lint。

参考这里设置 bash 危险指令检查和密钥保护：https://github.com/karanb192/claude-code-hooks

配置 settings.json

\`\`\`json
{
  // ...

  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/hooks/block-dangerous-commands.js"
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/hooks/protected-secret.js"
          }
        ]
      }
    ]
  }
\`\`\`

\`\`\`shell
❯ /hooks

───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 PreToolUse - Matcher: Bash
 Input to command is JSON of tool call arguments.
 Exit code 0 - stdout/stderr not shown
 Exit code 2 - show stderr to model and block tool call
 Other exit codes - show stderr to user only but continue with tool call

   1. + Add new hook…                                   User Settings
 ❯ 2. node ~/.claude/hooks/block-dangerous-commands.js  User Settings
   3. node ~/.claude/hooks/protected-secret.js
\`\`\`

## 6. CL CLAUDE.md 配置

https://code.claude.com/docs/zh-CN/memory#choose-where-to-put-claudemd-files

CLAUDE.md 文件在 cl 每次启动时会自动加载到 cl 中，作为 Memory，如上文中说到的：cl 之后的回答都会最大程度遵守它，但不是百分百遵守。

CLAUDE.md 加载顺序：CLAUDE.md 文件可以位于多个位置，每个位置有不同的范围。更具体的位置优先于更广泛的位置。

### 6.1 个人使用

在个人使用， \`~/.claude/CLAUDE.md\`  通常位于此。所有项目使用，当有多个是，cl 会以较高优先级覆盖低优先级配置并整合。

cl 官方推荐 CLAUDE.md 文件内容不要太长，不要超过 200 行，超过了建议使用 @ 导入的方式加载。

自用的 CLAUDE.md 文件：

\`\`\`markdown
## CRITICAL WORKFLOW REQUIREMENT

- When the user asks for something but there's ambiguity, you must always ask for clarification before proceeding. Provide users some options.
- When giving user responses, give short and concise answers. Avoid unnecessary verbosity.
- Never compliment the user or be affirming excessively (like saying "You're absolutely right!" etc). Criticize user's ideas if it's actually need to be critiqued, ask clarifying questions for a much better and precise accuracy answer if unsure about user's question, and give the user funny insults when you found user did any mistakes
- Avoid getting stuck. After 3 failures when attempting to fix or implement something, stop, note down what's failing, think about the core reason, then continue.
- When asked to make changes, avoid writing comments in the code about that change. Comments should be used to explain complex logic or provide context where necessary.

## Output Guidelines


deleting a paragraph wouldn't affect my decision-making, don't include it.

- Directly state the conclusion or solution; avoid preamble.
- Omit obvious context and known information.
- Only use examples if they help understand key logic.
- Ask follow-up questions only if the cost is less than the cost of guessing wrong and having to rework; otherwise, provide the best judgment and indicate the hypothesis.
\`\`\`

### 6.2 项目使用

在 cl 中，可以使用 \`/init\` 指令生成当前项目的 CLAUDE.md 文件，如果已经有了，\`init\` 指令会优化而不是覆盖。

在项目的 CLAUDE.md 中，可以通过 @ 的方式引入项目的文件或者代码，例如 \`@package.json\`，这会指导 cl 在加载 CLAUDE.md 时读取 package.json 文件。

### 6.3 官方推荐写法

1. 明确指出要做什么，而不是用笼统大概的写法，例如：**使用 2 空格缩进”而不是”正确格式化代码**；
2. 使用 markdown 语法编写；
3. 每个 claude 文件在 200 行以下。

### 6.4 CLAUDE.md 进化之路

一种更好的用法是：在使用过程中，让 cl 自己将这次的内容总结并写入到 CLAUDE.md 或者其他 markdown 文档中，在下次使用时，方便复用，或者达到自我进化的目的。

## 6. CL Settings 配置

https://code.claude.com/docs/zh-CN/settings#%E5%8F%AF%E7%94%A8%E8%AE%BE%E7%BD%AE

和 CLAUDE.md. 一样，同样分为个人和项目级配置。

> Tips: 使用百炼模型平台上的 GLM5 模型。

\`\`\`shell
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-xxxxxxxxxxxx",
    "API_TIMEOUT_MS": "3000000",
    "ANTHROPIC_BASE_URL": "https://dashscope.aliyuncs.com/apps/anthropic",
    "DISABLE_AUTOUPDATER": "1"
  },
  "includeCoAuthoredBy": false,
  "language": "chinese",
  "alwaysThinkingEnabled": true,
  "model": "glm-5",
  "small_model": "qwen3.5-flash",
  "statusLine": {
    "type": "command",
    "command": "npx ccsp@latest --preset PMBTUS --theme powerline"
  },
	"hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/hooks/block-dangerous-commands.js"
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/hooks/protected-secret.js"
          }
        ]
      }
    ]
  }
}
\`\`\`

Statusline 配置：https://github.com/Wangnov/claude-code-statusline-pro

## 7. CL 实用指南

### 7.1 CL 调试

\`\`\`shell
export CLAUDE_DEBUG=true
export CLAUDE_LOG_LEVEL=debug

# 启动
cl

# 查看日志
tail -f ~/.claude/logs/claude.log
\`\`\`

### 7.2 永远让 CL 可以自动测试

\`\`\`markdown
请实现功能 X,然后:

1. 运行测试验证
2. 检查代码格式
3. 验证边界情况
4. 确认无回归问题
\`\`\`

### 7.3 随时打断 cl

cl 本身是一个 Loop，也是目前 Agent 应用开发使用最多的 ReAct 范式。
使用 HITL 机制。如果发现 cl 出现了偏差，按下 esc 随时打断并修正。

### 7.4 使用 Plan 模式

使用 PLAN 模式或者渐进式完成，\`PLAN-AND-EXECUTE Agent\` 范式用法，明确列举 plan 或者 todo 项，顺序完成。

\`\`\`shell
# 或者通过以下 prompt 方式

1. 阅读并理解 @path 项目，并生成 xxx 总结文档;
2. 分析要完成 x 功能，需要怎么做，并制定一个 plan；
3. 完成 plan；
4. 编写测试 case 并回归。
\`\`\`

两下 \`Shift+Tab\` 或者输入 \`/plan\` 指令进入 Plan Mode！

### 7.5 使用 SubAgents 模式

\`Multi Agent\` 范式，将一个任务分为几个小的独立的子 Agent，分开执行最后汇报执行结果。

https://code.claude.com/docs/zh-CN/best-practices#%E4%BD%BF%E7%94%A8-subagents-%E8%BF%9B%E8%A1%8C%E8%B0%83%E6%9F%A5

### 7.6 多用 cl 内置指令

例如下面这些场景，上下文太多时，cl 陷入混乱。cl 消息塞满整个消息窗口时，自动压缩机制压缩之后消息混乱 等等场景。

虽然 cl 显示的上下文时 200k，但是不一定全部可用，cl 的上下文组成是：

\`\`\`
200K 总上下文
├── 固定开销 (~15-20K)
│   ├── 系统指令: ~2K
│   ├── 所有启用的 Skill 描述符: ~1-5K
│   ├── MCP Server 工具定义: ~10-20K  ← 最大隐形杀手
│   └── LSP 状态: ~2-5K
│
├── 半固定 (~5-10K)
│   ├── CLAUDE.md: ~2-5K
│   └── Memory: ~1-2K
│
└── 动态可用 (~160-180K)
    ├── 对话历史
    ├── 文件内容
    └── 工具调用结果
\`\`\`

- 任务 A 结束，任务 B 开始时，使用 \`/clear\` 清理上下文，会清理除了 CLAUDE.md 的其他所有东西；
- Plan模式下的，step 1 执行完成，使用 \`/compact\` 手动压缩上下文；
- 长会话主动用 \`/context\` 观察消耗，不要等系统自动压缩后再补救；
- 有事没事看下 cl memory 的内容，cl 在按照那个 Prompt 做事？\`/memory\`；
- 每次配置完成之后，\`/doctor\` 看下 cl 配置是否正确。

### 7.8 同时编辑一个项目的多个分支？

许多大神使用 tmux 或者终端 tab 同时操作多个 cl ，但是如果想操作同一个仓库项目的不同分支，worktree 可以实现。

https://git-scm.com/docs/git-worktree

### 7.9 配置一个 Raycast Scripts

\`\`\`shell
#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title cl
# @raycast.mode silent

# Optional parameters:
# @raycast.icon /Users/shown/Downloads/claude-code-favicon.ico

# Documentation:
# @raycast.description open claude code

osascript -e 'tell application "Terminal"
    do script "cl"
    activate
end tell'
\`\`\`

## 8. 参考文档

- CL 官方文档：https://code.claude.com/docs/zh-CN/
- CL：https://x.com/dotey/status/2007217136176148737
- skills 推荐：https://github.com/ComposioHQ/awesome-claude-skills
- CL 创始人的 10 个 skills：https://x.com/bcherny/status/2017742741636321619）
- 推荐安装的 mcp：https://help.apiyi.com/claude-code-mcp-top-10-must-install.html
- 视频演讲：https://x.com/i/status/1951179504790946189
- 还不错的 subagents：https://github.com/VoltAgent/awesome-claude-code-subagents
- https://x.com/HiTw93/status/2032091246588518683
`;export{n as default};
