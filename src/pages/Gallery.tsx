import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiLayout,
  FiX,
  FiMapPin,
  FiCalendar,
} from 'react-icons/fi';
import { usePlum } from '../hooks/usePlum';
import { useThemeStore } from '../store/themeStore';
import type { GalleryImage } from '../types';

const mockImages: GalleryImage[] = [
  {
    id: '1',
    url: '/img/photo/1.jpg',
    category: 'Flower',
    title: '樱花',
    metadata: {
      date: '2026-03-30',
      location: '郑州 · 人民公园',
    },
  },
  {
    id: '2',
    url: '/img/photo/2.jpg',
    category: 'Tree',
    title: '枝叶交错',
    metadata: {
      date: '2026-03-30',
      location: '郑州 · 人民公园',
    },
  },
  {
    id: '3',
    url: '/img/photo/3.jpg',
    category: 'Nature',
    title: '绿意初醒',
    metadata: {
      date: '2026-03-30',
      location: '郑州 · 人民公园',
    },
  },
  {
    id: '4',
    url: '/img/photo/4.jpg',
    category: 'City',
    title: '林荫人行道',
    metadata: {
      date: '2026-03-30',
      location: '郑州 · 人民公园林荫道',
    },
  },
  {
    id: '5',
    url: '/img/photo/5.jpg',
    category: 'City',
    title: '天桥人流',
    metadata: {
      date: '2026-03-30',
      location: '郑州 · 人民公园天桥',
    },
  },
  {
    id: '6',
    url: '/img/photo/6.jpg',
    category: 'Flower',
    title: '初绽月季',
    metadata: {
      date: '2026-03-30',
      location: '郑州 · 月季公园',
    },
  },
  {
    id: '7',
    url: '/img/photo/7.jpg',
    category: 'Flower',
    title: '盛红月季',
    metadata: {
      date: '2026-04-25',
      location: '郑州 · 月季公园',
    },
  },
  {
    id: '8',
    url: '/img/photo/8.jpg',
    category: 'Flower',
    title: '素白月季',
    metadata: {
      date: '2026-04-25',
      location: '郑州 · 月季公园',
    },
  },
  {
    id: '9',
    url: '/img/photo/9.jpg',
    category: 'City',
    title: '西望远方',
    metadata: {
      date: '2026-05-01',
      location: '郑州 · 西三环天桥',
    },
  },
];

const categoryLabels: Record<string, string> = {
  All: '全部',
  Flower: '繁花',
  Tree: '草木',
  Nature: '自然',
  City: '城市',
};

const categories = ['All', 'Flower', 'Tree', 'Nature', 'City'];

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isCompact, setIsCompact] = useState(true);

  const { theme } = useThemeStore();
  const plumCanvasRef = usePlum({
    speed: 6,
    density: 0.45,
    color: theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(55, 65, 81, 0.12)',
  });

  const filteredImages = useMemo(() => {
    if (selectedCategory === 'All') return mockImages;
    return mockImages.filter((img) => img.category === selectedCategory);
  }, [selectedCategory]);

  const selectedImageIndex = selectedImage
    ? filteredImages.findIndex((img) => img.id === selectedImage.id)
    : -1;
  const hasMultipleImages = filteredImages.length > 1;

  const closeLightbox = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const showImageByOffset = useCallback(
    (offset: number) => {
      if (!selectedImage || filteredImages.length === 0) return;
      const currentIndex = filteredImages.findIndex((img) => img.id === selectedImage.id);
      const safeIndex = currentIndex >= 0 ? currentIndex : 0;
      const nextIndex =
        (safeIndex + offset + filteredImages.length) % filteredImages.length;
      setSelectedImage(filteredImages[nextIndex]);
    },
    [filteredImages, selectedImage]
  );

  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLightbox();
        return;
      }
      if (!hasMultipleImages) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showImageByOffset(-1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        showImageByOffset(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeLightbox, hasMultipleImages, selectedImage, showImageByOffset]);

  return (
    <motion.div
      className="min-h-screen relative"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
    >
      {/* 梅花背景 - 统一全站风格 */}
      <canvas
        ref={plumCanvasRef}
        className="fixed inset-0 pointer-events-none opacity-40 dark:opacity-25"
        style={{ zIndex: 0 }}
      />

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Header */}
        <section className="py-12 mb-4">
          <div className="container mx-auto px-6">
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Gallery</h1>

              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed mb-2">
                  用镜头捕捉生活与自然的静谧瞬间，记录定格的微小光影。
                </p>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  共记录 {mockImages.length} 帧日常瞬间
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Toolbar & Filters */}
        <section className="container mx-auto px-6 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 max-w-6xl mx-auto">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary text-white shadow-sm font-semibold'
                      : 'border border-gray-300 dark:border-gray-700 hover:border-primary dark:hover:border-primary text-light-text-secondary dark:text-dark-text-secondary'
                  }`}
                >
                  {categoryLabels[cat] || cat}
                </button>
              ))}
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center gap-1 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-gray-200 dark:border-gray-800 rounded-lg p-1">
              <button
                onClick={() => setIsCompact(true)}
                className={`p-1.5 rounded text-xs transition-colors ${
                  isCompact
                    ? 'bg-primary text-white'
                    : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
                }`}
                title="紧凑排版"
              >
                <FiGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsCompact(false)}
                className={`p-1.5 rounded text-xs transition-colors ${
                  !isCompact
                    ? 'bg-primary text-white'
                    : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
                }`}
                title="宽松排版"
              >
                <FiLayout className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* Gallery Masonry Grid */}
        <section className="container mx-auto px-6 pb-16">
          <div
            className={`${
              isCompact
                ? 'columns-1 sm:columns-2 md:columns-3 xl:columns-4 gap-4'
                : 'columns-1 sm:columns-2 md:columns-3 gap-6'
            } max-w-6xl mx-auto`}
          >
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className={`${
                  isCompact ? 'mb-4' : 'mb-6'
                } break-inside-avoid cursor-pointer group`}
                onClick={() => setSelectedImage(image)}
              >
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-light-bg-secondary dark:bg-dark-bg-secondary hover:border-primary dark:hover:border-primary transition-colors">
                  <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-900">
                    <img
                      src={image.url}
                      alt={image.title || '摄影作品'}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-300 ease-out"
                    />
                  </div>

                  {/* Caption */}
                  <div className="p-3 flex items-center justify-between text-xs text-light-text-secondary dark:text-dark-text-secondary border-t border-gray-100 dark:border-gray-800/80">
                    <span className="font-semibold text-light-text dark:text-dark-text group-hover:text-primary transition-colors">
                      {image.title}
                    </span>
                    {image.metadata?.location && (
                      <span className="text-[11px] opacity-80 truncate max-w-[50%]">
                        {image.metadata.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLightbox}
            >
              <div
                className="max-w-4xl max-h-[90vh] relative flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Navigation Buttons */}
                {hasMultipleImages && (
                  <>
                    <button
                      type="button"
                      onClick={() => showImageByOffset(-1)}
                      className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 text-white hover:bg-white hover:text-black transition flex items-center justify-center"
                      title="上一张"
                      aria-label="查看上一张照片"
                    >
                      <FiChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      onClick={() => showImageByOffset(1)}
                      className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 text-white hover:bg-white hover:text-black transition flex items-center justify-center"
                      title="下一张"
                      aria-label="查看下一张照片"
                    >
                      <FiChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Close Button */}
                <button
                  type="button"
                  onClick={closeLightbox}
                  className="absolute -top-10 right-0 w-8 h-8 rounded-full text-white/80 hover:text-white transition flex items-center justify-center"
                  title="关闭预览"
                  aria-label="关闭照片预览"
                >
                  <FiX className="w-6 h-6" />
                </button>

                {/* Image */}
                <div className="rounded-lg overflow-hidden border border-white/10 shadow-2xl bg-black">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.title || '摄影大图'}
                    className="max-h-[75vh] w-auto max-w-full object-contain"
                  />
                  {/* Metadata bar */}
                  <div className="p-4 bg-zinc-950/90 text-white text-xs flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
                    <div>
                      <h3 className="font-bold text-sm text-white">{selectedImage.title}</h3>
                      <div className="flex items-center gap-3 text-zinc-400 mt-1">
                        {selectedImage.metadata?.location && (
                          <div className="flex items-center gap-1">
                            <FiMapPin className="w-3 h-3 text-primary" />
                            <span>{selectedImage.metadata.location}</span>
                          </div>
                        )}
                        {selectedImage.metadata?.date && (
                          <div className="flex items-center gap-1">
                            <FiCalendar className="w-3 h-3 text-primary" />
                            <span>{selectedImage.metadata.date}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {hasMultipleImages && selectedImageIndex >= 0 && (
                      <span className="text-zinc-500 font-mono">
                        {selectedImageIndex + 1} / {filteredImages.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
