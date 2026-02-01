const n=`---
slug: go-context
title: go context
date: 2025-08-18 20:04:11
authors: yuluo
tags: [Go]
keywords: [Go]
---

context 主要为了解决在并发模型下，多个 Goroutine 之间**取消信号，超时，数据传递**等问题。

<!-- truncate -->
## 1. 用途

在系统中，一个用户的请求，可能会涉及到多个服务之间的调用，请求 API，调用数据库等。例如用户登录请求：

1. controller 层接受请求；
2. 调用 service 层，进行用户登录验证；
3. service 层调用 user 模块的 API，查询用户信息；
4. user 模块调用数据库，查询用户信息。

在登录过程中，我们可能希望设置超时时间等其他功能属性，例如

1. 在 3s 内，用户登录成功，则返回成功，否则返回失败；
2. 加入 traceId，方便排查问题；
3. 加入取消信号，当用户取消登录时，停止后续操作等。

context 就可以完美解决以上问题。

## 2. Context 包分析

以下分析基于 Go SDK 1.24.6。

### 2.1 Context 接口

\`\`\`go
// 本质是一个接口
type Context interface {

    // 获取 context 的截止时间。
    // ok 为 false 表示没有设置截止时间
    Deadline() (deadline time.Time, ok bool)

    // 核心方法，返回一个只读 channel，当 context 被取消时，会关闭 Done channel。
    // 下游的 Goroutine 只需要在 select 中监听 Done channel，即可感知到 context 被取消。
    // 从而做出停止动作
    Done() <-chan struct{}

    // 返回 context 被取消的原因（Done channel 取消的原因）
    // context.Canceled：context 被主动取消。
    // context.DeadlineExceeded：context 因超时而被取消。
    Err() error

    // 从 context 中获取一个键值对。
    // 用来传递请求范围的上下文数据，例如 traceId，用户信息等。
    Value(key any) any
}
\`\`\`

### 2.2 Context 实现

在开发中，不直接或者很少使用 Context 接口，而是使用 context 包提供的派生函数来使用 context。

1. context.Background(): 通常在 main 函数、初始化和测试代码中创建，作为所有 context 的根节点。它永远不会被取消；
2. context.TODO(): 当你不确定该用哪个 Context，或者当前函数以后会更新以便接收一个 Context 参数时，可以使用它。它和 Background 类似；
3. context.WithCancel(parent Context): 基于一个父 context 创建一个新的 context 和一个 cancel 函数。调用 cancel 函数，新的 context 就会被取消；
4. context.WithTimeout(parent Context, timeout time.Duration): 和 WithCancel 类似，但它多了一个超时时间。时间一到，自动取消；
5. context.WithValue(parent Context, key, val any): 创建一个携带键值对的 context。

## 3. 使用示例

### 3.1 键值对传递

\`\`\`go
// context 传递上下文信息
package main

import (
    "context"
    "fmt"
)

type TraceId string

const TraceIdKey = TraceId("trace_id")

func main() {

    ctx := context.WithValue(context.Background(), TraceIdKey, "main start...")

    // 第一跳
    processOne(ctx)
}

func processOne(ctx context.Context) {

    // 第二跳
    processTwo(ctx)
}

func processTwo(ctx context.Context) {

    traceId, _ := ctx.Value(TraceIdKey).(string)

    // 结束
    fmt.Println(traceId)
}
\`\`\`

### 3.2 超时取消

\`\`\`go
// 调用外部接口时，可能会出现超时的情况，这时候我们可以用 context 来控制。

package main

import (
    "context"
    "fmt"
    "time"
)

func callAPI(ctx context.Context) error {

    fmt.Println("开始调用 API...")

    // 模拟一个耗时很长的操作
    if err := longRunningTask(ctx); err != nil {
        return err
    }

    fmt.Println("API 调用完成。（如果看到此消息，说明未超时）")
    return nil
}

func longRunningTask(ctx context.Context) error {

    select {
    // 模拟这个任务需要 5 秒才能完成
    case <-time.After(5 * time.Second):
        fmt.Println("任务执行完毕！")
        return nil
    // 在任务完成前，检查 context 是否被取消
    case <-ctx.Done():
        return fmt.Errorf("任务被中断: %w", ctx.Err())
    }
}

func main() {
    // 创建一个 3 秒后会超时的 context
    ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
    defer cancel()

    if err := callAPI(ctx); err != nil {
        fmt.Printf("API 调用出错: %v\\n", err)
    }
}
\`\`\`

### 3.3 主动取消

\`\`\`go
// 建立一个主动取消的context
// 当我们需要停止一个长时间运行的任务时，使用 context 可以方便地发出取消信号来结束任务。

package main

import (
    "context"
    "fmt"
    "time"
)

func monitor(ctx context.Context, name string) {

    fmt.Printf("【%s】监控启动...\\n", name)

    for {
        select {
        case <-ctx.Done():
            // 当 ctx.Done() 被关闭时，说明收到了取消信号
            fmt.Printf("【%s】收到取消信号，监控停止。原因: %s\\n", name, ctx.Err())
            return
        default:
            // 模拟执行监控任务
            fmt.Printf("【%s】正在监控中...\\n", name)
            time.Sleep(1 * time.Second)
        }
    }
}

func main() {

    // 创建一个可以被取消的根 context
    ctx, cancel := context.WithCancel(context.Background())

    // 启动一个 goroutine 执行监控
    go monitor(ctx, "监控 1 号")

    // 让监控运行 5 秒
    time.Sleep(5 * time.Second)

    // 5 秒后，手动调用 cancel 函数，发出取消信号
    fmt.Println("主程序：发出取消信号！")
    cancel()

    // 再等待一小会，确保 goroutine 已经退出
    time.Sleep(1 * time.Second)

    fmt.Println("主程序：退出。")
}
\`\`\`

### 3.4 HTTP 服务器优雅关闭

\`\`\`go
// context 的经典用法，Go 的 http.Server 中，每个请求
// 的 http.Request 都包含一个 context.Context
// 可以用来传递请求级别的值，以及取消信号
// 当客户端断开连接时，ctx.Done() 会收到信号
// Gin 基于 context 接口实现了自己的 gin.Context，用来处理请求和响应

package main

import (
    "fmt"
    "log"
    "net/http"
    "time"
)

func slowHandler(w http.ResponseWriter, r *http.Request) {

    // r.Context() 请求绑定的 context
    ctx := r.Context()

    log.Println("Handler 开始处理请求")
    defer log.Println("Handler 处理请求结束")

    select {
    case <-time.After(10 * time.Second):
        // 模拟一个耗时 10 秒的操作
        fmt.Fprintln(w, "请求处理完毕！")
        log.Println("请求处理完毕！")
    case <-ctx.Done():
        // 如果客户端断开连接，ctx.Done() 会收到信号
        err := ctx.Err()
        log.Printf("请求被客户端取消: %v", err)
        http.Error(w, err.Error(), http.StatusRequestTimeout)
    }

}

func main() {

    http.HandleFunc("/slow", slowHandler)

    log.Println("服务器启动，监听端口 :8080")
    log.Println("请在浏览器访问 http://localhost:8080/slow，然后在 10 秒内关闭或停止加载页面")

    if err := http.ListenAndServe(":8080", nil); err != nil {
        log.Fatal(err)
    }
}
\`\`\`
`;export{n as default};
