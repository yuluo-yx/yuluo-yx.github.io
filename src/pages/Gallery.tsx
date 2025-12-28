import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiGrid, FiLayout } from 'react-icons/fi';
import type { GalleryImage } from '../types';

const mockImages: GalleryImage[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    category: 'Landscape',
    title: 'Mountain Vista',
    metadata: {
      date: '2024-12-01',
      location: 'Swiss Alps',
    },
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000',
    category: 'Architecture',
    title: 'Modern Building',
    metadata: {
      date: '2024-11-28',
      location: 'Tokyo',
    },
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05',
    category: 'Nature',
    title: 'Misty Forest',
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b',
    category: 'Landscape',
    title: 'Golden Hour',
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1477346611705-65d1883cee1e',
    category: 'Nature',
    title: 'Sunrise',
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6',
    category: 'Street',
    title: 'City Lights',
  },
];

const categories = ['All', 'Landscape', 'Architecture', 'Nature', 'Street'];

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isCompact, setIsCompact] = useState(true); // true: 紧凑, false: 宽松

  const filteredImages =
    selectedCategory === 'All'
      ? mockImages
      : mockImages.filter(img => img.category === selectedCategory);

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
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            className="max-w-5xl max-h-[90vh] relative"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={e => e.stopPropagation()}
          >
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
              </div>
            )}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white text-4xl hover:text-gray-300 transition-colors"
            >
              ×
            </button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
