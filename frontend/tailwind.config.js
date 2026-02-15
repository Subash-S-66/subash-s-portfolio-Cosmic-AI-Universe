/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        void: { DEFAULT: '#0a0f1f', deep: '#060b18' },
        'void-deep': '#060b18',
        'cosmic-violet': '#8b5cf6',
        'cosmic-blue': '#3b82f6',
        'cosmic-cyan': '#06b6d4',
        'neon-violet': '#a855f7',
        cyan: { DEFAULT: '#06b6d4' },
        purple: { DEFAULT: '#a855f7' },
        pink: { DEFAULT: '#ff2d55' },
        green: { DEFAULT: '#00ffa3' },
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'cosmic-breathe': 'cosmicBreathe 8s ease-in-out infinite',
      },
      keyframes: {
        cosmicBreathe: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.1)' },
        },
      },
    },
  },
  plugins: [],
}
