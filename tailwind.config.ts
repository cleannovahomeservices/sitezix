import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#000000',
        sidebar: '#0f0f0f',
        surface: 'rgba(255,255,255,0.04)',
        border: 'rgba(255,255,255,0.07)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        jakarta: ['var(--font-jakarta)', 'sans-serif'],
      },
      keyframes: {
        d1: { '0%,100%': { transform: 'translate(0,0) scale(1)' }, '50%': { transform: 'translate(80px,60px) scale(1.1)' } },
        d2: { '0%,100%': { transform: 'translate(0,0) scale(1)' }, '50%': { transform: 'translate(-60px,-80px) scale(1.12)' } },
        d3: { '0%,100%': { transform: 'translate(-50%,-50%) scale(1)' }, '50%': { transform: 'translate(calc(-50% + 40px),calc(-50% - 30px)) scale(1.09)' } },
        fadeUp: { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        blink: { '50%': { opacity: '0' } },
        spin: { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        d1: 'd1 20s ease-in-out infinite',
        d2: 'd2 25s ease-in-out infinite',
        d3: 'd3 30s ease-in-out infinite',
        'fade-up': 'fadeUp 0.5s ease both',
        blink: 'blink 1s step-end infinite',
        spin: 'spin 0.6s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
