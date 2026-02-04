import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiBookOpen } from 'react-icons/fi';

const NotFound = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="min-h-[70vh] flex items-center justify-center"
    >
      <div className="max-w-xl w-full text-center px-6">
        <p className="text-sm uppercase tracking-[0.3em] text-light-secondary dark:text-dark-secondary">
          404
        </p>
        <h1 className="mt-4 text-3xl md:text-4xl font-semibold">页面不见了</h1>
        <p className="mt-3 text-light-secondary dark:text-dark-secondary leading-relaxed">
          你访问的页面不存在，可能已被移动或链接有误。
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-light-card dark:bg-dark-card border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          >
            <FiHome />
            <span>返回首页</span>
          </Link>
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-light-card dark:bg-dark-card border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          >
            <FiBookOpen />
            <span>浏览博客</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default NotFound;
