import { motion } from 'framer-motion';
import { logoPaths, logoViewBox } from '../../config/brand';

export default function Logo() {
  const transitions = [
    { duration: 0.85, delay: 0 },
    { duration: 1.05, delay: 0.12 },
    { duration: 0.9, delay: 0.28 },
    { duration: 0.75, delay: 0.45 },
  ];

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
        viewBox={logoViewBox}
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
          {logoPaths.map((pathConfig, index) => (
            <motion.path
              key={pathConfig.d}
              d={pathConfig.d}
              strokeWidth={pathConfig.strokeWidth}
              opacity={'opacity' in pathConfig ? pathConfig.opacity : undefined}
              initial={{
                pathLength: 0,
                opacity: 'opacity' in pathConfig ? pathConfig.opacity : 0,
              }}
              animate={{
                pathLength: 1,
                opacity: 'opacity' in pathConfig ? pathConfig.opacity : 1,
              }}
              transition={{ ...transitions[index], ease: 'easeInOut' }}
            />
          ))}
        </g>
      </svg>
    </motion.div>
  );
}
