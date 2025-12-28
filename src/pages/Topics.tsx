import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiFileText } from 'react-icons/fi';
import { usePlum } from '../hooks/usePlum';
import { useThemeStore } from '../store/themeStore';
import { loadTopicCategories, type TopicCategory } from '../utils/topicLoader';

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

  return (
    <motion.div
      className="min-h-screen relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <canvas
        ref={plumCanvasRef}
        className="fixed inset-0 pointer-events-none opacity-50 dark:opacity-30"
        style={{ zIndex: 0 }}
      />
      <div className="relative" style={{ zIndex: 1 }}>
        {/* Header */}
        <section className="py-12 mb-8">
          <div className="container mx-auto px-6">
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">专栏</h1>
              
              {/* 专栏介绍 */}
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed mb-4">
                  这里会放一些有关于某个方向或领域的一系列学习文档：
                </p>
                <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                  包括但不限于：AI、微服务、云原生、技术探索、隐私计算、设计模式...
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Topics Grid */}
        <section className="container mx-auto px-6 pb-12">
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="text-center py-20">
                <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary">
                  加载中...
                </p>
              </div>
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/topics/${category.path}`}
                      className="block h-full"
                    >
                      <div className="h-full p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-750 transition-all shadow-sm hover:shadow-md">
                        {/* 专栏图标 */}
                        <div className="mb-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center">
                            <FiBookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="text-xl font-semibold">
                            {category.name}
                          </h3>
                        </div>

                        {/* 描述 */}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                          {category.description}
                        </p>

                        {/* 文章数量 */}
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                          <FiFileText className="w-4 h-4" />
                          <span>{category.articlesCount} 篇文章</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary">
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
