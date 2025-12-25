import { useState } from 'react';
import { FiCheck, FiCopy } from 'react-icons/fi';

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  textContent?: string;  // 用于复制的纯文本
}

const CodeBlock = ({ children, className, textContent }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  
  // 提取语言信息
  const language = className?.replace('language-', '') || 'text';
  
  const handleCopy = async () => {
    try {
      const textToCopy = textContent || String(children);
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="relative group my-6">
      {/* 语言标签和复制按钮 */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1f2937] dark:bg-[#0d1117] rounded-t-lg border-b border-gray-700">
        <span className="text-xs text-gray-400 font-mono uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors rounded hover:bg-gray-700"
          aria-label="复制代码"
        >
          {copied ? (
            <>
              <FiCheck className="w-4 h-4 text-green-400" />
              <span className="text-green-400">已复制</span>
            </>
          ) : (
            <>
              <FiCopy className="w-4 h-4" />
              <span>复制</span>
            </>
          )}
        </button>
      </div>
      
      {/* 代码内容 - 保留 rehype-highlight 添加的 HTML 结构以获得语法高亮 */}
      <div className="overflow-x-auto bg-[#1f2937] dark:bg-[#0d1117] rounded-b-lg">
        <pre className="!my-0 !bg-transparent !p-4 text-base">
          <code className={className}>{children}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
