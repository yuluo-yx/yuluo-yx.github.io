import { useEffect, useRef, useState } from 'react';
import { FiCheck, FiShare2 } from 'react-icons/fi';

interface ShareButtonProps {
  className?: string;
  ariaLabel?: string;
}

function copyWithFallback(text: string) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  textarea.style.top = '0';
  textarea.style.left = '0';

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, text.length);

  let copied = false;

  try {
    copied = document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }

  return copied;
}

export default function ShareButton({
  className = '',
  ariaLabel = '复制当前页面链接',
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleShare = async () => {
    const currentUrl = window.location.href;
    let success = false;

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(currentUrl);
        success = true;
      } catch (error) {
        console.error('复制链接失败，尝试降级复制方案:', error);
      }
    }

    if (!success) {
      success = copyWithFallback(currentUrl);
    }

    if (!success) {
      console.error('复制链接失败，浏览器不支持当前复制方案');
      return;
    }

    setCopied(true);

    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
    }

    resetTimerRef.current = window.setTimeout(() => {
      setCopied(false);
      resetTimerRef.current = null;
    }, 2000);
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-sm font-medium text-light-text shadow-sm transition-colors hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-dark-card/80 dark:text-dark-text-secondary dark:hover:border-primary dark:hover:text-primary ${className}`}
    >
      {copied ? (
        <>
          <FiCheck className="h-4 w-4" />
          <span>已复制</span>
        </>
      ) : (
        <>
          <FiShare2 className="h-4 w-4" />
          <span>分享</span>
        </>
      )}
    </button>
  );
}
