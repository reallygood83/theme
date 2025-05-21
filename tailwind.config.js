/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        secondary: '#10B981',
        accent: '#F59E0B',
        background: '#F3F4F6',
        text: '#1F2937',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      animation: {
        'fade-in-out': 'fadeInOut 2s ease-in-out',
      },
      keyframes: {
        fadeInOut: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '10%': { opacity: 1, transform: 'translateY(0)' },
          '90%': { opacity: 1, transform: 'translateY(0)' },
          '100%': { opacity: 0, transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}