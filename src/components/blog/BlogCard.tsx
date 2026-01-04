import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiClock, FiCalendar } from 'react-icons/fi';
import type { BlogPost } from '../../types';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <motion.article
      className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 group flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link to={`/blogs/${post.slug}`} className="flex flex-col h-full">
        {/* Cover Image - 只在有图片时显示 */}
        {post.coverImage && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Title */}
          <h2 className="text-lg font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {post.title}
          </h2>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-md font-medium"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 2 && (
              <span className="text-xs px-2 py-0.5 text-light-text-secondary dark:text-dark-text-secondary">
                +{post.tags.length - 2}
              </span>
            )}
          </div>

          {/* Footer - Date and Reading Time */}
          <div className="flex items-center justify-between text-xs text-light-text-secondary dark:text-dark-text-secondary mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1">
              <FiCalendar className="w-3 h-3" />
              <span>{new Date(post.date).toLocaleDateString('zh-CN', { 
                year: 'numeric',
                month: 'short',
                day: 'numeric' 
              })}</span>
            </div>
            
            {post.readingTime && (
              <div className="flex items-center gap-1">
                <FiClock className="w-3 h-3" />
                <span>{post.readingTime} min</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
