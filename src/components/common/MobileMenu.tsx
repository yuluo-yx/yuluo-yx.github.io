import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import type { IconType } from 'react-icons';
import {
  FiUser,
  FiFileText,
  FiFolder,
  FiBookOpen,
  FiCamera,
} from 'react-icons/fi';

interface NavItem {
  name: string;
  path: string;
  icon: IconType;
}

const navItems: NavItem[] = [
  { name: 'About', path: '/', icon: FiUser },
  { name: 'Blogs', path: '/blogs', icon: FiFileText },
  { name: 'Projects', path: '/projects', icon: FiFolder },
  { name: 'Topics', path: '/topics', icon: FiBookOpen },
  { name: 'Gallery', path: '/gallery', icon: FiCamera },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const location = useLocation();
  const canUsePortal = typeof document !== 'undefined';

  const handleNavClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!canUsePortal) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩 */}
          <motion.div
            className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* 菜单 */}
          <motion.div
            className="fixed inset-y-0 right-0 z-[100] h-dvh min-h-screen w-72 max-w-[82vw] border-l border-gray-200 bg-white text-light-text shadow-2xl dark:border-gray-800 dark:bg-black dark:text-dark-text md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="移动端导航"
            style={{ height: '100dvh' }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* 关闭按钮 */}
            <div className="flex justify-end p-4">
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-light-text-secondary hover:bg-light-bg-secondary hover:text-light-text dark:text-dark-text-secondary dark:hover:bg-dark-bg-secondary dark:hover:text-dark-text transition-colors"
                aria-label="Close menu"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* 导航链接 */}
            <nav className="px-4 py-2">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleNavClick}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-light-text-secondary hover:bg-light-bg-secondary hover:text-light-text dark:text-dark-text-secondary dark:hover:bg-dark-bg-secondary dark:hover:text-dark-text'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function MobileMenuButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded-lg hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary transition-colors"
        aria-label="Open menu"
      >
        <FiMenu className="w-6 h-6" />
      </button>
      <MobileMenu isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
