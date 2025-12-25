import { motion } from 'framer-motion';

export default function Logo() {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      className="cursor-pointer"
    >
      <svg
        width="160"
        height="60"
        viewBox="0 0 160 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="stroke-black dark:stroke-white"
      >
        <motion.path
          d="M 1,30
             C 12,24 14,30 16,36
             C 17,40 18,44 17,48
             C 16,51 14,54 12,56
             C 14,54 16,50 18,46
             C 20,42 22,38 24,34
             C 26,30 29,25 32,22
             C 35,19 38,18 41,19
             C 43,20 44,22 45,25
             C 46,29 46,33 46,37
             C 46,40 48,42 51,42
             C 54,42 57,40 59,37
             C 61,33 62,28 63,24
             C 64,22 65,20 66,19
             C 67,18 68,18 69,19
             C 70,21 71,24 72,28
             C 73,32 74,36 74,40
             C 76,36 80,30 84,26
             C 87,23 90,22 93,23
             C 95,24 96,26 97,29
             C 98,33 98,37 98,41
             C 98,44 100,46 103,46
             C 106,46 109,44 111,41
             C 113,37 114,32 115,28
             C 117,30 120,33 122,36
             C 124,40 125,44 124,48
             C 123,51 120,53 117,53
             C 114,53 112,51 111,48
             C 110,45 110,42 110,39"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: [0, 1, 1, 0],
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: 5,
            times: [0, 0.7, 0.85, 1],
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 0.5
          }}
        />
      </svg>
    </motion.div>
  );
}
