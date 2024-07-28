---
title: Github 搭建个人博客
date: 2023-08-23 23:34:54
index_img: /img/bgc.jpg
banner_img: /img/bgc.jpg
tags:
- personal blog
- Github Pages
categories:
- Technology 
- Github
---

# Github 博客搭建

## 准备工作

- 准备一个 github 账号；
- 建立 github 仓库，**仓库名为 username.github.io**，同时设置仓库为 public；
- clone 仓库，写入一个 index.html 文件，推送到仓库（许多网上的教程会有 choose theme，但是新版本的 github 没有这个东西！）；
- 浏览器输入 https://username.github.io 访问！

<p class="note note-info">
    Note:  push 代码之后可能需要 等一会 才能响应内容。
    <br>
    关于 Github Pages 的一些设置在 repo -> setting -> Pages 中，例如，绑定域名，选择构建分支等，一般默认即可
</p>

## 进阶设置

<p class="note note-info">通过之前的步骤，相信你已经可以访问到你的 blog 了，当然页面非常 **丑**！</p>

- 安装 Node （百度安装）
- 安装 Git

### 1. 安装 hexo

```shell
# 全局安装（推荐全局）
npm install hexo -g
# 局部安装
npm install hexo

# 任意目录建立文件夹
mkdir blog && cd blog

# 初始化 Hexo 项目
hexo init

# 以本地服务的形式启动 hexo 控制台会显示访问地址，当然也非常丑！
hexo server / hexo s
```

### 2. 安装 Fluid 主题

1. 下载最新的  Fluid Release 版本。<a class="btn" href="https://github.com/fluid-dev/hexo-theme-fluid/releases" title="点击下载">点击跳转</a>

2. 解压到 hexo 的 theme 文件夹下，并重命名为 fluid

3. 覆盖配置文件

   ```shell
   # 复制 /themes/fluid/_config.yml 到根目录下，并重命名为 _config.fluid.yml
   ```

4. 修改 hexo 根目录下的 _config.yaml 文件

   ```shell
   theme: fluid  # 指定主题
   language: zh-CN  # 指定语言，会影响主题显示的语言，按需修改 (不需要重写，前面有，搜索找到修改即可！)
   ```

5. 创建关于页

   ```shell
   # 命令
   hexo new page about
   
   # 创建成功后，修改 /source/about/index.html，添加 layout 属性
   ---
   title: about
   date: 2020-02-23 19:20:33
   layout: about
   ---
   
   这里写关于页的正文，支持 Markdown, HTML
   ```

6. 重新启动

   ```shell
   hexo server
   ```

7. 不出意外，修改主题之后的 blog 已经显示成功了！

### 3. 创建文章

1. 如下修改 Hexo 博客目录中的 `_config.yml`，打开这个配置是为了在生成文章的时候生成一个同名的资源目录用于存放图片文件。

   <p class="note note-warning">网上这么说的，本人测试无效，图片文件放在 `themes\fluid\source\img` 路径才能访问到。</p>

   ```yaml
   post_asset_folder: true
   ```

   执行如下命令创建一篇新文章，名为 test **（文章名可以为中文，多个单词组成用引号引起来）**

   ```shell
   hexo new post test
   ```

2. 在 source/_post/test 中放一张图片，之后修改 test.md 文章内容如下

   <p class="note note-warning">参考第一步中的加粗内容</p>

   ```md
   ---
   title: 测试文章
   date: 2023-08-23 21.24:35:20
   # 文章首页封面图
   index_img: /img/bgc.jpg
   # 文章页顶部大图
   banner_img: /img/bgc.jpg
   tags:
   - 原创
   categories:
   - test
   ---
   
   这是一篇测试文章！
   
   ![图片引用](/img/bgc.jpg)
   
   便签
   <p class="note note-primary">标签</p>
   <p class="note note-success">标签</p>
   <p class="note note-warning">标签</p>
   <p class="note note-info">标签</p>
   
   行内标签
   <span class="label label-primary">Label</span>
   <span class="label label-success">Label</span>
   
   按钮
   <a class="btn" href="url" title="title">text</a>
   ```

3. 启动并访问

   ```shell
   # 生成 public 文件夹
   hexo g
   
   # 以本地服务形式启动
   hexo server
   ```

### 4. 个性化定制

<p class="note note-success">
	如果想要快速查看更改后的显示配置，
    <br
    执行 hexo clean 清除缓存
    执行 hexo s 预览！
</p>

1. 浏览器标签页名称

   ```shell
   # 修改根目录下 _config.yml 中的 title 字段。
   # Site
   title: Yuluo's blog
   ```

2. 博客标题

   ```shell
   # 修改根目录下的 _config.fluid.yml 中的 blog_title 字段。
   navbar:
     blog_title: "Yuluo's blog"
   ```
   
3. 主页正中间的文字

   ```shell 
   # 修改根目录下的 _config.fluid.yml 中的 text 字段。
   slogan:
   	enable: true
   
       # 为空则按 hexo config.subtitle 显示
       # If empty, text based on `subtitle` in hexo config
       text: "芝兰生于空谷，不以无人而不芳!"
   ```

4. 其他配置均可在  `_config.fluid.yml` 查看进行个性化修改。

   ```shell
   # 例如：其他 navbar 的背景大图及其他设置 Line 930
   #---------------------------
   # 标签页
   # Tag Page
   #---------------------------
   tag:
     enable: true
     banner_img: /img/default.png
     banner_img_height: 80
     banner_mask_alpha: 0.3
     tagcloud:
       min_font: 15
       max_font: 30
       unit: px
       start_color: "#BBBBEE"
       end_color: "#337ab7"
       
       
   # 用于浏览器标签的图标 line 19
   # Icon for browser tab
   favicon: /img/fluid.png
   ```

5. 关于页的图标设置

   地址：https://hexo.fluid-dev.com/docs/icon/#%E5%86%85%E7%BD%AE%E7%A4%BE%E4%BA%A4%E5%9B%BE%E6%A0%87

   ```shell
   # line：960  找到 icon 的名字替换即可
   - { class: "iconfont icon-github-fill", link: "https://github.com", tip: "GitHub" }
   - { class: "iconfont icon-douban-fill", link: "https://douban.com", tip: "豆瓣" }
   - { class: "iconfont icon-wechat-fill", qrcode: "/img/favicon.png" }
   ```

6. 文章中底部的作者和连接修改

   ```shell
   # 根目录下的 _config.yml 配置中分别搜索 url 和 author
   
   # 文章作者 line 10
   keywords:
   author: yulu
   
   # URL  line 16
   ## Set your site url here. For example, if you use GitHub Page, set url as 'https://username.github.io/project'
   url: http://yuluo-yx.github.i
   ```

   

## 部署到 github pages

有多种方式，这里选择较为简单的一种

> 推送根目录下的 public 目录到 github 仓库中，访问即可！
>

<p class="note note-success">如果没有public，运行 `hexo g` 生成即可！push 上去等待一会刷新，查看效果</p>









   

   
