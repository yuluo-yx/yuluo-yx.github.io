import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiClock, FiTag, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import MarkdownRenderer from '../components/blog/MarkdownRenderer';
import TableOfContents from '../components/blog/TableOfContents';
import ReadingProgress from '../components/blog/ReadingProgress';
import Comments from '../components/common/Comments';
import { loadAllBlogs } from '../utils/blogLoader';
import type { BlogPost } from '../types';

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [allBlogPosts, setAllBlogPosts] = useState<BlogPost[]>([]);

  // Load all blog posts
  useEffect(() => {
    loadAllBlogs().then(posts => {
      setAllBlogPosts(posts);
    });
  }, []);

  useEffect(() => {
    if (allBlogPosts.length === 0) return;
    
    // 查找当前文章
    const foundPost = allBlogPosts.find((p) => p.slug === slug);
    if (foundPost) {
      setPost(foundPost);
      const index = allBlogPosts.findIndex((p) => p.slug === slug);
      setCurrentIndex(index);
      // 滚动到页面顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // 文章不存在，跳转回博客列表
      navigate('/blogs');
    }
  }, [slug, allBlogPosts, navigate]);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">文章加载中...</h1>
        </div>
      </div>
    );
  }

  const prevPost = currentIndex > 0 ? allBlogPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allBlogPosts.length - 1 ? allBlogPosts[currentIndex + 1] : null;

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 text-light-secondary dark:text-dark-secondary hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <FiArrowLeft />
          <span>返回博客列表</span>
        </Link>
      </div>

      {/* 文章头部 */}
      <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
        <div className="lg:grid lg:grid-cols-[250px_1fr] lg:gap-12">
          {/* 侧边栏 - 目录（桌面端，左侧） */}
          <aside className="hidden lg:block order-first">
            <div className="sticky top-24">
              <TableOfContents content={post.content} />
            </div>
          </aside>

          {/* 主要内容 */}
          <div className="min-w-0 overflow-hidden">
            <MarkdownRenderer content={post.content} />
          </div>
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
        </footer>

        {/* 评论区 */}
        <div className="max-w-4xl mx-auto px-6 pb-16">
          <Comments />
        </div>
      </article>
    </motion.div>
  );
};

export default BlogDetail;
