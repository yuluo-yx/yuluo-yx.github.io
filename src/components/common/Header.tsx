import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiFileText,
  FiFolder,
  FiBookOpen,
  FiCamera,
} from 'react-icons/fi';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { MobileMenuButton } from './MobileMenu';

const navItems = [
  { name: 'About', path: '/', icon: FiUser },
  { name: 'Blogs', path: '/blogs', icon: FiFileText },
  { name: 'Projects', path: '/projects', icon: FiFolder },
  { name: 'Topics', path: '/topics', icon: FiBookOpen },
  { name: 'Gallery', path: '/gallery', icon: FiCamera },
];

export default function Header() {
  const location = useLocation();

  const handleNavClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <Logo />
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link key={item.path} to={item.path} className="relative" onClick={handleNavClick}>
                  <motion.div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'text-primary'
                        : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.name}</span>
                  </motion.div>
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      layoutId="activeNav"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <MobileMenuButton />
          </div>
        </div>
      </nav>
    </header>
  );
}
