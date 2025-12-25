import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import CodeBlock from './CodeBlock';
import 'highlight.js/styles/atom-one-dark.css';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Custom heading with anchor links
          h1: ({ children }) => (
            <h1 className="text-4xl font-bold mt-8 mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-3xl font-bold mt-6 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-2xl font-bold mt-4 mb-2">{children}</h3>
          ),
          // Custom code blocks with copy button
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            
            // 提取纯文本内容用于复制功能
            const getTextContent = (node: any): string => {
              if (typeof node === 'string') return node;
              if (Array.isArray(node)) return node.map(getTextContent).join('');
              if (node?.props?.children) return getTextContent(node.props.children);
              return '';
            };
            
            const textContent = getTextContent(children);
            
            return isInline ? (
              <code className="px-1.5 py-0.5 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded text-sm font-mono">
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
          // Custom table
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                {children}
              </table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
