import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiChevronRight, FiChevronDown } from 'react-icons/fi';

interface TocItem {
  id: string;
  text: string;
  level: number;
  children?: TocItem[];
}

interface TableOfContentsProps {
  content: string;
}

// 生成 slug ID，与 MarkdownRenderer 保持一致
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '') // 保留字母、数字、中文、空格和连字符
    .trim()
    .replace(/\s+/g, '_') // 空格替换为下划线
    .replace(/-+/g, '_'); // 连字符替换为下划线
};

// 将扁平的标题列表转换为树形结构
const buildTree = (headings: TocItem[]): TocItem[] => {
  const root: TocItem[] = [];
  const stack: TocItem[] = [];

  headings.forEach((heading) => {
    const newItem = { ...heading, children: [] };

    // 找到父节点
    while (stack.length > 0 && stack[stack.length - 1].level >= newItem.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(newItem);
    } else {
      const parent = stack[stack.length - 1];
      if (!parent.children) parent.children = [];
      parent.children.push(newItem);
    }

    stack.push(newItem);
  });

  return root;
};

const TableOfContents = ({ content }: TableOfContentsProps) => {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    // 从 Markdown 内容中提取标题，排除代码块中的内容
    const lines = content.split('\n');
    const toc: TocItem[] = [];
    let inCodeBlock = false;

    lines.forEach((line) => {
      // 检测代码块的开始和结束
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        return;
      }

      // 如果在代码块中，跳过这一行
      if (inCodeBlock) {
        return;
      }

      // 匹配标题（不在代码块中）
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        // 使用 slug 作为 ID
        const id = generateSlug(text);
        toc.push({ id, text, level });
      }
    });

    setHeadings(buildTree(toc));
    
    // 默认只展开到 H2 级别
    const defaultExpanded = new Set<string>();
    toc.forEach((item) => {
      if (item.level <= 2) {
        defaultExpanded.add(item.id);
      }
    });
    setExpandedItems(defaultExpanded);
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

  const scrollToHeading = (id: string) => {
    // 直接通过 ID 查找元素
    const element = document.getElementById(id);
    
    if (element) {
      const top = element.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const renderTocItem = (item: TocItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);

    return (
      <li key={item.id}>
        <div className="flex items-center">
          {hasChildren && (
            <button
              onClick={() => toggleExpand(item.id)}
              className="mr-1 p-0.5 hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary rounded transition-colors"
            >
              {isExpanded ? (
                <FiChevronDown className="w-3 h-3 text-light-secondary dark:text-dark-secondary" />
              ) : (
                <FiChevronRight className="w-3 h-3 text-light-secondary dark:text-dark-secondary" />
              )}
            </button>
          )}
          {!hasChildren && <span className="w-4" />}
          <button
            onClick={() => scrollToHeading(item.id)}
            className={`text-left flex-1 py-1 transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
              activeId === item.id
                ? 'text-blue-600 dark:text-blue-400 font-medium'
                : 'text-light-secondary dark:text-dark-secondary'
            }`}
          >
            {item.text}
          </button>
        </div>
        {hasChildren && isExpanded && (
          <ul className="ml-4 space-y-2 mt-2">
            {item.children!.map((child) => renderTocItem(child, depth + 1))}
          </ul>
        )}
      </li>
    );
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
        {headings.map((item) => renderTocItem(item))}
      </ul>
    </motion.nav>
  );
};

export default TableOfContents;
