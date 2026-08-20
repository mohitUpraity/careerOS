/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#090A0F',
          subtle: '#0D0E15',
        },
        surface: {
          DEFAULT: '#141622',
          hover: '#1A1D2C',
          active: '#212538',
          elevated: '#1E2235',
        },
        border: {
          subtle: '#26293B',
          glow: 'rgba(99, 102, 241, 0.2)',
          danger: 'rgba(239, 68, 68, 0.3)',
          success: 'rgba(16, 185, 129, 0.3)',
        },
        brand: {
          primary: '#6366F1',
          accent: '#3B82F6',
          purple: '#8B5CF6',
        },
        sec: {
          allow: '#10B981',
          pending: '#F59E0B',
          block: '#EF4444',
          running: '#3B82F6',
          idle: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px -5px rgba(99, 102, 241, 0.3)',
        'glow-danger': '0 0 25px -5px rgba(239, 68, 68, 0.4)',
        'glow-success': '0 0 20px -5px rgba(16, 185, 129, 0.3)',
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
      keyframes: {
        pulseBorder: {
          '0%, 100%': { borderColor: 'rgba(239, 68, 68, 0.4)' },
          '50%': { borderColor: 'rgba(239, 68, 68, 0.9)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.9' },
        },
      },
      animation: {
        'pulse-border': 'pulseBorder 2s infinite ease-in-out',
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
      },
    },
  },
  plugins: [],
};
