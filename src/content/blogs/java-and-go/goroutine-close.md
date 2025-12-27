---
slug: goroutine-close
title: 优雅关闭 GoRoutine
date: 2025-09-02 20:51:10
authors: yuluo
tags: [Go]
keywords: [Go]
---

> 首先需要明确别的是：Go 中并没有显式（主动）停止 GoRoutine 的方式。只能通过主动退出的方式终止协程，通常通过上下文通信的方式实现。
> 那么，为什么 goRoutine 不能被强制停止？
> 1. 资源管理：协程中可能会使用到一些资源，如文件句柄、网络连接等。如果强制停止协程，这些资源可能不会被正确释放，导致资源泄漏；
>    数据一致性：协程中可能会处理共享的数据，如果强制停止协程，可能会导致数据不一致的问题；
> 2. defer 无法执行：协程中可能会使用 defer 语句来执行一些清理操作，如果强制停止协程，这些操作可能不会被执行；
> 3. 代码可维护性降低，开发者可能不知道什么时候 goRoutine 就会被关闭了，导致代码难以维护。

---

> goRoutine 强调的是协同工作的概念，而不是强制。

<!-- truncate -->

## 1. Go Context 

承接上文：[Go context](./golang-context.md) 是 Go 官方发布的用来管理 GoRoutine 的包。可以在协程中传递参数，控制协程的生命周期等。

## 2. GoRoutine 关闭

下面来研究下如何关闭 goRoutine。有以下三种方式：

1. 使用 close 关闭；
2. 使用 select 轮询关闭；
3. 使用 context 关闭。

### 2.1 close 关闭方式

最原始的关闭方式，使用 channel 的 close 机制来发送结束信息。

当一个 channel 被关闭时，如果继续读取数据，会返回一个单位零值和一个 false 的布尔值，goRoutine 可以通过布尔值来退出。

```go
// will also set ok to false for a closed and empty channel.
func close(c chan<- Type)
```

close 关闭 goRoutine：

```go
package main

import (
    "fmt"
    "time"
)

func main() {

    // 创建一个无缓冲的 int 型 channel，用于在主 goroutine 与匿名子 goroutine 之间通信
    ch := make(chan int)

    // 启动一个子 goroutine 负责生产数据
    go func() {
        // 依次发送 0~9 共 10 个整数
        for i := 0; i < 10; i++ {
            ch <- i
        }
        // 发送完毕后关闭 channel，向接收端广播“无更多数据”信号
        close(ch)
    }()

    // 主 goroutine 通过 range 循环不断从 channel 接收数据
    // 当 channel 被关闭且缓冲区为空时，for-range 自动结束
    for v := range ch {
        fmt.Println(v)
        time.Sleep(200 * time.Millisecond)
    }
}
```

#### 2.1.1 优点

简单直观，容易理解。

#### 2.1.2 缺点

只能关闭一次，不能重复关闭；
无法传递更具体的错误信息，例如关闭原因等。

### 2.2 select 轮询机制关闭

select 是 Go 语言中用于处理多个 channel 的机制，它可以同时监听多个 channel，并在其中一个 channel 有数据可读时执行相应的操作。
例如接收到了关闭 channel 的数据，goRoutine 就会退出。 select 会阻塞直到其中一个 case 满足条件，然后执行该 case 中的代码。

在实际应用中，goRoutine 通常会执行任务并监听退出信号，当接收到退出信号时，goRoutine 会退出。

```go
package main

import (
    "fmt"
    "time"
)

func worker(workChan <-chan int, doneChan chan struct{}) {

    fmt.Println("work 启动...")

    for {
        select {
        case v := <-workChan:
            fmt.Println("work 接收到数据:", v)
        case <-doneChan:
            fmt.Println("work 结束...")
            return
        }

        time.Sleep(200 * time.Millisecond)
    }
}

func main() {

    workChan := make(chan int)
    doneChan := make(chan struct{})

    go worker(workChan, doneChan)

    // 模拟业务逻辑发送数据
    for i := 0; i < 10; i++ {
        workChan <- i
    }

    // workChan 执行结束，延迟一秒后发送结束信号
    time.Sleep(1 * time.Second)

    doneChan <- struct{}{}

    fmt.Println("Main 结束...")
}
```

#### 2.2.1 优点

更加灵活，可以传递更具体的错误信息，例如关闭原因等。
使用 goRoutine 有复杂逻辑或者阻塞的场景。

#### 2.2.2 缺点

需要开发者手动维护一个 done chan；
关闭之后，所有监听的 channel 都会被关闭，无法再次使用。

### 2.3 context 关闭

标准做法，所有 go 函数和库都倾向使用 context 关闭 goRoutine。
context 作为函数参数被层层传递，goRoutine 可以通过 context 判断是否需要退出。

> PS: 官方推荐任何一个长期运行的函数第一个参数都应该是 context.Context。

支持较为丰富的功能，例如超时退出，手动取消等。

```go
package main

import (
    "context"
    "fmt"
    "sync"
    "time"
)

func worker(ctx context.Context, wg *sync.WaitGroup) {
    
    defer wg.Done() // 确保 goroutine 退出时通知 main

    fmt.Println("worker 启动...")

    ticker := time.NewTicker(200 * time.Millisecond)
    defer ticker.Stop()

    for {
        select {
        case <-ctx.Done():
            fmt.Println("worker 接收到 Done 信号，退出...")
            return
        case <-ticker.C:
            fmt.Println("worker running...")
        }
    }
}

func main() {
    ctx, cancel := context.WithCancel(context.Background())

    var wg sync.WaitGroup
    wg.Add(1)
    go worker(ctx, &wg)

    // 1 秒后取消
    time.Sleep(time.Second)
    cancel()

    // 等待 worker 优雅退出
    wg.Wait()
    fmt.Println("main 退出")
}
```
