import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiBookOpen, FiClock, FiTag } from 'react-icons/fi';
import MarkdownRenderer from '../components/blog/MarkdownRenderer';
import TableOfContents from '../components/blog/TableOfContents';
import ReadingProgress from '../components/blog/ReadingProgress';
import Comments from '../components/common/Comments';
import { 
  loadTopicArticles, 
  loadTopicArticleDetail,
  groupArticlesBySubDirectory,
  getSubDirectoryDisplayName 
} from '../utils/topicLoader';

const TopicDetail = () => {
  const { '*': fullPath } = useParams<{ '*': string }>();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<any[]>([]);
  const [currentArticle, setCurrentArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 解析路径：第一段是分类，剩余是 slug
  const pathParts = fullPath?.split('/').filter(Boolean) || [];
  const categoryPath = pathParts[0];
  const slug = pathParts.length > 1 ? pathParts.slice(1).join('/') : undefined;
  
  // 如果有 slug，则显示文章详情；否则显示文章列表
  const isDetailView = !!slug;

  useEffect(() => {
    if (!categoryPath) {
      navigate('/topics');
      return;
    }

    setLoading(true);

    if (isDetailView && slug) {
      // 加载文章详情
      const fullSlug = `${categoryPath}/${slug}`;
      loadTopicArticleDetail(fullSlug)
        .then(article => {
          if (article) {
            setCurrentArticle(article);
          } else {
            navigate('/topics');
          }
        })
        .finally(() => setLoading(false));

      // 同时加载该分类的所有文章用于导航
      loadTopicArticles(categoryPath).then(setArticles);
    } else {
      // 加载文章列表
      loadTopicArticles(categoryPath)
        .then(articles => {
          setArticles(articles);
          if (articles.length === 0) {
            navigate('/topics');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [categoryPath, slug, isDetailView, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">加载中...</h1>
        </div>
      </div>
    );
  }

  // 文章详情视图（类似 BlogDetail）
  if (isDetailView && currentArticle) {
    const currentIndex = articles.findIndex(a => a.slug === currentArticle.slug);
    const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
    const nextArticle = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;

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
            to={`/topics/${categoryPath}`}
            className="inline-flex items-center gap-2 text-light-secondary dark:text-dark-secondary hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <FiArrowLeft />
            <span>返回专栏</span>
          </Link>
        </div>

        {/* 文章头部 */}
        <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {currentArticle.title}
            </h1>

            {/* 元信息 */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-light-secondary dark:text-dark-secondary mb-6">
              <div className="flex items-center gap-2">
                <FiCalendar className="w-4 h-4" />
                <time>{new Date(currentArticle.date).toLocaleDateString('zh-CN')}</time>
              </div>

              {currentArticle.readingTime && (
                <div className="flex items-center gap-2">
                  <FiClock className="w-4 h-4" />
                  <span>{currentArticle.readingTime} 分钟阅读</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <FiTag className="w-4 h-4" />
                <span>{currentArticle.category}</span>
              </div>
            </div>

            {/* 标签 */}
            {currentArticle.tags && currentArticle.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {currentArticle.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm bg-light-card dark:bg-dark-card rounded-full border border-light-border dark:border-dark-border"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* 文章内容和目录 */}
          <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-12">
            {/* 目录 */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <TableOfContents content={currentArticle.content} />
              </div>
            </aside>

            {/* 主要内容 */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <MarkdownRenderer content={currentArticle.content} />
            </div>
          </div>

          {/* 文章导航 */}
          <nav className="mt-16 pt-8 border-t border-light-border dark:border-dark-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 上一篇 */}
              {prevArticle ? (
                <Link
                  to={`/topics/${prevArticle.slug}`}
                  className="group p-6 rounded-lg border border-light-border dark:border-dark-border hover:border-blue-500 dark:hover:border-blue-500 transition-all"
                >
                  <div className="flex items-center gap-2 text-sm text-light-secondary dark:text-dark-secondary mb-2">
                    <FiArrowLeft className="w-4 h-4" />
                    <span>上一篇</span>
                  </div>
                  <h3 className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {prevArticle.title}
                  </h3>
                </Link>
              ) : (
                <div />
              )}

              {/* 下一篇 */}
              {nextArticle && (
                <Link
                  to={`/topics/${nextArticle.slug}`}
                  className="group p-6 rounded-lg border border-light-border dark:border-dark-border hover:border-blue-500 dark:hover:border-blue-500 transition-all text-right"
                >
                  <div className="flex items-center justify-end gap-2 text-sm text-light-secondary dark:text-dark-secondary mb-2">
                    <span>下一篇</span>
                    <FiArrowLeft className="w-4 h-4 rotate-180" />
                  </div>
                  <h3 className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {nextArticle.title}
                  </h3>
                </Link>
              )}
            </div>
          </nav>

          {/* 评论区 */}
          <div className="mt-16">
            <Comments />
          </div>
        </article>
      </motion.div>
    );
  }

  // 文章列表视图
  const categoryName = articles[0]?.category || categoryPath;
  const articleGroups = groupArticlesBySubDirectory(articles);
  const groupKeys = Object.keys(articleGroups);

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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{categoryName}</h1>

          {/* 统计信息 */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-light-secondary dark:text-dark-secondary">
              <FiBookOpen className="w-5 h-5" />
              <span>共 {articles.length} 篇文章</span>
            </div>
          </div>
        </header>

        {/* 按分组显示文章列表 */}
        <div className="space-y-12">
          {groupKeys.map((groupKey) => {
            const groupArticles = articleGroups[groupKey];
            const groupName = getSubDirectoryDisplayName(groupKey);
            let articleIndex = 0;

            return (
              <div key={groupKey}>
                {/* 分组标题（如果有多个分组才显示） */}
                {groupKeys.length > 1 && (
                  <h2 className="text-2xl font-bold mb-6 pb-3 border-b border-light-border dark:border-dark-border">
                    {groupName}
                  </h2>
                )}

                {/* 该分组的文章列表 */}
                <div className="space-y-4">
                  {groupArticles.map((article) => {
                    articleIndex++;
                    return (
                      <motion.div
                        key={article.slug}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: articleIndex * 0.03 }}
                      >
                        <Link
                          to={`/topics/${article.slug}`}
                          className="block group p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-750 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-start gap-4">
                            {/* 序号 */}
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center font-semibold text-sm">
                              {articleIndex}
                            </div>

                            {/* 内容 */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {article.title}
                              </h3>
                              {article.description && (
                                <p className="text-light-secondary dark:text-dark-secondary mb-3 line-clamp-2">
                                  {article.description}
                                </p>
                              )}

                              {/* 元信息 */}
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                  <FiCalendar className="w-4 h-4" />
                                  <span>{new Date(article.date).toLocaleDateString('zh-CN')}</span>
                                </div>
                                {article.readingTime && (
                                  <div className="flex items-center gap-1">
                                    <FiClock className="w-4 h-4" />
                                    <span>{article.readingTime} 分钟</span>
                                  </div>
                                )}

                                {/* 标签 */}
                                {article.tags && article.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {article.tags.slice(0, 3).map((tag: string) => (
                                      <span
                                        key={tag}
                                        className="text-xs px-2 py-0.5 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default TopicDetail;
