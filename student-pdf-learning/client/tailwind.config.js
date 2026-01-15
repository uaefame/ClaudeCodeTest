/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // VARK color safelist for dynamic classes
    'bg-visual', 'bg-visual-50', 'bg-visual-100', 'bg-visual-700', 'text-visual', 'text-visual-700', 'border-visual', 'ring-visual',
    'bg-audio', 'bg-audio-50', 'bg-audio-100', 'bg-audio-700', 'text-audio', 'text-audio-700', 'border-audio', 'ring-audio',
    'bg-readwrite', 'bg-readwrite-50', 'bg-readwrite-100', 'bg-readwrite-700', 'text-readwrite', 'text-readwrite-700', 'border-readwrite', 'ring-readwrite',
    'bg-kinesthetic', 'bg-kinesthetic-50', 'bg-kinesthetic-100', 'bg-kinesthetic-700', 'text-kinesthetic', 'text-kinesthetic-700', 'border-kinesthetic', 'ring-kinesthetic',
  ],
  theme: {
    extend: {
      colors: {
        // VARK Primary Colors
        visual: {
          DEFAULT: '#7C3AED',
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#7C3AED',
          600: '#6D28D9',
          700: '#5B21B6',
        },
        audio: {
          DEFAULT: '#06B6D4',
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
        },
        readwrite: {
          DEFAULT: '#F97316',
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
        },
        kinesthetic: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        // Supporting Colors
        navy: {
          DEFAULT: '#1E293B',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        gold: {
          DEFAULT: '#FBBF24',
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
        },
      },
      fontFamily: {
        'heading': ['"Plus Jakarta Sans"', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
