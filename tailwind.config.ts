import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bordeaux: {
          DEFAULT: '#7F1518',
          dark: '#5A0F12',
          light: '#963235',
        },
        avorio: {
          DEFAULT: '#FAF6F0',
          scuro: '#F1EADC',
        },
        pietra: {
          DEFAULT: '#3C3A37',
          chiaro: '#6B6762',
        },
        oro: {
          DEFAULT: '#B8935A',
          chiaro: '#D4B47A',
        },
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        wider: '0.08em',
        widest: '0.2em',
      },
      animation: {
        'fade-in': 'fadeIn 1.2s ease-out forwards',
        'fade-up': 'fadeUp 1s ease-out forwards',
        'slow-zoom': 'slowZoom 12s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slowZoom: {
          from: { transform: 'scale(1)' },
          to: { transform: 'scale(1.08)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
