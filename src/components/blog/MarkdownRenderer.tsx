import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import CodeBlock from './CodeBlock';
import 'highlight.js/styles/atom-one-dark.css';

interface MarkdownRendererProps {
  content: string;
}

interface CodeComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// 生成 slug ID
const generateSlug = (text: string | React.ReactNode): string => {
  const textContent = typeof text === 'string' 
    ? text 
    : React.Children.toArray(text).join('');
  
  return textContent
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '') // 保留字母、数字、中文、空格和连字符
    .trim()
    .replace(/\s+/g, '_') // 空格替换为下划线
    .replace(/-+/g, '_'); // 连字符替换为下划线
};

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none
      prose-headings:font-bold prose-headings:tracking-tight
      prose-h1:text-4xl prose-h1:mt-8 prose-h1:mb-6
      prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-4
      prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-3
      prose-p:my-4 prose-p:leading-7
      prose-li:my-1
      prose-img:rounded-lg prose-img:shadow-md prose-img:my-6 prose-img:mx-auto prose-img:max-w-full
      prose-pre:!p-0 prose-pre:!bg-transparent prose-pre:!my-0
      prose-code:!bg-transparent prose-code:!p-0
      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
      prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic
      prose-table:w-full
      prose-hr:my-8 prose-hr:border-gray-300 dark:prose-hr:border-gray-700
    ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          // Custom image with better spacing and styling
          img: ({ src, alt }) => (
            <div className="my-8 flex flex-col items-center">
              <img
                src={src}
                alt={alt || ''}
                className="rounded-lg shadow-lg max-w-full h-auto"
                loading="lazy"
              />
              {alt && (
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                  {alt}
                </span>
              )}
            </div>
          ),
          // Custom heading with anchor links
          h1: ({ children }) => {
            const id = generateSlug(children);
            return (
              <h1 id={id} className="text-4xl font-bold mt-8 mb-6 pb-2 border-b border-gray-200 dark:border-gray-700 scroll-mt-24">
                {children}
              </h1>
            );
          },
          h2: ({ children }) => {
            const id = generateSlug(children);
            return (
              <h2 id={id} className="text-3xl font-bold mt-8 mb-4 scroll-mt-24">
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const id = generateSlug(children);
            return (
              <h3 id={id} className="text-2xl font-semibold mt-6 mb-3 scroll-mt-24">
                {children}
              </h3>
            );
          },
          h4: ({ children }) => {
            const id = generateSlug(children);
            return (
              <h4 id={id} className="text-xl font-semibold mt-4 mb-2 scroll-mt-24">
                {children}
              </h4>
            );
          },
          // Custom paragraph
          p: ({ children }) => (
            <p className="my-4 leading-7 text-gray-700 dark:text-gray-300">{children}</p>
          ),
          // Custom code blocks with copy button
          code: ({ className, children }: CodeComponentProps) => {
            // 检查是否是行内代码（没有 className 表示是行内）
            const isInline = !className;
            
            // 提取纯文本内容用于复制功能
            const getTextContent = (node: unknown): string => {
              if (typeof node === 'string') return node;
              if (Array.isArray(node)) return node.map(getTextContent).join('');
              if (node && typeof node === 'object' && 'props' in node) {
                const nodeWithProps = node as { props?: { children?: unknown } };
                if (nodeWithProps.props?.children) {
                  return getTextContent(nodeWithProps.props.children);
                }
              }
              return '';
            };
            
            const textContent = getTextContent(children);
            
            return isInline ? (
              <code className="px-1.5 py-0.5 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded text-sm font-mono font-semibold text-gray-800 dark:text-gray-200">
                {children}
              </code>
            ) : (
              <CodeBlock className={className} textContent={textContent}>
                {children}
              </CodeBlock>
            );
          },
          // Custom links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {children}
            </a>
          ),
          // Custom blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 bg-light-bg-secondary dark:bg-dark-bg-secondary">
              {children}
            </blockquote>
          ),
          // Custom table - 只使用内联分割线
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-light-bg-secondary dark:bg-dark-bg-secondary">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left text-sm font-semibold border-b-2 border-gray-300 dark:border-gray-600">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-sm">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
