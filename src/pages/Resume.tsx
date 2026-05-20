import { useState } from 'react';
import { FiDownload, FiMaximize2, FiMinimize2 } from 'react-icons/fi';

export default function Resume() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const pdfUrl = '/resume/resume.pdf';
  const resumePages = [
    '/resume/resume-page-1.png',
    '/resume/resume-page-2.png',
  ];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-200 dark:bg-gray-950">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Resume</span>
        <div className="flex items-center gap-2">
          <a
            href={pdfUrl}
            download="resume.pdf"
            className="flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <FiDownload size={14} />
            <span>下载</span>
          </a>
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            aria-label={isFullscreen ? '退出全屏' : '全屏查看简历'}
          >
            {isFullscreen ? <FiMinimize2 size={14} /> : <FiMaximize2 size={14} />}
          </button>
        </div>
      </div>
      <main className="flex-1 space-y-6 overflow-y-auto px-3 py-6 sm:px-6 lg:py-8">
        {resumePages.map((page, index) => (
          <img
            key={page}
            src={page}
            alt={`Resume page ${index + 1}`}
            className="mx-auto block h-auto w-full max-w-[960px] select-none rounded-sm bg-white shadow-[0_18px_45px_rgba(15,23,42,0.18)] ring-1 ring-black/10 dark:ring-white/10"
            draggable={false}
            loading={index === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </main>
    </div>
  );
}
