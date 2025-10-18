---
slug: vllm-sr-understand
title: VSR 项目解析
date: 2025-10-18 23:36:16
authors: yuluo
tags: ['Vllm', 'Canlde', 'Semantic router']
keywords: ['Vllm', 'Canlde', 'Semantic router']
image: /img/ai/mom/3.png
---

<!-- truncate -->

承上文 [Vllm Semantic-router MoM 架构](https://yuluo-yx.github.io/blog/vllm-sr-mom)，理解下 VSR 语义路由项目整体部分。

## 术语解释

> Ok, 开始之前。先对一些专业术语扫盲，以免造成理解错误。

- Candle Hugging Face 的机器学习（ML）框架，由 Rust 编写；
- FFI (Foreign Function Interface) Candle 通过 FFI 暴露给 Go 调用；
- decoder-only：生成模型，GPT Qwen 等。
- encoder-only：（有时也称表征模型）输出是一个 embedding 向量；
- BERT 模型：自然语言理解模型，理解语义；
- ModernBERT 模型：更大 token 的 BERT 模型，双注意力机制；
- LoRA ：(Low-Rank Adaptation) 微调模型用，加速模型微调，推理阶段不存在；
- Jailbreak Detection：越狱检测。防止恶意 prompt 攻击，在请求到达 LLM 之前进行安全过滤；
- Intent Classification：意图分类；
- PII 检测：个人身份信息检测；
- Fine-tuning ：微调，使用预训练好的模型，少量标注数据；
- Pre-Traing：预训练；海量数据，大量 GPU 资源从 0 训练。

一些术语参考：https://zhuanlan.zhihu.com/p/14063328673

## 工作流程

![image-20251018230818243](/img/ai/mom/3.png)

VSR 由三种语言异构组合而成，其中 Golang 负责流量接入和转发，Rust 负责调用模型得出结果，Python 负责训练和微调 BERT 模型。

## 整体架构

![VSR Arch](https://yuluo-yx.github.io/assets/images/2-d82c8db20a2548352f67777c38d8d96b.png)

 从图中可以看到，VSR 主要围绕高性能的 Rust 分类构建。

其他模块主要职责为：

Python：`src/training`模型训练脚本，负责微调和训练 BERT 模型；

Golang：router 负责路由用户请求流量，调用 candle-binding；

Rust：candle-binding 加载训练完成的模型，语义分数计算，文本分类，返回结果给 Go client；

Envoy：调用 Backend LLM。

## Candle-binding 

VSR 的大脑部分。ML 推理引擎绑定。提供了 rust candle 的机器学习和模型推理能力，并通过 FFI（Foreign Function Interface）暴露给 Go 使用。

```markdown
┌─────────────────────────────────────────────────────────┐
│                  Go Application Layer                   │
│         (semantic-router.go - CGO Bindings)             │
└───────────────────┬─────────────────────────────────────┘
                    │ FFI (C ABI)
┌───────────────────▼─────────────────────────────────────┐
│              Rust Native Library                        │
│        (libcandle_semantic_router.dylib/.so)            │
│                                                         │
│  ├── lib.rs           - 主入口和相似度计算                 │
│  ├── bert_official.rs - 官方 BERT 分类器                  │
│  ├── modernbert.rs    - ModernBERT 实现                  │
│  └── unified_classifier.rs - 统一分类器 (LoRA支持)        │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│           Candle ML Framework (Hugging Face)            │
│     - Rust 原生 ML 框架 (类似 PyTorch)                    │
│     - GPU/CPU 加速支持                                   │
│     - BERT/ModernBERT 模型实现                           │
└─────────────────────────────────────────────────────────┘
```

## Train

VSR 的训练模块。candle 最终调用的模型来源。使用的数据来自 HF 的公开数据集。

```markdown
Training
  │
  ├─ 输入: 数据集 + BERT 基础模型
  │
  ├─ 训练: LoRA 微调 (1% 参数)
  │   └─ 优势: 快速、省内存、效果好
  │
  └─ 输出:
      ├─ LoRA 适配器 (1-2MB) - 中间产物
      │   └─ adapter_model.safetensors
      │   └─ 通常被下一步覆盖或删除
      │
      └─ 完整合并模型 (440MB) 
          └─ merge_and_unload() 自动执行合并
          └─ Rust/Candle 用
              └─ Go 服务调用
                  └─ 生产环境部署

核心流程: LoRA 模型被自动合并
LoRA 训练 → merge_and_unload() → model.safetensors → Candle 加载 → 推理
```

### LoRA 微调

```markdown
W_new = W_pretrained + B × A
#       ↑              ↑
#    冻结不动      只训练这两个小矩阵

# 参数对比：
# 完整微调: 训练 110M 参数
# LoRA 微调: 训练 1.2M 参数 (↓ 99%)

# 效果：
# - 速度快 3-5 倍
# - 内存省 67%
# - 性能几乎相同 (99.5%)
```

## Go 

集成 Envoy ExtProc 处理输入流量，往后调用 candle。支持任何兼容 OpenAI API 的 llm 后端服务。

```markdown
┌────────────────────────────────────────────────────────────────────────┐
│                         完整请求处理流程                                 │
└────────────────────────────────────────────────────────────────────────┘

用户请求: POST /v1/chat/completions
{
  "model": "gpt-3.5-turbo",
  "messages": [{"role": "user", "content": "帮我解这道微积分题"}]
}
        │
        ↓
┌───────────────────────────────────────────────────────────────────────┐
│ 1️⃣  Envoy Proxy (端口 8801)                                            │
│    - 接收 HTTP 请求                                                    │
│    - 提取请求头和请求体                                                │
└───────────────────────────────────────────────────────────────────────┘
        │
        ↓ gRPC 调用
┌───────────────────────────────────────────────────────────────────────┐
│ 2️⃣  ExtProc (Go 服务, 端口 50051)                                      │
│    pkg/extproc/processor.go                                           │
│                                                                        │
│    Process() 处理流:                                                   │
│    ├─ RequestHeaders  → handleRequestHeaders()                        │
│    ├─ RequestBody     → handleRequestBody() ⭐ 主要处理                │
│    ├─ ResponseHeaders → handleResponseHeaders()                       │
│    └─ ResponseBody    → handleResponseBody()                          │
└───────────────────────────────────────────────────────────────────────┘
        │
        ↓
┌───────────────────────────────────────────────────────────────────────┐
│ 3️⃣  请求体处理: handleRequestBody()                                    │
│    pkg/extproc/request_handler.go                                     │
│                                                                        │
│    步骤:                                                               │
│    ├─ 1. 解析 OpenAI 请求体                                           │
│    ├─ 2. 提取用户消息内容                                             │
│    ├─ 3. 检查语义缓存 (可选)                                          │
│    ├─ 4. 调用分类器 ⬇️                                                │
│    ├─ 5. 调用 PII 检测 ⬇️                                              │
│    ├─ 6. 调用越狱检测 ⬇️                                               │
│    ├─ 7. 路由决策                                                     │
│    └─ 8. 修改请求头/体                                                │
└───────────────────────────────────────────────────────────────────────┘
        │
        ├────────────────────────┬─────────────────────┬─────────────────┐
        ↓                        ↓                     ↓                 ↓
┌──────────────────┐  ┌──────────────────┐  ┌───────────────────┐  ┌─────┐
│ 4️⃣  意图分类      │  │ 5️⃣  PII 检测      │  │ 6️⃣  越狱检测       │  │工具 │
│ (Classifier)     │  │ (PIIChecker)     │  │ (PromptGuard)     │  │匹配 │
└──────────────────┘  └──────────────────┘  └───────────────────┘  └─────┘
        │                        │                     │
        ↓ Go 调用                ↓                     ↓
┌──────────────────┐  ┌──────────────────┐  ┌───────────────────┐
│ candle_binding   │  │ candle_binding   │  │ candle_binding    │
│ (CGO)            │  │ (CGO)            │  │ (CGO)             │
└──────────────────┘  └──────────────────┘  └───────────────────┘
        │                        │                     │
        ↓ FFI 调用               ↓                     ↓
┌──────────────────┐  ┌──────────────────┐  ┌───────────────────┐
│ Rust Candle      │  │ Rust Candle      │  │ Rust Candle       │
│ Intent Model     │  │ PII Model        │  │ Jailbreak Model   │
│ (BERT 推理)      │  │ (Token 分类)     │  │ (BERT 推理)       │
└──────────────────┘  └──────────────────┘  └───────────────────┘
        │                        │                     │
        │ 返回结果                │                     │
        │ Category: "math"       │ HasPII: false       │ IsJailbreak: false
        │ Confidence: 0.95       │ Confidence: 0.98    │ Confidence: 0.92
        │                        │                     │
        └────────────────────────┴─────────────────────┴───────────┐
                                                                    ↓
                                                    ┌──────────────────────┐
                                                    │ 7️⃣  路由决策引擎      │
                                                    │                      │
                                                    │ 规则:                │
                                                    │ ├─ IsJailbreak?      │
                                                    │ │   └─ Block (403)   │
                                                    │ ├─ HasPII?           │
                                                    │ │   └─ Log + 可选阻止│
                                                    │ └─ Category + Conf?  │
                                                    │     └─ Select Model  │
                                                    └──────────────────────┘
                                                                    │
                                                                    ↓
                                            ┌──────────────────────────────┐
                                            │ 8️⃣  修改请求                  │
                                            │                              │
                                            │ 添加请求头:                   │
                                            │ - x-selected-model: math-7b  │
                                            │ - x-category: mathematics    │
                                            │ - x-confidence: 0.95         │
                                            │ - x-gateway-destination:     │
                                            │   http://math-llm:8000       │
                                            └──────────────────────────────┘
                                                                    │
                                                                    ↓
                                            ┌──────────────────────────────┐
                                            │ 9️⃣  返回 gRPC 响应给 Envoy   │
                                            │                              │
                                            │ ProcessingResponse {         │
                                            │   HeaderMutation,            │
                                            │   BodyMutation,              │
                                            │   Status: CONTINUE           │
                                            │ }                            │
                                            └──────────────────────────────┘
                                                                    │
                                                                    ↓
                                            ┌──────────────────────────────┐
                                            │ 🔟  Envoy 路由到后端 vLLM     │
                                            │                              │
                                            │ 根据 x-gateway-destination:  │
                                            │ http://math-llm:8000         │
                                            │                              │
                                            │ 转发请求到专用模型            │
                                            └──────────────────────────────┘
                                                                    │
                                                                    ↓
                                            ┌──────────────────────────────┐
                                            │ 1️⃣1️⃣  vLLM 后端 (math-llm)    │
                                            │                              │
                                            │ 接收请求并生成回复            │
                                            │ Model: meta-llama/Llama-7b   │
                                            └──────────────────────────────┘
                                                                    │
                                                                    ↓
                                            ┌──────────────────────────────┐
                                            │ 1️⃣2️⃣  响应返回给用户          │
                                            └──────────────────────────────┘
```

简化图

```markdown
用户请求 → Envoy (8801) → ExtProc (Go, 50051)
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                意图分类         PII检测         越狱检测
                    │               │               │
                   CGO             CGO             CGO
                    │               │               │
                Rust Candle     Rust Candle     Rust Candle
                    │               │               │
              Category: "math"  HasPII: false  IsJailbreak: false
              Confidence: 0.95  Entities: []   Confidence: 0.92
                    │               │               │
                    └───────────────┴───────────────┘
                                    │
                            路由决策引擎
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
              IsJailbreak?                    Category?
                    │                               │
                  Block                       Select Model
                (403)                         (math-llama-7b)
                                                    │
                                        Set Header:
                                        x-gateway-destination:
                                        http://math-llm:8000
                                                    │
                                        Return to Envoy
                                                    │
                                        Route to Backend
                                        (math-llm:8000)
```

## 可观测

基于 OT + Prometheus + Grafana + Jaeger 。通过 `/metrics` 导出观测数据。ß

## Config 

> VSR 提供了充足的配置项，配置各个基本属性。有下面几种类型：

 bert 模型配置

分类器配置

- 意图分类
- PII 检测
- 越狱检测

推理模式配置

类别模式与评分

语义缓存配置

可观测配置
