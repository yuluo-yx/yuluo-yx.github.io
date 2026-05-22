import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowUpRight, FiCheck, FiCopy } from 'react-icons/fi';
import { siteBrand } from '../config/brand';
import { friendLinks, myFriendCard, type FriendLink } from '../data/friendLinks';
import { usePlum } from '../hooks/usePlum';
import { useThemeStore } from '../store/themeStore';

const pageMotion = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

function Avatar({
  friend,
  className = 'h-16 w-16 p-2',
}: {
  friend: FriendLink;
  className?: string;
}) {
  return (
    <div
      className={`${className} flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700`}
    >
      <img
        src={friend.avatar}
        alt={`${friend.name} logo`}
        className="h-full w-full object-contain"
        loading="lazy"
      />
    </div>
  );
}

function FriendCard({ friend, index }: { friend: FriendLink; index: number }) {
  return (
    <motion.article
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="group relative rounded-lg border border-gray-200 bg-light-bg-secondary p-4 shadow-sm transition-colors dark:border-gray-800 dark:bg-dark-bg-secondary"
    >
      <div className="flex items-start gap-3">
        <Avatar friend={friend} className="h-12 w-12 p-1.5" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="truncate text-base font-semibold tracking-normal text-light-text dark:text-dark-text">
              {friend.name}
            </h3>
            <a
              href={friend.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-primary transition-colors hover:bg-primary/10"
              aria-label={`访问 ${friend.name}`}
              title={`访问 ${friend.name}`}
            >
              <FiArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
          <p className="mt-1.5 text-sm leading-6 text-light-text-secondary dark:text-dark-text-secondary">
            {friend.description}
          </p>
        </div>
      </div>

    </motion.article>
  );
}

function buildMySiteText() {
  return `{
  title: '${myFriendCard.name}',
  description: '${myFriendCard.description}',
  website: '${myFriendCard.href}',
  avatar: '${siteBrand.url}${siteBrand.logoPath}',
}`;
}

function copyWithTextarea(text: string) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

function FloatingMySiteCard() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = buildMySiteText();

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        copyWithTextarea(text);
      }
    } catch {
      copyWithTextarea(text);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <motion.aside
      drag
      dragMomentum={false}
      dragElastic={0.08}
      dragConstraints={{ left: 0, right: 260, top: -420, bottom: 0 }}
      initial={{ opacity: 0, x: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18, duration: 0.35 }}
      whileDrag={{
        scale: 1.03,
        boxShadow: '0 24px 70px rgba(59, 130, 246, 0.18)',
      }}
      className="fixed bottom-6 left-6 z-40 w-[min(22rem,calc(100vw-3rem))] cursor-grab rounded-lg border border-gray-200 bg-light-bg-secondary/95 p-4 shadow-lg backdrop-blur active:cursor-grabbing dark:border-gray-800 dark:bg-dark-bg-secondary/95"
      aria-label="我的站点信息"
    >
      <div className="mb-4 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        <span>My Site</span>
        <button
          type="button"
          onClick={handleCopy}
          onPointerDown={event => event.stopPropagation()}
          className="rounded-md p-1 transition-colors hover:bg-primary/10"
          aria-label="复制友链信息"
          title={copied ? '已复制' : '复制友链信息'}
        >
          {copied ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex min-w-0 items-center gap-4">
        <Avatar friend={myFriendCard} />
        <div className="min-w-0">
          <h2 className="truncate text-xl font-semibold">{myFriendCard.name}</h2>
          <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            {myFriendCard.description}
          </p>
          <div className="mt-3 flex flex-nowrap gap-1.5 overflow-hidden">
            {myFriendCard.tags?.map(tag => (
              <span
                key={tag}
                className="shrink-0 whitespace-nowrap rounded-md border border-primary/25 px-2 py-0.5 text-[11px] font-medium leading-5 text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

export default function Links() {
  const { theme } = useThemeStore();
  const plumCanvasRef = usePlum({
    speed: 6,
    density: 0.5,
    color: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(55, 65, 81, 0.15)',
  });

  return (
    <motion.div className="relative min-h-screen bg-light-bg dark:bg-dark-bg" {...pageMotion}>
      <canvas
        ref={plumCanvasRef}
        className="pointer-events-none fixed inset-0 opacity-50 dark:opacity-30"
        style={{ zIndex: 0 }}
      />

      <div className="relative" style={{ zIndex: 1 }}>
        <section className="py-12 mb-8">
          <div className="container mx-auto px-6">
            <motion.div
              className="mx-auto max-w-4xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="mb-6 text-4xl font-bold text-light-text dark:text-dark-text md:text-5xl">
                Links
              </h1>

              <div className="prose prose-lg max-w-none dark:prose-invert">
                <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                  记录一路同行的朋友站点，保持连接，也保留彼此的入口
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-6 pb-16">
          <motion.div
            className="mx-auto max-w-3xl"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.35 }}
          >
            <div className="mb-6 flex items-end justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-800">
              <div>
                <h2 className="text-2xl font-bold">朋友们</h2>
                <p className="mt-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  {friendLinks.length} sites collected
                </p>
              </div>
            </div>

            {friendLinks.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {friendLinks.map((friend, index) => (
                  <FriendCard key={friend.id} friend={friend} index={index} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 bg-light-bg-secondary p-8 text-center dark:border-gray-700 dark:bg-dark-bg-secondary">
                <p className="text-base font-medium">友链列表整理中</p>
                <p className="mt-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  下一次更新时会补齐已经确认的站点。
                </p>
              </div>
            )}
          </motion.div>
        </section>
      </div>

      <FloatingMySiteCard />
    </motion.div>
  );
}
