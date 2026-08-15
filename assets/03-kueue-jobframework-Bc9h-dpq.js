const e=`---
id: kueue-03-jobframework
slug: 03-kueue-jobframework
title: Kueue JobFramework 适配层
description: 解析 Kueue JobFramework 如何将异构作业转换为 Workload，并通过统一调和循环接入调度体系。
date: 2026-08-15
authors: yuluo
tags: [Kueue, Kubernetes, 云原生, 源码分析]
keywords: [Kueue, JobFramework, Workload, GenericJob, ComposableJob]
---

> Job 如何成为 Kueue Workload 被 Kueue 接管并统一调度？
>

从 Kueue 的文档中看到，Kueue 要处理很多作业对象，batch/job、JobSet，RayJob，RayService，Kubeflow 全家桶（PytorchJob/TFJob...）Spark 等等一系列的。不难看出，**JobFramework 的作用就是提供一层统一的封装和抽象，将不同的资源都转换为 WorkLoad CRD**，收敛成为一套通用的调和循环，集成房只需要实现一组统一的接口，核心调度，配额，预占逻辑即可。

## JobFramework 抽象定义
下面是将异构作业语义全部翻译成 Kueue Workload 的全部接口：

\`\`\`go
// GenericJob is a required interface that must be implemented by all jobs
// managed by Kueue's jobframework.
type GenericJob interface {
    // Object returns the job instance.
    Object() client.Object

    // IsSuspended returns whether the job is suspended.
    IsSuspended() bool

    // Suspend suspends the job.
    Suspend()

    // RunWithPodSetsInfo injects node affinity and pod set counts extracted
    // from the workload into the job and unsuspends it.
    RunWithPodSetsInfo(ctx context.Context, c client.Client, podSetsInfo []podset.PodSetInfo) error

    // RestorePodSetsInfo restores the original node affinity and pod set counts of the job.
    // It returns whether any change was made. On a pod set count mismatch it logs
    // and returns false without applying any change.
    RestorePodSetsInfo(ctx context.Context, podSetsInfo []podset.PodSetInfo) bool

    // Finished returns whether the job is completed or failed.
    // The message describes the condition, and success indicates completion status.
    // Observed generation of the workload is set by the jobframework.
    Finished(ctx context.Context) (message string, success, finished bool)

    // PodSets builds workload pod sets corresponding to the job.
    PodSets(ctx context.Context, c client.Client) ([]kueue.PodSet, error)

    // IsActive returns true if there are any running pods.
    IsActive() bool

    // PodsReady indicates whether all job-derived pods are ready.
    PodsReady(ctx context.Context, c client.Client) bool

    // GVK returns the GroupVersionKind for the job.
    GVK() schema.GroupVersionKind
}
\`\`\`

从代码注释可以看出来，最核心的接口函数是：PodSets，将作业转为 Workload。

这里是作业转换的 GenericJob 接口定义，对于不同场景用户有自己的定制化需求。Kueue 提供了可选接口定义，在调和循环里通过断言来决定。

\`\`\`go
可选接口(用接口断言分支)

JobWithPodLabelSelector     // 给 TAS/pod 集成提供 label selector
JobWithReclaimablePods      // 弹性收缩时回收配额 (Job/StatefulSet 用)
JobWithCustomStop           // 自定义停止流程 (Job/Pod 自己实现 Stop)
JobWithFinalize             // 结束后清理
JobWithSkip                 // 调和前可跳过
JobWithPriorityClass        // 自定义优先级来源
JobWithCustomValidation     // webhook 自定义校验
JobWithCustomWorkloadConditions / JobWithCustomWorkloadActivation
JobWithManagedBy            // MultiKueue 的 managedBy 协议
JobWithCustomAnnotations   // e.g. RayJob 的 raycluster-generation
ElasticWorkloadNameProvider // 弹性作业 workload 名后缀
TopLevelJob                 // 声明本 Job 直接拥有 Workload (无关 ownerRef)
JobWithCustomQueueNameChange
\`\`\`

### ComposableJob
多对象组合的双轨机制。绝大多数集成(Job/JobSet/Ray...)是"一个 API 对象对应一个 Workload"。但有三种集成是"一个作业由多个 API 对象组成"——Pod group、Deployment、StatefulSet:Kueue 给每个 Pod(或 replica)各建一个 Workload。

\`\`\`go
// ComposableJob is an optional interface that should be implemented by generic jobs
// composed of multiple API objects.
type ComposableJob interface {
    // Load loads all members of the composable job. If removeFinalizers is true,
    // workload and job finalizers should be removed.
    Load(ctx context.Context, c client.Client, key *types.NamespacedName) (removeFinalizers bool, err error)

    // Run unsuspends all members of the ComposableJob and injects node affinity
    // with pod set counts extracted from the workload into all members of the job.
    Run(ctx context.Context, c client.Client, wl *kueue.Workload, podSetsInfo []podset.PodSetInfo, r events.EventRecorder, msg string) error

    // ConstructComposableWorkload builds a new Workload from all members of the ComposableJob.
    ConstructComposableWorkload(ctx context.Context, c client.Client, r events.EventRecorder, labelKeysToCopy, annotationsToCopy sets.Set[string]) (*kueue.Workload, error)

    // ListChildWorkloads returns all workloads related to the composable job.
    ListChildWorkloads(ctx context.Context, c client.Client, parent types.NamespacedName) (*kueue.WorkloadList, error)

    // FindMatchingWorkloads returns related workloads: the matching ComposableJob workload
    // and any duplicates that should be deleted.
    FindMatchingWorkloads(ctx context.Context, c client.Client, r events.EventRecorder) (match *kueue.Workload, toDelete []*kueue.Workload, err error)

    // Stop implements the custom stop procedure for ComposableJob.
    Stop(ctx context.Context, c client.Client, podSetsInfo []podset.PodSetInfo, stopReason StopReason, eventMsg string) ([]client.Object, error)

    // ForEach calls f on each member of the ComposableJob.
    ForEach(f func(obj runtime.Object))

    // EnsureWorkloadOwnedByAllMembers ensures that the provided workload is owned by all specified members.
    // If not, it adds missing owner references and returns an error if any issue occurs.
    EnsureWorkloadOwnedByAllMembers(ctx context.Context, c client.Client, r events.EventRecorder, workload *kueue.Workload) error

    // EquivalentToWorkload checks whether the provided workload is equivalent to the target workload.
    // Returns true if they are equivalent and an error if any issues occur.
    EquivalentToWorkload(ctx context.Context, c client.Client, wl *kueue.Workload) (bool, error)
}
\`\`\`

> batch/Job 的世界里:1 个 Job 对象 → 1 个 Workload(Job 的 Pod template 里 N 个 Pod 都算同一个 PodSet 的 count)。
>
> Pod 集成的世界里:1 个 Pod = 1 个 Workload。一个 "pod group"(比如 8 卡训练的 8 个 Pod)是 8 个独立 Pod 对象,对应 8 个 Workload,它们靠 kueue.x-k8s.io/pod-group-name 标签串成一组,Kueue 给整组一起做准入。

## 集成注册（IntergrationManager）
Kueue 的 Integration Manager 定义了集成组件长什么样，每个集成组件对外暴露一个 IntegrationCallbacks，用来登记。

\`\`\`go
type IntegrationCallbacks struct {
	// NewJob creates a new instance of job
	NewJob func() GenericJob
	// GVK holds the schema information for the job
	// (this callback is optional)
	GVK schema.GroupVersionKind
	// NewReconciler creates a new reconciler
	NewReconciler ReconcilerFactory
	// NewAdditionalReconcilers creates additional reconcilers
	// (this callback is optional)
	NewAdditionalReconcilers []ReconcilerFactory
	// SetupWebhook sets up the framework's webhook with the controllers manager
	SetupWebhook func(mgr ctrl.Manager, opts ...Option) error
	// JobType holds an object of the type managed by the integration's webhook
	JobType runtime.Object
	// SetupIndexes registers any additional indexes with the controllers manager
	// (this callback is optional)
	SetupIndexes func(ctx context.Context, indexer client.FieldIndexer) error
	// AddToScheme adds any additional types to the controllers manager's scheme
	// (this callback is optional)
	AddToScheme func(s *runtime.Scheme) error
	// CanSupportIntegration returns true if the integration meets any additional condition
	// like the Kubernetes version.
	CanSupportIntegration func(opts ...Option) (bool, error)
	// The job's MultiKueue adapter (optional)
	MultiKueueAdapter MultiKueueAdapter
	// The list of integration that need to be enabled along with the current one.
	//
	// Deprecated: Use ImplicitlyEnabledFrameworkNames instead.
	DependencyList []string
	// The list of integrations implicitly enabled as dependencies of the integration.
	ImplicitlyEnabledFrameworkNames []string
}
\`\`\`

各个集成对应的 RegisterIntegration 函数：

\`\`\`go
func RegisterIntegration(m *jobframework.IntegrationManager) error {
	return m.RegisterIntegration(FrameworkName, jobframework.IntegrationCallbacks{
		SetupIndexes:      SetupIndexes,
		NewJob:            NewJob,
		NewReconciler:     NewReconciler,
		SetupWebhook:      SetupWebhook,
		JobType:           &batchv1.Job{},
		MultiKueueAdapter: &multiKueueAdapter{},
	})
}
\`\`\`

\`pkg/controller/jobs/jobs.go:48\` 在一个 \`RegisterIntegrations(manager)\`里把 14 个 kueue 支持的作业类型 built-in 全部注册进去。

\`\`\`go
// RegisterIntegrations registers all built-in job integrations with manager.
func RegisterIntegrations(manager *jobframework.IntegrationManager) error {
	for _, register := range []func(*jobframework.IntegrationManager) error{
		appwrapper.RegisterIntegration,
		deployment.RegisterIntegration,
		job.RegisterIntegration,
		jobset.RegisterIntegration,
		kubeflowjobs.RegisterIntegrations,
		leaderworkerset.RegisterIntegration,
		mpijob.RegisterIntegration,
		pod.RegisterIntegration,
		raycluster.RegisterIntegration,
		rayjob.RegisterIntegration,
		rayservice.RegisterIntegration,
		sparkapplication.RegisterIntegration,
		statefulset.RegisterIntegration,
		trainjob.RegisterIntegration,
	} {
		if err := register(manager); err != nil {
			return err
		}
	}
	return nil
}
\`\`\`

继而在 kueue main.go 中用 var 创建单例 IntegrationManager。运行时启动那些集成实现由 config API 里的 \`onfiguration.Integrations.Frameworks\` 字端控制，按需开启。

## 装配
Integraton 创建完成时，在 manager 启动时装配成 controller + webhook 的形式，对每个已启用的集成,装配流程有两条岔路,取决于 API server 上现在有没有这个 CRD：

\`\`\`mermaid
flowchart TD
      A["ReconcileGenericJob(job GenericJob)"] --> B["loadJob: job.(ComposableJob)?"]
      B -->|是| B1["cJob.Load 多对象加载"]
      B -->|否| B2["client.Get 单对象加载"]

      B1 --> C
      B2 --> C["守卫: job.(JobWithSkip)?"]
      C -->|"ok 且 Skip()=true"| X1["return 提前结束"]
      C -->|"否"| D["job.(TopLevelJob)?"]

      D -->|"ok 且 IsTopLevel()"| E2["isTopLevelJob=true 直接顶层"]
      D -->|否| E1["FindAncestorJob 找祖先"]

      E1 --> F
      E2 --> F["queue-name / namespaceSelector 检查"]

      F -->|"非顶层子作业"| G["shouldSuspendChildJob"]
      G --> X2["return"]

      F -->|"顶层作业"| H["ensureOneWorkload"]
      H --> H1["job.(ComposableJob)? FindMatching/ConstructComposable"]
      H --> H0["否则普通 ConstructWorkload"]

      H1 --> I["能力增强分支"]
      H0 --> I

      I --> I1["job.(JobWithCustomWorkloadConditions)? 注入 condition"]
      I1 --> I2["job.(JobWithCustomWorkloadActivation)? 调 active"]
      I2 --> I3["job.(JobWithReclaimablePods)? 更新回收配额"]

      I3 --> J["状态判定分支"]
      J -->|"wl finished"| K1["finalizeJob"]
      J -->|"Evicted"| K2["stopJob"]
      K2 --> S["stopJob: job.(JobWithCustomStop)? 自定义 / 否则 Suspend+Restore"]
      J -->|"IsSuspended"| L["admitted?"]

      L -->|"admitted"| M["startJob"]
      M --> M1["job.(ComposableJob)? cj.Run"]
      M1 --> M2["否则 job.RunWithPodSetsInfo"]
      M2 --> M3["MultiKueue: ShouldSkipLocalExecution?"]
      L -->|"未 admitted"| N["等待 return"]
      J -->|"running 且 admitted"| N
\`\`\`

+ Kueue 不假设外部 CRD 一定先于自己安装，比如 JobSet 的 CRD 由 JobSet Operator 提供，启动顺序无法保证；
+ Kueue 启动时 CRD 还没装上,mutating webhook 必须立刻注册(否则用户在此期间创建的 JobSet 不被挂起,Pod 抢跑),但 controller 可以等；
+ waitForAPI 起一个后台 goroutine 轮询,CRD 出现后再装 controller。

## 调和循环
装配完成之后，Controller 进入调合阶段，无论那种集成都会进入 \`JobReconciler.ReconcileGenericJob\`调谐。这是整个 jobframework 的核心。

\`\`\`mermaid
  flowchart TD
      A["遍历每个已启用集成"] --> B{"CanSupportIntegration?"}
      B -->|不支持| X1["返回错误 装配失败"]
      B -->|支持| C["apiutil.GVKForObject + restMappingExists"]
      C --> D{"API server 有该 CRD?"}
      D -->|有| E["setupControllerAndWebhook<br/>立刻装 controller + webhook"]
      D -->|无 NoMatch| F["先 SetupWebhook 注册 mutating webhook<br/>防止作业抢跑"]
      F --> G["go waitForAPI 后台轮询 CRD 出现"]
      G --> H{"CRD 出现?"}
      H -->|出现| E
      H -->|未出现| G
      D -.->|"未启用的集成"| N["注册 NoopWebhook 占位"]
\`\`\`

### startJob 节点约束落地
Workload 被 scheduler 准入（Admitted=True）后，触发 JobReconciler 再次调和，命中 \`JobReconciler.ReconcileGenericJob\` 的 suspended 分支之后 → startJob。

1. getPodSetsInfoFromStatus 从 status.admission.podSetAssignments 读出 flavor 的 nodeLabels、tolerations、topologyAssignment 的节点选择器。

2. composable 走 cj.Run(:1472),普通走 job.RunWithPodSetsInfo(:1477)——把 flavor 节点约束回写进 Job 的 Pod template,再 suspend=false。

3. MultiKueue 检查 ShouldSkipLocalExecution(:1459):若该 workload 走远端集群,本地不启动 Pod。

**Kueue 把"配额锁定"与"物理节点"绑在一起的动作：Kueue 注入的 nodeSelector/toleration 把 Pod 限制在配额对应的 ResourceFlavor 节点上,然后 K8s 原生 kube-scheduler 才真正把 Pod 绑到具体节点。Kueue 自己不绑节点。**

### stopJob 驱逐回退
更高优先级抢占或 PodsReadyTimeout 触发 Evicted → stopJob：

1. 优先 JobWithCustomStop.Stop(:1494,Job/Pod 都自定义),否则走 generic Suspend() + RestorePodSetsInfo 还原原始 nodeAffinity(避免下次跑带着上次 flavor 的节点选择器)。

2. composable 走其专属 Stop(:1502)。

3. 清 status.admission 配额、置 Requeued=True,Workload 回队尾等下一轮调度。
`;export{e as default};
