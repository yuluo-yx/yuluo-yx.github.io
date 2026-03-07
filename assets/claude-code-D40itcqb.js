const n=`---
slug: claude-code
title: 让 Claude Code 更好用
date: 2026-03-07 23:34:54
authors: yuluo
tags: [CC, Skills]
keywords: [CC, Skills]
---

Vibe Coding，探索下怎么配置 Claude Code 会变得更好用

Github: https://github.com/anthropics/claude-code

## 1. Claude Code 的目录结构

有一些是我自建的配置，有一些是原本就有的配置。已经眼花撩乱了，下面看下各个目录都是干啥的？为了方便起见，下面 claude code 简称 cl：或者也可以有这样一条 alias 配置：

\`alias cl='claude --dangerously-skip-permissions --append-system-prompt "$(cat ~/.shown_env/claude/system-prompt.txt)"'\`

\`\`\`shell
├── CLAUDE.md						# cl 启动时会自动读取的自定义指令配置文件，作为 system prompt
├── backups							# 文件备份目录
├── cache								# 缓存目录，存储 cl 产生的临时数据文件
├── debug								# 调试日志目录
├── file-history				# 文件操作历史记录
├── history.jsonl				# 对话历史记录，方便用户回溯
├── ide									# IDE 集成文件
├── plans								# 存储 plan 模式下的 plan 文件
├── plugins							# cl 插件目录，例如 mcp 插件管理
├── projects						# 项目级别的 cl 配置和 session 数据，在一个项目目录下使用 cl 时，会创建对应的项目文件夹
├── session-env					# 会话环境变量
├── settings.json				# cl 的全局配置文件，包含模型，ak，权限，环境变量等配置
├── shell-snapshots			# shell 状态快照，便于恢复
├── skills							# cl skills 目录，自定义 skills
├── stats-cache.json		# 统计数据缓存，例如 token 用量
├── statsig							# 功能开关
├── telemetry						# 观测数据，记录使用情况，错误信息等
└── todos								# 存储 todoWriter 工具创建的 todo 项
\`\`\`

除此之外可能还有 hooks/rules 等其他目录。见名知意。

## 2. CL Skills

Agent Skills 为 AI 增加了额外的技能包，方便使用。在 CL 中，不用特别配置，只需安装即可。

https://code.claude.com/docs/zh-CN/skills

可以安装 npx skills add vercel-labs/skills@find-skills -g -y，来搜索有哪些能用的 skills。比如在安装之后询问：

\`\`\`shell
❯ /skills
  ⎿  Skills dialog dismissed

❯ 我想做一个 React app，帮我找下有哪些能用的 skills

⏺ Skill(find-skills)
  ⎿  Successfully loaded skill

⏺ 正在查找与 React 开发相关的 skills...

───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
❯ 帮我用 Vite 创建 React 项目                                                                                                 …

───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  📁 .claude | 🤖 glm-5 | 📊 [█░░░░░░░░░░░░░░] 8.8% (17.7k/200k) | 💰 $0.06
  ⏵⏵ bypass permissions on (shift+tab to cycle)
\`\`\`

## 3. CL MCP 配置

https://code.claude.com/docs/zh-CN/mcp

在安装了 cl 之后，可以使用 claude mcp list 查看已经安装的 mcp，像下面这样：

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

## 4. CL Command Lines

https://code.claude.com/docs/zh-CN/cli-reference

 cl 作为一个命令行工具，在启动时自带一些指令启动。让我们来看看。

如果 cl 太长太难记，或许需要一条这样的 alias：\`alias cl='claude --dangerously-skip-permissions --append-system-prompt "$(cat ~/.shown_env/claude/system-prompt.txt)"'\`

常用的可能有以下几个：

1. --append-system-prompt 将自定义文本附加到默认系统提示的末尾（在交互和打印模式中都有效）；
2. --dangerously-skip-permissions 跳过所有权限提示（谨慎使用）.

\`\`\`shell
system-prompt.txt

CRITICAL WORKFLOW REQUIREMENT
- When the user asks for something but there's ambiguity, you must always ask for clarification before proceeding. Provide users some options.
- When giving user responses, give short and concise answers. Avoid unnecessary verbosity.
- Never compliment the user or be affirming excessively (like saying "You're absolutely right!" etc). Criticize user's ideas if it's actually need to be critiqued, ask clarifying questions for a much better and precise accuracy answer if unsure about user's question, and give the user funny insults when you found user did any mistakes
- Avoid getting stuck. After 3 failures when attempting to fix or implement something, stop, note down what's failing, think about the core reason, then continue.
- When asked to make changes, avoid writing comments in the code about that change. Comments should be used to explain complex logic or provide context where necessary.
\`\`\`



## 5. CL Hooks 配置

https://code.claude.com/docs/zh-CN/hooks-guide

在 Claude Code 特定时刻（事件）自动执行的脚本，让你能对 CL 的行为进行确定性控制。

https://github.com/karanb192/claude-code-hooks

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
            "command": "node ~/.claude/hooks/block-dangerous-commands.js"
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
   3. node ~/.claude/hooks/block-dangerous-commands.js
\`\`\`

## 5. CL claude.md 配置

https://code.claude.com/docs/zh-CN/memory#choose-where-to-put-claudemd-files

claude.md 文件在 cl 每次启动时会自动加载到 cl 中，cl 之后的回答都会最大程度遵守它，但不是百分百遵守。

claude.md 加载顺序：CLAUDE.md 文件可以位于多个位置，每个位置有不同的范围。更具体的位置优先于更广泛的位置。

### 5.1 个人使用

在个人使用， \`~/.claude/CLAUDE.md\`  通常位于此。所有项目使用，当有多个是，cl 会随机选取

claude code 官方推荐 claude.md 文件内容不要太长，不要超过 200 行，超过了建议使用导入的方式加载。

自用的 claude.md 文件：

\`\`\`markdown
关键工作流程要求:

- 当用户提出请求但表达不清时，务必先询问用户以确认其理解，然后再继续操作。为用户提供一些选项;
- 回复用户时，请提供简短精炼的答案，避免不必要的赘述;
- 切勿过度赞扬或肯定用户（例如说“你说得完全正确！”等）,如果用户的想法确实需要批评，请提出批评意见；如果对用户的问题不确定，请提出澄清问题以获得更准确、更精确的答案；如果发现用户犯了错误，请适当地“调侃”用户;
- 避免陷入困境。尝试修复或实现某个功能失败三次后，请停止操作，记录失败的原因，思考其根本原因，然后再继续;
- 当被要求进行更改时，请避免在代码中添加关于更改的注释。注释应该用于解释复杂的逻辑或在必要时提供上下文信息。

重要：所有输出均使用简体中文！
\`\`\`

### 5.2 项目使用

在 cl 中，可以使用 /init 指令生成项目的  CLAUDE.md 文件，如果已经有了，init 指令会优化而不是覆盖。

### 5.3 官方推荐写法

1. 明确指出要做什么，而不是用笼统大概的写法，例如：**使用 2 空格缩进”而不是”正确格式化代码**；
2. 使用 markdown 语法编写；
3. 每个 claude 文件在 200 行以下。

### 5.4 CLAUDE.md 进化之路

一种更好的用法是，在使用过程中，让 cl 自己将这次的内容总结并写入到 CLAUDE.md. 中，达到自我进化的目的。

## 6. CL Settings 配置

https://code.claude.com/docs/zh-CN/settings#%E5%8F%AF%E7%94%A8%E8%AE%BE%E7%BD%AE

和 CLAUDE.md. 一样，同样分为个人用户和项目级配置。

\`\`\`shell
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-762e6e532c8a4745b881bbf2a7db7608",
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
            "command": "node ~/.claude/hooks/block-dangerous-commands.js"
          }
        ]
      }
    ]
  }
}
\`\`\`

Statusline 配置：https://github.com/Wangnov/claude-code-statusline-pro

## 6. CL 实用指南

### 6.1 CL 调试

\`\`\`shell
export CLAUDE_DEBUG=true
export CLAUDE_LOG_LEVEL=debug

# 启动
cl

# 查看日志
tail -f ~/.claude/logs/claude.log
\`\`\`

### 6.2 永远让 CL 可以自动测试

\`\`\`markdown
请实现功能 X,然后:
1. 运行测试验证
2. 检查代码格式
3. 验证边界情况
4. 确认无回归问题
\`\`\`

### 6.3 让 CL 自己查找上下文

使用 PLAN 模式或者渐进式完成。

\`\`\`shell
1. 阅读并理解 @path 项目，并生成 xxx 总结文档;
2. 分析要完成 x 功能，需要怎么做，并制定一个 plan；
3. 完成 plan；
4. 编写测试 case 并回归
\`\`\`

### 6.4 使用 Plan 模式

两下 Shift+Tab 进入 Plan Mode！

### 6.5 使用 SubAgents 模式

https://code.claude.com/docs/zh-CN/best-practices#%E4%BD%BF%E7%94%A8-subagents-%E8%BF%9B%E8%A1%8C%E8%B0%83%E6%9F%A5

### 6.6 多用 /clear 清理上下文

当上下文太多时，cl 也可能会变傻！

## 7. 参考文档

- CL 官方文档：https://code.claude.com/docs/zh-CN/
- CL：https://x.com/dotey/status/2007217136176148737
- skills 推荐：https://zhuanlan.zhihu.com/p/1995802528294646467
- CL 创始人的 10 个 skills：https://tonybai.com/2026/02/03/claude-code-founder-10x-efficiency-10-hidden-skills/（https://x.com/bcherny/status/2017742741636321619）
- 推荐安装的 mcp：https://help.apiyi.com/claude-code-mcp-top-10-must-install.html
`;export{n as default};
