import { motion } from 'framer-motion';

export default function Logo() {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      transition={{ duration: 0.2 }}
      className="cursor-pointer text-light-text dark:text-dark-text"
      aria-label="yuluo"
    >
      <svg
        width="160"
        height="60"
        viewBox="0 0 160 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="logo-title"
      >
        <title id="logo-title">yuluo</title>
        <g
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <motion.path
            d="M9 42 C18 35 27 20 34 12 C37 8 40 10 38 15 C34 25 25 40 22 51 C20 58 28 56 36 47 C43 39 45 28 46 22"
            strokeWidth="2.45"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.85, ease: 'easeInOut' }}
          />
          <motion.path
            d="M46 22 C41 36 42 45 48 45 C55 45 61 32 64 24 C61 38 62 47 69 47 C76 47 82 34 86 21 C89 12 93 8 97 10 C101 13 96 24 90 34 C86 40 82 45 78 49 C87 45 94 35 101 24 C98 37 99 45 106 45 C113 45 119 34 122 26"
            strokeWidth="2.45"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.05, delay: 0.12, ease: 'easeInOut' }}
          />
          <motion.path
            d="M122 26 C117 39 121 48 130 47 C139 46 147 38 146 30 C145 24 137 24 132 31 C127 39 132 47 141 45 C147 44 152 40 156 35"
            strokeWidth="2.45"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.28, ease: 'easeInOut' }}
          />
          <motion.path
            d="M26 50 C54 56 92 56 126 49 C137 47 146 48 153 52"
            strokeWidth="1.15"
            opacity="0.72"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.75, delay: 0.45, ease: 'easeInOut' }}
          />
        </g>
      </svg>
    </motion.div>
  );
}
