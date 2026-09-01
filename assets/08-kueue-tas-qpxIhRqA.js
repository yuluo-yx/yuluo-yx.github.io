const n=`---
id: kueue-08-tas
slug: 08-kueue-tas
title: Kueue 拓扑感知调度 TAS
description: 解析 Kueue 拓扑感知调度的 API、节点容量缓存、拓扑分配算法、约束落地与故障恢复。
date: 2026-09-01
authors: yuluo
tags: [Kueue, Kubernetes, 云原生, 源码分析]
keywords: [Kueue, TAS, Topology, TopologyAssignment, PodSet]
---

> 本文是 Kueue 源码导读系列第 8 篇，分析 Topology Aware Scheduling（TAS）如何在准入阶段感知节点、机架等拓扑容量，再把计算结果交给 Pod 调度阶段执行。源码基线为 Kueue \`main\` 分支 \`80042b1a0\`。
>
> TAS 的目标不是取代 kube-scheduler，而是避免 Kueue 只看到“集群总配额足够”，却准入一个实际上无法放入目标拓扑域的 Gang Workload。

## TAS 要解决的问题

### Gang Scheduling 与拓扑约束

分布式训练通常不只要求 N 个 Pod 都能运行，还希望它们处于同一机架、网络块或其他低延迟域。传统配额判断只回答：

\`\`\`text
ClusterQueue 剩余 GPU >= Workload 请求 GPU
\`\`\`

它无法回答：

\`\`\`text
是否存在同一个 rack，能同时容纳这 16 个 GPU Pod？
\`\`\`

若先准入再让 kube-scheduler 逐个尝试，部分 Pod 可能已经运行，其余 Pod 长期 Pending。TAS 把节点容量和拓扑域纳入 Kueue 的准入计算，使 Gang 的配额预留与实际放置条件尽量一致。

### Kueue 与 kube-scheduler 的职责边界

两者职责可以概括为：

| 组件 | 决策 |
| --- | --- |
| Kueue Scheduler | Workload 是否应被准入、使用哪个 ResourceFlavor、每个拓扑域放多少 Pod |
| TAS TopologyUngater | 把域分配转换为具体 Pod 的节点选择约束，并移除 scheduling gate |
| kube-scheduler | 在允许的节点集合中执行最终过滤、打分和绑定 |

Kueue 写入的是约束，不是 \`spec.nodeName\`。因此 kube-scheduler 仍然负责检查卷、端口、反亲和、插件等完整调度条件。

\`\`\`mermaid
flowchart LR
    W[Workload] --> Q[配额 Flavor 选择]
    Q --> T[TAS 拓扑容量试算]
    T --> A[TopologyAssignment]
    A --> U[TopologyUngater]
    U --> P[Pod NodeSelector / Affinity]
    P --> K[kube-scheduler 绑定节点]
\`\`\`

## TAS API 模型

### Topology

\`Topology\` 是集群级对象，\`spec.levels\` 按从高到低的顺序声明节点标签：

\`\`\`yaml
apiVersion: kueue.x-k8s.io/v1beta2
kind: Topology
metadata:
  name: datacenter-topology
spec:
  levels:
    - nodeLabel: cloud.example.com/block
    - nodeLabel: cloud.example.com/rack
    - nodeLabel: kubernetes.io/hostname
\`\`\`

每个节点在这些标签上的取值共同构成一条拓扑路径。若使用 \`kubernetes.io/hostname\`，它只能位于最低层。层级必须唯一，最多 16 层。

### ResourceFlavor TopologyName

\`ResourceFlavor.spec.topologyName\` 把 flavor 与 Topology 关联。TAS Cache 只会收集符合该 flavor node labels、taints/tolerations 及拓扑定义的节点。

\`\`\`yaml
apiVersion: kueue.x-k8s.io/v1beta2
kind: ResourceFlavor
metadata:
  name: gpu-a100
spec:
  nodeLabels:
    accelerator: a100
  topologyName: datacenter-topology
\`\`\`

因此 flavor 选择与拓扑选择不是两次互不相关的计算：先选到 TAS flavor，才知道应该使用哪棵拓扑树和哪些节点容量。

### PodSet TopologyRequest

\`PodSetTopologyRequest\` 描述 PodSet 的放置意图，主要模式如下：

| 模式 | 语义 |
| --- | --- |
| \`required\` | 所有 Pod 必须放入指定层级的同一个域 |
| \`preferred\` | 尽量紧凑；放不下时逐层放宽，最终可跨多个域 |
| \`unconstrained\` | 不追求紧凑，只要求总可用容量足够 |
| slice constraints | 将 PodSet 切片，每个切片满足指定层级约束 |

JobFramework 从 PodTemplate 上的 \`kueue.x-k8s.io/podset-*-topology\` 注解生成该字段。三种主模式互斥，避免同一个 PodSet 同时表达冲突意图。

\`podIndexLabel\`、\`subGroupIndexLabel\` 和 \`podSetGroupName\` 用于把有序 Pod、复制 Job 或 leader/worker PodSet 映射到一致的拓扑分配。

### PodSetAssignment TopologyAssignment

成功计算后，结果写入 \`status.admission.podSetAssignments[*].topologyAssignment\`。逻辑上它包含：

- \`levels\`：要写入 Pod 选择约束的标签键；
- \`slices\`：一个或多个分配切片；
- 每个 domain 的标签值与 Pod 数量。

v1beta2 使用 prefix、suffix、universal values/count 等形式压缩大规模 hostname 列表，但语义仍可还原为：

\`\`\`text
(block-a, rack-1, node-01) -> 4 Pods
(block-a, rack-1, node-02) -> 4 Pods
\`\`\`

该状态既是准入结果，也是 TopologyUngater 后续为 Pod 分配域的依据。

## TAS 控制器与缓存

### Node Controller

Node 事件会立即调用 \`TASCache.SyncNode\`。缓存据此更新：

- 节点 labels 形成的拓扑路径；
- allocatable 容量；
- taints 和 Ready 状态；
- 节点属于哪些 TAS ResourceFlavor。

启用故障替换能力后，同一个 Controller 还会查找 assignment 中引用该节点的 Workload，并根据节点消失、NotReady 超时或不再容忍的 taint 触发恢复流程。

### Pod Usage Controller

只看 Node allocatable 会高估可用量，因为 DaemonSet、Deployment、静态 Pod 等非 TAS Pod 也会占用节点。

\`PodUsageReconciler\` 监听已经绑定且未终止的 Pod：

- TAS Pod 的用量由 Workload assignment 记账；
- 非 TAS Pod 的实际 requests 写入 non-TAS usage cache；
- Pod 终止或迁移时删除旧用量，并批量唤醒可能重新可调度的 Workload。

### TASFlavorCache

每个启用 topology 的 ResourceFlavor 对应一个 \`TASFlavorCache\`。它持有相对稳定的节点和拓扑结构，以及持续变化的非 TAS/TAS 用量。

同一节点可能匹配多个 flavor。Cache 需要防止交叉 flavor 下对同一物理容量重复乐观计算，调度周期还会聚合重叠域的使用情况。

### TASFlavorSnapshot

Scheduler 不直接在共享 Cache 上试放。每轮调度从 flavor cache 创建 \`TASFlavorSnapshot\`：

- 拓扑树可以共享只读结构；
- \`domainStates\` 保存本轮各域的临时 Pod 数；
- \`leafCapacities\` 保存叶子节点容量、non-TAS usage 和 TAS usage；
- 假定准入只修改当前 snapshot。

这样一个 Workload 试放失败时可以丢弃临时状态，不污染其他调度循环。

## 拓扑树与容量核算

### Topology Levels 与 Domains

Topology level 是标签键，domain 是该层级下一组具体标签值。例如：

\`\`\`text
block-a
├── rack-1
│   ├── node-01
│   └── node-02
└── rack-2
    ├── node-03
    └── node-04
\`\`\`

叶子通常是 hostname，但 Topology 并不强制必须包含 hostname。算法从叶子向上汇总“能放多少 Pod”，再从选中的上层域向下生成具体 assignment。

### 节点可用资源

对一个叶子节点，概念上的剩余容量为：

\`\`\`text
remaining = allocatable
          - non-TAS Pod requests
          - 已准入 TAS usage
          - 本调度周期 assumed usage
\`\`\`

Pod 的单体 requests 必须在每个资源维度都能放入节点。不能用两个各剩半张 GPU 的节点拼成一个请求整张 GPU 的 Pod。

### 非 TAS Pod 的资源占用

non-TAS usage 来自实际 Pod，而不是 Workload quota。这样即使某 Deployment 完全绕过 Kueue，它对节点的占用也会降低 TAS 可见容量。

反过来，TAS 不是整个集群的资源会计系统。它关心的是可能承载对应 TAS flavor 的节点，以及会影响这些节点可放置性的活跃 Pod。

### Assumed Workload 用量

Scheduler 在 API 写入完成前会先 assume Workload。TAS 的净用量与普通 quota 净用量一起加入 snapshot，防止同一轮中后处理的 Workload 再次使用已被前一个 Workload 选中的节点容量。

如果更新 Admission 失败，assumption 会被清理并重新排队，最终状态仍由 API 事件收敛。

## Topology Assignment 计算

### Required、Preferred 与 Unconstrained

\`required=rack\` 时，算法只接受能完整容纳 PodSet 的单个 rack。容量散落在多个 rack 即使总量足够，也判定不适配。

\`preferred=rack\` 会先尝试 rack 级紧凑放置；若没有单个 rack 能容纳，则向更高层搜索，必要时分散到多个域。

\`unconstrained=true\` 直接利用整个 topology 的可用叶子集合，适合不依赖低延迟通信、但希望准入估算更准确的批处理任务。

### Flavor 与拓扑联合选择

\`TASFlavorAssigner\` 从普通资源 assignment 中提取唯一 TAS flavor。一个 PodSet 的资源若最终落到多个不同 TAS flavor，会返回 \`MultipleTASFlavorsAssignedError\`，因为单个 PodSet 无法同时在两棵独立拓扑树上生成一致 placement。

flavor 还必须：

- 带有 \`topologyName\`；
- 在 TAS Cache 中已经建立；
- 包含请求的 topology level；
- 满足 Pod nodeSelector、required nodeAffinity 与 tolerations。

### 多 PodSet 联合分配

一个 Workload 可以有多个 PodSet。TAS 按 flavor 聚合它们的请求，在同一个 snapshot 内依次计算，并立即增加 assumed usage。

\`podSetGroupName\` 可以要求 leader/worker 等相关 PodSet 使用同一个 ResourceFlavor，并在域分配时保持组内 rank 对应关系。前一个 PodSet 的结果会影响后一个 PodSet 可见的剩余容量。

### 多层拓扑分配

切片约束允许表达类似：

\`\`\`text
整个 PodSet 按 8 Pod 一组放入 block
每组再按 4 Pod 一片放入 rack
\`\`\`

算法先验证切片大小与 Pod 数的关系，再逐层计算可容纳的 slice 数。多层约束比单一 \`podSetSliceRequiredTopology\` 更精确，但也要求应用具有稳定 Pod index，才能把特定 Pod 映射到正确切片。

### Balanced Placement

默认 Best Fit 倾向选择刚好能容纳请求的较紧凑域，以减少碎片。Unconstrained 场景可使用 Least Free Capacity 方向的排序；启用 Balanced Placement 后，preferred 请求可以在紧凑度与跨域均衡之间选择合适阈值，失败时回退到 Best Fit。

无论采用哪种 profile，算法都不能放宽 \`required\` 的硬约束。

## Scheduler 集成

### TASFlavorAssigner

主调度流程先完成配额 flavor assignment，再由 \`updateAssignmentForTAS\` 构造 Workload 的 topology requests。只有显式请求 TAS，或 ClusterQueue 中所有可用 flavor 都是 TAS flavor 时，才会进入 TAS 计算。

MultiKueue 会把 TAS 延迟到 worker cluster；ProvisioningRequest 第一次调度也可能先标记 delayed，等待容量准备好后再计算。

### Snapshot 内的试算与回滚

TAS 失败不一定立刻判定 Workload 永久不可调度。Scheduler 可以：

- 在同一调度周期以抢占后的资源状态重算；
- 根据 feature gate 在发现只因 TAS 不适配时重新计算 assignment；
- 在 preemption simulation 中临时移除 Victim usage；
- 失败后保留 Workload 等待 Node、Pod 或 flavor 状态变化重新入队。

这些试算都发生在 snapshot，不会提前修改真实 Workload。

### Admission Status 写入

配额和拓扑都适配后，Scheduler 把 flavor、resourceUsage、count 与 topologyAssignment 一起写入 Admission。

如果 \`delayedTopologyRequest=Pending\`，Workload 可以先持有 QuotaReserved，但 \`Admitted\` 仍为 False。只有延迟分配完成并变为 Ready，Workload Controller 才会把它推进到 Admitted。

## 拓扑约束落地

### SchedulingGates

JobFramework 为 TAS PodTemplate 增加：

\`\`\`yaml
spec:
  schedulingGates:
    - name: kueue.x-k8s.io/topology
\`\`\`

带 gate 的 Pod 不会被 kube-scheduler 过早绑定。否则 Pod 可能在 TopologyUngater 写入域约束前就被调度到错误节点。

### TopologyUngater

\`topologyUngater\` 同时监听 Workload 和 TAS Pod。它只处理已经由 TAS 准入、仍带 topology gate 的 Pod，并使用 expectations 防止并发 reconcile 重复处理同一批 Pod。

它依据 Pod index、PodSet assignment 和 slice 划分，为每个 Pod 找到应使用的 domain，然后 patch Pod 并移除 gate。

### NodeAffinity 与 Pod 创建

TopologyAssignment 最终会转换为对应 domain 的 node selector 或 required node affinity。此时 Pod 只允许进入匹配标签值的节点集合。

对 hostname 叶子，约束可以精确到具体节点；若 assignment 只保留更高层级，则 kube-scheduler 可在该域内继续选择具体节点。Kueue 选择“范围”，kube-scheduler 完成“落点”。

## 弹性 Workload 与切片

### Partial Admission

PodSet 有 \`minCount\` 时，普通调度可在配额不足时降低准入数量。TAS 随后必须使用实际 assignment count 重新计算节点容量，不能仍按 spec 中的最大数量放置。

若缩小后的 PodSet 能形成合法拓扑 assignment，结果中的 count 会与实际准入规模一致。

### PodSet Slice

slice 把一个大 PodSet 拆成固定大小的拓扑单元。例如 64 个 worker、slice size 为 8，可要求每 8 个 Pod 位于同一个 rack，同时允许 8 个 slice 分布到不同 rack。

slice 是 assignment 的分组语义，不等价于把一个 Workload 拆成多个独立的配额对象。

### Assignment 扩缩容

Elastic Workload Slices 与 TAS 结合时，当前实现只支持 unconstrained topology。新的 Workload slice 可以读取上一 slice 的 topology assignment，在扩容时尽量延续已有放置，并用新 Admission 替换旧 slice。

required/preferred 拓扑与弹性 slice 的组合会被明确拒绝，避免扩容后破坏原有硬域约束。

## 节点故障与拓扑重分配

### Stale Assignment 检测

Assignment 写入后，节点可能删除、NotReady 或出现不再容忍的 taint。Node Controller 通过 Workload assignment 反查受影响对象，并把节点名写入 \`status.unhealthyNodes\`。

这表示“当前拓扑结果需要修复”，不等于整个 Workload 已经失去配额。

### Hot Swap

启用 \`TASFailedNodeReplacement\` 后，Scheduler 会保留健康 domain，只为故障节点对应的 Pod 数寻找 replacement assignment：

\`\`\`mermaid
flowchart TD
    N[发现 assignment 中的故障节点] --> U[写入 unhealthyNodes]
    U --> S[Scheduler 重新计算缺失部分]
    S --> F{找到同约束替代域?}
    F -->|是| M[合并旧 assignment 与 replacement]
    M --> C[清空 unhealthyNodes]
    F -->|否| W[等待容量或按策略驱逐]
\`\`\`

对 slice workload，替换仍需落在最紧的有效 slice constraint 内，不能为了找到节点而静默破坏通信拓扑。

### Node Taint 与替换策略

节点删除或缺少 Ready condition 可立即视为故障；NotReady 是否等待固定时间、Pod 终止是否触发替换、taint 是否触发替换都由相应 feature gate 与 toleration 判断控制。

若一次有多个 assignment 节点失败，或启用了 fail-fast 且首次找不到替代节点，Controller 可以驱逐整个 Workload，让它释放并重新竞争完整资源。

## 边界与并发场景

### ClusterAutoscaler 与 ProvisioningRequest

TAS 只能根据当前缓存或已准备容量生成 assignment。使用 ProvisioningRequest 时，首次准入可以先预留 quota 并延迟 topology request；外部控制器完成扩容后，再基于新节点计算真实分配。

因此“QuotaReserved”与“已经有节点可放”在该流程中是两个阶段。

### 与非 TAS Workload 共享节点

非 TAS Pod 不会获得 topology assignment，但其实际 requests 会从 TAS 节点容量中扣除。TAS Workload 也仍然占用 ClusterQueue quota。

两套会计分别解决：

- quota cache：组织是否有资格使用资源；
- TAS cache：目标节点现在是否容得下 Pod。

任何一套不足，Workload 都不能完成准入。

### 拓扑变化期间的一致性

Node、Pod、ResourceFlavor 和 Workload 由不同 informer 更新，短时间内 snapshot 可能落后于真实集群。实现通过 assumption、不可变拓扑树、每轮可变状态、expectations 和重新入队来收敛，而不是依赖跨对象事务。

这也解释了为什么 TAS 是“提高准入准确性”，而不是对最终绑定的绝对保证：Kueue 计算完成后，集群状态仍可能变化，kube-scheduler 仍需执行最后检查。

## 小结

TAS 在 Kueue 的配额调度和 Kubernetes 的 Pod 调度之间增加了一层拓扑容量承诺：

- Topology 与 ResourceFlavor 定义可调度节点及层级；
- PodSetTopologyRequest 描述 required、preferred、unconstrained 或 slice 意图；
- TAS Cache 同时扣除非 TAS 实际用量和 TAS 已承诺用量；
- Scheduler 在 snapshot 中联合选择 flavor 与 topology assignment；
- TopologyUngater 把结果落实为 Pod 约束，再交给 kube-scheduler；
- 节点故障时可局部替换 assignment，无法恢复时再驱逐重排。

掌握这条链路后，就能区分“配额不足”“节点总容量不足”“指定 rack 放不下”和“Pod 最终调度失败”四类看似相同的 Pending 问题。

## 源码索引

- \`apis/kueue/v1beta2/topology_types.go\`：Topology API 与 TAS 注解、gate 常量。
- \`apis/kueue/v1beta2/workload_types.go\`：TopologyRequest、TopologyAssignment 和 unhealthyNodes。
- \`apis/kueue/v1beta2/resourceflavor_types.go\`：ResourceFlavor 的 topologyName。
- \`pkg/cache/scheduler/tas_cache.go\`：TAS 全局缓存。
- \`pkg/cache/scheduler/tas_flavor.go\`：单 flavor 的节点与拓扑状态。
- \`pkg/cache/scheduler/tas_flavor_snapshot.go\`：拓扑分配主算法与故障替换。
- \`pkg/cache/scheduler/tas_topology_tree.go\`：拓扑树构建。
- \`pkg/scheduler/flavorassigner/tas_flavorassigner.go\`：Workload 请求到 TAS 请求的转换。
- \`pkg/controller/tas/node_controller.go\`：节点同步与故障检测。
- \`pkg/controller/tas/pod_usage_controller.go\`：非 TAS Pod 用量同步。
- \`pkg/controller/tas/topology_ungater.go\`：Pod 域映射与 scheduling gate 移除。
- \`pkg/controller/jobframework/tas.go\`：PodTemplate 注解到 TopologyRequest。
`;export{n as default};
