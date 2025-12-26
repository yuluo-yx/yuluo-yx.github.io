import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiClock, FiTag } from 'react-icons/fi';
import DateInfo from '../components/common/DateInfo';
import { loadAllBlogs } from '../utils/blogLoader';
import type { BlogPost } from '../types';

// Load all blog posts from markdown files
const allPosts = loadAllBlogs();

export default function Blogs() {
  const [selectedTag, setSelectedTag] = useState<string>('All');

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set(allPosts.flatMap(post => post.tags));
    return ['All', ...Array.from(tags)];
  }, []);

  // Filter posts by tag
  const filteredPosts = useMemo(() => {
    if (selectedTag === 'All') {
      return allPosts;
    }
    return allPosts.filter(post => post.tags.includes(selectedTag));
  }, [selectedTag]);

  // Group posts by year
  const postsByYear = useMemo(() => {
    const grouped: Record<string, BlogPost[]> = {};
    filteredPosts.forEach(post => {
      const year = new Date(post.date).getFullYear().toString();
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(post);
    });
    // 按年份降序排序（2025 -> 2024 -> 2023...）
    return Object.keys(grouped)
      .sort((a, b) => Number(b) - Number(a))
      .reduce((acc, year) => {
        // 每年内的文章也按日期降序排序（最新的在前）
        acc[year] = grouped[year].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return acc;
      }, {} as Record<string, BlogPost[]>);
  }, [filteredPosts]);

  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <section className="bg-light-bg-secondary dark:bg-dark-bg-secondary py-16">
        <div className="container mx-auto px-6">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
            <DateInfo />
          </motion.div>
        </div>
      </section>

      {/* Tag Filter Section */}
      <section className="sticky top-16 z-40 bg-light-bg/95 dark:bg-dark-bg/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap items-center gap-3">
              <FiTag className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
              <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">标签:</span>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedTag === tag
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-light-bg-secondary dark:bg-dark-bg-secondary hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <motion.div 
              className="mt-4 text-sm text-light-text-secondary dark:text-dark-text-secondary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              共 <span className="font-semibold text-primary">{filteredPosts.length}</span> 篇文章
            </motion.div>
          </div>
        </div>
      </section>

      {/* Blog Timeline */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {filteredPosts.length > 0 ? (
              <motion.div
                key="timeline"
                className="relative pl-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Timeline Line with Glow Effect */}
                <div className="absolute left-1/3 top-0 bottom-0 w-px">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary to-primary/20" />
                </div>

                {Object.entries(postsByYear).map(([year, posts], yearIndex) => (
                  <div key={year} className="mb-20 last:mb-0">
                    {/* Year Label with Animation */}
                    <motion.div
                      className="relative mb-12 flex items-center"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        delay: yearIndex * 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                    >
                      {/* Year Text in blue - on the left */}
                      <h2 
                        className="text-5xl font-bold text-primary text-right pr-6" 
                        style={{ width: 'calc(33.333% - 3rem)' }}
                      >
                        {year}
                      </h2>
                      
                      {/* Short Line extending to timeline */}
                      <div className="h-0.5 w-12 bg-primary" />
                    </motion.div>

                    {/* Posts */}
                    <div className="space-y-6">
                      {posts.map((post, postIndex) => {
                        const postDate = new Date(post.date);
                        const monthDay = postDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
                        
                        return (
                          <motion.div
                            key={post.slug}
                            className="relative flex items-start group"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ 
                              delay: yearIndex * 0.1 + postIndex * 0.05,
                              type: "spring",
                              stiffness: 100
                            }}
                          >
                            {/* Date Badge */}
                            <div 
                              className="text-right pr-8 pt-2"
                              style={{ width: 'calc(33.333% - 1rem)' }}
                            >
                              <div className="inline-block px-3 py-1.5 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                {monthDay}
                              </div>
                            </div>

                            {/* Short Line extending from timeline */}
                            <div 
                              className="relative flex-shrink-0 mt-3"
                            >
                              <div className="h-0.5 w-6 bg-primary group-hover:w-8 transition-all" />
                            </div>

                            {/* Content Card */}
                            <Link 
                              to={`/blogs/${post.slug}`}
                              className="flex-1 pl-8"
                            >
                              <motion.div 
                                className="relative bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl p-6 border border-transparent hover:border-primary/20 transition-all overflow-hidden"
                                whileHover={{ 
                                  y: -4,
                                  boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)"
                                }}
                              >
                                {/* Hover Gradient Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="relative">
                                  {/* Title */}
                                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                                    {post.title}
                                  </h3>
                                  
                                  {/* Description */}
                                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4 line-clamp-2 leading-relaxed">
                                    {post.description}
                                  </p>
                                  
                                  {/* Meta Info */}
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold">
                                      {post.category}
                                    </span>
                                    {post.readingTime && (
                                      <div className="flex items-center gap-1.5 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                        <FiClock className="w-3.5 h-3.5" />
                                        <span className="font-medium">{post.readingTime} 分钟</span>
                                      </div>
                                    )}
                                    <div className="flex gap-2 flex-wrap">
                                      {post.tags.slice(0, 3).map(tag => (
                                        <span key={tag} className="text-xs font-medium text-primary/80 hover:text-primary transition-colors">
                                          #{tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Arrow Indicator */}
                                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                </div>
                              </motion.div>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="text-center py-20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="text-6xl mb-4">📭</div>
                <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary mb-4">
                  该标签下暂无文章
                </p>
                <button
                  onClick={() => setSelectedTag('All')}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  查看所有文章
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </motion.div>
  );
}
