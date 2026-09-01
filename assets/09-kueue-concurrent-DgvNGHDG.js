const n=`---
id: kueue-09-concurrent-admission
slug: 09-kueue-concurrent
title: Kueue Concurrent Admission 并发准入
description: 解析 Kueue Concurrent Admission 的 Parent/Variant Workload 模型、并发配额试探、迁移策略与生命周期。
date: 2026-09-01
authors: yuluo
tags: [Kueue, Kubernetes, 云原生, 源码分析]
keywords: [Kueue, ConcurrentAdmission, WorkloadVariant, Admission, Flavor]
---

> 本文是 Kueue 源码导读系列第 9 篇，分析 Concurrent Admission 如何为同一个 Workload 创建多个 flavor Variant，让它们并行等待不同资源，并在首个成功后选择是否继续迁移到更优 flavor。源码基线为 Kueue \`main\` 分支 \`80042b1a0\`。
>
> 该能力在当前源码中仍受 Alpha feature gate 控制。它适合“多种硬件都能运行，但偏好有先后”的任务，不应被理解为普通 flavor fallback 的同义词。

## Concurrent Admission 要解决的问题

### 单一 Workload 准入的限制

普通 flavor assignment 会按 ClusterQueue 中的 flavor 顺序依次尝试。只要某个 flavor 能 Fit，Scheduler 就选定它；如果需要等待外部 AdmissionCheck 或触发扩容，Workload 会围绕这一份 assignment 继续推进。

问题在于，不同 flavor 的容量到达时间可能完全不同：

\`\`\`text
reserved-a100：最优，但要等 20 分钟扩容
on-demand-a100：次优，5 分钟可用
spot-a100：成本低但可能立即可用
\`\`\`

单个 Workload 无法同时等待三条独立的准入路径。若先锁定最优 flavor，可能增加排队时间；若立即使用次优 flavor，又无法在最优容量稍后出现时自动迁移。

Concurrent Admission 把一份业务意图拆成一个 Parent 和多个 Variant：

\`\`\`mermaid
flowchart TD
    P[Parent Workload] --> V1[Variant: reserved-a100]
    P --> V2[Variant: on-demand-a100]
    P --> V3[Variant: spot-a100]
    V1 --> S[Kueue Scheduler]
    V2 --> S
    V3 --> S
\`\`\`

每个 Variant 只允许使用一个 flavor，因此可以独立排队、执行 AdmissionChecks 并参与抢占。

### Flavor 偏好与迁移

偏好顺序直接取自 ClusterQueue \`resourceGroups[0].flavors\` 的排列：

\`\`\`text
索引 0 > 索引 1 > 索引 2
越靠前，越优先
\`\`\`

第一个成功准入的 Variant 让业务先运行起来。如果策略为 \`TryPreferredFlavors\`，更靠前的 Variant 仍可继续等待；它成功获得容量后，Kueue 驱逐当前较差 Variant，并把 Parent 切换到更优 assignment。

这是一种“先可用、后优化”的调度模型。

## API 与配置入口

### Feature Gate 与启用条件

需要启用 \`ConcurrentAdmission\` feature gate，并在目标 ClusterQueue 配置 \`spec.concurrentAdmissionPolicy\`。当前源码将该 gate 标记为 Alpha，默认关闭。

Workload Controller 通过 Queue Manager 判断 Workload 所属 ClusterQueue 是否启用该策略。满足条件时，它给原始 Workload 增加：

\`\`\`yaml
metadata:
  labels:
    kueue.x-k8s.io/concurrent-admission-parent: "true"
\`\`\`

从此原始 Workload 成为 Parent，不再作为普通调度候选直接执行 flavor assignment。

### ClusterQueue ConcurrentAdmissionPolicy

最小配置如下：

\`\`\`yaml
apiVersion: kueue.x-k8s.io/v1beta2
kind: ClusterQueue
metadata:
  name: gpu-cq
spec:
  queueingStrategy: BestEffortFIFO
  concurrentAdmissionPolicy:
    migration:
      mode: TryPreferredFlavors
  resourceGroups:
    - coveredResources: [cpu, memory, nvidia.com/gpu]
      flavors:
        - name: reserved-a100
          resources: []
        - name: on-demand-a100
          resources: []
        - name: spot-a100
          resources: []
\`\`\`

示例省略了每个 flavor 的 ResourceQuota，重点是 flavor 顺序和 migration policy。

Webhook 对该能力施加了几项结构约束：

- 只能有一个 ResourceGroup；
- 该组最多 16 个 flavors；
- 不能使用 \`StrictFIFO\`，必须采用 \`BestEffortFIFO\`；
- \`lastAcceptableFlavorName\` 必须出现在该组 flavors 中；
- policy 在 ClusterQueue 更新时不能随意添加或移除。

限制为单 ResourceGroup，是因为当前一个 Variant 只锁定一个 flavor，尚不能表达多个 ResourceGroup 的 flavor 笛卡尔组合。

### Migration Mode 与 Constraints

当前有两种模式：

| 模式 | 行为 |
| --- | --- |
| \`TryPreferredFlavors\` | 首次运行后，继续追求排序更靠前的 flavor |
| \`RetainFirstAdmission\` | 第一个成功的 Variant 固定下来，不再迁移 |

Mode 为空时，Controller 按 \`TryPreferredFlavors\` 处理。

\`constraints.lastAcceptableFlavorName\` 只适用于 \`TryPreferredFlavors\`，用于限制迁移目标。例如顺序为 \`reserved > on-demand > spot\`，约束为 \`on-demand\` 时，已经运行在 spot 的任务可以迁往 reserved 或 on-demand。

### ResourceGroup 与 Flavor 约束

Variant 上会写入内部注解：

\`\`\`yaml
metadata:
  annotations:
    kueue.x-k8s.io/workload-allowed-resource-flavors: reserved-a100
\`\`\`

\`FlavorAssigner\` 在遍历 flavor 时调用 \`IsFlavorAllowedForVariant\`。不在注解允许集合中的 flavor 直接跳过，因此 reserved Variant 不会悄悄 fallback 到 spot。

这是并发试探能成立的关键：每条分支必须代表一个确定 flavor，否则多个 Variant 最终仍可能竞争同一类资源。

## Parent 与 Variant Workload

### Parent Workload

Parent 是 JobFramework 创建的原始 Workload。它继续承担面向业务 Job 的稳定身份：

- OwnerReferences 仍指向原始 Job；
- JobFramework 观察 Parent 的 Admitted、Evicted、Finished 等状态；
- Parent 的 Admission 来自当前胜出 Variant；
- Parent 不执行 AdmissionChecks，检查发生在具体 Variant 上。

因此，业务控制器不需要理解多份 Variant，也不应自行选择 Variant。

### Variant Workload

\`generateVariant\` 复制 Parent 的 Spec 和初始 Status，然后进行三项关键修改：

1. 使用 Parent、UID、GVK 和 flavor 生成稳定名称；
2. 设置指向 Parent Workload 的 controller OwnerReference；
3. 写入 allowed-flavor 注解，并添加 Concurrent Admission preemption gate。

Variant 是真实 Scheduler 候选。它会进入 Queue Manager、计算配额、运行 AdmissionChecks，并拥有自己的 Conditions。

### 命名与归属关系

Controller 不通过名称字符串判断亲缘关系，而是从 OwnerReference 读取 Parent name 与 UID。调度器寻找 sibling 时也比较 Parent UID，避免 Parent 删除重建后把旧 Variant 与新对象错误归为同一家族。

Parent 删除后，Kubernetes garbage collector 可根据 controller OwnerReference 清理 Variant。

## ConcurrentAdmission Controller

### Controller 装配与事件来源

\`variantReconciler\` 监听：

- Parent Workload 事件；
- Variant Workload 事件，并映射回 Parent；
- ClusterQueue flavor 顺序或集合变化，并找出受影响 Parent。

每次 Reconcile 都重新读取完整 family 与 ClusterQueue，以 API 状态为事实来源执行幂等收敛。

### Variant 创建

Controller 为 ResourceGroup 中每个 flavor 确保一份 Variant：

\`\`\`mermaid
flowchart TD
    R[Reconcile Parent] --> L[读取 CQ flavor 列表]
    L --> C[缺少的 flavor 创建 Variant]
    C --> D[删除已不在 CQ 的 stale Variant]
    D --> A[按 flavor 顺序排序]
    A --> S[同步 active / admission / preemption gate]
\`\`\`

若 ClusterQueue 后续新增 flavor，会补建 Variant；移除 flavor，则删除对应 stale Variant 并释放其状态。

### Variant 状态聚合

\`syncAdmissionStatus\` 只把已 Admitted Variant 的 Admission 同步给 Parent：

- Variant 已准入、Parent 未准入：给 Parent 设置 QuotaReserved 与 Admitted；
- Parent 与 Variant 都已准入：继续同步 PodsReady 等状态；
- Parent 已准入但没有任何运行 Variant：驱逐 Parent；
- Parent Finished：把 Finished 级联到所有 Variant。

Parent 是“当前运行方案”的投影，而不是所有 Variant 状态的拼接。

### 策略约束执行

Controller 使用 \`spec.active\` 控制哪些 Variant 还能继续竞争：

- Parent inactive：停用全部 Variant；
- 尚无 Variant admitted：激活所有 Variant；
- \`RetainFirstAdmission\`：保留胜出 Variant，停用其他 Variant；
- \`TryPreferredFlavors\`：停用比当前结果更差的 Variant，只激活允许范围内更优的 Variant。

停用已经持有 quota 的 Variant 时，Controller 会完成驱逐并清除 Admission，避免 inactive 对象长期占用配额。

## Scheduler 的并发准入流程

### Variant 入队与排序

每个 active Variant 都是普通 Workload 队列项，继承 Parent 的 priority 和创建语义，但 flavor 可选集合被限制为一项。

ClusterQueue 禁止 StrictFIFO，是因为同一家族的多个 Variant 需要独立被评估；若队头某个 Variant 阻塞后续 sibling，就失去并发试探的意义。

### 多条准入路径

“Concurrent”表示多个 Variant 可以同时处于 Pending、等待 quota 或 AdmissionCheck 的状态，不表示业务 Job 长期同时运行多份。

在稳定状态下，目标是不超过一个 admitted Variant：

\`\`\`text
Parent
├── reserved Variant: Pending
├── on-demand Variant: Admitted  <- 当前运行
└── spot Variant: inactive
\`\`\`

若更优 Variant 随后具备条件，Scheduler 先触发 migration，等待旧 Variant 释放配额，再准入新 Variant，而不是直接让二者同时启动同一个 Job。

### 选定 Admitted Variant

Variant 正常 Fit 时，Scheduler 仍走 \`assumeWorkload -> PatchAdmissionStatus\` 流程。Controller 观察到它 Admitted 后：

1. 将该 Admission 复制到 Parent；
2. JobFramework 根据 Parent 启动业务 Job；
3. 停用比它更差的 sibling；
4. 根据 migration mode 决定更优 sibling 是否继续 active。

如果 Scheduler 发现已经有更优 sibling admitted，会跳过当前较差 Variant，并将其保持在 PendingEvaluation。

### 其他 Variant 的配额释放

已经胜出的 Variant 不会仅因另一个 Variant“看起来可行”就立即释放。迁移目标必须真正达到可迁移条件，Scheduler 才使用 \`issueMigration\` 驱逐旧 Variant。

旧 Variant 清除 Admission 后，目标 Variant 重新参与调度并取得配额；随后 Parent Status 切换为新 assignment。

## Flavor Preference 与迁移

### Flavor 顺序与偏好

Concurrent Admission 没有单独的 priority 数字。偏好完全由 ClusterQueue 的 flavor 数组索引决定：

\`\`\`text
index 越小 = 越优
\`\`\`

调整 flavor 顺序会触发相关 Parent 重算；同时也会改变 sibling 的“更优/更差”关系。因此它是有运行时影响的策略变更，不只是 YAML 排版。

### TryPreferredFlavors

假设 spot Variant 最先准入：

\`\`\`mermaid
sequenceDiagram
    participant S as spot Variant
    participant P as Parent
    participant R as reserved Variant
    participant C as Concurrent Controller
    S->>P: 同步 spot Admission，Job 开始运行
    C->>R: 保持 active，继续等待更优 flavor
    R->>S: reserved 具备条件，发起 flavor migration
    S-->>C: 驱逐并释放旧 Admission
    R->>P: reserved 准入，Parent 切换 Admission
\`\`\`

迁移会停止并重启底层 Job，而不是透明搬迁已经运行的 Pod。是否值得迁移，需要结合任务 checkpoint 能力和重启成本评估。

### RetainFirstAdmission

该模式以最短启动时间为优先。任一 Variant admitted 后，其他 Variant 全部 deactivate，不再追求更靠前 flavor。

它适合不可中断任务，或 flavor 之间性能差异不足以抵消一次重启成本的场景。

### LastAcceptableFlavorName

该约束是迁移目标的下界，不改变第一次准入时的候选集合。第一次仍可由任意 Variant 抢先成功；成功后，Controller 只保留同时满足以下条件的迁移候选：

- 比当前 admitted flavor 更优；
- 排名不低于 \`lastAcceptableFlavorName\`。

Scheduler 的 \`isMigrationAllowed\` 还会在真正发起迁移前再次检查，形成 Controller 激活范围之外的执行期保护。

## 抢占协调

### Preemption Gates

每个 Variant 创建时都带有：

\`\`\`text
kueue.x-k8s.io/concurrent-admission
\`\`\`

preemption gate 关闭时，Variant 可以正常尝试不需抢占的 Fit，但若只有通过抢占才能准入，Scheduler 会标记 \`BlockedOnPreemptionGates\` 并停止，不会立即杀死 Victim。

### 多 Variant 抢占去重

如果一个 Parent 的所有 Variant 都同时发起抢占，可能为同一个业务 Job 驱逐多组 Workload，最终却只使用一个 flavor。

Controller 因而按 flavor 偏好选择一个候选打开 gate。只有 open Variant 可以实际执行抢占。它会优先处理排序靠前且已经确认“需要抢占”的 Variant。

### 抢占完成后的 Gate 推进

源码设置了 5 分钟的单次 preemption timeout。已有 gate 刚打开时，其他候选继续等待；超时后若仍未成功，Controller 可以让下一 Variant 获得抢占机会。

这不是 Scheduler goroutine 的互斥锁，而是写在 Workload spec/status 中的可恢复状态。Controller 重启后仍能从 API 重建协调进度。

## Parent 与 Variant 生命周期

### Pending 到 Admitted

完整状态链如下：

\`\`\`mermaid
stateDiagram-v2
    [*] --> ParentPending
    ParentPending --> VariantsPending: 创建每个 flavor Variant
    VariantsPending --> VariantAdmitted: 首个分支准入
    VariantAdmitted --> ParentAdmitted: 复制 Admission
    ParentAdmitted --> Migrating: 更优分支可用
    Migrating --> ParentAdmitted: 新 Variant 胜出
\`\`\`

AdmissionChecks 只属于 Variant；Parent 的 Admitted 是当前 Variant 所有准入条件已经满足后的结果。

### Eviction 与重新选择

若 admitted Variant 因普通抢占、AdmissionCheck Retry 或其他原因被驱逐：

1. Controller 先把 Parent 标记为 Evicted；
2. 等 Parent 失去 quota reservation；
3. 清理 Variant Admission；
4. 在 Parent 仍 active 的前提下重新激活可选 Variants。

这样 JobFramework 先停止业务 Job，再进行新一轮选择，避免旧 Job 尚未停下就切换资源方案。

### Finished 与级联清理

业务 Job 结束后，JobFramework 把 Finished 写到 Parent。Controller 再对每个 Variant 执行 finish，使队列、缓存和状态都停止继续竞争。

Parent 删除时，OwnerReference 负责清理 Variants；ClusterQueue 移除 flavor 时则由 Controller 主动删除对应 stale Variant。

## 可观测性与边界

### Conditions、Events 与 Metrics

排查时应分开观察：

- Parent \`QuotaReserved/Admitted/Evicted/Finished\`：业务视角；
- Variant \`QuotaReserved/Admitted/BlockedOnPreemptionGates\`：每条 flavor 路径；
- \`CreatedVariant\`、\`ActivatedVariant\`、\`DeactivatedVariant\`、\`PreemptionUngatedVariant\` Events：Controller 决策；
- ClusterQueue flavor 顺序与 AdmissionCheck 状态：为何某条路径更快或更优。

只看 Parent Pending 无法判断是所有 flavor 都无容量，还是某个 Variant 卡在外部 AdmissionCheck。

### BestEffortFIFO 行为

Concurrent Admission 明确拒绝 StrictFIFO。BestEffortFIFO 允许不可适配的 Variant 暂时移入 inadmissible 集合，让 sibling 或其他能 Fit 的 Workload 继续调度。

代价是队列顺序不再代表严格创建时间。若业务必须严格 FIFO，就不应在该 ClusterQueue 启用 Concurrent Admission。

### Variant 数量与 API 对象开销

每个 Parent 会产生与 flavor 数量相同的 Workload API 对象。16 个 flavor 上限限制了最坏膨胀，但大规模场景仍会增加：

- informer 与 reconciliation 事件；
- Queue Manager entries；
- AdmissionCheck 控制器处理量；
- Conditions、Events 和审计复杂度。

因此 flavors 应代表真正可替代且值得并行尝试的资源类型，而不是把每个细小节点属性都建成一个 flavor。

## 小结

Concurrent Admission 用 Parent/Variant 模型把“按顺序 fallback”改造成“并行等待、首个运行、可选迁移”：

- Parent 保持业务 Workload 的稳定身份；
- 每个 Variant 只允许一个 flavor，独立进入 Scheduler；
- 首个 admitted Variant 把 Admission 同步给 Parent；
- \`TryPreferredFlavors\` 继续追求更优资源，\`RetainFirstAdmission\` 固定首个结果；
- preemption gate 确保同一家族一次只让一个 Variant 制造抢占影响；
- active、OwnerReference 和状态同步保证整组对象最终收敛。

它优化的是多类容量到达时间不确定时的等待策略。使用前仍需评估迁移重启成本、AdmissionCheck 开销和 Alpha API 的演进风险。

## 源码索引

- \`apis/kueue/v1beta2/clusterqueue_types.go\`：ConcurrentAdmissionPolicy、migration mode 与 constraints。
- \`pkg/controller/concurrentadmission/controller.go\`：Variant 创建、激活、迁移状态同步和抢占 gate。
- \`pkg/workload/concurrentadmission/concurrentadmission.go\`：Parent/Variant 判断与 allowed flavor。
- \`pkg/controller/core/workload_controller.go\`：普通 Workload 到 Parent 的标记入口。
- \`pkg/controller/constants/constants.go\`：Parent label、allowed-flavor 注解与 preemption gate。
- \`pkg/scheduler/flavorassigner/flavorassigner.go\`：Variant flavor 过滤。
- \`pkg/scheduler/scheduler.go\`：Sibling 比较、迁移驱逐和 gate 执行。
- \`pkg/webhooks/clusterqueue_webhook.go\`：ClusterQueue 结构及更新校验。
`;export{n as default};
