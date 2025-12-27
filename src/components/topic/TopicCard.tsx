import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Topic } from '../../types';

interface TopicCardProps {
  topic: Topic;
}

export default function TopicCard({ topic }: TopicCardProps) {
  const progress = topic.totalPosts > 0 ? (topic.completedPosts / topic.totalPosts) * 100 : 0;

  return (
    <motion.article
      className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl overflow-hidden hover:shadow-xl transition-shadow"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link to={`/topics/${topic.id}`}>
        {/* Cover Image */}
        {topic.coverImage ? (
          <div className="h-48 overflow-hidden">
            <img
              src={topic.coverImage}
              alt={topic.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-48 bg-primary flex items-center justify-center">
            <span className="text-6xl">📚</span>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <h3 className="text-2xl font-bold mb-3 hover:text-primary transition-colors">
            {topic.name}
          </h3>
          
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
            {topic.description}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between mb-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            <span>{topic.completedPosts} / {topic.totalPosts} 篇文章</span>
            <span>更新于 {new Date(topic.lastUpdated).toLocaleDateString()}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-light-bg dark:bg-dark-bg rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
