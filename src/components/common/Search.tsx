import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiSearch, FiX } from 'react-icons/fi';

type SearchStatus = 'idle' | 'loading' | 'ready' | 'error';

interface PagefindUIOptions {
  element: string;
  showImages?: boolean;
  resetStyles?: boolean;
}

declare global {
  interface Window {
    PagefindUI?: new (options: PagefindUIOptions) => unknown;
  }
}

const PAGEFIND_CSS_ID = 'pagefind-ui-css';
const PAGEFIND_SCRIPT_ID = 'pagefind-ui-script';
const PAGEFIND_CONTAINER_ID = 'pagefind-modal-search';

let pagefindAssetsPromise: Promise<void> | null = null;

function loadPagefindAssets(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.PagefindUI) {
    return Promise.resolve();
  }

  if (pagefindAssetsPromise) {
    return pagefindAssetsPromise;
  }

  const loadingPromise = new Promise<void>((resolve, reject) => {
    if (!document.getElementById(PAGEFIND_CSS_ID)) {
      const link = document.createElement('link');
      link.id = PAGEFIND_CSS_ID;
      link.rel = 'stylesheet';
      link.href = '/pagefind/pagefind-ui.css';
      document.head.appendChild(link);
    }

    const existingScript = document.getElementById(PAGEFIND_SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Pagefind UI 加载失败')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = PAGEFIND_SCRIPT_ID;
    script.src = '/pagefind/pagefind-ui.js';
    script.async = true;
    script.onload = () => {
      if (window.PagefindUI) {
        resolve();
      } else {
        reject(new Error('Pagefind UI 未初始化'));
      }
    };
    script.onerror = () => reject(new Error('Pagefind UI 加载失败'));
    document.body.appendChild(script);
  }).catch(error => {
    pagefindAssetsPromise = null;
    throw error;
  });

  pagefindAssetsPromise = loadingPromise;

  return loadingPromise;
}

export default function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const initializedRef = useRef(false);
  const canUsePortal = typeof document !== 'undefined';

  const closeSearch = useCallback(() => {
    setIsOpen(false);
  }, []);

  const openSearch = useCallback(() => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openSearch();
        return;
      }

      if (event.key === 'Escape') {
        closeSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeSearch, openSearch]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let cancelled = false;

    setStatus(current => (current === 'ready' ? current : 'loading'));

    loadPagefindAssets()
      .then(() => {
        if (cancelled) {
          return;
        }

        const container = document.getElementById(PAGEFIND_CONTAINER_ID);

        if (!container || !window.PagefindUI) {
          throw new Error('Pagefind 搜索容器不可用');
        }

        if (!initializedRef.current || container.childElementCount === 0) {
          container.innerHTML = '';
          new window.PagefindUI({
            element: `#${PAGEFIND_CONTAINER_ID}`,
            showImages: false,
            resetStyles: false,
          });
          initializedRef.current = true;
        }

        setStatus('ready');
        window.setTimeout(() => {
          document.querySelector<HTMLInputElement>('.pagefind-search-panel .pagefind-ui__search-input')?.focus();
        }, 50);
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className="inline-flex h-[38px] min-w-[38px] items-center justify-center gap-2 rounded-lg border border-gray-200 bg-light-card px-3 text-sm font-medium text-light-text-secondary transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-gray-700 dark:bg-dark-card dark:text-dark-text-secondary dark:hover:border-blue-500 dark:hover:text-blue-400"
        aria-label="搜索"
        title="搜索 (Ctrl+K)"
        onClick={openSearch}
      >
        <FiSearch className="h-4 w-4" />
        <span className="hidden lg:inline">搜索</span>
        <kbd className="hidden rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 xl:inline">
          Ctrl K
        </kbd>
      </button>

      {isOpen && canUsePortal ? createPortal(
        <div
          className="fixed inset-0 z-[100] overflow-y-auto bg-black/50 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="站内搜索"
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              closeSearch();
            }
          }}
        >
          <div className="pagefind-search-panel mx-auto w-full max-w-3xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#111827]">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
              <div className="flex items-center gap-2 text-sm font-semibold text-light-text dark:text-dark-text">
                <FiSearch className="h-4 w-4 text-blue-500" />
                <span>站内搜索</span>
              </div>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-light-text-secondary transition-colors hover:bg-gray-100 hover:text-light-text dark:text-dark-text-secondary dark:hover:bg-gray-800 dark:hover:text-dark-text"
                aria-label="关闭搜索"
                onClick={closeSearch}
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-[220px] p-4">
              {status === 'error' ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
                  搜索索引暂不可用，请先执行构建生成 Pagefind 索引。
                </div>
              ) : null}
              {status === 'loading' ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-light-text-secondary dark:border-gray-800 dark:bg-gray-900 dark:text-dark-text-secondary">
                  搜索加载中...
                </div>
              ) : null}
              <div id={PAGEFIND_CONTAINER_ID} className={status === 'error' ? 'hidden' : ''} />
            </div>
          </div>
        </div>,
        document.body
      ) : null}

      <style>{`
        .pagefind-search-panel .pagefind-ui {
          --pagefind-ui-scale: 0.92;
          --pagefind-ui-primary: #2563eb;
          --pagefind-ui-text: #111827;
          --pagefind-ui-background: #ffffff;
          --pagefind-ui-border: #e5e7eb;
          --pagefind-ui-tag: #f3f4f6;
          --pagefind-ui-border-width: 1px;
          --pagefind-ui-border-radius: 8px;
          --pagefind-ui-image-border-radius: 6px;
          --pagefind-ui-font: inherit;
        }

        .dark .pagefind-search-panel .pagefind-ui {
          --pagefind-ui-primary: #60a5fa;
          --pagefind-ui-text: #f9fafb;
          --pagefind-ui-background: #111827;
          --pagefind-ui-border: #374151;
          --pagefind-ui-tag: #1f2937;
        }

        .pagefind-search-panel .pagefind-ui__form::before {
          display: none;
        }

        .pagefind-search-panel .pagefind-ui__search-input {
          box-shadow: none;
          padding-left: 1rem;
        }

        .pagefind-search-panel .pagefind-ui__result-link {
          font-weight: 700;
        }

        .pagefind-search-panel .pagefind-ui__result-excerpt {
          line-height: 1.7;
        }
      `}</style>
    </>
  );
}
