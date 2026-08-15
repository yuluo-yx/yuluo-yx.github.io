const e=`---
id: kueue-02-api-objects
slug: 02-kueue-api-obj
title: Kueue API 对象与作业流转
description: 解析 Kueue 项目目录、核心 API 对象，以及作业从提交到准入的完整流转过程。
date: 2026-08-15
authors: yuluo
tags: [Kueue, Kubernetes, 云原生, 源码分析]
keywords: [Kueue, API, CRD, Workload, ClusterQueue, Job]
---

## 目录结构
Kueue 项目中有很多子目录，其中有几个是特别需要关注的目录：

\`\`\`shell
apis: CRD API 定义，其中包含三类：
    1. kueue：Kueue 核心 API；
    2. config：控制器配比类型 API；
    3. visibility：待排队能见度 API。
keps：Kubernetes Enhancement Proposals，设计文档；
pkg：核心模块，大多数逻辑代码都在此目录下。
cmd：二进制文件入口：
    1. kueue：控制器 manager 的 main 入口；
    2. kubectl：kubectl 插件 CLI；
    3. importer：数据导入工具；
    4. kueueviz：可视化前后端工具；
    5. experimental：skills 调试 runhook。
\`\`\`

其他目录职能见名思义。

## APIs CRD 定义
上面说到，API 资源有三类，分别是：Kueue、config 和 visibility。接下来看下目录下定义了什么东西，有什么作用。

### Kueue API
Kueue 项目中最核心的 API CRD。目录下面有三个版本，分别是：v1alpha1、v1beta1 和 v2beta2。

其中 v1alpha1 已经废弃，相关 api 字段已经全删除掉了。

#### v1beat1 API
旧稳定版 API，和 v2beat2 有同样的 API 定义。不同的是，根据 k8s 的 api 惯例，v1beta1 有一组 conversion 的代码，用来将 v1beta1 转为 v2beat2。

#### v2beat2 API
目前 kueue 项目的主力版本，最新的类型和字端都在这里，是 controller/scheduler 直接使用的 API 版本。以此版本分析 kueue 的 api 定义。

> **Kubernetes 的 API 版本惯例：存一个 hub 版本作权威，其余 spoke 版本通过 conversion 来回。Kueue 的 hub 是 v1beta2，v1beta1 通过*_conversion.go 桥接，v1alpha1 基本退场。**
>

一般来说，k8s 项目的 api 都是和 yaml 文件一一对应的。每一种 CRD 都有一个对应的 *_types.go 文件声明字端属性。分析几个主要的 API Objects 定义。

##### Workload Type
Workload 是用户作业在 Kueue 内部的统一抽象。不论是 batch/Job、JobSet、RayJob 还是 Pod group，各 job framework 都把原始对象适配成 Workload，由 scheduler 做排队与准入。

##### LocalQueue Type
命名空间级别队列。指向一个 ClusterQueue。用户提交的作业先从此处进去。从 namespace 作业到集群资源配额。

##### ClusterQueue Type
集群级队列。配额、预占、借用、准入检查配置。

##### ResoueceFlavor Type
资源 flavor（如不同 GPU 型号/spot 区间），带 label/taint 容差。

##### cohort Type
ClusterQueue 之上的分层组，用于资源跨队列借用与公平共享。

##### Topology Type
TAS 的拓扑定义（如 region→zone→rack→host）

##### Kueue API 流转
\`\`\`shell
用户作业 (Job/JobSet/Ray/...)
          │ job framework 适配
          ▼
     Workload (namespace-scoped)
     -.spec.queueName──────────────────────┐
     -.spec.podSets[*].topologyRequest     │
                                          ▼
     LocalQueue (namespace) ──spec.clusterQueue──▶ ClusterQueue (cluster)
                                                    │ -.spec.cohortName
                                                    │ -.spec.resourceGroups[*].flavors[*].name
                                                    │ -.spec.preemption / flavorFungibility / admissionChecksStrategy
                                                    ▼                         ▼
                                                ResourceFlavor ◀──name── Topology
                                                (nodeLabels/taints,         (levels:
                                                 topologyName)              block→rack→host)
                                                    │
                                          cohort 树 (Cohort 对象, parentName)
                                          跨 CQ 借还 + 公平共享 + cohort 预占

  两阶段准入：QuotaReserved（flavor 选定 + 配额占住，写 status.admission）→ admissionChecks 全部 Ready → Admitted。
\`\`\`

### Config API
不同于 Kueue API，config API 是给 Kueue 控制器自己读取的配置，Kueue 二进制文件启动时，会从此加载配置。

### Visibility API
暴露出去的给运维人员查看 Kueue 状态的 API 接口，哪些 Workload 在排队，排在第几 等。由 Kueue 提供 HTTP Server。

## Kueue Job 流转
前面已经分析过 API 的流转。接下来分析下，Kueue Job 从 kubectl apply 到执行结束都发生了什么，以及代码里是怎么流转的。

整个过程中，主要涉及三个组件：

Job Framework：将 K8s 的 Job（Jobset，Ray） 转为 Kueue Workload；

Core Controller：核心控制器，关注 Kueue API，WorkLoad，CQ，LQ 等；

Scheduler：选择 Flavor，计算配额，做预占 等。

\`\`\`mermaid
  sequenceDiagram
      autonumber
      actor User
      participant API as kube-apiserver
      participant WH as Mutating Webhook (jobframework/base_webhook)
      participant JobR as JobReconciler (pkg/controller/jobs/*)
      participant WL as Workload CRD (apis/kueue/v1beta2)
      participant WLR as WorkloadReconciler (pkg/controller/core)
      participant QC as QueueCache (pkg/cache)
      participant Sched as Scheduler (pkg/scheduler)
      participant ACC as AdmissionCheck Controllers
      participant K8sJob as K8s Job controller
      participant KSch as kube-scheduler
      participant Pod

      Note over User,Pod: 阶段0 控制器启动 cmd/kueue 加载 Configuration 并注册 apis/kueue 与 apis/visibility scheme IntegrationManager 启用 framework

      User->>API: kubectl apply Job (label queue-name=lq)
      API->>WH: create admission (mutating)
      WH-->>API: suspend=true + finalizer (+ TAS gate)
      API-->>User: Job created (suspended 无 Pod)

      Note over JobR,WL: 阶段2 Job 转 Workload 适配
      API->>JobR: reconcile 事件
      JobR->>JobR: loadJob / namespaceSelector / queue-name 检查
      JobR->>JobR: ensureOneWorkload PodSets 转换 + priority + queueName
      JobR->>API: Create Workload (finalizer)
      API->>WL: 写入 etcd

      Note over WLR,QC: 阶段3 Workload 入队
      API->>WLR: reconcile Workload
      WLR->>QC: AddOrUpdateWorkload(wl)
      Note over QC: 按 LocalQueue 到 ClusterQueue 组织 pending heap

      Note over Sched: 阶段4-5 调度与 admit
      loop 每个调度周期
          Sched->>QC: Heads(ctx)
          QC-->>Sched: 队头候选 entries
          Sched->>QC: Snapshot (CQ配额 cohort借用 flavor用量 TAS拓扑)
          Sched->>Sched: flavorassigner 分配 flavor
          alt Fit 有配额可借 cohort
              Sched->>API: patch Workload.status admission + QuotaReserved=True
              API->>WL: 更新
              Sched->>QC: Assume 占用计入缓存
          else Preempt
              Sched->>API: 给 victim 写 Evicted=True reason=Preempted 带 preemptor UID
              Note over Sched: 等被抢者释放后下轮重试
          else NoFit
              Sched->>Sched: 记 inadmissibleReason
          end
      end

      Note over ACC: 阶段6 AdmissionCheck 推进
      WLR->>WLR: 观察到 QuotaReserved=True
      loop 每个 check
          API->>ACC: reconcile
          ACC->>API: 更新 admissionChecks state Pending 到 Ready + podSetUpdates
      end
      WLR->>API: 所有 check Ready 则 SyncAdmittedCondition 设 Admitted=True
      API->>WL: 更新

      Note over JobR: 阶段7 解挂 Job 注入节点约束
      API->>JobR: Workload Admitted 触发再次 reconcile
      JobR->>JobR: startJob 读 flavor nodeLabels tolerations topologyAssignment
      JobR->>API: patch Job 注入 nodeSelector 与 toleration 且 suspend=false
      API-->>API: Job unsuspended

      Note over K8sJob,KSch: 阶段8 Pod 创建与节点绑定由 K8s 原生完成
      API->>K8sJob: Job unsuspended 创建 Pod
      K8sJob->>API: create Pod
      API->>KSch: Pod 入队
      KSch->>KSch: filter score 受 Kueue 注入 nodeSelector 约束
      KSch->>API: bind Pod 到 Node
      API->>Pod: 运行

      Note over JobR: 阶段8续 PodsReady 观察
      API->>JobR: Pod 状态事件
      alt enable WaitForPodsReady
          JobR->>API: 写 PodsReady condition
          opt 超时未 ready
              JobR->>API: stopJob + Evicted reason=PodsReadyTimeout + 指数退避重排队
          end
      end

      Note over Sched: 阶段9 运行中被更高优先级抢占
      opt preemptor 出现
          Sched->>API: victim Workload Evicted=True reason=Preempted
          API->>JobR: reconcile
          JobR->>API: stopJob suspend Job 杀 Pod 清 admission Requeued=True
          Note over QC: Workload 回队尾 下轮重调度
      end

      Note over JobR: 阶段10 结束与清理
      API->>JobR: Job 完成
      JobR->>JobR: job.Finished 为 true
      JobR->>API: workloadfinish.Finish 设 Finished=True Succeeded 或 Failed
      JobR->>JobR: finalizeJob + RemoveFinalizer
      opt config.objectRetentionPolicies.workloads.afterFinished
          WLR->>API: 到期自动删除 Workload
      end
\`\`\`
`;export{e as default};
