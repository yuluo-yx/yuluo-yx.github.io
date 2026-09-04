---
slug: gpu
title: GPU 初识
date: 2026-09-04 16:23:00
authors: yuluo
tags: [LLM, GPU]
keywords: [LLM, GPU]
image: /img/ai/gpu.png
---

系统性且简单的了解下 GPU。

## GPU & CPU

众所周知，CPU 是电脑上必不可少的硬件之一。中文为中央处理器。主要处理 IO，逻辑控制，擅长串行计算。

而 GPU 却不是必须要求的，一般在游戏本上才会有较高配置的 GPU。办公本都是集成显卡。GPU 拥有许多小型计算核心，擅长并行计算。用来处理视频渲染，LLM 训练和推理等。

从 Nvidia 开发出了 CUDA 开始，GPU 被用来做海量数据处理和 LLMs 训练。

> 补充下集成显卡：其和 CPU 在同一块芯片上，或者贴在同一个主板上，没有单独显存，需要借助内存。性能较弱。适合日常办公和小型游戏，例如 LOL。

## GPU 里有什么？

- 计算单元（SM / Tensor Cores，张量核心）
- 显存（HBM / GDDR）
- 片上缓存（L2 / Shared Memory）
- 互联（PCIe / NVLink / NVSwitch）
- 驱动与固件（Driver / Firmware）

### 显存和算力的区别

这两个不是同一个东西。一句话：**算力是软约束，显存是硬约束。**

#### 显存

显存是 GPU 的本地内存空间，模型参数，KV Cache，。临时张量都会占用缓存。显存决定能不能跑。

#### 算力

算力对应 SM/Tensor Core 的计算能力，通常用 TFLOPS 表示。算力的工程特征更像是“可时间片贡献的吞吐资源”。算力决定跑的快不快。

### 张量

存储在 GPU 显存中的，用于并行矩阵和多维数组运算的数据结构。在深度学习框架中，PyTorch 等，张量就是多维数据数组。

## GPU 厂商

### 国外

- Nvidia：英伟达，GPU 龙头厂商；
- AMD：第二大 GPU 厂商；
- Intel：传统 PC 上集成显卡厂商。

### 国内

- 摩尔线程；
- 沐曦股份；
- 寒武纪；
- 海光；
- ……

## GPU 型号

### Nvidia

数据中心/计算型：A/H/L 系列（训练/推理/HPC 主战场）

消费级/游戏：GeForce RTX（不适合作为基础设施治理样本）

专业图形：RTX A / 旧 Quadro（图形工作站场景为主）

#### 消费级（GeForce 系列）

面向游戏玩家和视频剪辑：

RTX 50，RTX 40，RTX 30 系列。

#### 专业工作站

面向 3D 渲染，CAD 等大型工业软件和 AI 开发：

Blackwell 架构：RTX Pro 6000，5000 ；

Ada/Ampere 架构：RTX 6000 Ada，RTX A60000。

#### 数据中心与 AI

计算与 AI 卡：H200，H100，A100，L4 等。采用 HBM 和大容量高速显存。

#### GPU 演进

- Volta（V100）之后，Tensor Core 让 AI 负载成为核心假设 ；
- Ampere（A100）推动训练规模化 ；
- Hopper（H100）更强调大模型训练与推理并发形态 ；
- Blackwell（B200/B300）把尺度推到机柜级（NVL72），并让 FP4 低精度成为推理主流假设。

## 加速器全景

![image](/img/ai/gpu.png)

| 类别 | 全称 | 擅长点 | 典型场景 | 误用场景 |
| --- | --- | --- | --- | --- |
| CPU | Central Processing Unit | 通用计算，复杂逻辑 | 控制面，预处理，调度 | 模型训练 |
| GPU | Graphics Processing Unit | 并行矩阵计算 | 训练，批量推理 | 低并发强实时 |
| TPU | Tensor Processing Unit | 张量计算加速 | Google Cloud 训练推理 | 当通用 GPU 用 |
| NPU | Neural Processing Unit | 低功耗推理（端侧）与数据中心推理（昇腾） | AI PC，边缘设备，推理服务器 | NPU 只能用在端侧 |
| DPU | Data Processing Unit | 网络/存储卸载 | 大规模 AI 集群 | 小规模场景过度建设 |
| APU | Accelerated Processing Unit | CPU + GPU 紧耦合 | 单机微调，HPC | 只看 FLOS 忽略内存优势 |
| LPU | Language Processing Unit | 低延迟语言生成 | 实时 Agent，语言 AI | 当通用训练芯片 |

## GPU  商业化交付

面向消费者时，GPU 通常以单卡形式交付。

在面对数据中心和云算力平台时，GPU 厂商通常以高密多卡模组（HGX）、整机（DGX）或整机柜（NVL72）为单元交付。

在单卡 GPU 场景时，GPU 连接在主板和 CPU，通过 CPU 调度的方式处理。但是这不适用 GPU 多卡或者云算力平台场景。效率低下。

在多卡或者机柜种，GPU 怎么通信？以 Nvidia 为例：

在多卡之间，GPU 使用 NVLink（通信协议与总线）和 NVSwitch（交换机）+ 高密基板来组成星型网络并通信。不经过 CPU，实现跨节点的网卡直通显存（GPUDirect RDMA）。

在机柜之间，使用 RDMA（InfiniBand 或 RoCE）网络或者光纤/光模块的方式+独立交换机方式通信。

多卡 GPU 通常以 2 的幂次方组卡，底层是为了配合大模型矩阵切分算法与通信拓扑的对称，上层则是为了方便云平台规避算力碎片化。一些主流的云算力提供商也选择以偶数方式租卡。

```mermaid
graph TB
  %% 样式定义
      classDef gpu fill:#76B900,stroke:#333,stroke-width:2px,color:#fff;
      classDef nvswitch fill:#FF9800,stroke:#333,stroke-width:2px,color:#fff;
      classDef cpu fill:#2196F3,stroke:#333,stroke-width:2px,color:#fff;
      classDef nic fill:#9C27B0,stroke:#333,stroke-width:2px,color:#fff;
      classDef switch fill:#607D8B,stroke:#333,stroke-width:2px,color:#fff;

  %% ---------------- 节点 A ----------------
      subgraph ServerA ["🏢 DGX 服务器 A (整机)"]
          subgraph HostA ["主机系统 (普通通路)"]
              CPUA["CPU & 主机内存"]:::cpu
          end

          subgraph HGXA ["🔥 HGX 核心底板 (机内极速区)"]
              NVSwitchA["⚡ NVSwitch (高速立交桥)"]:::nvswitch

              GPUA0["SXM GPU 0"]:::gpu
              GPUA1["SXM GPU 1"]:::gpu
              GPUA2["SXM GPU 2"]:::gpu
              GPUA7["... SXM GPU 7"]:::gpu

              %% 机内 NVLink 互联
              GPUA0 <== "NVLink 极速通道" ==> NVSwitchA
              GPUA1 <== "NVLink 极速通道" ==> NVSwitchA
              GPUA2 <== "NVLink 极速通道" ==> NVSwitchA
              GPUA7 <== "NVLink 极速通道" ==> NVSwitchA
          end

          NICA["高速 RDMA 网卡<br/>(ConnectX)"]:::nic

          %% 内部上下游连接
          CPUA -. "PCIe 慢速通道<br/>(仅做初始化/管控)" .-> HGXA
          GPUA0 <== "GPUDirect 显存直通<br/>(绕过 CPU)" ==> NICA
      end

  %% ---------------- 节点间外部网络 ----------------
      subgraph Network ["🌐 数据中心网络 (跨机通信)"]
          RDMASwitch["🔀 外部交换机<br/>(InfiniBand 高铁专网 / RoCE 以太网)"]:::switch
      end

  %% ---------------- 节点 B ----------------
      subgraph ServerB ["🏢 DGX 服务器 B (整机)"]
          NICB["高速 RDMA 网卡<br/>(ConnectX)"]:::nic

          subgraph HGXB ["🔥 HGX 核心底板 (机内极速区)"]
              NVSwitchB["⚡ NVSwitch (高速立交桥)"]:::nvswitch

              GPUB0["SXM GPU 0"]:::gpu
              GPUB1["SXM GPU 1"]:::gpu
              GPUB7["... SXM GPU 7"]:::gpu

              GPUB0 <== "NVLink 极速通道" ==> NVSwitchB
              GPUB1 <== "NVLink 极速通道" ==> NVSwitchB
              GPUB7 <== "NVLink 极速通道" ==> NVSwitchB
          end

          subgraph HostB ["主机系统 (普通通路)"]
              CPUB["CPU & 主机内存"]:::cpu
          end

          CPUB -. "PCIe 慢速通道" .-> HGXB
          GPUB0 <== "GPUDirect 显存直通<br/>(绕过 CPU)" ==> NICB
      end

  %% ---------------- 跨机连线 ----------------
      NICA <== "光纤链路 (RDMA 零拷贝)" ==> RDMASwitch
      RDMASwitch <== "光纤链路 (RDMA 零拷贝)" ==> NICB

  %% 跨机逻辑直通标注
      GPUA0 -. "🚀 逻辑跨机直通：RDMA Read 隔空抓取显存数据 (CPU 全程无感知)" .- GPUB0
```
