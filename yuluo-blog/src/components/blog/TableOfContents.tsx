import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

const TableOfContents = ({ content }: TableOfContentsProps) => {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // 从 Markdown 内容中提取标题
    const lines = content.split('\n');
    const toc: TocItem[] = [];

    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2];
        // 生成 ID（简化版本，实际应该更健壮）
        const id = `heading-${index}`;
        toc.push({ id, text, level });
      }
    });

    setHeadings(toc);
  }, [content]);

  useEffect(() => {
    // 监听滚动，高亮当前标题
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
      }
    );

    // 观察所有标题元素
    const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headingElements.forEach((elem) => observer.observe(elem));

    return () => {
      headingElements.forEach((elem) => observer.unobserve(elem));
    };
  }, []);

  if (headings.length === 0) {
    return null;
  }

  const scrollToHeading = (text: string) => {
    // 查找对应的标题元素
    const headingElements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const element = headingElements.find((el) => el.textContent === text);
    
    if (element) {
      const top = element.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-1"
    >
      <h2 className="text-sm font-semibold mb-4 text-light-text dark:text-dark-text">
        目录
      </h2>

      <ul className="space-y-2 text-sm">
        {headings.map((heading, index) => (
          <li
            key={index}
            style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
          >
            <button
              onClick={() => scrollToHeading(heading.text)}
              className={`text-left w-full py-1 transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                activeId === heading.id
                  ? 'text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-light-secondary dark:text-dark-secondary'
              }`}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </motion.nav>
  );
};

export default TableOfContents;
