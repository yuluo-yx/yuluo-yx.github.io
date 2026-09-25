import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiBookOpen,
  FiFileText,
  FiCpu,
  FiServer,
  FiLayers,
  FiShield,
  FiMusic,
  FiTrendingUp,
  FiArrowRight,
} from 'react-icons/fi';
import { usePlum } from '../hooks/usePlum';
import { useThemeStore } from '../store/themeStore';
import { loadTopicCategories, type TopicCategory } from '../utils/topicLoader';

function getTopicIcon(path: string) {
  switch (path) {
    case 'AI':
    case 'spring-ai-alibaba-reactagent':
      return FiCpu;
    case 'kueue':
    case 'cloud_native':
      return FiServer;
    case 'ai-gateway':
    case 'microservice':
      return FiLayers;
    case 'design-pattern':
      return FiBookOpen;
    case 'finance':
      return FiTrendingUp;
    case 'music':
      return FiMusic;
    default:
      return FiShield;
  }
}

export default function Topics() {
  const { theme } = useThemeStore();
  const [categories, setCategories] = useState<TopicCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const plumCanvasRef = usePlum({
    speed: 6,
    density: 0.5,
    color: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(55, 65, 81, 0.15)',
  });

  useEffect(() => {
    loadTopicCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  const totalArticles = categories.reduce((acc, cur) => acc + cur.articlesCount, 0);

  return (
    <motion.div
      className="min-h-screen relative"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
    >
      <canvas
        ref={plumCanvasRef}
        className="fixed inset-0 pointer-events-none opacity-50 dark:opacity-30"
        style={{ zIndex: 0 }}
      />
      <div className="relative" style={{ zIndex: 1 }}>
        {/* Header */}
        <section className="py-12 mb-4">
          <div className="container mx-auto px-6">
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">专栏</h1>

              {/* 专栏介绍 */}
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed mb-2">
                  涵盖特定技术方向与领域的系统性知识笔记与深度实践文档。
                </p>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  共 {categories.length} 个专题专栏 · 累计收录 {totalArticles} 篇文档
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Topics Grid */}
        <section className="container mx-auto px-6 pb-16">
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  专栏加载中...
                </p>
              </div>
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => {
                  const Icon = getTopicIcon(category.path);
                  return (
                    <Link
                      key={category.id}
                      to={`/topics/${category.path}`}
                      className="block group"
                    >
                      <div className="h-full p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-light-bg-secondary dark:bg-dark-bg-secondary hover:border-primary dark:hover:border-primary transition-colors flex flex-col justify-between">
                        <div>
                          {/* 专栏图标与标题 */}
                          <div className="mb-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold text-light-text dark:text-dark-text group-hover:text-primary transition-colors leading-snug">
                              {category.name}
                            </h3>
                          </div>

                          {/* 描述 */}
                          <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4 line-clamp-3 leading-relaxed">
                            {category.description}
                          </p>
                        </div>

                        {/* 底部信息 */}
                        <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs text-light-text-secondary dark:text-dark-text-secondary">
                          <div className="flex items-center gap-1.5">
                            <FiFileText className="w-3.5 h-3.5" />
                            <span>{category.articlesCount} 篇文章</span>
                          </div>

                          <div className="flex items-center gap-1 font-medium text-primary group-hover:translate-x-0.5 transition-transform">
                            <span>浏览</span>
                            <FiArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  暂无专栏内容，敬请期待...
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
