import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiGrid, FiLayout, FiX } from 'react-icons/fi';
import type { GalleryImage } from '../types';

const mockImages: GalleryImage[] = [
  {
    id: '1',
      url: 'img/photo/1.jpg',
    category: 'Flower',
    title: '樱花',
    metadata: {
      date: '2026-03-30',
      location: '郑州-人民公园',
    },
  },
  {
    id: '2',
    url: '/img/photo/2.jpg',
    category: 'Tree',
    title: '乱七八槽',
     metadata: {
      date: '2026-03-30',
      location: '郑州-人民公园',
    },
  },
    {
    id: '3',
    url: '/img/photo/3.jpg',
    category: 'Nutral',
    title: '小草',
     metadata: {
      date: '2026-03-30',
      location: '郑州-人民公园',
    },
  },
    {
    id: '4',
    url: '/img/photo/4.jpg',
    category: 'City',
    title: '人行道',
     metadata: {
      date: '2026-03-30',
      location: '郑州-人民公园人行道',
    },
  },
    {
    id: '5',
    url: '/img/photo/5.jpg',
    category: 'City',
    title: '天桥下来来往往的人',
     metadata: {
      date: '2026-03-30',
      location: '郑州-人民公园天桥',
    },
  },
      {
    id: '6',
    url: '/img/photo/6.jpg',
    category: 'Flower',
    title: '月季-红',
     metadata: {
      date: '2026-03-30',
      location: '郑州-月季公园',
    },
  },
      {
    id: '7',
    url: '/img/photo/7.jpg',
    category: 'Flower',
    title: '月季-红',
     metadata: {
      date: '2026-04-25',
      location: '郑州-月季公园',
    },
  },
      {
    id: '8',
    url: '/img/photo/8.jpg',
    category: 'Flower',
    title: '月季-白',
     metadata: {
      date: '2026-04-25',
      location: '郑州-月季公园',
    },
  },
      {
    id: '9',
    url: '/img/photo/9.jpg',
    category: 'City',
    title: '远方',
     metadata: {
      date: '2026-05-01',
      location: '郑州-西三环天桥',
    },
  },
];

const categories = ['All', 'Flower', 'Tree', 'Nutral', 'City'];

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isCompact, setIsCompact] = useState(true); // true: 紧凑, false: 宽松

  const filteredImages = useMemo(
    () =>
      selectedCategory === 'All'
        ? mockImages
        : mockImages.filter(img => img.category === selectedCategory),
    [selectedCategory]
  );
  const selectedImageIndex = selectedImage
    ? filteredImages.findIndex(img => img.id === selectedImage.id)
    : -1;
  const hasMultipleImages = filteredImages.length > 1;

  const closeLightbox = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const showImageByOffset = useCallback(
    (offset: number) => {
      if (!selectedImage || filteredImages.length === 0) return;

      const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
      const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
      const nextIndex =
        (safeCurrentIndex + offset + filteredImages.length) % filteredImages.length;

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
      className="min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <section className="py-12 mb-8">
        <div className="container mx-auto px-6">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Gallery</h1>

            {/* 图库介绍 */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                用镜头捕捉生活的美好瞬间，探索世界的无限可能
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="container mx-auto px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4 max-w-7xl mx-auto">
          {/* Category Buttons */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-light-bg-secondary dark:bg-dark-bg-secondary hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Layout Mode Toggle */}
          <div className="flex gap-1 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg p-1">
            <button
              onClick={() => setIsCompact(true)}
              className={`p-2 rounded transition-colors ${
                isCompact
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title="紧凑布局"
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsCompact(false)}
              className={`p-2 rounded transition-colors ${
                !isCompact
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title="宽松布局"
            >
              <FiLayout className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Image Grid (Masonry-style) */}
      <section className="container mx-auto px-6 pb-12">
        <div className={`${
          isCompact
            ? 'columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-3'
            : 'columns-1 md:columns-2 lg:columns-3 gap-6'
        } max-w-7xl mx-auto`}>
          {filteredImages.map((image, index) => (
            <motion.div
              key={image.id}
              className={`${
                isCompact ? 'mb-3' : 'mb-6'
              } break-inside-avoid cursor-pointer group`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedImage(image)}
            >
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={image.url}
                  alt={image.title || 'Gallery image'}
                  className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-4 opacity-0 group-hover:opacity-100">
                  <div className="text-white">
                    {image.title && <h3 className="font-bold text-lg">{image.title}</h3>}
                    {image.metadata?.location && (
                      <p className="text-sm">{image.metadata.location}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={closeLightbox}
        >
          <motion.div
            className="max-w-5xl max-h-[90vh] relative"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={e => e.stopPropagation()}
          >
            {hasMultipleImages && (
              <>
                <button
                  type="button"
                  onClick={() => showImageByOffset(-1)}
                  className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur transition hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-white md:-left-16 md:h-12 md:w-12"
                  aria-label="查看上一张照片"
                  title="上一张"
                >
                  <FiChevronLeft className="h-7 w-7" />
                </button>
                <button
                  type="button"
                  onClick={() => showImageByOffset(1)}
                  className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur transition hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-white md:-right-16 md:h-12 md:w-12"
                  aria-label="查看下一张照片"
                  title="下一张"
                >
                  <FiChevronRight className="h-7 w-7" />
                </button>
              </>
            )}
            <img
              src={selectedImage.url}
              alt={selectedImage.title || 'Gallery image'}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            {selectedImage.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4 rounded-b-lg">
                <h3 className="font-bold text-xl mb-1">{selectedImage.title}</h3>
                {selectedImage.metadata?.location && (
                  <p className="text-sm opacity-80">{selectedImage.metadata.location}</p>
                )}
                {selectedImage.metadata?.date && (
                  <p className="text-sm opacity-80">{selectedImage.metadata.date}</p>
                )}
                {hasMultipleImages && selectedImageIndex >= 0 && (
                  <p className="mt-2 text-xs opacity-70">
                    {selectedImageIndex + 1} / {filteredImages.length}
                  </p>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="关闭照片预览"
              title="关闭"
            >
              <FiX className="h-7 w-7" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
