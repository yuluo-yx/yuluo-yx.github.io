---
slug: go-dlv-debug-containers
title: 线上 Debug Go 程序
date: 2026-05-05 20:47:10
authors: yuluo
tags: [Go]
keywords: [Go]
image: /img/golang/3.png
---

## 需求背景

Go 没有和 Java Arthas 一样的工具，没办法线上 debug Go 程序。 对于一些依赖项较多，本地难以启动的服务：

+ Debug 只能看日志；
+ 每次加日志都要编译，打镜像，部署。
+ 。。。。。。

### Go Debug 工具

> [https://github.com/go-delve/delve](https://github.com/go-delve/delve)
>

安装：`go get -u github.com/go-delve/delve/cmd/dlv@2.16.1`

## Dlv 用法
### 静态程序
> 用的不多。
>

```go
package main

import "fmt"

func main() {
  m := test()
  fmt.Printf("output: %v", m["1"])

  for {
  }
}

func test() map[string]any {

  return map[string]any{
    "1": 1,
  }
}
```

debug

```shell
# yuluo @ 💯 Everything wins. in ~/project/indi/go-playground/dlv [13:13:08]
$ dlv debug main.go
Type 'help' for list of commands.

# 断点
# 有包路径时：b package/xx/xxx/xxx.go:line
# 或者 b module.FuncionName
(dlv) b main.go:7
Breakpoint 1 set at 0x104283920 for main.main() ./main.go:7

# 继续运行程序，直到遇到断点或程序结束
(dlv) c
> [Breakpoint 1] main.main() ./main.go:7 (hits goroutine(1):1 total:1) (PC: 0x104283920)
     2:
     3: import "fmt"
     4:
     5: func main() {
     6:         m := test()
=>   7:         fmt.Printf("output: %v", m["1"])
     8:
     9:         for {
    10:         }
    11: }
    12:

# 单步 step 下一步 next
(dlv) s
output: 1> main.main() ./main.go:9 (PC: 0x1042839b8)
     4:
     5: func main() {
     6:         m := test()
     7:         fmt.Printf("output: %v", m["1"])
     8:
=>   9:         for {
    10:         }
    11: }
    12:
    13: func test() map[string]any {
    14:
(dlv)

# 输出栈信息
(dlv) stack
0  0x0000000104283920 in main.main
   at ./main.go:7
1  0x0000000104202b74 in runtime.main
   at /Users/yuluo/go/pkg/mod/golang.org/toolchain@v0.0.1-go1.24.4.darwin-arm64/src/runtime/proc.go:283
2  0x0000000104236374 in runtime.goexit
   at /Users/yuluo/go/pkg/mod/golang.org/toolchain@v0.0.1-go1.24.4.darwin-arm64/src/runtime/asm_arm64.s:1223

# 输出本地变量信息
(dlv) locals
m = map[string]interface {} [...]

# 包变量
locals [pattern]：显示所有局部变量，可以传入pattern根据名称过滤
vars [pattern]：显示所有全局变量，可以传入pattern根据名称过滤
args [pattern]：显示当前函数的参数，可以传入pattern根据名称过滤
p [var]：显示某个变量的具体值，如果变量是结构体，这会详细显示结构体的所有字段
```

### 运行程序
> 已经运行起来的程序。
>

```go
package main

import (
    "fmt"
    "log"
    "net/http"
)

func simpleHandler(w http.ResponseWriter, r *http.Request) {
    sum := 0
    for i := 1; i <= 5; i++ {
        sum += i
    }
    _, err := fmt.Fprintf(w, "sum = %d\n", sum)
    if err != nil {
        log.Printf("write response: %v", err)
    }
}

func main() {
    http.HandleFunc("/sum", simpleHandler)
    err := http.ListenAndServe(":1234", nil)
    if err != nil {
        log.Fatalf("listen failed: %v", err)
    }
}
```

```shell
# 启动进程
go build -gcflags "-N -l" main.go

# -N -l 关闭编译器优化，看到更多的变量信息

# PID
$ lsof -i:1234
# or ps aux
COMMAND   PID  USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
main    73296 yuluo    3u  IPv6 0x24061e16c986a231      0t0  TCP *:search-agent (LISTEN)

# attach
$ dlv attach 73296
Warning: no debug info found, some functionality will be missing such as stack traces and variable evaluation.
Type 'help' for list of commands.
(dlv)

# 断点 handler 函数
break main.simpleHandler

# 发送请求触发函数
curl 127.0.0.1:1234/sum

# 执行函数
(dlv) c
> [Breakpoint 1] main.simpleHandler() ./dlv/main.go:9 (hits total:1) (PC: 0x100ea9e20)
     4:         "fmt"
     5:         "log"
     6:         "net/http"
     7: )
     8:
=>   9: func simpleHandler(w http.ResponseWriter, r *http.Request) {
    10:         sum := 0
    11:         for i := 1; i <= 5; i++ {
    12:                 sum += i
    13:         }
    14:         _, err := fmt.Fprintf(w, "sum = %d\n", sum)

# next
(dlv) n
> main.simpleHandler() ./dlv/main.go:11 (PC: 0x100ea9e34)
     6:         "net/http"
     7: )
     8:
     9: func simpleHandler(w http.ResponseWriter, r *http.Request) {
    10:         sum := 0
=>  11:         for i := 1; i <= 5; i++ {
    12:                 sum += i
    13:         }
    14:         _, err := fmt.Fprintf(w, "sum = %d\n", sum)
    15:         if err != nil {
    16:                 log.Printf("write response: %v", err)
(dlv) n
> main.simpleHandler() ./dlv/main.go:12 (PC: 0x100ea9e44)
     7: )
     8:
     9: func simpleHandler(w http.ResponseWriter, r *http.Request) {
    10:         sum := 0
    11:         for i := 1; i <= 5; i++ {
=>  12:                 sum += i
    13:         }
    14:         _, err := fmt.Fprintf(w, "sum = %d\n", sum)
    15:         if err != nil {
    16:                 log.Printf("write response: %v", err)
    17:
# 查看变量
(dlv) p sum
15

(dlv) locals
sum = 15
err = error nil

(dlv) args
w = net/http.ResponseWriter(*net/http.response) 0x1400019dae0
r = ("*net/http.Request")(0x14000192000)

(dlv) p r.Header
net/http.Header [
        "User-Agent": [
                "curl/8.7.1",
        ],
        "Accept": ["*/*"],
]
(dlv)
```

### Tips
如果看到了变量，但是没有变量输出，是因为 Go 编译器 `-w -s` 优化导致的。

```shell
(dlv) list
> main.simpleHandler() ./dlv/main.go:14 (PC: 0x100ea9e58)
     9: func simpleHandler(w http.ResponseWriter, r *http.Request) {
    10:         sum := 0
    11:         for i := 1; i <= 5; i++ {
    12:                 sum += i
    13:         }
=>  14:         _, err := fmt.Fprintf(w, "sum = %d\n", sum)
    15:         if err != nil {
    16:                 log.Printf("write response: %v", err)
    17:         }
    18: }
    19:
(dlv) args
Command failed: unable to find locals: no debug information present in binary
(dlv) vars
(no vars)
```

## Debug 远程服务
准备一个 go web 服务。

```go
package main

import (
  "log"
  "net/http"

  "github.com/gin-gonic/gin"
)

func main() {
  // Create a Gin router with default middleware (logger and recovery)
  r := gin.Default()

  // Define a simple GET endpoint
  r.GET("/ping", func(c *gin.Context) {
    // Return JSON response
    c.JSON(http.StatusOK, gin.H{
      "message": "pong",
    })
  })

  // Start server on port 8080 (default)
  // Server will listen on 0.0.0.0:8080 (localhost:8080 on Windows)
  if err := r.Run(); err != nil {
    log.Fatalf("failed to run server: %v", err)
  }
}
```

`curl [http://localhost:8080/ping](http://localhost:8080/ping)` -> `{"message":"pong"}`

### Docker 服务
将上面的 gin 服务打包为一个 docker 镜像：

```dockerfile
# Build stage
FROM golang:1.25.8 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server .

# Runtime stage
FROM busybox:latest

WORKDIR /app

COPY --from=builder /app/server .

EXPOSE 8080

CMD ["./server"]
```

`make docker-run`，`curl http://ip:port`-> `{"message": "pong"}`

用 dlv 包装之后的 docker 镜像：

```dockerfile
# Build stage
FROM golang:1.25.8 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Do NOT strip debug symbols, keep DWARF info for delve
RUN CGO_ENABLED=0 GOOS=linux go build -gcflags="all=-N -l" -o /app/server .

# Debug stage
FROM golang:1.25.8

# Install delve debugger
RUN go install github.com/go-delve/delve/cmd/dlv@latest

WORKDIR /app

COPY --from=builder /app/server .
# Copy source for breakpoint mapping (optional but helpful)
COPY . .

# App port + Delve headless port
EXPOSE 8080 2345

# Run app under delve headless, accept multi-client connections
CMD ["dlv", "exec", "./server", "--headless", "--listen=:2345", "--api-version=2", "--accept-multiclient", "--log"]
```

进入 debug 镜像之后，查看进程，dlv 服务和 go server 正常：

```shell
root@37e28780bbd1:/app# ps aux
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.1  0.0 7802108 48440 ?       Ssl  08:24   0:00 dlv exec ./server --headless --listen=:2345 --api-version=2 --accept-multiclient --log
root          13  0.0  0.0 5806160 12800 ?       Ssl  08:24   0:00 /go/bin/dlv ** telemetry **
root          19  0.0  0.0  15812     0 ?        t    08:24   0:00 /app/server
root          47  0.1  0.0   4320  3584 pts/0    Ss   08:28   0:00 bash
root          55  0.0  0.0   6388  3584 pts/0    R+   08:28   0:00 ps aux
root@37e28780bbd1:/app#
```

#### Goland debug
docker 服务启动之后，在 Goland 添加 Go Remote；

![](/img/golang/1.png)

填写 docker dlv 服务的 ip 和 （**dlv 调试 port**）port：

![](/img/golang/2.png)

断点 debug：

![](/img/golang/3.png)

输出变量成功！

#### Vscode debug
在当前项目的 `.vscode/launch.json`中添加 launch.json ，如果有需要可以添加 tasks.json 和 settings.json 配置。

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run",
      "type": "go",
      "request": "launch",
      "mode": "debug",
      "program": "${workspaceFolder}",
      "output": "${workspaceFolder}/bin/server"
    },
    {
      "name": "Debug (Docker)",
      "type": "go",
      "request": "attach",
      "mode": "remote",
      "remotePath": "/app",
      "port": 22345,
      "host": "30.177.110.51",
      "showLog": true,
      "trace": "verbose",
      "logOutput": "rpc",
      "substitutePath": [
        {
          "from": "${workspaceFolder}",
          "to": "/app"
        }
      ]
    },
    {
      "name": "Debug (Kubernetes)",
      "type": "go",
      "request": "attach",
      "mode": "remote",
      "remotePath": "/app",
      "port": 22345,
      "host": "localhost",
      "showLog": true,
      "trace": "verbose",
      "logOutput": "rpc",
      "substitutePath": [
        {
          "from": "${workspaceFolder}",
          "to": "/app"
        }
      ]
    }
  ]
}
```

添加的运行配置会在这里显示：

![](/img/golang/4.png)

##### Vscode 本地 debug

![](/img/golang/5.png)

##### Vscode Docker dlv debug

更改对应的 ip 和 port 配置，和上面本地 debug 一样启动即可：

![](/img/golang/6.png)

### k8s
正常启动的 crd 文件：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: debug-server
  labels:
    app: debug-server
spec:
  replicas: 1
  selector:
    matchLabels:
      app: debug-server
  template:
    metadata:
      labels:
        app: debug-server
    spec:
      containers:
        - name: debug-server
          image: debug-server:latest
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: 50m
              memory: 64Mi
            limits:
              cpu: 200m
              memory: 128Mi
          livenessProbe:
            httpGet:
              path: /ping
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ping
              port: 8080
            initialDelaySeconds: 3
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: debug-server
spec:
  selector:
    app: debug-server
  ports:
    - name: http
      port: 8080
      targetPort: 8080
      nodePort: 30080
  type: NodePort
```

用 dlv 包装之后的 crd（其实没啥变化，用的镜像还是 docker debug 的）：

```shell
apiVersion: apps/v1
kind: Deployment
metadata:
  name: debug-server-debug
  labels:
    app: debug-server-debug
spec:
  replicas: 1
  selector:
    matchLabels:
      app: debug-server-debug
  template:
    metadata:
      labels:
        app: debug-server-debug
    spec:
      containers:
        - name: debug-server
          image: debug-server:debug
          ports:
            - containerPort: 8080
            - containerPort: 2345
          securityContext:
            capabilities:
              add:
                - SYS_PTRACE
          env:
            - name: GIN_MODE
              value: debug
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
---
apiVersion: v1
kind: Service
metadata:
  name: debug-server-debug
spec:
  selector:
    app: debug-server-debug
  ports:
    - name: http
      port: 8080
      targetPort: 8080
      nodePort: 30080
    - name: delve
      port: 2345
      targetPort: 2345
      nodePort: 32345
  type: NodePort
```
