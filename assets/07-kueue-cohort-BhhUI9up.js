const n=`---
id: kueue-07-cohort
slug: 07-kueue-cohort
title: Kueue Cohort 层级配额与公平共享
description: 解析 Kueue Cohort 的层级模型、配额借贷、资源传播、公平共享与跨队列抢占机制。
date: 2026-09-01
authors: yuluo
tags: [Kueue, Kubernetes, 云原生, 源码分析]
keywords: [Kueue, Cohort, ClusterQueue, Quota, FairSharing]
---

> 本文是 Kueue 源码导读系列第 7 篇，承接上一篇 Workload 抢占，分析 Cohort 如何把多个 ClusterQueue 组织成配额树，并在树上完成借用、公平共享和 Victim 选择。源码基线为 Kueue \`main\` 分支 \`80042b1a0\`。
>
> Cohort 不是真实资源池，也不负责创建 Pod。它描述的是一组 ClusterQueue 之间“哪些空闲配额可以共享、最多借多少、至少保留多少”的关系。

## Cohort 解决什么问题

### ClusterQueue 之间的资源共享

没有 Cohort 时，每个 ClusterQueue 只能消费自己的 \`nominalQuota\`。某个团队即使完全空闲，它的配额也不能被另一个繁忙团队使用。

把 ClusterQueue 加入同一个 Cohort 后，未使用的可借出配额可以在成员之间流动：

\`\`\`mermaid
flowchart LR
    A[team-a CQ<br/>nominal 40 CPU<br/>usage 10] -->|最多可借出 30| C[Cohort]
    C -->|借入 20| B[team-b CQ<br/>nominal 40 CPU<br/>usage 60]
\`\`\`

这里没有把配额对象从 A 转移给 B。Scheduler 仍然把 Workload 准入到 B，只是在检查 B 是否可用时，把 Cohort 中其他成员未使用且允许借出的部分一起计算。

### 扁平 Cohort 与层级 Cohort

早期可以把 Cohort 理解为一组平级 ClusterQueue。当前实现允许 Cohort 通过 \`spec.parentName\` 构成树：

\`\`\`text
company
├── platform
│   ├── build-cq
│   └── test-cq
└── research
    ├── training-cq
    └── inference-cq
\`\`\`

层级带来两个能力：

- 在部门内部优先共享，再从更高层的公共池借用；
- 在每一层分别设置 nominal、borrowing、lending 和 fair-sharing weight。

因此，一棵 Cohort 树不是简单的成员列表，而是一条逐层检查额度、逐层传播用量的路径。

## Cohort API

\`apis/kueue/v1beta2/cohort_types.go\` 定义了集群级 \`Cohort\` 对象。核心字段如下：

| 字段 | 作用 |
| --- | --- |
| \`spec.parentName\` | 指向父 Cohort；为空时当前节点是根 |
| \`spec.resourceGroups\` | 定义 Cohort 自身额外提供的 flavor/resource 配额 |
| \`spec.fairSharing\` | 定义当前节点参与公平共享时的权重 |
| \`status.fairSharing\` | 暴露当前计算得到的 \`weightedShare\` |

ClusterQueue 则通过 \`spec.cohortName\` 挂到某个 Cohort。父子边都只保存名字，真正可遍历的树由内存中的 Hierarchy Manager 建立。

### ParentName

\`parentName\` 有三种语义：

1. 为空：这是 Cohort 树的根；
2. 指向已存在 Cohort：建立显式父子关系；
3. 指向尚不存在 Cohort：内存中建立隐式 Cohort，等待对应 API 对象出现。

允许先引用后创建可以降低资源创建顺序的耦合。例如先创建子 Cohort，再创建父 Cohort，不需要人为安排严格的 apply 顺序。

但父子关系不能形成环。若出现 \`a -> b -> a\`，缓存会返回 \`ErrCohortHasCycle\`，相关树无法生成可用调度快照。API 注释也明确说明：环存在期间，该环中的 Cohort 及其成员 ClusterQueue 都不能正常参与调度。

### ResourceGroups

Cohort 和 ClusterQueue 复用 \`ResourceGroup\`、\`FlavorQuotas\` 与 \`ResourceQuota\` 结构。区别在于 Cohort 的 \`nominalQuota\` 是附加在成员 ClusterQueue 配额之上的共享池，而不是把成员的 nominal 再声明一次。

\`\`\`yaml
apiVersion: kueue.x-k8s.io/v1beta2
kind: Cohort
metadata:
  name: research
spec:
  parentName: company
  resourceGroups:
    - coveredResources: [cpu]
      flavors:
        - name: default-flavor
          resources:
            - name: cpu
              nominalQuota: "100"
              borrowingLimit: "50"
              lendingLimit: "80"
\`\`\`

这段配置表达：\`research\` 子树自身增加 100 CPU；至少有 20 CPU 留在该子树内，最多向父层借 50 CPU。

### FairSharing

\`spec.fairSharing.weight\` 决定同层兄弟节点的相对份额。未设置时按 \`1\` 计算。权重越大，在相同借用量下计算出的 weighted share 越小，因此越容易被优先调度、越不容易成为抢占来源。

权重为 \`0\` 不是“禁用公平共享”。当节点不借用时其 share 仍为 0；一旦借用，精确 share 视为正无穷，在排序中会处于最不利位置。

### Status

开启 Fair Sharing 后，\`CohortReconciler\` 把当前 \`weightedShare\` 写到：

\`\`\`yaml
status:
  fairSharing:
    weightedShare: 250
\`\`\`

API 状态使用向上取整后的 \`int64\`，调度器内部比较则保留 \`float64\` 精度。Status 是观测结果，不是调度输入，修改它不会改变公平共享权重。

## Hierarchy Manager

### Cohort 与 ClusterQueue 节点

\`pkg/cache/hierarchy/manager.go\` 使用泛型 Manager 同时维护两类节点：

- Cohort 可以有父 Cohort、子 Cohort 和子 ClusterQueue；
- ClusterQueue 是叶子，只能挂到一个 Cohort。

Scheduler Cache 和 Queue Manager 各自持有一套与职责相符的节点对象，但共享相同的层级维护规则。

### 父子关系维护

边的更新不是直接覆盖一个字符串，而是完整执行“从旧父节点摘除，再挂到新父节点”：

\`\`\`mermaid
flowchart TD
    E[收到 Cohort 或 ClusterQueue 更新] --> D[从旧 Parent detach]
    D --> C{新 Parent 已存在?}
    C -->|是| A[挂到显式 Cohort]
    C -->|否| I[创建隐式 Cohort并挂载]
    A --> U[更新配额树]
    I --> U
\`\`\`

删除一个仍有子节点的显式 Cohort 时，Manager 不会把孩子一并删掉，而是用同名隐式 Cohort 接住原有子节点。这样 ClusterQueue 的引用关系不会因为父 API 对象短暂缺失而丢失。

当隐式节点不再有任何孩子时，它才会被清理。

### 环路与非法配置校验

Webhook 负责字段级约束，例如：

- Fair Sharing weight 必须符合 Quantity 约束；
- resource group、flavor 和 resource 组合必须合法；
- 根 Cohort 不能配置 borrowing/lending limit；
- borrowing/lending limit 必须是非负值。

层级环路涉及多个对象，不能只靠单个对象的字段校验完整判断。因此缓存每次重算树资源前还会调用 \`hierarchy.HasCycle\`，形成第二道运行时防线。

## Cohort 配额模型

### NominalQuota

每个资源都以 \`(ResourceFlavor, ResourceName)\` 为键独立记账。例如 \`on-demand/cpu\` 与 \`spot/cpu\` 是两个不同的 FlavorResource，不能只因为资源名同为 CPU 就直接互换。

ClusterQueue 的 \`SubtreeQuota\` 初始等于自身 nominal；Cohort 的 \`SubtreeQuota\` 则由三部分组成：

\`\`\`text
Cohort SubtreeQuota
= Cohort 自身 NominalQuota
+ 每个子节点允许向上可见的配额
\`\`\`

### BorrowingLimit

\`borrowingLimit\` 限制当前节点最多能从父树额外取得多少资源。对一个有父节点的节点，可用量由两部分组成：

\`\`\`text
Available = LocalAvailable + min(父节点可用量, 本节点还能借入的上限)
\`\`\`

检查会沿父链递归，所以子 ClusterQueue 既要满足自己的 borrowing limit，也要满足中间 Cohort 的 borrowing limit。任一层到达上限，都可能阻止 Workload 准入。

### LendingLimit

\`lendingLimit\` 控制多少 nominal 可以被父层看到。源码通过 \`localQuota\` 表达留在本地、永不向父节点借出的部分：

\`\`\`text
localQuota = max(0, SubtreeQuota - LendingLimit)
\`\`\`

若未设置 lending limit，\`localQuota\` 为 0，即空闲 nominal 全部可以向上共享。若 nominal 为 100、lending limit 为 30，则至少 70 留在当前子树，最多 30 对父层可见。

这里的“保留”不是静态切走一块机器，而是在配额计算中控制可见范围。

### SubtreeQuota 与资源传播

\`updateCohortResourceNode\` 从根开始递归到叶子，再把子节点结果累加回父节点。对子节点的贡献量为：

\`\`\`text
contributionToParent = child.SubtreeQuota - child.localQuota
\`\`\`

Usage 的传播也遵循同样边界：只有超过 \`localQuota\` 的用量才计入父节点。于是父节点看到的不是子树全部用量，而是正在消费父级共享容量的部分。

这种表示使“本地保证配额”和“共享池占用”可以用同一棵树计算，而不需要为每次借用创建单独的借贷对象。

## 调度快照中的 Cohort 树

### CohortSnapshot

每轮调度开始时，Cache 生成隔离的调度快照。\`CohortSnapshot\` 包含：

- 名称和父子关系；
- \`ResourceNode\` 中的 Quotas、SubtreeQuota、Usage；
- Fair Sharing 权重；
- 遍历根和整棵子树的方法。

Scheduler 在快照上模拟准入和抢占，不直接修改共享 Cache。只有 API 更新成功后，控制器事件才把真实用量推进 Cache。

### ClusterQueueSnapshot

ClusterQueueSnapshot 是树的叶子，也是 Workload 实际归属的位置。它保存当前准入中的 Workload、资源用量、策略和 flavor 信息，并通过父指针访问 Cohort 的剩余容量。

调度检查因此分成两层：

1. 先为 Workload 的每个 PodSet 选择 flavor；
2. 再沿 ClusterQueue 到 Cohort 根的路径检查相应 FlavorResource 是否仍有额度。

### Workload 用量计算

Workload 准入时，\`addUsage\` 先增加叶子节点 Usage。如果新增量超过该节点尚未使用的 local quota，超出的部分递归加到父 Cohort。

\`\`\`text
deltaToParent = max(0, newUsage - currentLocalAvailable)
\`\`\`

这不是把整个 Workload 都标记为“借来的”。同一个 Workload 的一部分可以使用本地保证额度，只有越过边界的部分才占用父级共享池。

## 借用与归还

### 借用资格判断

一个 Workload 能借到配额，需要同时满足：

- ClusterQueue 属于 Cohort；
- 目标 flavor/resource 在树中存在可共享配额；
- 叶子和沿途 Cohort 均未超过 borrowing limit；
- 其他已准入 Workload 的 Usage 计入后，根节点仍有可用量；
- 若无直接空闲额度，相关 preemption policy 允许通过抢占腾出空间。

“配置了 borrowingLimit”不代表一定能借到对应数量，它只定义上限，实际额度仍取决于父树当时的空闲资源。

### 多层级配额借用

假设 \`training-cq\` 挂在 \`research\`，\`research\` 又挂在 \`company\`。Workload 超过 training 的本地配额后：

\`\`\`mermaid
sequenceDiagram
    participant CQ as training-cq
    participant R as research Cohort
    participant C as company Cohort
    CQ->>R: 查询本地额度之外的可用量
    R->>C: research 本地共享池不足，继续向父层查询
    C-->>R: 返回根层剩余额度
    R-->>CQ: 叠加本地可用量并应用 borrowingLimit
    CQ-->>CQ: 判断 Workload 是否整体可容纳
\`\`\`

每层返回值都会被本层的 borrowing limit 再次截断，因此配额不会绕过组织边界。

### Workload 完成后的配额归还

Workload 完成、被驱逐并清除 Admission，或 reclaimable pods 减少占用时，Cache 使用 \`removeUsage\` 反向扣减。

它先减少叶子 Usage，再计算原先有多少 Usage 存在父节点中，只把对应部分向父链递归移除。资源一旦归还，就能在后续调度周期中被同树其他 Workload 使用。

## Fair Sharing

### WeightedShare

公平共享解决的是：当多个节点都希望借用同一个共享池时，谁先调度、谁更适合被抢占。

Kueue 不是按 Workload 数量平均，而是比较节点的借用比例：

\`\`\`text
weightedShare = dominant borrowed ratio / fairWeight
\`\`\`

未借用任何资源时 share 为 0。节点一旦超过自己的 SubtreeQuota，才进入正的 share 区间。

### DominantResourceShare

\`dominantResourceShare\` 会先按 FlavorResource 计算超过 SubtreeQuota 的数量，再按 ResourceName 聚合借用量，除以对应的可借出总量，最后取最大的比例作为 dominant resource share。

例如某节点借用了 20/100 CPU 和 2/5 GPU：

\`\`\`text
CPU share = 20%
GPU share = 40%
DominantResourceShare = 40%（GPU）
\`\`\`

若 weight 为 2，则用于比较的 weighted share 为 20%。这种 Dominant Resource Fairness 思路避免只看 CPU 而让稀缺 GPU 被某个队列持续独占。

### ClusterQueue 排序

\`CompareDRS\` 规定：

- share 更低的节点更适合继续调度；
- share 更高的节点更适合在公平抢占中让出资源；
- 零权重且正在借用的节点排在最不利位置；
- 精确 share 相同时再由上层稳定排序规则决定结果。

Fair Sharing 是共享容量竞争时的相对排序，不会突破 borrowing/lending limit，也不会替代 Workload priority。

## Cohort 范围内的抢占

### ReclaimWithinCohort

\`reclaimWithinCohort\` 允许一个 ClusterQueue 为拿回自己的 nominal quota，抢占同一 Cohort 树中正在借用的 Workload。

典型场景是 A 曾把空闲额度借给 B，后来 A 自己提交了 Workload。只要策略和优先级条件满足，A 可以从借用方回收额度。

### BorrowWithinCohort

\`borrowWithinCohort\` 处理另一种情况：发起方本身也需要借用，并希望通过抢占其他成员 Workload 获得共享配额。该策略可配置 \`maxPriorityThreshold\`，限制哪些低优先级 Victim 可以被选择。

它比 reclaim 更激进，因此应结合业务优先级和 Fair Sharing 一起配置。

### 层级 Cohort 的 Victim 选择

启用 Fair Sharing 时，Preemptor 不只是把整棵树的 Workload 放进一个平面列表。它从树根逐层向下：

1. 找出包含可用候选且正在借用的子节点；
2. 优先进入 DRS 更高的子树；
3. 重复选择，直到到达具体 ClusterQueue；
4. 再按 Workload priority 等条件确定 Victim。

这样 Victim 的选择与 Cohort 层级权重一致：先决定哪个组织分支的共享占用更高，再决定该分支中停止哪个 Workload。

## 控制器同步与可观测性

### CohortReconciler

\`pkg/controller/core/cohort_controller.go\` 的职责是把 API 对象同步到两套内存状态：

\`\`\`mermaid
flowchart LR
    API[Cohort API] --> R[CohortReconciler]
    R --> SC[Scheduler Cache]
    R --> QM[Queue Manager]
    SC --> M[Metrics / Status stats]
    M --> API
\`\`\`

创建或更新时，Reconciler 先调用 Cache 的 \`AddOrUpdateCohort\`，再更新 Queue Manager；删除时则从两者移除显式对象并清理对应指标。ClusterQueue 的变化也会通过事件通道触发相关 Cohort 的状态刷新。

### 状态与指标更新

当前 Cohort Status 主要暴露 Fair Sharing 的 \`weightedShare\`。此外 Cache 会报告 Cohort subtree quota、usage、weighted share 等指标，便于判断：

- 某个子树能向上提供多少配额；
- 当前共享池被哪些分支消耗；
- 公平共享排序为何发生变化。

需要注意，指标和 Status 都来自某一时刻的缓存统计。Workload API、控制器事件和下一轮调度之间存在短暂传播窗口，排障时应结合 ClusterQueue 与 Workload 状态一起看。

## 小结

Cohort 的核心不是“把几个队列分组”，而是建立一棵可计算的配额树：

- \`nominalQuota\` 定义节点自身增加的容量；
- \`lendingLimit\` 决定多少容量能向父层共享；
- \`borrowingLimit\` 决定子树最多从父层取得多少；
- \`SubtreeQuota\` 和 Usage 沿树聚合，形成实时可用量；
- Fair Sharing 用加权 Dominant Resource Share 排序竞争者；
- Cohort 范围抢占在同一棵树上完成配额回收。

理解这棵树以后，Kueue 的借用、归还、公平排序和跨队列抢占就不再是四套独立机制，而是围绕同一份层级配额状态的不同操作。

## 源码索引

- \`apis/kueue/v1beta2/cohort_types.go\`：Cohort API、父节点、资源组和状态。
- \`apis/kueue/v1beta2/fairsharing_types.go\`：Fair Sharing 配置与状态。
- \`pkg/cache/hierarchy/manager.go\`：显式/隐式 Cohort 与父子边维护。
- \`pkg/cache/scheduler/resource_node.go\`：SubtreeQuota、Usage、借贷限制和资源传播。
- \`pkg/cache/scheduler/cohort_snapshot.go\`：调度快照中的 Cohort 节点。
- \`pkg/cache/scheduler/fair_sharing.go\`：Dominant Resource Share 与 weighted share。
- \`pkg/controller/core/cohort_controller.go\`：Cohort API 到 Cache、Queue Manager 的同步。
- \`pkg/webhooks/cohort_webhook.go\`：Cohort 字段校验入口。
- \`pkg/scheduler/preemption/\`：Cohort 范围抢占与公平 Victim 选择。
`;export{n as default};
