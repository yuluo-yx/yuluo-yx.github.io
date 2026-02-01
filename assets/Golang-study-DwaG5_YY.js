const n=`---
slug: study-go
date: 2023-11-02 10:19:40
title: 简单记录下 Go 的入门知识
authors: yuluo
tags: [Go]
keywords: [Go]
---

<!-- truncate -->

# Golang

> 本文章中记录一些 Golang 中的语言特性，包括 init 函数，面向对象，defer 关键字，并发编程等。

## init 函数与导包

> init函数的执行流程是早于main函数的，如果想在main函数执行前做一些事情，可以在init函数中去完成

\`\`\`golang
import (
 "fmt",
    // .表示 导入当前包中的所有方法到当前的包中，直接使用API调用 不要轻易使用。避免方法名重复 无法识别
    . "html/template",
    // _ 表示 导入并不使用 但是会执行当前包的init方法
    _ "text/template",
    // myhttp 作为"net/http"包的别名
 myhttp "net/http"
)
\`\`\`

## 指针

Golang 的指针和 C 语言类型，类型指针不能进行偏移和运算，只需要记住两个符号：\`&\`（取地址）和\`*\`（根据地址取值）

示例如下：

\`\`\`golang
var var-name *var-type

// var-type： 指针类型

// var-name：指针变量名

// 指定变量作为一个指针
// 代表取指针的值，直接输出变量是地址值
\`\`\`

指针交换数字值示例：

\`\`\`golang
package main

import "fmt"

func swap(pa *int, pb *int) {
   var temp int
   temp = *pa // temp = main::a
   *pa = *pb  // main::a = main::b
   *pb = temp // main::b = temp
}

func main() {
 var a int = 10
 var b int = 20

 var ia *int
 ia = &a
 fmt.Printf("a = %v\\n", a)
 fmt.Printf("&a = %v\\n", &a)
 fmt.Printf("ia = %v\\n", ia)
 fmt.Printf("*ia = %v\\n", *ia)

 fmt.Println("----------------------------------")

 fmt.Println("a = ", a, "b = ", b)

 // swap
 swap(&a, &b)

 fmt.Println("a = ", a, "b = ", b)
}
\`\`\`

## defer 执行顺序

> 表示一个函数在执行之后，结束之前执行的时机。

## golang 函数

函数在go语言中是一级公民，所有的功能单元都定义在函数中，可以重复使用，函数包含函数的名称。参数列表和返回值类型，共同构成函数的签名（signature）

### **go语言 函数特性**

- 普通函数，匿名函数（没有名称的函数），方法（定义在struct上的函数）

- 不允许函数重载，不允许函数同名

- 函数不能嵌套函数，但可以嵌套匿名函数

- 函数是一个值，可以将函数赋值给变量，使得这个变量也成为函数

- 函数可以作为参数传递给另一个函数

- 函数的返回值可以是一个函数

- 函数参数可以没有名称

- 函数在传递参数的时候，会先拷贝参数的副本，再将副本传递给函数

  \`\`\`java
  func test() (name string, age int)} {

      name = yuluo
      age = 20

      return
  }

  // 变长参数
  func f3(args... int) {
      for _, v := range args {
          fmt.Println("v := %d ", v)
      }
  }

  // 函数类型定义
  func sum(a int, b int) int {
      return a + b
  }

  func max(a, b int) int {
      if a > b {
          return a
      }

      return b
  }

  func main() {
      f3(1, 2, 3, 4, 7, 8)

      f3(1, 3, 4)

      // 定义函数类型
      type f1 func(int, int) int
      var ff f1

      // 赋值函数类型的变量
      ff = sum
   ff(1, 2)

      ff = max
      ff = max(1, 2)
  }
  \`\`\`

### **golang 高阶函数**

一个函数作为函数的参数，传递给另外一个函数，也可以作为一个函数的返回值返回

\`\`\`golang
package main

func sayHello(name string) {
    fmt.Println("Hello, %s" + name)
}

//函数作为参数
func f1(name string, f func(string)) {
    f(name)
}

func add(a, b int) int {
    return a + b
}

func sub(a, b int) int {
    return a - b
}

func operation(op string) func(int, int) int {
 switch op {
 case "+":
  return add
 case "-":
  return sub
 default:
  return nil
 }
}

func main() {

    // 函数作为参数
    f1("yuluo", sayHello)

    // 函数作为返回值
    ff := operation("+")
    r := ff(1, 2)
    fmt.Println(r)

    ff := operation("-")
    r := ff(1, 2)
    fmt.Println(r)

}
\`\`\`

### **golang匿名函数**

golang函数不能嵌套，但是可以通过在函数内部定义匿名函数，实现简单功能的调用

\`\`\`go
语法：func(参数列表)(返回值)
也可以没有参数和返回值

func main() {
    // 此处没有函数名称 func max(a, b int) int {}
    max := func(a, b int) int {
        if a > b {
            return a
        }
        return b
    }

    r := max(1, 2)
    fmt.Println(r)

    // 自己调用自己
    r = func(a, b int) int {
        if a > b {
            return a
        }
        return b
    }(1, 2)
    fmt.Println(r)

}
\`\`\`

### **golang 闭包**

\`\`\`golang
func add() func(y int) int {
    // x 的作用域是和函数的生命周期绑定在一起的
    var x int
    return func(y int) int {
        return x += y
    }
}

func main() {

    var f = add()
    fmt.Println(f(10))
    fmt.Println(f(20))
    fmt.Println(f(30))

}
\`\`\`

## OOP 面向对象

### 类型定义和别名

> 类型定义仅仅只在代码中存在，在编译完成之后不会存在类型别名

\`\`\`golang
package main

func main() {

    type MyInt int

    var i MyInt
    i = 00
}
\`\`\`

### 结构体

> go 语言中没有面向对象的概念，但是可以使用结构体来实现，面向对象的一些特性。例如：封装，继承和多态等特性

\`\`\`golang
package main

import "fmt"

// Book 表示定义一个结构体 将多个简单类型封装成为一个复杂的数据类型
// 大写表示其他包也可以访问
type Book struct {
   title string
   auth  string
   price int
}

// 这里传递的是book的一个副本 原来值不会改变
func changeBook(book Book) {
   book.title = "huakai"
}

// 修改值
func changeBookByRefer(book *Book) {
   // 这里有自动解引用的过程
   // 实际为：(*per).name = "huakai"
   book.title = "huakai"
}

func main() {

   //var book Book
   //book.title = "go入门"
   //book.auth = "yuluo"
   //book.price = 20

   // 键值对方式初始化
   // book := Book{
   //   title: "java入门",
   //   auth:  "yuluo",
   //   price: 20,
   // }

   // 顺序方式
    book := Book{
     "java入门",
     "yuluo",
     20,
   }

   fmt.Println("原本值：", book)

   changeBook(book)
   fmt.Println("更改之后的值：", book)

   changeBookByRefer(&book)

   fmt.Println("传引用更改之后的值：", book)

   // 匿名结构体
    var tom struct {
        id, age int
        name string
    }
    tom.id = 102
    tom.age = 20
    tom.name = "tom"
    fmt.Printf("%v\\n", tom)
}
\`\`\`

### 方法

> 面向对象中存在类方法的概念，在 go 中没有 go 方法的概念，但是我们可以声明一些方法属于某个结构体

go 语言的方法是一种特殊的函数，定义于 struct 之上（与 struct 关联，绑定），被称为 struct 的接收者（receiver）**通俗理解就是：方法是有接收者的函数**

\`\`\`golang
type mytype struct {}

// receiver （接收者）接受该方法的结构体 mymethod方法名 para参数列表 return_type 返回值列表
func (recevicer mytype) mymethod(para) return_type {}
func (recevicer *mytype) mymethod(para) return_type {}
\`\`\`

### 接口

> 是一种新的类型定义，把所有具有共性的方法定义在一起，任何其他类型只要是实现了这些方法就是实现了这个接口

\`\`\`golang
/*定义接口*/
type interfae_name interface {
 method_name1 [return_type]
 method_name2 [return_type]
 method_name3 [return_type]
}

/*定义结构体*/
type struct_name struct {
 /*变量定义*/
}

/*实现接口方法*/
func (struct_name_var struct_name) method_name1() (return_type) {
 // 方法实现
}

func (struct_name_var struct_name) method_name2() (return_type) {
 // 方法实现
}
\`\`\`

> 例如 手机和电脑 分别实现 USB 接口，实现读和写功能

\`\`\`golang
type USB interface {
    read()
    write()
}

// 电脑结构体
type Computer struct {
    name string
}

// 手机结构体
type Mobile struct {
    name string
}

// 电脑实现USB接口
func (c Computer) read() {
    fmt.Printf("c.name = %v %s\\n", c.name, "电脑使用usb接口读取")
}
func (c Computer) write() {
    fmt.Printf("c.name = %v %s\\n", c.name, "电脑使用usb接口写")
}

//手机实现use接口
func (m Mobile) read() {
    fmt.Printf("m.name = %v %s\\n", m.name, "手机使用usb接口读取")
}
func (m Mobile) write() {
    fmt.Printf("m.name = %v %s\\n", m.name, "手机使用usb接口写")
}

func main() {
    c := Computer {
        name: "Dell",
    }

    c.read()
    c.write()

    m := Mobile {
        model: "5G",
    }

    m.read()
    m.write()
}
\`\`\`

### 面向对象的表示与封装

\`\`\`golang
package main

import "fmt"

/*
如果类名首字母大写，表示其他包也能够访问 否则只能在类的内部访问
同样的，方法首字母大写，表示可以在其他包中访问，否则只能在本类中访问
go语言的封装特性
 */
type Book struct {
   Title string
   Auth  string
   Price int
}

func (this Book) show() {
   fmt.Println("使用show方法输出的 Book 对象", this)
}

func (this *Book) GetAuth() string {
   return this.Auth
}

func (this *Book) SetAuth(newName string) {
   // 这里的this对象是一个副本，并不能真的修改book对象的值
   // 改入传递指针之后才能修改值
   this.Auth = newName
}

func main() {

   // 定义book对象
   book := Book{Title: "java入门", Auth: "yuluo", Price: 100}
   fmt.Println("原本值：", book)

   auth := book.GetAuth()
   fmt.Println("使用get方法", auth)

   book.SetAuth("huakai")
   fmt.Println("调用set方法之后的值：", book)

   book.show()

}
\`\`\`

### 面向对象继承

> 通过结构体的嵌套来实现继承

\`\`\`golang
package main

import "fmt"

// Human 父类
type Human struct {
   Sex  string
   name string
}

func (this *Human) Eat() {
   fmt.Println("Human.Eat()...")
}

func (this *Human) Walk() {
   fmt.Println("Human.walk()...")
}

type Teacher struct {
   Human // 表示继承了Human类中的方法

   // 在Human上扩展出来的工作属性
   work string
}

// Teacher Eat 重定义父类的方法
func (this *Teacher) Eat() {
   fmt.Println("Teacher.Eat()...")
}

func (this *Teacher) Teach() {
   fmt.Println("Teacher.Teach()...")
}

func main() {

   h := Human{"男", "lisi"}

   h.Eat()
   h.Walk()

   // 定义子类对象
   //t := Teacher{h, "教师"}
   t := Teacher{Human{"男", "yuluo"}, "程序员"}

   // 调用子类方法
   t.Eat()
   t.Teach()

   // 调用父类方法
   t.Walk()

}
\`\`\`

### 面向对象多态

> 多态的基本要素：
>
> - 有一个父类（接口）
> - 有子类（实现了父类接口中的全部方法）
> - 父类类型的变量（指针）指向子类的具体数据变量

\`\`\`golang
package main

import "fmt"

// 本质是一个指针
type Animal interface {
   Sleep()
   GetColor() string // 获取动物的颜色
   GetType() string  // 获取动物的种类
}

// 具体的类
type Cat struct {
   color string // 猫的颜色
}

func (this *Cat) Sleep() {
   fmt.Println("Cat is sleeping……")
}

func (this *Cat) GetColor() string {
   return this.color
}

func (this *Cat) GetType() string {
   return "Cat"
}

// 具体的类
type Dog struct {
   color string // 狗的颜色
}

func (this *Dog) Sleep() {
   fmt.Println("Dog is sleeping……")
}

func (this *Dog) GetColor() string {
   return this.color
}

func (this *Dog) GetType() string {
   return "Cat"
}

func main() {
   // 接口的数据类型， 父类指针
   var animal Animal

   animal = &Cat{"yellow"}

   // 调用的是 Cat 的 Sleep 方法
   animal.Sleep()

   animal = &Dog{"black"}
   // 调用的是 Dog 的 Sleep 方法 产生多态现象
   animal.Sleep()
}
\`\`\`

### 空接口含义

interface：\`通用的万能类型 类似与 java 中的 Object\`

\`\`\`go
// 表示map的 key 是 string 类型，value 是 go 中的任意数据类型
map1 := map[string]interface{}
\`\`\`

### golang 构造函数

\`\`\`golang
package main

import "fmt"

type Person struct {
    name string
    age int
}

// Person 对象的构造函数 返回一个person对象的指针
func NewPerson(name string, age int) (*Person, error) {
    if name == "" {
        return nil, fmt.Errorf("name 不能为空")
    }
    if age < 0 {
        return nil, fmt.Errorf("年龄不能小于 0")
    }

    return &Person{name: name, age: age}, nil
}

func main() {
    person, err := NewPeron("yuluo", 20)
    if err != nil {
        fmt.Println(err)
    }

    fmt.Println(person)
}
\`\`\`

## golang 并发编程

### 协程

> golang 通过关键字 go 开启一个携程，使其并发执行

\`\`\`golang
// 例1
func main() {
   // main线程 顺序执行
   go test4("yuluo")
   // go 启动携程 和 主线程同时执行
   test4("huakai")

}

func test4(msg string) {
   for i := 0; i < 5; i++ {
      fmt.Printf("msg: %v\\n", msg)
      time.Sleep(time.Millisecond * 100)
   }
}

// 例2
package main

import (
   "fmt"
   "time"
)

// 子 routine
func newTask() {
   i := 0
   for {
      i++
      fmt.Printf("new Groutine : i = %d\\n", i)
   }
}

// 主 goroutine
func main() {
   // 创建一个goroutine 取执行newTask进程
   go newTask()

   i := 0
   for {
      i++
      fmt.Printf("main goroutine : i = %d\\n", i)
      time.Sleep(time.Duration(i))
   }
}
\`\`\`

### channel

> 用于携程（goroutine）之间进行通信

创建channel语法

> channel的有缓冲和无缓冲问题
>
> - 当channel已经满了，在向里面写值，就会阻塞
> - 如果channel为空，从里面取值，也会阻塞

\`\`\`golang
// 通道由 make 函数创建
unbuffered := make(chan int)      // 整型无缓冲通道
buffered := make(chan int， 10)   // 整型缓冲通道
\`\`\`

协程发送数据到通道：

\`\`\`golang
goroutine1 := make(chan string, 5)  // 字符串缓冲通道,5表示通道能包含5个值
goroutine <- "hello"     // 通过通道发送字符串
\`\`\`

从通道接受值：

\`\`\`golang
// \`<-\` 在通道左边表示接受值，在通道右边表示发送值
data := <- goroutine1     // 从通道接受值
\`\`\`

- 同一个通道，发送和接受操作是互斥的；
- 发送和接受操做在完全完成之前会被阻塞；

\`\`\`go
func main() {

   // 用go创建承载一个形参为空，返回值为空的一个函数
   go func() {
      defer fmt.Println("A.defer")

      func() {
         defer fmt.Println("B.defer")

         // 退出当前的两个函数
         runtime.Goexit()

         fmt.Println("B")
         // （）表示在创建了一个匿名函数之后，调用此匿名函数
      }()

      fmt.Println("A")
   }()

   // go一个有参数的函数
   go func(a int, b int) {
      fmt.Println(a, b)
      // 调用此匿名函数并传参
   }(1, 2)

   // 死循环
   for {
      time.Sleep(1 * time.Second)
   }

}
\`\`\`

\`\`\`go
package main

import "fmt"

func main() {

   // 定义一个channel  channel同时也会保证go routine的执行顺序
   c := make(chan int)

   // 创建两个go routine
   go func() {
      defer fmt.Println("go routine 结束")
      fmt.Println("go routine 正在运行……")

      // 给chan中存值 将666发送给c
      c <- 666
   }()

   // 从C中取出值 并赋值给num
   num := <-c

   fmt.Println("channel中的值：", num)
   fmt.Println("main routine 结束")

}
\`\`\`

如果chann中没有值的话，线程会一直阻塞，直到有值之后，在拿出来值。**保证了 go routine 的执行顺序**

> channel 和 range 混合使用（channel 遍历）
>
> \`\`\`go
> for data := range c {
>  fmt.Println(data)
> }
> \`\`\`
>
> channer和select混合使用
>
> - 单流程下一个go只能监控一个channel的执行状态，select可以完成监控多个channel的运行状态
>
> \`\`\`go
> select {
>     case <- chan1:
>      // 如果chan1成功读到数据，则进行该操作
>     case chan2 <- 1:
>      // 如果chan2写入数据成功，则进行该操作
>     default:
>      // 如果上面都没成功，执行此操作
> }
> \`\`\`

### WaitGroup 同步

线程之间互相等待时使用，A线程没有执行完成，使用此关键字通知B线程等A线程一会

\`\`\`golang
func main() {
 // 启动10个协程（线程）
 for i := 0; i < 10; i++ {
  go showMsg(6)
 }

 // 主协程
 fmt.Println("end...")

}

func showMsg(i int) {
 fmt.Println(i)
}
\`\`\`

运行如上代码时，主携程并不会等待10个协程执行完毕后在结束，而是自己结束。加入 WairGroup 就可以在10个协程执行完成之后再结束主协程

\`\`\`go
package main

import (
 "fmt"
    "sync"
)

var wg sync.WaitGroup

func main() {
   // 启动10个协程（线程）
   for i := 0; i < 10; i++ {
      go showMsg(i)
      wg.Add(1)
   }

   // 等待
   wg.Wait()
   // 主协程
   fmt.Println("end...")

}

func showMsg(i int) {

   // 在执行之后，结束之前执行的时机
   defer wg.Done()

   fmt.Println(i)
}
\`\`\`

## go mod 常用命令

| 命令            | 作用                           |
| --------------- | ------------------------------ |
| go mod int      | 生成go.mod文件                 |
| go mod download | 下载go.mod文件中指明的所有依赖 |
| go mod tidy     | 整理现有的依赖                 |
| go mod graph    | 查看现有的依赖结构             |
| go mod edit     | 编辑go.mod文件                 |
| go mod vendor   | 导出项目所有的依赖到vendor目录 |
| go mod verify   | 检验一个模块是否被篡改过       |
| go mod why      | 查看为什么需要依赖某模块       |

## golang proxy 选项

这个环境变量主要是用户设置Go模块代理，作用是用于使GO在后续拉取模块版本时直接通过镜像站点快速拉取。

默认值是：https://proxy.golang.org,direct

默认的代理国内访问不了，需要设置国内的代理

- 阿里云

  https://mirrors.aliyun.com/goproxy

- 七牛云

  https://goproxy.cn,direct

> direct: 如果在改镜像找不到这个包，会去原本的源拉取
`;export{n as default};
