# Yuluo 个人博客网站需求文档

## 项目概述

一个纯静态的个人博客网站，使用现代化技术栈构建，注重视觉体验和用户交互。

## 视觉设计

### 主题风格
- **主题色系**：以亮黑色（深色模式）为主题色
- **主题切换**：支持深色/浅色主题无缝切换，带平滑过渡动画
  - 深色模式：亮黑色背景 (#0a0a0a ~ #1a1a1a)
  - 浅色模式：亮白色背景 (#fafafa ~ #ffffff)
- **设计理念**：简约、大气、现代化
- **动态背景**：
  - 从左至右律动的光点粒子效果
  - 使用 WebGL 实现
  - 光点会随鼠标移动产生微妙互动
  - 主题切换时光点颜色自适应变化

### 色彩规范
- **深色模式**：
  - 主背景：#0f0f0f
  - 次背景：#1a1a1a
  - 主文字：#e4e4e7
  - 次文字：#a1a1aa
  - 强调色：#3b82f6（可自定义品牌色）
  
- **浅色模式**：
  - 主背景：#ffffff
  - 次背景：#f4f4f5
  - 主文字：#18181b
  - 次文字：#71717a
  - 强调色：#2563eb

## 布局设计

### 导航栏（Header）
- **Logo 区域**（左上角）：
  - 使用 SVG 构建动态 Logo
  - Figma 风格的渐变色动画效果
  - "yuluo" 艺术字设计
  - 悬停时有微妙的呼吸动画
  
- **导航菜单**（右上角）：
  - About（关于）
  - Blogs（博客）
  - Projects（项目）
  - Topics（专栏）
  - Gallery（相机 📷）
  - 每个菜单项配有精致的图标
  - 当前页面高亮显示

### 响应式设计
- 桌面端：横向导航布局
- 平板/手机端：汉堡菜单 + 侧边栏抽屉

## 页面模块详细设计

### 1. About（关于页面）
**定位**：网站主页 + 个人介绍

**内容结构**：
- **Hero 区域**：
  - 大标题欢迎语
  - 个人简介（一句话介绍）
  - 社交媒体链接（GitHub, Twitter, Email 等）
  - CTA 按钮：查看博客 / 联系我
  
- **自我介绍区域**：
  - 个人照片/头像（圆形或艺术化边框）
  - 详细个人介绍
  - 技能标签云
  - 当前状态（正在做什么）
  
- **时间线区域**：
  - 教育经历
  - 工作经历
  - 重要成就
  
- **兴趣爱好**：
  - 用卡片展示个人兴趣
  - 配有相关图标

### 2. Blogs（博客列表页）
**定位**：技术分享 + 个人感悟

**列表视图**：
- **过滤和搜索**：
  - 搜索框（实时搜索）
  - 分类筛选（技术/生活/感悟等）
  - 标签筛选
  - 排序选项（最新/最热/随机）
  
- **文章卡片**：
  - 封面图（支持自定义或自动生成渐变背景）
  - 标题
  - 摘要（前 150 字）
  - 发布日期 + 阅读时长估算
  - 分类标签
  - 悬停时卡片轻微上浮 + 阴影加深
  
- **分页/无限滚动**：采用无限滚动 + 加载更多

**文章详情页**：
- **文章头部**：
  - 大标题
  - 发布/更新时间
  - 分类和标签
  - 阅读进度条（固定在顶部）
  
- **文章内容**：
  - 完整的 Markdown 渲染支持
    - 代码高亮（多语言支持）
    - 表格
    - 引用块
    - 图片（支持放大查看）
    - 数学公式（KaTeX）
    - Mermaid 图表
  - 文章目录导航（侧边栏，自动跟随滚动）
  
- **文章底部**：
  - 标签列表
  - 上一篇/下一篇导航
  - 评论区（可选 Giscus 或 Utterances）

### 3. Projects（项目展示页）
**定位**：个人项目作品集

**展示形式**：
- **网格布局**：等高卡片网格
- **项目卡片**：
  - 项目缩略图/预览图
  - 项目名称
  - 简短描述（一句话）
  - 技术栈标签
  - GitHub 链接 + 在线预览链接（如有）
  - 悬停展示更多详情
  
- **项目详情页**（可选）：
  - 详细介绍
  - 技术架构
  - 功能特性
  - 截图集

### 4. Topics（专栏页面）
**定位**：系列文章合集

**列表视图**：
- **专栏卡片布局**：
  - 专栏封面图
  - 专栏名称
  - 专栏简介
  - 文章数量
  - 最后更新时间
  - 进度指示（已完成文章数/总计划数）
  
- **示例专栏**：
  - "AI "
  - "设计模式"
  
**专栏详情页**：
- 专栏介绍
- 文章列表（有序排列）

### 5. Gallery（相机/图集页）
**定位**：摄影作品展示

**展示方式**：
- **瀑布流布局**：Pinterest 风格
- **图片卡片**：
  - 高质量缩略图（懒加载）
  - 悬停显示拍摄信息（可选）
    - 拍摄时间
    - 拍摄地点
    - 相机参数（光圈、快门、ISO）
  - 点击进入灯箱模式（Lightbox）
  
- **分类**：
  - 风景
  - 人像
  - 街拍
  - 建筑
  - 其他
  
- **灯箱模式**：
  - 全屏查看
  - 左右切换
  - 图片信息展示
  - 下载选项（可选）

## 技术栈

### 核心框架
- **React 18+**：使用 Hooks 和函数组件
- **TypeScript**：完整的类型安全
- **Vite**：开发构建工具，快速 HMR

### 路由和状态
- **React Router v6**：客户端路由
- **Zustand** 或 **Jotai**：轻量级状态管理（主题、用户偏好等）

### UI 和样式
- **Tailwind CSS**：原子化 CSS 框架
- **Framer Motion**：流畅的动画效果
- **Radix UI** 或 **Headless UI**：无样式 UI 组件
- **React Icons**：图标库

### Markdown 处理
- **react-markdown**：Markdown 渲染
- **remark** / **rehype** 插件：
  - remark-gfm（GitHub Flavored Markdown）
  - rehype-highlight（代码高亮）
  - rehype-katex（数学公式）
  - rehype-slug（标题锚点）
  - remark-toc（目录生成）
- **Prism.js** 或 **Shiki**：代码语法高亮

### 图片处理
- **react-photo-view** 或 **yet-another-react-lightbox**：图片灯箱
- **react-lazy-load-image-component**：图片懒加载

### 背景动画
- **Canvas API** 或 **Three.js**：粒子动画效果
- **react-tsparticles**（可选）：预制粒子效果

### 工具库
- **date-fns** 或 **dayjs**：日期处理
- **gray-matter**：解析 Markdown frontmatter
- **reading-time**：阅读时长估算

### 开发工具
- **ESLint** + **Prettier**：代码规范
- **Husky** + **lint-staged**：Git hooks
- **TypeScript 严格模式**

### 部署
- **GitHub Pages** / **Vercel** / **Netlify**：静态网站托管
- **GitHub Actions**：自动化构建部署

## 项目结构建议

```
yuluo-blog/
├── public/
│   ├── favicon.ico
│   └── assets/
│       └── images/
├── src/
│   ├── assets/
│   │   ├── fonts/
│   │   ├── images/
│   │   └── icons/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Logo.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── ParticlesBackground.tsx
│   │   ├── blog/
│   │   │   ├── BlogCard.tsx
│   │   │   ├── BlogList.tsx
│   │   │   ├── MarkdownRenderer.tsx
│   │   │   └── TableOfContents.tsx
│   │   ├── project/
│   │   │   ├── ProjectCard.tsx
│   │   │   └── ProjectGrid.tsx
│   │   ├── topic/
│   │   │   ├── TopicCard.tsx
│   │   │   └── TopicDetail.tsx
│   │   └── gallery/
│   │       ├── ImageGrid.tsx
│   │       └── Lightbox.tsx
│   ├── pages/
│   │   ├── About.tsx
│   │   ├── Blogs.tsx
│   │   ├── BlogDetail.tsx
│   │   ├── Projects.tsx
│   │   ├── Topics.tsx
│   │   ├── TopicDetail.tsx
│   │   └── Gallery.tsx
│   ├── content/
│   │   ├── blogs/
│   │   │   └── *.md
│   │   ├── topics/
│   │   │   └── */
│   │   │       └── *.md
│   │   └── projects.json
│   ├── hooks/
│   │   ├── useTheme.ts
│   │   ├── useScrollProgress.ts
│   │   └── useMediaQuery.ts
│   ├── store/
│   │   └── themeStore.ts
│   ├── utils/
│   │   ├── markdown.ts
│   │   ├── date.ts
│   │   └── readingTime.ts
│   ├── styles/
│   │   ├── globals.css
│   │   └── markdown.css
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .eslintrc.cjs
├── .prettierrc
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── package.json
```

## 功能要求

### 必需功能
- ✅ 完整的 Markdown 渲染支持（代码高亮、表格、公式等）
- ✅ 主题切换（深色/浅色）
- ✅ 响应式设计（移动端适配）
- ✅ 文章搜索和筛选
- ✅ 阅读进度指示
- ✅ 代码块复制功能
- ✅ 图片懒加载
- ✅ SEO 优化（meta 标签、sitemap）
- ✅ 性能优化（代码分割、预加载）

### 可选功能
- ⏳ RSS 订阅
- ⏳ 评论系统（Giscus）
- ⏳ 文章字数统计
- ⏳ 浏览量统计（可使用 Google Analytics）
- ⏳ 全文搜索（Algolia 或 Fuse.js）
- ⏳ 多语言支持（i18n）
- ⏳ PWA 支持（离线可用）
- ⏳ 打印优化样式

## 性能优化

- 路由懒加载（React.lazy + Suspense）
- 图片优化（WebP 格式、响应式图片）
- 代码分割（按页面/按组件）
- 字体优化（字体子集化、预加载）
- 缓存策略（Service Worker）
- 压缩资源（Gzip/Brotli）

## SEO 优化

- 语义化 HTML
- meta 标签（title, description, og:tags）
- 结构化数据（JSON-LD）
- Sitemap.xml
- robots.txt
- 图片 alt 属性
- 语义化 URL

## 开发流程

1. **初始化项目**：`npm create vite@latest`
2. **配置 Tailwind CSS**
3. **搭建基础布局**：Header、Footer、路由
4. **开发核心页面**：按优先级 About → Blogs → Projects → Topics → Gallery
5. **集成 Markdown 渲染**
6. **样式细化和动画**
7. **性能优化**
8. **SEO 配置**
9. **部署上线**

## 部署方案

### GitHub Pages
```bash
npm run build
# 将 dist/ 推送到 gh-pages 分支
```

### Vercel/Netlify
- 连接 GitHub 仓库
- 自动检测 Vite 项目
- 自动部署（推送到主分支即触发）

---

**预估开发周期**：2-3 周（含设计和优化）  
**维护成本**：低（静态网站，无服务器端）
