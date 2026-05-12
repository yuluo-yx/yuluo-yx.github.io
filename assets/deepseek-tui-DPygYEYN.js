const e=`---
slug: deepseek-tui
title: DeepSeek-TUI 安装和配置
date: 2026-05-10 11:17:15
authors: yuluo
tags: [Deepseek-TUI]
keywords: [Deepseek-TUI]
image: /img/ai/deepseek-tui/2.png
---

**一个住在终端里的编程智能体。**

> ● 由 Hmbown 独立维护；
>
> ● 和 deepseek.inc 无关；
>
> ● 中文文档，国内用户友好型。

深度求索 · DeepSeek TUI 是一款基于 DeepSeek V4 系列的开源命令行智能体。

它编辑文件、执行 Shell、调用 MCP 服务器，并尊重你的沙箱边界。

## 1. 安装

\`\`\`shell
# 国内用户可以配置 npm 代理源
npm install -g deepseek-tui

cargo install deepseek-tui-cli --locked   # \`deepseek\` (entry point)
cargo install deepseek-tui     --locked   # \`deepseek-tui\` (TUI binary)

brew tap Hmbown/deepseek-tui
brew install deepseek-tui

# 安装验证
deepseek --version
\`\`\`

## 2. 配置

deepseek-tui 默认使用 deepseek-v4-pro 模型，所有配置存放在 ~/.deepseek/ 目录下。

项目级别的覆盖通过仓库根目录的 .deepseek/ 等项目级配置实现。

> 配置参考：https://github.com/Hmbown/DeepSeek-TUI#configuration

### 2.1 DeepSeek 模型配置

在 platform.deepseek.com 注册。注册后会获得一个 sk-... 格式的 API 密钥。

粘贴一次后， deepseek auth 会将其配置在 ~/.deepseek/config.toml。

### 2.2 其他厂商模型配置

deepseek-tui 支持 9 中不同的 provider，默认 deepseek。

> 参考：https://github.com/Hmbown/DeepSeek-TUI#other-api-providers。

\`\`\`markdown
· deepseek
· nvidia-nim
· openrouter
· novita
· fireworks
· sglang
· vllm
· ollama
· openai
\`\`\`

这里以 OpenAI Provider，阿里云百炼的 deepseek-v4 pro 模型接入。

> 配置参考：https://github.com/Hmbown/deepseek-tui/blob/main/config.example.toml
>
> 第一次配置时，可能需要手动创建 ~/.deepseek 目录并创建 config.toml 文件。

\`\`\`toml
allow_shell = true
approval_policy = "on-request"
auto_allow = [
    "git status",
    "cargo check",
    "npm run",
]
cost_currency = "cny"
default_text_model = "deepseek-v4-pro"

# 可以更详细配置，这里复用 claude 配置
instructions = ["~/.claude/CLAUDE.md"]

max_subagents = 15

mcp_config_path = "~/.deepseek/mcp.json"
memory_path = "~/.deepseek/memory.md"
notes_path = "~/.deepseek/notes.txt"
provider = "openai"
reasoning_effort = "max"
sandbox_mode = "workspace-write"
skills_dir = "~/.deepseek/skills"

[capacity]
deepseek_v3_2_chat_prior = 3.9
deepseek_v3_2_reasoner_prior = 4.1
deepseek_v4_flash_prior = 4.2
deepseek_v4_pro_prior = 3.5
enabled = false
fallback_default_prior = 3.8
low_risk_max = 0.5
max_replay_per_turn = 1
medium_risk_max = 0.62
min_turns_before_guardrail = 4
profile_window = 8
refresh_cooldown_turns = 6
replan_cooldown_turns = 5
severe_min_slack = -0.25
severe_violation_ratio = 0.4

[context]
cycle_threshold = 768000
enabled = true
l1_threshold = 192000
l2_threshold = 384000
l3_threshold = 576000
seam_model = "deepseek-v4-flash"
verbatim_window_turns = 16

[features]
apply_patch = true
exec_policy = true
mcp = true
shell_tool = true
subagents = true
web_search = true

[memory]
enabled = true

# 可信项目配置
[projects."/Users/yuluo/.deepseek"]
trust_level = "trusted"

providers.openai]
api_key = "sk-xxxx"
base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1"
model = "deepseek-v4-pro"

[retry]
enabled = true
exponential_base = 2.0
initial_delay = 1.0
max_delay = 60.0
max_retries = 3

[subagents]
max_concurrent = 10

[tui]
alternate_screen = "auto"
# 注意这里配置的是 tui 的显示语言，非模型输出的思考内容
locale = "zh-Hans"
mouse_capture = true
notification_condition = "always"
osc8_links = true
terminal_probe_timeout_ms = 500
\`\`\`

配置中的 mcp skill 等需要手动执行 \`deepseek setup --skill\` 等创建对应文件。

### 2.3 TUI 配置

也可以通过输入 /config 指令启动 tui 以配置：

![ds-tui config](/img/ai/deepseek-tui/4.png)

### 2.4 配置验证

deepseek doctor 会检查密钥、网络连通性、沙箱可用性、 MCP 服务器，并将报告写入 ~/.deepseek/doctor.log。

\`\`\`shell
$ deepseek doctor
DeepSeek TUI Doctor
==================

Version Information:
  deepseek-tui: 0.8.22 (8b6027598194)
  rust: rustc 1.95.0 (59807616e 2026-04-14)

Configuration:
  ✓ config.toml found at ~/.deepseek/config.toml
  workspace: ~/.deepseek

API Keys:
  ✓ deepseek: env=yes, config=no
  · nvidia-nim: env=no, config=no
  · openrouter: env=no, config=no
  · novita: env=no, config=no
  · fireworks: env=no, config=no
  · sglang: env=no, config=no
  · vllm: env=no, config=no
  · ollama: env=no, config=no
  · credential precedence: ~/.deepseek/config.toml, OS keyring, then env
  ✓ active provider key resolved from config.toml

API Connectivity:
  · provider: openai
  · base_url: https://dashscope.aliyuncs.com/compatible-mode/v1
  · model: deepseek-v4-pro
  · strict_tool_mode: disabled
  ✓ API connection successful (model: deepseek-v4-pro)

MCP Servers:
  ✓ MCP feature flag enabled
  ✓ MCP config found at ~/.deepseek/mcp.json
  · 1 server(s) configured
  ✓ example: stdio server (node ./path/to/your-mcp-server.js)

Skills:
  ✓ local skills dir found at ~/.deepseek/skills (1 items)
  · .agents skills dir not found at ~/.deepseek/.agents/skills
  ✓ global .agents skills dir found at ~/.agents/skills (3 items)
  ✓ global skills dir found at ~/.deepseek/skills (1 items)
  · selected skills dir: ~/.deepseek/skills

Tools:
  ✓ tools dir found at ~/.deepseek/tools (2 items)

Plugins:
  · plugins dir not found at ~/.deepseek/plugins
    Run \`deepseek setup --plugins\` to scaffold a starter dir.

Storage:
  · tool-output spillover dir not yet created at ~/.deepseek/tool_outputs
  · composer stash empty (Ctrl+S in the composer to park a draft)

Platform:
  OS: macos
  Arch: aarch64
  ✓ sandbox available: macos-seatbelt

All checks complete!
\`\`\`

## 3. 使用

按照惯例设置下 \`alias：alias dst="deepseek"\`。

deepseek-tui 有三种运行模式——与审批系统正交。按 Tab 切换。

- Plan：只读调查。可以 grep、读文件、列目录、抓取 URL——不能写入或执行 shell；
- Agent：默认模式。多步工具调用。Shell 和有副作用的工具需按 approval_mode 设置审批；
- YOLO：自动批准所有操作并启用信任模式。工作区边界解除。请谨慎使用。

dst 启动！界面还是挺简洁的，比 codex 和 cc 有更多细节展示。

![ds-tui start](/img/ai/deepseek-tui/3.png)

### 3.1 小试牛刀：

运行时输出：

![ds-tui 分析 typo 项目](/img/ai/deepseek-tui/2.png)

需要审批时的输出：

![人工介入审批](/img/ai/deepseek-tui/1.png)

> Tips: 中止属于用法问题，已反馈作者，新版本中已修复。

### 3.2 使用快捷键

- Tab：切换模式（Plan / Agent / YOLO）
- Shift+Tab：切换推理强度
- Ctrl+L：清屏，保留会话
- Ctrl+C：取消当前轮次
- Ctrl+D：退出
- /help：斜杠命令面板
- /config：交互式编辑配置
- /trust：解除本会话的工作区边界
`;export{e as default};
