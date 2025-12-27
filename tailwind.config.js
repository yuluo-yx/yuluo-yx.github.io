/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 深色模式 - 纯黑白
        dark: {
          bg: '#000000',
          'bg-secondary': '#0a0a0a',
          text: '#ffffff',
          'text-secondary': '#a0a0a0',
        },
        // 浅色模式 - 纯黑白
        light: {
          bg: '#ffffff',
          'bg-secondary': '#fafafa',
          text: '#000000',
          'text-secondary': '#666666',
        },
        // 强调色 - 蓝色系
        primary: {
          DEFAULT: '#3b82f6',
          light: '#3b82f6',
          dark: '#60a5fa',
        },
      },
    },
  },
  plugins: [],
}
