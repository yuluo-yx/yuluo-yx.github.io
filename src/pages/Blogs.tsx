import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiClock,
  FiTag,
  FiGrid,
  FiList,
  FiSearch,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiRotateCcw,
} from 'react-icons/fi';
import DateInfo from '../components/common/DateInfo';
import { loadAllBlogs } from '../utils/blogLoader';
import { usePlum } from '../hooks/usePlum';
import { useThemeStore } from '../store/themeStore';
import BlogCard from '../components/blog/BlogCard';
import type { BlogPost } from '../types';

type LayoutMode = 'timeline' | 'card';

const PAGE_SIZE = 12;

export default function Blogs() {
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    const saved = localStorage.getItem('blog_layout_mode');
    return saved === 'timeline' || saved === 'card' ? saved : 'card';
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const contentSectionRef = useRef<HTMLDivElement>(null);

  const { theme } = useThemeStore();

  // 梅花背景
  const plumCanvasRef = usePlum({
    speed: 12,
    density: 0.5,
    color: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(55, 65, 81, 0.15)',
  });

  // 读取所有博客（已在 blogLoader 做了模块级内存缓存）
  useEffect(() => {
    let isMounted = true;
    loadAllBlogs().then((posts) => {
      if (isMounted) {
        setAllPosts(posts);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLayoutModeChange = (mode: LayoutMode) => {
    setLayoutMode(mode);
    localStorage.setItem('blog_layout_mode', mode);
  };

  // 提取所有标签列表
  const allTags = useMemo(() => {
    const tags = new Set(allPosts.flatMap((post) => post.tags));
    return ['All', ...Array.from(tags)];
  }, [allPosts]);

  // 标签改变或搜索改变时重置页码
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTag, searchQuery]);

  // 综合过滤：标签 + 搜索关键字
  const filteredPosts = useMemo(() => {
    let result = allPosts;

    if (selectedTag !== 'All') {
      result = result.filter((post) => post.tags.includes(selectedTag));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(q) ||
          post.description.toLowerCase().includes(q) ||
          post.category.toLowerCase().includes(q) ||
          post.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allPosts, selectedTag, searchQuery]);

  // 卡片模式分页
  const totalPages = Math.ceil(filteredPosts.length / PAGE_SIZE);
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPosts.slice(start, start + PAGE_SIZE);
  }, [filteredPosts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (contentSectionRef.current) {
      const top = contentSectionRef.current.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // 时间轴分组（按年份）
  const postsByYear = useMemo(() => {
    const grouped: Record<string, BlogPost[]> = {};
    filteredPosts.forEach((post) => {
      const year = new Date(post.date).getFullYear().toString();
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(post);
    });

    Object.keys(grouped).forEach((year) => {
      grouped[year].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });

    return grouped;
  }, [filteredPosts]);

  const sortedYears = useMemo(() => {
    return Object.keys(postsByYear).sort((a, b) => parseInt(b) - parseInt(a));
  }, [postsByYear]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen relative"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
    >
      {/* 梅花背景 */}
      <canvas
        ref={plumCanvasRef}
        className="fixed inset-0 pointer-events-none opacity-50 dark:opacity-30"
        style={{ zIndex: 0 }}
      />

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Header 纯净回归原本质朴风格 */}
        <section className="py-12 mb-4">
          <div className="container mx-auto px-6">
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Blog</h1>

              {/* 博客介绍 */}
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed mb-4">
                  记录技术成长的点点滴滴，分享学习心得与实践经验
                </p>
                <DateInfo />
              </div>

              {/* 布局切换器 */}
              <div className="flex items-center gap-4 mt-8">
                <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                  布局模式:
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLayoutModeChange('timeline')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      layoutMode === 'timeline'
                        ? 'bg-primary text-white shadow-md'
                        : 'border border-gray-300 dark:border-gray-700 hover:border-primary dark:hover:border-primary text-light-text-secondary dark:text-dark-text-secondary'
                    }`}
                  >
                    <FiList className="w-4 h-4" />
                    时间轴
                  </button>
                  <button
                    onClick={() => handleLayoutModeChange('card')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      layoutMode === 'card'
                        ? 'bg-primary text-white shadow-md'
                        : 'border border-gray-300 dark:border-gray-700 hover:border-primary dark:hover:border-primary text-light-text-secondary dark:text-dark-text-secondary'
                    }`}
                  >
                    <FiGrid className="w-4 h-4" />
                    卡片
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 标签与搜索栏（两种模式均可筛选，彻底修复原先卡片模式无法筛选的缺陷） */}
        <section className="sticky top-16 z-30 bg-light-bg/95 dark:bg-dark-bg/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="max-w-5xl mx-auto space-y-3">
              {/* 搜索框与状态 */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索文章标题、内容或标签..."
                    className="w-full pl-9 pr-8 py-1.5 rounded-lg text-sm bg-light-bg-secondary dark:bg-dark-bg-secondary border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-primary text-light-text dark:text-dark-text"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-light-text dark:hover:text-dark-text"
                    >
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* 计数指示 */}
                <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary flex items-center justify-between sm:justify-end gap-3">
                  <span>
                    共 <span className="font-semibold text-primary">{filteredPosts.length}</span> 篇文章
                    {allPosts.length !== filteredPosts.length && (
                      <span className="opacity-75">（总计 {allPosts.length} 篇）</span>
                    )}
                  </span>
                  {(selectedTag !== 'All' || searchQuery) && (
                    <button
                      onClick={() => {
                        setSelectedTag('All');
                        setSearchQuery('');
                      }}
                      className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                    >
                      <FiRotateCcw className="w-3 h-3" />
                      重置筛选
                    </button>
                  )}
                </div>
              </div>

              {/* 标签列表 */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <FiTag className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary flex-shrink-0" />
                <span className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary mr-1">
                  标签:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        selectedTag === tag
                          ? 'bg-primary text-white shadow-sm'
                          : 'border border-gray-300 dark:border-gray-700 hover:border-primary dark:hover:border-primary text-light-text-secondary dark:text-dark-text-secondary'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 内容展示区域 */}
        <section ref={contentSectionRef} className="container mx-auto px-6 py-12">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              {filteredPosts.length > 0 ? (
                layoutMode === 'card' ? (
                  /* 卡片网格布局（支持分页，解决原先卡片无响应与DOM过多的卡顿） */
                  <motion.div
                    key="card"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {paginatedPosts.map((post) => (
                        <BlogCard key={post.slug} post={post} />
                      ))}
                    </div>

                    {/* 分页控制（朴素干净风格） */}
                    {totalPages > 1 && (
                      <div className="mt-12 flex items-center justify-center gap-2 pt-6 border-t border-gray-200 dark:border-gray-800">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 dark:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary transition-colors text-light-text dark:text-dark-text flex items-center gap-1"
                        >
                          <FiChevronLeft className="w-3.5 h-3.5" />
                          上一页
                        </button>

                        <div className="flex items-center gap-1 mx-2">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => {
                            if (
                              num === 1 ||
                              num === totalPages ||
                              (num >= currentPage - 1 && num <= currentPage + 1)
                            ) {
                              const isActive = num === currentPage;
                              return (
                                <button
                                  key={num}
                                  onClick={() => handlePageChange(num)}
                                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                                    isActive
                                      ? 'bg-primary text-white shadow-sm font-bold'
                                      : 'border border-gray-300 dark:border-gray-700 text-light-text dark:text-dark-text hover:border-primary'
                                  }`}
                                >
                                  {num}
                                </button>
                              );
                            } else if (
                              (num === currentPage - 2 && num > 1) ||
                              (num === currentPage + 2 && num < totalPages)
                            ) {
                              return (
                                <span
                                  key={num}
                                  className="w-5 text-center text-xs text-light-text-secondary dark:text-dark-text-secondary"
                                >
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 dark:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary transition-colors text-light-text dark:text-dark-text flex items-center gap-1"
                        >
                          下一页
                          <FiChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* 时间轴布局（去除大块发光与浮夸装饰，修复手机端 33% 挤压惨剧） */
                  <motion.div
                    key="timeline"
                    className="relative"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {sortedYears.map((year) => {
                      const posts = postsByYear[year];
                      return (
                        <div key={year} className="mb-14 last:mb-0">
                          {/* 年份标题 */}
                          <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-3xl font-bold text-primary">
                              {year}
                            </h2>
                            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                          </div>

                          {/* 文章列表 */}
                          <div className="space-y-4 border-l border-gray-200 dark:border-gray-800 ml-2 pl-4 sm:ml-4 sm:pl-6">
                            {posts.map((post) => {
                              const postDate = new Date(post.date);
                              const monthDay = postDate.toLocaleDateString('zh-CN', {
                                month: 'numeric',
                                day: 'numeric',
                              });

                              return (
                                <div key={post.slug} className="relative group">
                                  {/* 时间轴小圆点 */}
                                  <div className="absolute -left-[21px] sm:-left-[29px] top-4 w-2 h-2 rounded-full bg-primary" />

                                  <Link to={`/blogs/${post.slug}`} className="block">
                                    <div className="p-4 sm:p-5 rounded-xl bg-light-bg-secondary dark:bg-dark-bg-secondary border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-colors">
                                      <div className="flex items-center justify-between text-xs text-light-text-secondary dark:text-dark-text-secondary mb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-primary">
                                            {post.category}
                                          </span>
                                          <span>·</span>
                                          <span>{monthDay}</span>
                                        </div>
                                        {post.readingTime && (
                                          <div className="flex items-center gap-1">
                                            <FiClock className="w-3 h-3" />
                                            <span>{post.readingTime} 分钟</span>
                                          </div>
                                        )}
                                      </div>

                                      <h3 className="text-base sm:text-lg font-bold text-light-text dark:text-dark-text group-hover:text-primary transition-colors mb-1.5 leading-snug">
                                        {post.title}
                                      </h3>

                                      <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary line-clamp-2 leading-relaxed mb-3">
                                        {post.description || post.title}
                                      </p>

                                      <div className="flex flex-wrap gap-1.5">
                                        {post.tags.slice(0, 3).map((tag) => (
                                          <span
                                            key={tag}
                                            className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-light-text-secondary dark:text-dark-text-secondary"
                                          >
                                            #{tag}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </Link>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )
              ) : (
                /* 空状态 */
                <motion.div
                  key="empty"
                  className="text-center py-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-base text-light-text-secondary dark:text-dark-text-secondary mb-4">
                    未找到相关文章
                  </p>
                  <button
                    onClick={() => {
                      setSelectedTag('All');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    查看所有文章
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
