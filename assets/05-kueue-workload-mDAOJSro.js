const e=`---
id: kueue-05-workload
slug: 05-kueue-workload
title: Kueue Workload 控制器与状态流转
description: 解析 Kueue Workload 的数据模型、核心控制器、准入状态机、驱逐重排与生命周期管理。
date: 2026-08-31
authors: yuluo
tags: [Kueue, Kubernetes, 云原生, 源码分析]
keywords: [Kueue, Workload, WorkloadReconciler, Admission, Eviction]
---

> 本文是 Kueue 源码导读系列第 5 篇，承接上一篇 Scheduler 的准入结果，分析 \`pkg/controller/core/workload_controller.go\` 如何维护 Workload 状态、内存队列与配额缓存。源码基线为 Kueue \`main\` 分支 \`80042b1a0\`。
>
> Scheduler 负责回答“能不能预留配额”，Workload Controller 负责让这个决定在 API 状态、队列缓存和后续生命周期中持续成立。它不直接启动或停止 Job；真正修改 Job 的仍然是 JobFramework。

## Workload 数据模型

\`Workload\` 是 Kueue 的调度与准入单位。JobFramework 把不同类型的 Job 转换成统一的 Workload，Scheduler 只面对 Workload 做资源计算，后续控制器也通过 Workload Conditions 协作。

一个 Workload 可以看成两部分：

- \`spec\` 描述不可随意变化的调度意图；
- \`status\` 记录配额分配、外部准入检查和运行生命周期。

### Workload Spec

\`apis/kueue/v1beta2/workload_types.go\` 中的 \`WorkloadSpec\` 主要包含以下字段：

| 字段                            | 作用                                                           |
| ------------------------------- | -------------------------------------------------------------- |
| \`podSets\`                       | 一组同构 Pod 集合，每组包含 Pod 模板和数量，最多 18 组         |
| \`queueName\`                     | Workload 所属的 LocalQueue；持有 \`status.admission\` 时不能修改 |
| \`priorityClassRef\` / \`priority\` | 优先级来源及解析后的数值，参与队列排序和抢占                   |
| \`active\`                        | 是否允许进入准入流程；设为 \`false\` 会驱逐已经运行的 Workload   |
| \`maximumExecutionTimeSeconds\`   | Workload 可处于 Admitted 状态的累计最长时间                    |
| \`preemptionGates\`               | 控制 Workload 是否可以发起抢占的门控列表                       |

这里没有 ClusterQueue 字段。用户只选择命名空间内的 LocalQueue，LocalQueue 再指向 ClusterQueue。这样 Job 提交者不需要直接依赖集群级配额对象。

### Workload Status

\`WorkloadStatus\` 同时被 Scheduler、Workload Controller、JobFramework 和 AdmissionCheck Controller 更新。关键字段如下：

| 字段                                    | 写入者与含义                                                                  |
| --------------------------------------- | ----------------------------------------------------------------------------- |
| \`admission\`                             | Scheduler 写入，记录 ClusterQueue 和各 PodSet 的 flavor、资源、数量及拓扑分配 |
| \`conditions\`                            | 多个控制器协作维护的生命周期事实                                              |
| \`admissionChecks\`                       | 外部准入控制器的 \`Pending/Ready/Retry/Rejected\` 状态                          |
| \`requeueState\`                          | 驱逐后的重排次数与下一次可入队时间                                            |
| \`reclaimablePods\`                       | 已不再需要保留配额的 Pod 数量                                                 |
| \`resourceRequests\`                      | 未准入时最近一次计算得到的资源请求明细                                        |
| \`accumulatedPastExecutionTimeSeconds\`   | 多次准入、驱逐循环中已经消耗的运行时间                                        |
| \`schedulingStats\`                       | 按原因和底层原因聚合的驱逐次数                                                |
| \`nominatedClusterNames\` / \`clusterName\` | MultiKueue 的候选集群与最终集群                                               |
| \`unhealthyNodes\`                        | TAS 场景中等待替换的故障节点                                                  |

\`status.admission\` 不是简单的布尔值。它保存的是 Scheduler 的完整决策结果，因此 JobFramework 在启动 Job 时不需要重新推导 flavor 或节点约束。

### PodSet 与资源请求

一个 \`PodSet\` 表示一组模板相同的 Pod，核心字段是 \`template\`、\`count\`、可选的 \`minCount\` 和 \`topologyRequest\`。分布式作业可以有多个 PodSet，例如一个 launcher 加多个 worker。

Workload 进入队列前，事件处理器会调用 \`workload.AdjustResources\`，补齐以下资源语义：

- RuntimeClass 带来的 Pod overhead；
- 命名空间 LimitRange 的默认 request；
- 只填写 limit 时对应的缺省 request。

调度前的总请求可以简化为：

\`\`\`text
PodSet 总请求 = 单个 Pod 的有效 requests × PodSet.count
\`\`\`

准入后，\`status.admission.podSetAssignments[*].resourceUsage\` 保存准入时的原始总量。即使随后发生动态回收，这个字段也不改写；缓存根据 \`reclaimablePods\` 计算当前仍应占用的配额。

### Conditions 与 AdmissionChecks

Workload 没有一个单独的 \`phase\` 字段。状态由一组 Conditions 组合表达：

| Condition            | 含义                                             |
| -------------------- | ------------------------------------------------ |
| \`QuotaReserved\`      | Scheduler 是否已经为 Workload 预留配额           |
| \`Admitted\`           | 配额、AdmissionChecks 和延迟拓扑分配是否全部就绪 |
| \`PodsReady\`          | JobFramework 观察到所需 Pod 已 Ready 或成功      |
| \`Evicted\`            | Workload 已收到驱逐信号                          |
| \`Preempted\`          | 驱逐由抢占引起，并记录抢占范围                   |
| \`Requeued\`           | 驱逐后是否可以重新进入队列                       |
| \`Finished\`           | 关联 Job 已成功或失败结束                        |
| \`DeactivationTarget\` | 控制器准备把 Workload 设为 inactive 的临时信号   |

\`admissionChecks\` 不是 Conditions 的替代品。它表示外部控制器对准入的独立判断，而 \`Admitted\` 是 Kueue 对所有前置条件的汇总结果。

## WorkloadReconciler 的装配与事件来源

\`WorkloadReconciler\` 同时实现两个接口：

\`\`\`go
var _ reconcile.Reconciler = (*WorkloadReconciler)(nil)
var _ predicate.TypedPredicate[*kueue.Workload] = (*WorkloadReconciler)(nil)
\`\`\`

这意味着它有两条执行路径：

1. \`Reconcile()\` 读取 API 对象，推进 Conditions、驱逐、退避和清理；
2. \`Create/Update/Delete\` 事件回调立即维护内存中的 queue 与 cache。

如果只读 \`Reconcile()\`，会漏掉 Workload 如何真正进入 Scheduler 队列这一半逻辑。

### Reconciler 依赖

\`WorkloadReconciler\` 中最重要的依赖是：

- \`queues *queue.Manager\`：维护待调度和 inadmissible Workload；
- \`cache *scheduler.Cache\`：维护已经预留配额或已准入的 Workload 及 ClusterQueue 用量；
- \`client.Client\`：读写 Workload、LocalQueue、ClusterQueue 等 API 对象；
- \`preemptionExpectations\`：跟踪抢占对象是否已经被观察到；
- \`waitForPodsReady\`：控制 Pod Ready 超时、恢复超时和重排退避；
- \`workloadRetention\`：控制 Finished Workload 的保留时间；
- \`watchers\`：把 Workload 变化通知其他内部组件。

\`queues\` 和 \`cache\` 不能混为一谈：前者回答“谁还在等”，后者回答“谁已经占了多少”。

### Watch 与索引

\`SetupWithManager\` 直接 Watch 以下资源：

- \`Workload\`：对象生命周期与 Conditions 变化；
- \`LocalQueue\`、\`ClusterQueue\`：队列停止、恢复、删除及 AdmissionCheck 配置变化；
- \`LimitRange\`、\`RuntimeClass\`：资源默认值或 overhead 改变后重新计算 Workload；
- \`DeviceClass\` 和内部 DRA channel：DRA 资源变化时重新调和相关 Workload。

整体关系如下：

\`\`\`mermaid
flowchart LR
    API["kube-apiserver"] -->|Workload 事件| WR["WorkloadReconciler"]
    LQ["LocalQueue"] --> WR
    CQ["ClusterQueue"] --> WR
    LR["LimitRange / RuntimeClass"] --> WR
    DRA["DeviceClass / DRA Events"] --> WR
    WR --> Q["queue.Manager<br/>Pending / Inadmissible"]
    WR --> C["scheduler.Cache<br/>Reserved / Admitted"]
    Q --> S["Scheduler"]
    S -->|Patch admission| API
\`\`\`

## Workload 调和主流程

\`Reconcile()\` 不是简单的状态 switch，而是一组有顺序的保护条件。主流程可以概括为：

\`\`\`mermaid
flowchart TD
    A["读取 Workload"] --> B{"孤儿或正在删除?"}
    B -->|是| B1["完成或移除 finalizer"]
    B -->|否| C{"Finished?"}
    C -->|是| C1["等待 retention 到期后删除"]
    C -->|否| D{"存在 requeueAt?"}
    D -->|未到期| D1["RequeueAfter 等待"]
    D -->|到期或不存在| E{"spec.active?"}
    E -->|否| E1["设置 Evicted 并清理退避状态"]
    E -->|是| F["解析 LocalQueue 与 ClusterQueue"]
    F --> G["同步 AdmissionChecks"]
    G --> H["同步 QuotaReserved=False 与 Admitted"]
    H --> I{"持有 QuotaReservation?"}
    I -->|否| J["结束本轮"]
    I -->|是| K["检查 AC Retry/Rejected、队列停止、PodsReady 超时、最大运行时间"]
\`\`\`

顺序很重要。例如已经 \`Admitted=True\` 的 Workload 不会先被写成 \`Admitted=False\` 再驱逐，否则 JobFramework 可能观察到一个缺少驱逐原因的瞬时状态。

### LocalQueue 与 ClusterQueue 校验

控制器先按 \`namespace + spec.queueName\` 读取 LocalQueue，再通过 \`queue.Manager.ClusterQueueForWorkload\` 找到 ClusterQueue。ClusterQueue 随后直接从 API client 读取，而不是完全相信 queue cache，因为控制器需要对 ClusterQueue API 事件做一致的状态判断。

未持有配额时，控制器会为 \`QuotaReserved=False\` 补充原因。启用细粒度未准入可观测性后，常见原因包括：

- \`Misconfigured\`：LocalQueue、ClusterQueue 不存在或准入配置非法；
- \`Suspended\`：LocalQueue 或 ClusterQueue 已停止；
- \`AdmissionGated\`：被注解门控；
- \`PendingEvaluation\`：等待 Scheduler 评估；
- \`WaitingForQuota\`、\`NoMatchingFlavor\` 等 Scheduler 返回的具体 NoFit 原因。

这些原因既给用户解释“为什么没运行”，也防止 Workload 在配置未修复时反复进入调度循环。

### Workload 写入队列和缓存

queue/cache 的迁移主要发生在 Workload 事件回调中：

| API 状态变化                     | queue.Manager           | scheduler.Cache          |
| -------------------------------- | ----------------------- | ------------------------ |
| 新建且可准入                     | AddOrUpdate             | 不写入                   |
| Pending → QuotaReserved/Admitted | Delete                  | AddOrUpdate              |
| QuotaReserved/Admitted → Pending | 退避结束后重新 Add      | Delete                   |
| ReclaimablePods 或优先级变化     | 必要时唤醒关联 Workload | AddOrUpdate 重新计算用量 |
| Finished、inactive、Delete       | Delete/Forget           | Delete                   |

删除 cache 和唤醒关联 inadmissible Workload 会在 queue lock 的保护下完成。这样 Scheduler 下一轮创建 Snapshot 时，不会出现“旧占用已删，但受影响 Workload 还没重新入队”的时间窗。

### QuotaReserved 与 Admitted 两阶段准入

两阶段准入的关系可以写成：

\`\`\`text
QuotaReserved = Scheduler 已选择 ClusterQueue、Flavor、数量和拓扑，并占住配额

Admitted = QuotaReserved
           && 所有 AdmissionChecks == Ready
           && 不存在待完成的 delayed topology assignment
\`\`\`

Scheduler 在 \`assumeWorkload\` 中先把带 Admission 的 Workload 副本写入内存 cache，再 patch API。若该 Workload 已经具备所有必需的 AdmissionCheck 条目，它会顺带调用 \`SyncAdmittedCondition\`；否则 Workload Controller 在后续调和中补齐检查并推进 \`Admitted\`。

因此 \`QuotaReserved=True, Admitted=False\` 是正常状态，表示配额已经锁住，但外部准入条件还没有全部完成。

## Workload 状态机

Kueue 内部的 \`workload.Status()\` 只归纳四个主状态：

\`\`\`go
Finished > Admitted > QuotaReserved > Pending
\`\`\`

它按上述顺序检查 Conditions。\`Evicted\`、\`Requeued\` 和 \`PodsReady\` 是影响生命周期的正交信号，不会形成第五个主状态。

\`\`\`mermaid
stateDiagram-v2
    [*] --> Pending
    Pending --> QuotaReserved: Scheduler reserve quota
    QuotaReserved --> Admitted: checks ready + topology ready
    Admitted --> Pending: evict → stop Job → clear admission
    QuotaReserved --> Pending: queue stop / check retry / release
    Pending --> Pending: backoff / inadmissible
    Admitted --> Finished: Job completed
    QuotaReserved --> Finished: Job terminated before start
    Finished --> [*]: retention elapsed
\`\`\`

### Pending 与 Inadmissible

\`Pending\` 是 API Conditions 推导出的主状态；\`Inadmissible\` 是 queue.Manager 内部的存放位置或 \`QuotaReserved=False\` 的原因，而不是独立 API phase。

可调度的 Pending Workload 位于 ClusterQueue heap 中。已经尝试但当前无法满足的 Workload 会移入 inadmissible 集合，避免在 \`BestEffortFIFO\` 下持续挡住后面的作业。配额、队列或相关 Workload 变化时，queue.Manager 再把受影响对象移回 active heap。

### Assumed 与 QuotaReserved

\`Assumed\` 完全是 Scheduler 内存态。Scheduler 在 patch API 之前先向 cache 写入带 Admission 的副本，保证下一轮 Snapshot 已经能看到这份占用。

API patch 成功后，\`status.admission\` 和 \`QuotaReserved=True\` 成为持久事实；patch 失败则删除 assumed cache 条目并重新排队。Workload Controller 只会观察最终 API 变化，不把 \`Assumed\` 暴露成 Condition。

### Admitted 与 PodsReady

\`Admitted=True\` 说明 Job 已具备启动资格。JobFramework 观察到它后，把 PodSetAssignment 中的 flavor、拓扑、标签、污点容忍等信息注入原始 Job，并解除挂起。

\`PodsReady\` 则由 JobFramework 根据实际 Pod 状态写入。它与 \`Admitted\` 的区别是：

- Admitted 表示控制面已经允许启动；
- PodsReady 表示数据面中的 Pod 已经达到运行要求。

如果启用了 \`waitForPodsReady\`，Workload Controller 会从 Admitted 或进入恢复状态的时间点开始计时，超时后触发驱逐与退避。

### Evicted 与 Requeued

驱逐不是一次原子删除，而是三段式协作：

1. Workload Controller 或 Scheduler 设置 \`Evicted=True\`；
2. JobFramework 观察到 Evicted，暂停 Job 并等待活动 Pod 退出；
3. Job 不再 active 后，JobFramework 清空 \`status.admission\`、设置 \`QuotaReserved=False\`，并决定 \`Requeued\` 是否为 True。

API 状态回到 Pending 后，Workload 的 Update 事件从 scheduler cache 删除旧占用；若没有退避且允许重排，立即重新进入 queue.Manager。

### Finished

JobFramework 检测到 Job 成功或失败后，调用 \`workloadfinish.Finish\` 写入 \`Finished=True\`。Workload Update 事件随后把它从 queue 和 cache 删除并释放配额。

Finished 优先级高于 Admitted 和 QuotaReserved，所以即使历史 Admission 信息还短暂存在，内部也会把它视为完成态，不再参与调度。

## AdmissionCheck 状态同步

Workload Controller 根据当前 ClusterQueue 及已经选择的 flavors，计算本 Workload 实际需要的 AdmissionChecks。\`reconcileSyncAdmissionChecks\` 会：

- 为新出现的检查创建 \`Pending\` 状态；
- 保留仍然需要的检查状态；
- 删除 ClusterQueue 已不再要求的检查；
- 按名称排序，减少无意义的 status diff。

不同 flavor 可以匹配不同 AdmissionCheck，因此必须在 Scheduler 写入 Admission 后再次计算实际集合。

### Pending、Ready、Retry 与 Rejected

四种状态的控制语义不同：

| 状态       | Workload Controller 行为                                                   |
| ---------- | -------------------------------------------------------------------------- |
| \`Pending\`  | 保留配额，等待外部控制器处理                                               |
| \`Ready\`    | 当全部检查 Ready 时允许同步 \`Admitted=True\`                                |
| \`Retry\`    | 驱逐当前 Workload，重置检查，并按 \`requeueAfterSeconds\` 或退避时间重新排队 |
| \`Rejected\` | 设置 \`DeactivationTarget\`，最终把 \`spec.active\` 设为 false，停止自动重试   |

Retry 是可恢复错误，Rejected 是终止自动准入的决定。把两者区分开，可以避免永久配置错误消耗无穷重试。

### PodSetUpdates 合并

AdmissionCheck 可以在状态中返回 \`PodSetUpdates\`，包含 labels、annotations、nodeSelector 和 tolerations。这些更新由 Workload Controller 保存，但不在这里直接改 Job。

JobFramework 的 \`getPodSetsInfoFromStatus\` 先把 Scheduler 的 PodSetAssignment 转为 \`PodSetInfo\`，再按 AdmissionCheck 合并 PodSetUpdates，最后交给 \`RunWithPodSetsInfo\`。如果两个检查尝试修改同一个已有键，合并会报错，而不是静默覆盖。

这条边界很重要：Workload Controller 汇总“能否准入”，JobFramework 负责把准入结果落到具体 Job API。

## 驱逐与重新排队

### 驱逐原因

Workload 可能因为以下事件被驱逐：

- 更高优先级 Workload 抢占；
- PodsReady 启动或恢复超时；
- AdmissionCheck 返回 Retry 或 Rejected；
- LocalQueue、ClusterQueue 被停止或删除；
- \`spec.active=false\`；
- 最大执行时间耗尽；
- TAS 节点故障等扩展场景。

\`workload/evict.Evict\` 会设置 Evicted Condition、重置集群提名和 AdmissionChecks、清理故障节点，并关闭 PreemptionGates；它不会越过 JobFramework 直接删除 Pod。

### 配额释放与状态清理

只有在 JobFramework 已经停止 Job、确认其不再 active 后，才调用 \`UnsetQuotaReservationWithCondition\` 清空 \`status.admission\`。这避免 Pod 仍在占用节点资源时，Kueue 已把同一份逻辑配额发给另一个 Workload。

当 Update 事件观察到 \`QuotaReserved/Admitted → Pending\`：

1. 从 scheduler cache 删除旧 Workload；
2. 释放 ClusterQueue/Cohort 用量；
3. 唤醒可能因这份配额不足而进入 inadmissible 的 Workload；
4. 根据 Requeued 和 backoff 决定是否重新入队。

### 指数退避与重入队

PodsReadyTimeout 和 AdmissionCheck Retry 可以写入 \`status.requeueState\`：

- \`count\` 记录重排次数；
- \`requeueAt\` 记录最早允许再次入队的时间。

控制器使用以配置值为上下界的指数退避，并附带少量 jitter。\`requeueAt\` 未到时返回 \`RequeueAfter\`；到期后清空时间、设置 \`Requeued=True\` 并重新加入 queue.Manager。

如果次数超过 \`requeuingBackoffLimitCount\`，控制器设置 \`DeactivationTarget\`，不再无限重试。

## 动态资源回收

### ReclaimablePods

支持动态回收的 Job 集成实现 \`JobWithReclaimablePods\`。JobFramework 根据 Job 状态计算哪些 Pod 已经完成、其资源不再需要保留，并更新 \`status.reclaimablePods\`。

例如一个 PodSet 最初有 10 个 Pod，其中 4 个已经成功完成，则有效计费数量为：

\`\`\`text
effectiveCount = podSet.count - min(reclaimableCount, podSet.count)
               = 10 - 4
               = 6
\`\`\`

使用 \`min\` 是为了处理弹性缩容与状态更新短暂交错的情况，避免 reclaimable 数量大于新 PodSet 数量后计算出负用量。

### PodSet 数量与配额更新

Workload Controller 的 Update 回调检测到 Admitted Workload 的 \`reclaimablePods\` 变化后，会在 queue lock 内调用 \`cache.AddOrUpdateWorkload\`。缓存基于新的 effectiveCount 缩减资源用量，再唤醒与该 Workload 关联的 inadmissible 对象。

这里没有重新执行一次完整准入，也不会改写原始 \`PodSetAssignment.resourceUsage\`。它只调整当前计入 ClusterQueue/Cohort 的有效消耗，让已完成 Pod 的配额可以尽快被其他 Workload 使用。

## 完成与清理

### Finalizer

Workload 通常带有 Kueue 的 \`resource-in-use\` finalizer，用来确保关联 Job 在 Workload 删除前被安全停止。正常完成后，JobFramework 执行 Job 自己的 finalize 逻辑，再移除该 finalizer。

对于丢失 OwnerReference 的孤儿 Workload，控制器可以先写入 \`Finished=True, reason=OwnerNotFound\` 释放配额，再移除 finalizer；若对象已经处于删除中，则直接完成必要的 finalizer 清理。

### Workload 保留策略

如果没有配置 retention，Finished Workload 会保留在 API 中供用户查看。配置 \`objectRetentionPolicies.workloads.afterFinished\` 后，Workload Controller 根据 Finished Condition 的 \`lastTransitionTime\` 计算到期时间：

- 未到期：返回 \`RequeueAfter\`；
- 到期：移除 Kueue finalizer，并请求删除 Workload。

因此资源释放不依赖 retention。Workload 进入 Finished 时已经从调度 cache 删除，retention 只决定 API 对象作为历史记录保留多久。

## 小结

Workload Controller 是 Kueue 中连接持久状态和内存调度状态的枢纽：

- Workload 事件回调在 queue.Manager 与 scheduler.Cache 之间搬运对象；
- \`Reconcile()\` 同步 LocalQueue、ClusterQueue、AdmissionChecks 和生命周期 Conditions；
- \`QuotaReserved\` 与 \`Admitted\` 把配额预留和真正放行拆成两个阶段；
- Evicted 只发出停止信号，JobFramework 停止 Job 后才清除 Admission 并释放配额；
- \`reclaimablePods\` 允许运行中的 Workload 逐步归还不再需要的资源；
- Finished、finalizer 和 retention 共同完成最终清理。

从组件职责看，Scheduler 产生准入决定，Workload Controller 维护决定的生命周期，JobFramework 把决定落实到具体 Job。理解这三者的边界，才能继续分析下一篇中的抢占、Victim 驱逐与配额回收。

## 源码索引

- \`apis/kueue/v1beta2/workload_types.go\`：Workload API、Conditions 与 AdmissionCheck 状态定义；
- \`pkg/controller/core/workload_controller.go\`：Workload Reconcile、事件回调与 Watch 装配；
- \`pkg/workload/workload.go\`：状态判定、资源计算、配额预留与重排辅助函数；
- \`pkg/workload/admissionchecks.go\`：Admitted Condition 与 AdmissionCheck 汇总逻辑；
- \`pkg/workload/evict/evict.go\`：驱逐状态写入与统计；
- \`pkg/controller/jobframework/reconciler.go\`：Job 停止、Admission 清理、PodSetUpdates 和 reclaimablePods；
- \`pkg/scheduler/scheduler.go\`：Assume、QuotaReserved 与 Admission patch。
`;export{e as default};
