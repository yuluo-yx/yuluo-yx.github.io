import { useState, useEffect } from 'react';
import { FiExternalLink } from 'react-icons/fi';

interface SmartLinkProps {
  href?: string;
  children?: React.ReactNode;
}

// 缓存已获取的标题，避免重复请求
const titleCache = new Map<string, string>();

export default function SmartLink({ href, children }: SmartLinkProps) {
  const [title, setTitle] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // 判断 children 是否就是 URL（用户直接粘贴 URL）
  const childText = typeof children === 'string' ? children : '';
  const isPlainUrl = childText === href || (childText.startsWith('http://') || childText.startsWith('https://'));

  useEffect(() => {
    if (!href || !isPlainUrl) return;

    // 检查缓存
    if (titleCache.has(href)) {
      setTitle(titleCache.get(href) || '');
      return;
    }

    const fetchTitle = async () => {
      setLoading(true);
      try {
        // 方案1：尝试从 URL 提取有意义的文本
        const url = new URL(href);
        const domain = url.hostname.replace('www.', '');
        
        // 尝试从路径提取标题
        const pathParts = url.pathname.split('/').filter(Boolean);
        const lastPart = pathParts[pathParts.length - 1];
        const readableTitle = lastPart
          ? lastPart
              .replace(/[-_]/g, ' ')
              .replace(/\.(html|htm|php|asp|aspx)$/, '')
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
          : domain;

        // 使用域名 + 路径作为标题
        const fallbackTitle = pathParts.length > 0 
          ? `${readableTitle} - ${domain}`
          : domain;

        setTitle(fallbackTitle);
        titleCache.set(href, fallbackTitle);

        // 方案2：尝试使用 LinkPreview API (可选)
        // 注意：这需要一个后端服务或使用第三方 API
        // 由于 CORS 限制，直接从客户端获取大多数网站的内容会失败
        
      } catch (error) {
        console.error('Failed to fetch title for:', href, error);
        setTitle(href);
      } finally {
        setLoading(false);
      }
    };

    fetchTitle();
  }, [href, isPlainUrl]);

  // 如果不是纯 URL，使用原始 children
  const displayText = isPlainUrl && title ? title : children;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline inline-flex items-center gap-1 group"
      title={href}
    >
      <span className={loading ? 'animate-pulse' : ''}>
        {displayText}
      </span>
      <FiExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </a>
  );
}
