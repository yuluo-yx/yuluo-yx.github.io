import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';

interface InterestCardProps {
  icon: IconType;
  title: string;
  description: string;
  color: string;
}

export default function InterestCard({ icon: Icon, title, description, color }: InterestCardProps) {
  return (
    <motion.div
      className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl p-6 hover:shadow-xl transition-shadow"
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-light-text-secondary dark:text-dark-text-secondary">
        {description}
      </p>
    </motion.div>
  );
}
