import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiBookOpen, FiCheckCircle } from 'react-icons/fi';
import type { Topic } from '../types';

// Mock data - 实际项目中应该从文件加载
const mockTopics: Topic[] = [
  {
    id: 'ai-series',
    name: 'AI 系列教程',
    description: '从基础到进阶，全面学习人工智能技术。涵盖机器学习、深度学习、自然语言处理等核心主题。',
    totalPosts: 20,
    completedPosts: 8,
    lastUpdated: '2024-12-20',
    posts: [
      {
        slug: 'ai-intro',
        title: '人工智能入门：AI 的基本概念',
        description: '了解人工智能的定义、历史和主要应用领域',
        date: '2024-12-01',
        author: 'Yuluo',
        tags: ['AI', '机器学习', '入门'],
        category: 'AI系列',
        content: '# 人工智能入门\n\nAI 相关内容...',
        readingTime: 10,
      },
      {
        slug: 'machine-learning-basics',
        title: '机器学习基础：算法与模型',
        description: '掌握机器学习的核心算法和常用模型',
        date: '2024-12-05',
        author: 'Yuluo',
        tags: ['机器学习', '算法', '模型'],
        category: 'AI系列',
        content: '# 机器学习基础\n\n机器学习相关内容...',
        readingTime: 15,
      },
      {
        slug: 'deep-learning-intro',
        title: '深度学习入门：神经网络基础',
        description: '理解神经网络的工作原理和基本架构',
        date: '2024-12-10',
        author: 'Yuluo',
        tags: ['深度学习', '神经网络', 'TensorFlow'],
        category: 'AI系列',
        content: '# 深度学习入门\n\n深度学习相关内容...',
        readingTime: 18,
      },
      {
        slug: 'nlp-fundamentals',
        title: '自然语言处理基础',
        description: 'NLP 技术概述和文本处理方法',
        date: '2024-12-15',
        author: 'Yuluo',
        tags: ['NLP', '自然语言处理', 'BERT'],
        category: 'AI系列',
        content: '# 自然语言处理基础\n\nNLP 相关内容...',
        readingTime: 12,
      },
      {
        slug: 'computer-vision',
        title: '计算机视觉入门',
        description: '图像识别和处理技术介绍',
        date: '2024-12-18',
        author: 'Yuluo',
        tags: ['计算机视觉', 'CNN', '图像处理'],
        category: 'AI系列',
        content: '# 计算机视觉入门\n\n计算机视觉相关内容...',
        readingTime: 14,
      },
      {
        slug: 'reinforcement-learning',
        title: '强化学习原理',
        description: '探索强化学习的核心思想和应用',
        date: '2024-12-20',
        author: 'Yuluo',
        tags: ['强化学习', 'RL', 'Q-Learning'],
        category: 'AI系列',
        content: '# 强化学习原理\n\n强化学习相关内容...',
        readingTime: 16,
      },
      {
        slug: 'generative-ai',
        title: '生成式 AI：AIGC 技术解析',
        description: 'GPT、Stable Diffusion 等生成式模型介绍',
        date: '2024-12-22',
        author: 'Yuluo',
        tags: ['生成式AI', 'GPT', 'AIGC'],
        category: 'AI系列',
        content: '# 生成式 AI\n\n生成式 AI 相关内容...',
        readingTime: 20,
      },
      {
        slug: 'ai-ethics',
        title: 'AI 伦理与安全',
        description: '探讨人工智能的伦理问题和安全挑战',
        date: '2024-12-24',
        author: 'Yuluo',
        tags: ['AI伦理', '安全', '隐私'],
        category: 'AI系列',
        content: '# AI 伦理与安全\n\nAI 伦理相关内容...',
        readingTime: 11,
      },
    ],
  },
  {
    id: 'design-patterns',
    name: '设计模式实战',
    description: '23种经典设计模式的原理、实现和应用场景详解。结合实际案例，提升软件设计能力。',
    totalPosts: 25,
    completedPosts: 15,
    lastUpdated: '2024-12-18',
    posts: [
      {
        slug: 'design-patterns-intro',
        title: '设计模式概述',
        description: '了解设计模式的分类和基本原则',
        date: '2024-11-01',
        author: 'Yuluo',
        tags: ['设计模式', 'OOP', '软件工程'],
        category: '设计模式',
        content: '# 设计模式概述\n\n设计模式相关内容...',
        readingTime: 8,
      },
      // ... 更多文章
    ],
  },
];

const TopicDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);

  useEffect(() => {
    const foundTopic = mockTopics.find((t) => t.id === id);
    if (foundTopic) {
      setTopic(foundTopic);
    } else {
      navigate('/topics');
    }
  }, [id, navigate]);

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">专栏加载中...</h1>
        </div>
      </div>
    );
  }

  const progress = (topic.completedPosts / topic.totalPosts) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-5xl mx-auto">
        {/* 返回按钮 */}
        <Link
          to="/topics"
          className="inline-flex items-center gap-2 text-light-secondary dark:text-dark-secondary hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8"
        >
          <FiArrowLeft />
          <span>返回专栏列表</span>
        </Link>

        {/* 专栏头部 */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{topic.name}</h1>
          <p className="text-lg text-light-secondary dark:text-dark-secondary mb-6">
            {topic.description}
          </p>

          {/* 统计信息 */}
          <div className="flex flex-wrap items-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-light-secondary dark:text-dark-secondary">
              <FiBookOpen className="w-5 h-5" />
              <span>共 {topic.totalPosts} 篇文章</span>
            </div>
            <div className="flex items-center gap-2 text-light-secondary dark:text-dark-secondary">
              <FiCheckCircle className="w-5 h-5" />
              <span>已完成 {topic.completedPosts} 篇</span>
            </div>
            <div className="flex items-center gap-2 text-light-secondary dark:text-dark-secondary">
              <FiCalendar className="w-5 h-5" />
              <span>
                最后更新：{new Date(topic.lastUpdated).toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>

          {/* 进度条 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-light-secondary dark:text-dark-secondary">
              <span>学习进度</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-light-card dark:bg-dark-card rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-600 dark:bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        </header>

        {/* 文章列表 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-6">系列文章</h2>
          
          {topic.posts.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/blogs/${post.slug}`}
                className="block group p-6 bg-light-card dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* 序号 */}
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 rounded-lg flex items-center justify-center font-bold">
                    {index + 1}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-light-secondary dark:text-dark-secondary mb-3 line-clamp-2">
                      {post.description}
                    </p>

                    {/* 元信息 */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-light-secondary dark:text-dark-secondary">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        <span>{new Date(post.date).toLocaleDateString('zh-CN')}</span>
                      </div>
                      {post.readingTime && (
                        <div className="flex items-center gap-1">
                          <FiBookOpen className="w-4 h-4" />
                          <span>{post.readingTime} 分钟阅读</span>
                        </div>
                      )}

                      {/* 标签 */}
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 bg-light-bg dark:bg-dark-bg rounded border border-gray-200 dark:border-gray-800"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 完成标记 */}
                  {index < topic.completedPosts && (
                    <div className="flex-shrink-0">
                      <FiCheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TopicDetail;
