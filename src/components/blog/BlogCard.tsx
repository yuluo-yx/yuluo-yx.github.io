import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiClock, FiCalendar } from 'react-icons/fi';
import type { BlogPost } from '../../types';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  const formattedDate = new Date(post.date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <motion.article
      className="group flex flex-col h-full bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-colors overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/blogs/${post.slug}`} className="flex flex-col h-full">
        {/* Cover Image - 仅在有图片时展示 */}
        {post.coverImage && (
          <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-gray-900">
            <img
              src={post.coverImage}
              alt={post.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Meta Category & Reading Time */}
            <div className="flex items-center justify-between text-xs text-light-text-secondary dark:text-dark-text-secondary mb-2">
              <span className="font-medium text-primary">
                {post.category}
              </span>
              {post.readingTime && (
                <div className="flex items-center gap-1">
                  <FiClock className="w-3 h-3" />
                  <span>{post.readingTime} 分钟</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold text-light-text dark:text-dark-text group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {post.title}
            </h2>

            {/* Description */}
            <p className="mt-2 text-sm text-light-text-secondary dark:text-dark-text-secondary line-clamp-2 leading-relaxed">
              {post.description || post.title}
            </p>
          </div>

          {/* Footer: Tags & Date */}
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-light-text-secondary dark:text-dark-text-secondary">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1.5">
              {post.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-light-text-secondary dark:text-dark-text-secondary font-medium"
                >
                  #{tag}
                </span>
              ))}
              {post.tags.length > 2 && (
                <span className="text-light-text-secondary dark:text-dark-text-secondary">
                  +{post.tags.length - 2}
                </span>
              )}
            </div>

            {/* Date */}
            <div className="flex items-center gap-1">
              <FiCalendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
