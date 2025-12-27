import { motion } from 'framer-motion';
import TopicCard from '../components/topic/TopicCard';
import { usePlum } from '../hooks/usePlum';
import { useThemeStore } from '../store/themeStore';
import type { Topic } from '../types';

const mockTopics: Topic[] = [
  {
    id: 'ai-ml-series',
    name: 'AI & Machine Learning',
    description: '深入探讨人工智能和机器学习的核心概念、算法实现和实际应用案例。',
    posts: [],
    totalPosts: 12,
    completedPosts: 8,
    lastUpdated: '2024-12-20',
  },
  {
    id: 'design-patterns',
    name: '设计模式详解',
    description: '系统学习23种经典设计模式，通过实际案例理解每种模式的应用场景和实现方式。',
    posts: [],
    totalPosts: 23,
    completedPosts: 15,
    lastUpdated: '2024-12-18',
  },
  {
    id: 'web-performance',
    name: 'Web 性能优化',
    description: '从多个维度探讨 Web 应用性能优化，包括加载优化、渲染优化、网络优化等。',
    posts: [],
    totalPosts: 10,
    completedPosts: 6,
    lastUpdated: '2024-12-15',
  },
  {
    id: 'typescript-advanced',
    name: 'TypeScript 进阶',
    description: '深入理解 TypeScript 类型系统，掌握高级类型、泛型和类型体操技巧。',
    posts: [],
    totalPosts: 15,
    completedPosts: 10,
    lastUpdated: '2024-12-10',
  },
];

export default function Topics() {
  const { theme } = useThemeStore();
  const plumCanvasRef = usePlum({
    speed: 6,
    density: 0.5,
    color: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(55, 65, 81, 0.15)',
  });

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
        <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">专栏</h1>
            <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary">
              系列文章合集，深入探讨特定主题
            </p>
          </motion.div>
        </div>
      </section>

      {/* Topics Grid */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {mockTopics.map(topic => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>

        {/* Empty State */}
        {mockTopics.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary">
              暂无专栏内容，敬请期待...
            </p>
          </div>
        )}
      </section>
      </div>
    </motion.div>
  );
}
