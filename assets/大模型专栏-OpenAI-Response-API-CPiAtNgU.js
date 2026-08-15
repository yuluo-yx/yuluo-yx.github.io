const n=`---
id: openai-response-api
slug: /openai-response-api
title: 大模型专栏-什么是 OpenAI Responses API
date: 2026-08-09 15:58:30
authors: yuluo
tags: [AI, LLMs]
keywords: [AI, LLMs]
image: /img/ai/model-api/images.jpeg
---

<!-- truncate -->

> 什么是 OpenAI Responses API？与 Chat Completions API 有什么区别？主流模型厂商的原生 API 在数据结构上有哪些差异？

## ChatGPT 首次出现

从 22 年开始，ChatGPT 以 Web 聊天框的形式发布。以一问一答的形式工作，有文本续写（stream）的能力。**（Completions API，姑且将这次称为第一代 OpenAI API Spec。**

## Chat Completions API 发布

2023 年 3 月，OpenAI 发布 [Chat Completions API](https://developers.openai.com/api/reference/chat-completions/overview)。核心数据结构是 \`messages\` 数组，由开发者组织和管理对话历史。

请求需要指定模型和消息列表。常见的消息角色包括：

- \`developer\` 或 \`system\`：提供应用级指令和行为约束，定义当前会话 LLMs 以一种什么样的角色进行。
- \`user\`：表示用户 Promnpt。
- \`assistant\`：表示模型输出。

响应通常通过 \`choices\` 返回模型输出，并通过 \`usage\` 返回 token 用量。

\`\`\`shell
curl https://api.openai.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $OPENAI_API_KEY" \\
  -d '{
    "model": "gpt-5.4",
    "messages": [
      {
        "role": "developer",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "Hello!"
      }
    ]
  }'

{
  "id": "chatcmpl-B9MBs8CjcvOU2jLn4n570S5qMJKcT",
  "object": "chat.completion",
  "created": 1741569952,
  "model": "gpt-5.4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I assist you today?",
        "refusal": null,
        "annotations": []
      },
      "logprobs": null,
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 19,
    "completion_tokens": 10,
    "total_tokens": 29,
    "prompt_tokens_details": {
      "cached_tokens": 0,
      "audio_tokens": 0
    },
    "completion_tokens_details": {
      "reasoning_tokens": 0,
      "audio_tokens": 0,
      "accepted_prediction_tokens": 0,
      "rejected_prediction_tokens": 0
    }
  },
  "service_tier": "default"
}
\`\`\`

## 其他厂商 API

随着 LLMs 发展，Anthropic、Google、DeepSeek 和 DashScope 等厂商都推出了原生 API。许多提供商同时提供 OpenAI 兼容接口，但原生 API 在参数层级、消息表示、工具调用和响应字段上有明显差异。

### [DashScope API](https://help.aliyun.com/zh/model-studio/qwen-api-via-dashscope)

DashScope 是阿里云的大模型服务平台。请求体通过 \`input\` 封装输入，通过 \`parameters\` 封装生成参数；响应使用 \`output\`、\`request_id\` 和 \`status_code\` 等字段。部分地域的请求域名还需包含 \`WorkspaceId\`。

\`\`\`shell
curl --location "https://{WorkspaceId}.cn-beijing.maas.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation" \\
--header "Authorization: Bearer $DASHSCOPE_API_KEY" \\
--header "Content-Type: application/json" \\
--data '{
    "model": "qwen3.8-max",
    "input":{
        "messages":[
            {
                "role": "system",
                "content": [{"text": "You are a helpful assistant."}]
            },
            {
                "role": "user",
                "content": [{"text": "你是谁？"}]
            }
        ]
    },
    "parameters": {
        "result_format": "message"
    }
}'

{
  "status_code": 200,
  "request_id": "902fee3b-f7f0-9a8c-96a1-6b4ea25af114",
  "code": "",
  "message": "",
  "output": {
    "text": null,
    "finish_reason": null,
    "choices": [
      {
        "finish_reason": "stop",
        "message": {
          "role": "assistant",
          "content": "我是阿里云开发的一款超大规模语言模型，我叫千问。"
        }
      }
    ]
  },
  "usage": {
    "input_tokens": 22,
    "output_tokens": 17,
    "total_tokens": 39
  }
}
\`\`\`

### [Anthropic Messages API](https://platform.claude.com/docs/en/api/messages)

Anthropic Messages API 同样使用消息列表表示对话，但将 \`system\` 指令放在请求体顶层，并使用内容块数组表示多模态内容。响应中的 \`content\`、\`stop_reason\` 和 \`usage\` 等字段也与 Chat Completions API 不同。

\`\`\`shell
curl https://api.anthropic.com/v1/messages \\
    -H 'Content-Type: application/json' \\
    -H 'anthropic-version: 2023-06-01' \\
    -H "X-Api-Key: $ANTHROPIC_API_KEY" \\
    --max-time 600 \\
    -d "{
          \\"max_tokens\\": 1024,
          \\"messages\\": [
            {
              \\"content\\": \\"Hello, world\\",
              \\"role\\": \\"user\\"
            }
          ],
          \\"model\\": \\"claude-opus-4-6\\",
          \\"stream\\": false,
          \\"system\\": [
            {
              \\"text\\": \\"Today's date is 2024-06-01.\\",
              \\"type\\": \\"text\\"
            }
          ],
          \\"temperature\\": 1,
          \\"thinking\\": {
            \\"type\\": \\"adaptive\\"
          },
          \\"top_k\\": 5,
          \\"top_p\\": 0.7
        }"
\`\`\`

### [Google Gemini Interactions API](https://ai.google.dev/gemini-api/docs/interactions-overview)

2026 年 6 月，Google 将 Interactions API 推向正式可用（GA），并建议新项目使用该接口。通过 \`input\` 接收字符串或步骤列表，使用 \`user_input\` 和 \`model_output\` 表示对话内容，并通过 \`steps\` 返回执行过程。多轮对话还可以通过 \`previous_interaction_id\` 使用可选的服务端状态管理。

\`\`\`shell
curl -X POST https://generativelanguage.googleapis.com/v1/interactions \\
  -H "x-goog-api-key: $GEMINI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gemini-3-flash-preview",
    "input": [
      { "type": "user_input", "content": [{ "type": "text", "text": "Hello!" }] },
      { "type": "model_output", "content": [{ "type": "text", "text": "Hi there! How can I help you today?" }] },
      { "type": "user_input", "content": [{ "type": "text", "text": "What is the capital of France?" }] }
    ]
  }'

{
  "id": "v1_ChdPU0F4YWFtNkFwS2kxZThQZ05lbXdROBIXT1NBeGFhbTZBcEtpMWU4UGdOZW13UTg",
  "model": "gemini-3-flash-preview",
  "status": "completed",
  "object": "interaction",
  "created": "2025-11-26T12:22:47Z",
  "updated": "2025-11-26T12:22:47Z",
  "steps": [
    {
      "type": "model_output",
      "content": [
        {
          "type": "text",
          "text": "The capital of France is Paris."
        }
      ]
    }
  ],
  "usage": {
    "input_tokens_by_modality": [
      {
        "modality": "text",
        "tokens": 50
      }
    ],
    "total_cached_tokens": 0,
    "total_input_tokens": 50,
    "total_output_tokens": 10,
    "total_thought_tokens": 0,
    "total_tokens": 60,
    "total_tool_use_tokens": 0
  }
}
\`\`\`

## 从 Chat API 到 Agent API

> 随着 OpenAI API Spec 的日渐普及，OpenAI API 成为了行业的事实标准。各家都适配了 OpenAI API...

随着大语言模型（LLM）的能力增强，开发者不再满足于构建简单的聊天机器人或 Web 对话页面，而是开始通过工具调用（tool calling）和 ReAct 等方式构建 Agent 应用。

Chat Completions API 不在满足需求（但仍然支持），最大的问题是：会话状态要自己管理（LLMs 自身没有记忆），cache 很难全部命中。每次请求都要把完整对话历史序列化成 JSON 发过去，对于包含多次工具调用的智能体工作流，增加了开发者的心智负担，需要处理状态管理和编排等。

### [Responses API](https://developers.openai.com/api/reference/responses/overview)

Responses API 是 Chat Completions API 的演进方向，

\`\`\`shell
curl https://api.openai.com/v1/responses \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $OPENAI_API_KEY" \\
  -d '{
    "model": "gpt-5.4",
    "input": [
      {
        "role": "user",
        "content": [
          {"type": "input_text", "text": "what is in this file?"},
          {
            "type": "input_file",
            "file_url": "https://www.berkshirehathaway.com/letters/2024ltr.pdf",
            "detail": "auto"
          }
        ]
      }
    ]
  }'

{
  "id": "resp_686eef60237881a2bd1180bb8b13de430e34c516d176ff86",
  "object": "response",
  "created_at": 1752100704,
  "status": "completed",
  "completed_at": 1752100705,
  "background": false,
  "error": null,
  "incomplete_details": null,
  "instructions": null,
  "max_output_tokens": null,
  "max_tool_calls": null,
  "model": "gpt-5.4",
  "output": [
    {
      "id": "msg_686eef60d3e081a29283bdcbc4322fd90e34c516d176ff86",
      "type": "message",
      "status": "completed",
      "content": [
        {
          "type": "output_text",
          "annotations": [],
          "logprobs": [],
          "text": "The file seems to contain excerpts from a letter to the shareholders of Berkshire Hathaway Inc., likely written by Warren Buffett. It covers several topics:\\n\\n1. **Communication Philosophy**: Buffett emphasizes the importance of transparency and candidness in reporting mistakes and successes to shareholders.\\n\\n2. **Mistakes and Learnings**: The letter acknowledges past mistakes in business assessments and management hires, highlighting the importance of correcting errors promptly.\\n\\n3. **CEO Succession**: Mention of Greg Abel stepping in as the new CEO and continuing the tradition of honest communication.\\n\\n4. **Pete Liegl Story**: A detailed account of acquiring Forest River and the relationship with its founder, highlighting trust and effective business decisions.\\n\\n5. **2024 Performance**: Overview of business performance, particularly in insurance and investment activities, with a focus on GEICO's improvement.\\n\\n6. **Tax Contributions**: Discussion of significant tax payments to the U.S. Treasury, credited to shareholders' reinvestments.\\n\\n7. **Investment Strategy**: A breakdown of Berkshire\\u2019s investments in both controlled subsidiaries and marketable equities, along with a focus on long-term holding strategies.\\n\\n8. **American Capitalism**: Reflections on America\\u2019s economic development and Berkshire\\u2019s role within it.\\n\\n9. **Property-Casualty Insurance**: Insights into the P/C insurance business model and its challenges and benefits.\\n\\n10. **Japanese Investments**: Information about Berkshire\\u2019s investments in Japanese companies and future plans.\\n\\n11. **Annual Meeting**: Details about the upcoming annual gathering in Omaha, including schedule changes and new book releases.\\n\\n12. **Personal Anecdotes**: Light-hearted stories about family and interactions, conveying Buffett's personable approach.\\n\\n13. **Financial Performance Data**: Tables comparing Berkshire\\u2019s annual performance to the S&P 500, showing impressive long-term gains.\\n\\nOverall, the letter reinforces Berkshire Hathaway's commitment to transparency, investment in both its businesses and the wider economy, and emphasizes strong leadership and prudent financial management."
        }
      ],
      "role": "assistant"
    }
  ],
  "parallel_tool_calls": true,
  "previous_response_id": null,
  "reasoning": {
    "effort": null,
    "summary": null
  },
  "service_tier": "default",
  "store": true,
  "temperature": 1.0,
  "text": {
    "format": {
      "type": "text"
    }
  },
  "tool_choice": "auto",
  "tools": [],
  "top_logprobs": 0,
  "top_p": 1.0,
  "truncation": "disabled",
  "usage": {
    "input_tokens": 8438,
    "input_tokens_details": {
      "cached_tokens": 0,
      "cache_write_tokens": 0
    },
    "output_tokens": 398,
    "output_tokens_details": {
      "reasoning_tokens": 0
    },
    "total_tokens": 8836
  },
  "user": null,
  "metadata": {}
}
\`\`\`

Responses API 提供以下能力：

1. 可选的服务端会话状态。应用可以通过 \`previous_response_id\` 串联多轮响应，也可以通过 Conversations API 维护持久会话。
2. 内置工具与工具编排。应用通常在 \`tools\` 参数中声明 \`web_search\`、\`file_search\`、\`computer\` 和 \`code_interpreter\` 等工具，模型再根据提示决定是否调用。具体工具支持情况取决于模型。
3. 统一的输入与输出项。除消息外，\`Item\` 还可以表示工具调用、工具输出和推理等内容，便于在一次请求中完成多步智能体循环。

### 影响面

从 Responses API 来看，OpenAI 正在把接口能力从单纯的文本生成扩展到“模型 + 状态 + 工具编排”。
这种设计让 API 更接近智能体运行时和 PaaS 构件，也让模型与智能体之间的边界变得没有过去那么清晰。
`;export{n as default};
