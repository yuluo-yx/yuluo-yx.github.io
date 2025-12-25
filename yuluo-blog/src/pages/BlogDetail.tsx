import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiClock, FiTag, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import MarkdownRenderer from '../components/blog/MarkdownRenderer';
import TableOfContents from '../components/blog/TableOfContents';
import ReadingProgress from '../components/blog/ReadingProgress';
import type { BlogPost } from '../types';

// Mock data - 实际项目中应该从 Markdown 文件加载
const mockBlogPosts: BlogPost[] = [
  {
    slug: 'getting-started-with-react',
    title: 'React 入门指南：从零开始构建现代 Web 应用',
    description: '一篇完整的 React 入门教程，帮助你快速掌握 React 的核心概念和最佳实践',
    date: '2024-12-20',
    author: 'Yuluo',
    tags: ['React', 'JavaScript', 'Frontend'],
    category: '技术',
    content: `
# React 入门指南：从零开始构建现代 Web 应用

React 是目前最流行的前端框架之一，由 Facebook 开发并维护。本文将带你从零开始学习 React 的核心概念。

## 什么是 React？

React 是一个用于构建用户界面的 JavaScript 库。它采用组件化的思想，让你可以将复杂的 UI 拆分成可复用的独立部分。

### React 的核心特性

1. **声明式编程**：你只需要描述 UI 应该是什么样子，React 会自动处理 DOM 更新
2. **组件化**：将 UI 拆分成独立、可复用的组件
3. **一次学习，随处编写**：可以用 React 开发 Web、移动端和桌面应用

## 环境搭建

首先，我们需要安装 Node.js 和 npm。然后使用 Vite 创建一个新的 React 项目：

\`\`\`bash
npm create vite@latest my-react-app -- --template react-ts
cd my-react-app
npm install
npm run dev
\`\`\`

这会创建一个包含 TypeScript 的 React 项目，并启动开发服务器。

## 核心概念

### 1. JSX

JSX 是 JavaScript 的语法扩展，让你可以在 JavaScript 中编写类似 HTML 的代码：

\`\`\`jsx
function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>;
}
\`\`\`

### 2. 组件

React 组件是可复用的 UI 单元。有两种创建组件的方式：

\`\`\`jsx
// 函数组件（推荐）
function MyComponent() {
  return <div>Hello World</div>;
}

// 类组件（旧式写法）
class MyComponent extends React.Component {
  render() {
    return <div>Hello World</div>;
  }
}
\`\`\`

### 3. Hooks

Hooks 是 React 16.8 引入的新特性，让函数组件也能使用状态和其他 React 特性：

\`\`\`jsx
import { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`你点击了 \${count} 次\`;
  }, [count]);

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        点击
      </button>
    </div>
  );
}
\`\`\`

#### 常用的 Hooks

- **useState**: 在函数组件中添加状态
- **useEffect**: 处理副作用（数据获取、订阅等）
- **useContext**: 访问 Context
- **useRef**: 访问 DOM 元素或保存可变值
- **useMemo**: 缓存计算结果
- **useCallback**: 缓存函数

### 4. Props

Props 是父组件传递给子组件的数据：

\`\`\`jsx
function Greeting({ name, age }) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>Age: {age}</p>
    </div>
  );
}

// 使用
<Greeting name="Alice" age={25} />
\`\`\`

### 5. 条件渲染

React 中可以使用 JavaScript 的条件语句进行渲染：

\`\`\`jsx
function LoginButton({ isLoggedIn }) {
  return (
    <div>
      {isLoggedIn ? (
        <button>登出</button>
      ) : (
        <button>登录</button>
      )}
    </div>
  );
}
\`\`\`

### 6. 列表渲染

使用 \`map\` 方法渲染列表：

\`\`\`jsx
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
\`\`\`

> **注意**：记得为每个列表项添加唯一的 \`key\` 属性！

## 实战：构建一个简单的 Todo 应用

让我们通过一个实际的例子来巩固所学知识：

\`\`\`jsx
import { useState } from 'react';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: input,
        completed: false
      }]);
      setInput('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed }
        : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="todo-app">
      <h1>我的待办事项</h1>
      
      <div className="input-group">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="添加新任务..."
        />
        <button onClick={addTodo}>添加</button>
      </div>

      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`

## 最佳实践

### 1. 组件设计原则

- **单一职责**：每个组件只做一件事
- **可复用性**：设计通用的组件
- **Props 验证**：使用 TypeScript 或 PropTypes

### 2. 状态管理

- **本地状态**：组件内部使用 useState
- **全局状态**：使用 Context API 或第三方库（Redux、Zustand）
- **服务端状态**：使用 React Query 或 SWR

### 3. 性能优化

\`\`\`jsx
// 使用 memo 避免不必要的重渲染
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* 复杂的渲染逻辑 */}</div>;
});

// 使用 useMemo 缓存计算结果
const sortedData = useMemo(() => {
  return data.sort((a, b) => a - b);
}, [data]);

// 使用 useCallback 缓存函数
const handleClick = useCallback(() => {
  console.log('clicked');
}, []);
\`\`\`

## 总结

React 是一个强大且灵活的前端框架，掌握以下核心概念：

1. ✅ **JSX 语法**
2. ✅ **组件化开发**
3. ✅ **Hooks 的使用**
4. ✅ **Props 和状态管理**
5. ✅ **条件渲染和列表渲染**

接下来，你可以：

- 学习 React Router 进行路由管理
- 了解状态管理库（Redux、Zustand）
- 掌握样式解决方案（Tailwind CSS、CSS Modules）
- 探索 Next.js 等 React 框架

## 参考资源

- [React 官方文档](https://react.dev)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Vite 官方文档](https://vitejs.dev)

Happy Coding! 🚀
`,
    readingTime: 8,
  },
  {
    slug: 'typescript-best-practices',
    title: 'TypeScript 最佳实践：编写类型安全的代码',
    description: '深入了解 TypeScript 的高级特性和最佳实践，提升代码质量',
    date: '2024-12-18',
    author: 'Yuluo',
    tags: ['TypeScript', 'JavaScript', 'Best Practices'],
    category: '技术',
    content: `# TypeScript 最佳实践\n\nTypeScript 相关内容...`,
    readingTime: 10,
  },
  {
    slug: 'building-modern-web-apps',
    title: '构建现代 Web 应用：从设计到部署',
    description: '全面讲解现代 Web 应用的开发流程和技术栈选择',
    date: '2024-12-15',
    author: 'Yuluo',
    tags: ['Web Development', 'React', 'Vite'],
    category: '技术',
    content: `# 构建现代 Web 应用\n\n现代 Web 开发相关内容...`,
    readingTime: 12,
  },
];

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    // 查找当前文章
    const foundPost = mockBlogPosts.find((p) => p.slug === slug);
    if (foundPost) {
      setPost(foundPost);
      const index = mockBlogPosts.findIndex((p) => p.slug === slug);
      setCurrentIndex(index);
    } else {
      // 文章不存在，跳转回博客列表
      navigate('/blogs');
    }
  }, [slug, navigate]);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">文章加载中...</h1>
        </div>
      </div>
    );
  }

  const prevPost = currentIndex > 0 ? mockBlogPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < mockBlogPosts.length - 1 ? mockBlogPosts[currentIndex + 1] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      {/* 阅读进度条 */}
      <ReadingProgress />

      {/* 返回按钮 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 text-light-secondary dark:text-dark-secondary hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <FiArrowLeft />
          <span>返回博客列表</span>
        </Link>
      </div>

      {/* 文章头部 */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>

          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-light-secondary dark:text-dark-secondary mb-6">
            <div className="flex items-center gap-2">
              <FiCalendar className="w-4 h-4" />
              <time>{new Date(post.date).toLocaleDateString('zh-CN')}</time>
            </div>

            {post.readingTime && (
              <div className="flex items-center gap-2">
                <FiClock className="w-4 h-4" />
                <span>{post.readingTime} 分钟阅读</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <FiTag className="w-4 h-4" />
              <span>{post.category}</span>
            </div>
          </div>

          {/* 标签 */}
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs bg-light-card dark:bg-dark-card rounded-full border border-gray-200 dark:border-gray-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        </header>

        {/* 文章内容区域 */}
        <div className="lg:grid lg:grid-cols-[1fr_250px] lg:gap-12">
          {/* 主要内容 */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <MarkdownRenderer content={post.content} />
          </div>

          {/* 侧边栏 - 目录（桌面端） */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents content={post.content} />
            </div>
          </aside>
        </div>

        {/* 文章底部 */}
        <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
          {/* 上一篇/下一篇导航 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {prevPost ? (
              <Link
                to={`/blogs/${prevPost.slug}`}
                className="group p-6 bg-light-card dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all"
              >
                <div className="flex items-center gap-2 text-sm text-light-secondary dark:text-dark-secondary mb-2">
                  <FiChevronLeft />
                  <span>上一篇</span>
                </div>
                <h3 className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {prevPost.title}
                </h3>
              </Link>
            ) : (
              <div />
            )}

            {nextPost && (
              <Link
                to={`/blogs/${nextPost.slug}`}
                className="group p-6 bg-light-card dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all text-right"
              >
                <div className="flex items-center justify-end gap-2 text-sm text-light-secondary dark:text-dark-secondary mb-2">
                  <span>下一篇</span>
                  <FiChevronRight />
                </div>
                <h3 className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {nextPost.title}
                </h3>
              </Link>
            )}
          </div>

          {/* 作者信息 */}
          <div className="flex items-center gap-4 p-6 bg-light-card dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
              Y
            </div>
            <div>
              <div className="font-semibold text-lg">{post.author}</div>
              <div className="text-sm text-light-secondary dark:text-dark-secondary">
                热爱技术，分享生活
              </div>
            </div>
          </div>
        </footer>
      </article>
    </motion.div>
  );
};

export default BlogDetail;
