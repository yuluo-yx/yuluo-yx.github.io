const e=`---
id: kueue-01-what-is-kueue
slug: 01-what-is-kueue
title: Kueue？
description: 认识 Kueue 的定位、核心概念、工作流程，以及它与 Kubernetes 调度器的关系。
date: 2026-08-08
authors: yuluo
tags: [Kueue, Kubernetes, 云原生, 作业调度]
keywords: [Kueue, Kubernetes, Job Queueing, Workload, ClusterQueue, LocalQueue]
---

Kueue 是 Kubernetes 原生的作业队列系统。它面向批处理、高性能计算（HPC）和 AI/ML 等工作负载，负责判断一个作业何时可以开始，以及它可以使用哪一类资源。

Kueue 不替代 \`kube-scheduler\`，也不负责直接把 Pod 绑定到节点。它工作在调度器之前：先根据队列、配额和准入规则决定是否放行整个作业，再由 Kubernetes 调度器完成 Pod 级别的节点调度。

## 为什么需要 Kueue

> 控制面治理是 GPU 平台化的核心，Kueue 让资源分配变得有序、可预测、可审计。关注的是：在有限的可用资源下，这次机会应该分配给谁？

在线服务通常希望持续运行，批处理和训练任务则更关注“何时获得足够资源并完整启动”。当多个团队共享同一个集群时，仅靠 Pod 调度很难完整表达以下需求：

- 每个团队可以使用多少 CPU、内存或 GPU；
- 资源不足时，哪些作业应该等待；
- 空闲配额能否借给其他团队；
- 高优先级作业能否抢占低优先级作业；
- 分布式训练所需的多个 Pod 能否作为一个整体准入；
- 不同型号的 GPU 或不同节点池应该如何分配。

Kueue 把这些问题放在“作业准入”阶段处理。只有当作业满足配额和策略要求时，Kueue 才解除挂起状态，让作业创建或运行 Pod。这种方式可以避免部分 Pod 已经占用资源，而其余 Pod 长时间无法启动的情况。

## Kueue 与 Kubernetes 调度器的分工

Kueue 和 \`kube-scheduler\` 处理不同层级的决策：

| 组件 | 决策对象 | 主要问题 |
| --- | --- | --- |
| Kueue | 作业或 Workload | 作业现在能否启动，可以使用多少配额和哪类资源 |
| \`kube-scheduler\` | Pod | Pod 应该运行在哪个节点上 |

可以把 Kueue 理解为检票系统，把 Kubernetes 调度器理解为座位分配系统。Kueue 先确认作业拥有足够的资源额度，调度器再为已经放行的 Pod 选择节点。

## 核心概念

### Workload

\`Workload\` 是 Kueue 的准入单位，表示一个需要运行到完成的应用。它可以由一个或多个 Pod 组成。

用户通常不需要手动创建 \`Workload\`。提交受支持的 \`Job\` 后，Kueue 会为它创建对应的 \`Workload\`，记录资源需求、队列归属和准入状态。

### LocalQueue

\`LocalQueue\` 是命名空间级资源，也是租户提交作业的入口。它把同一命名空间内的相关工作负载组织在一起，并指向一个 \`ClusterQueue\`。

不同团队可以在各自的命名空间使用独立的 \`LocalQueue\`，同时共享集群级配额策略。

### ClusterQueue

\`ClusterQueue\` 是集群级资源。它定义可供工作负载使用的资源类型、配额、排队策略、抢占规则和准入检查。

\`ClusterQueue\` 不属于某个命名空间。多个 \`LocalQueue\` 可以指向同一个 \`ClusterQueue\`，共同使用其中的配额。

### ResourceFlavor

\`ResourceFlavor\` 用来描述同一种资源的不同类别，例如不同 GPU 型号、不同 CPU 架构、按需节点或竞价节点。它通过节点标签和污点等信息，将逻辑配额与实际节点类型关联起来。

### Cohort

\`Cohort\` 把多个 \`ClusterQueue\` 组织成资源共享组。当一个队列存在空闲配额时，同一 \`Cohort\` 中的其他队列可以按策略借用这些配额，从而提高集群利用率。

## 一个作业如何被放行

典型的准入过程如下：

1. 集群管理员创建 \`ResourceFlavor\`、\`ClusterQueue\` 和 \`LocalQueue\`。
2. 用户提交 \`Job\`，并通过 \`kueue.x-k8s.io/queue-name\` 标签选择 \`LocalQueue\`。
3. Kueue 挂起 \`Job\`，并创建对应的 \`Workload\`。
4. Kueue 检查优先级、资源配额、资源类别和其他准入条件。
5. 条件满足后，Kueue 为 \`Workload\` 预留配额并解除 \`Job\` 的挂起状态。
6. \`kube-scheduler\` 为作业生成的 Pod 选择具体节点。
7. 作业结束后，Kueue 释放配额，继续处理队列中的其他工作负载。

下面的流程图展示了一个作业从提交、排队到 Pod 运行和配额释放的完整过程：

\`\`\`mermaid
flowchart TD
    A[用户提交 Job] --> B[Kueue 挂起 Job]
    B --> C[创建对应的 Workload]
    C --> D[Workload 进入 LocalQueue]
    D --> E{ClusterQueue 是否有足够配额}
    E -- 否 --> F[Workload 留在队列中等待]
    F --> E
    E -- 是 --> G[Kueue 预留配额并准入 Workload]
    G --> H[Kueue 解除 Job 挂起状态]
    H --> I[Job 控制器创建 Pod]
    I --> J[kube-scheduler 为 Pod 选择节点]
    J --> K[Pod 在节点上运行]
    K --> L{作业是否结束}
    L -- 否 --> K
    L -- 是 --> M[Kueue 释放配额]
    M --> N[继续处理其他 Workload]
\`\`\`

图中，Kueue 只负责作业准入和配额管理，\`kube-scheduler\` 仍然负责 Pod 的节点调度。如果配额暂时不足，\`Workload\` 会保留在队列中等待，而不是让一部分 Pod 先占用集群资源。

## Kueue 适合哪些场景

Kueue 适合资源昂贵、作业并发量较高，或需要多租户配额治理的集群，例如：

- 共享 GPU 集群中的模型训练和批量推理；
- 科研计算、仿真和数据分析；
- 大规模 Kubernetes \`Job\`；
- Kubeflow、KubeRay 和 JobSet 等生态工作负载；
- 需要跨团队借用配额、公平共享或抢占策略的集群；
- 需要跨集群分发作业的 MultiKueue 场景。

如果集群只运行少量在线服务，或所有 Pod 都应立即启动，Kueue 通常不是必需组件。

## Kueue 的边界

理解 Kueue 时，需要注意以下边界：

- Kueue 是作业级管理器，不是新的 Pod 调度器；
- Kueue 管理逻辑配额，实际节点仍可能受碎片、亲和性、污点或拓扑条件影响；
- Kueue 主要面向可挂起、可恢复或运行到完成的工作负载；
- 队列和配额策略需要集群管理员提前规划，Kueue 不会自动替代容量规划。

## 小结

Kueue 在 Kubernetes 原有调度能力之上增加了作业排队和资源准入层。它以 \`Workload\` 为准入单位，通过 \`LocalQueue\` 接收租户作业，由 \`ClusterQueue\` 管理集群配额，再使用 \`ResourceFlavor\` 和 \`Cohort\` 表达异构资源与跨队列共享关系。

它解决的核心问题不是“Pod 放在哪个节点”，而是“整个作业何时有资格开始”。

## 参考资料

- [Kueue 官方网站](https://kueue.sigs.k8s.io/)
- [Kueue 官方文档](https://kueue.sigs.k8s.io/docs/)
- [Kueue 核心概念：Workload](https://kueue.sigs.k8s.io/docs/concepts/workload/)
- [Kueue 核心概念：LocalQueue](https://kueue.sigs.k8s.io/docs/concepts/local_queue/)
- [Kueue 核心概念：ClusterQueue](https://kueue.sigs.k8s.io/docs/concepts/cluster_queue/)
- [Kueue GitHub 仓库](https://github.com/kubernetes-sigs/kueue)
`;export{e as default};
