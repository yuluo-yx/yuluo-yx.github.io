import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiClock, FiCalendar, FiArrowRight } from 'react-icons/fi';
import type { BlogPost } from '../../types';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <motion.article
      className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 group h-full flex flex-col"
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link to={`/blogs/${post.slug}`} className="flex flex-col h-full">
        {/* Cover Image with Gradient Overlay */}
        <div className="relative h-48 overflow-hidden">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-pink-600 transition-all duration-500" />
          )}
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-white/90 dark:bg-dark-bg/90 backdrop-blur-sm text-primary shadow-lg">
              {post.category}
            </span>
          </div>

          {/* Reading Time Badge */}
          {post.readingTime && (
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full bg-white/90 dark:bg-dark-bg/90 backdrop-blur-sm shadow-lg">
                <FiClock className="w-3 h-3" />
                <span>{post.readingTime} min</span>
              </div>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Title */}
          <h2 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {post.title}
          </h2>

          {/* Description */}
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4 line-clamp-3 flex-1">
            {post.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-md font-medium hover:bg-primary/20 transition-colors"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs px-2.5 py-1 text-light-text-secondary dark:text-dark-text-secondary">
                +{post.tags.length - 3}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
              <FiCalendar className="w-4 h-4" />
              <span>{new Date(post.date).toLocaleDateString('zh-CN', { 
                year: 'numeric',
                month: 'long',
                day: 'numeric' 
              })}</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
              <span>阅读更多</span>
              <FiArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
