/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#176B32',
          50: '#F0F6F1',
          100: '#DCEADF',
          200: '#BAD4C0',
          300: '#8FBA9D',
          400: '#5E9A73',
          500: '#3A8252',
          600: '#176B32',
          700: '#135728',
          800: '#0B3522',
          900: '#082A1C',
          950: '#04160F',
        },
        emerald: {
          accent: '#238B45',
        },
        sage: {
          DEFAULT: '#E4EAE2',
          light: '#EFF3ED',
          dark: '#C6D2C7',
        },
        ivory: {
          DEFAULT: '#F4F2EA',
          50: '#FBFAF5',
          100: '#F7F5EE',
          200: '#EDEAE0',
        },
        paper: '#FBFAF6',
        charcoal: {
          DEFAULT: '#232826',
          light: '#39413D',
          soft: '#4C5550',
        },
        muted: {
          DEFAULT: '#737B76',
          light: '#9BA39E',
        },
        steel: {
          DEFAULT: '#33607A',
          dark: '#1E4257',
          light: '#8FB0C2',
        },
        sand: {
          DEFAULT: '#C6B59B',
          light: '#E3DACB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      fontSize: {
        'display-2xl': ['clamp(3.25rem, 8.4vw, 7.5rem)', { lineHeight: '0.93', letterSpacing: '-0.045em', fontWeight: '500' }],
        'display-xl': ['clamp(2.85rem, 6.4vw, 5.5rem)', { lineHeight: '0.96', letterSpacing: '-0.038em', fontWeight: '500' }],
        'display-lg': ['clamp(2.35rem, 4.6vw, 3.9rem)', { lineHeight: '1.01', letterSpacing: '-0.032em', fontWeight: '500' }],
        'display-md': ['clamp(1.95rem, 3.4vw, 2.9rem)', { lineHeight: '1.05', letterSpacing: '-0.026em', fontWeight: '500' }],
        'display-sm': ['clamp(1.5rem, 2.3vw, 1.95rem)', { lineHeight: '1.14', letterSpacing: '-0.018em', fontWeight: '500' }],
        lede: ['clamp(1.075rem, 1.35vw, 1.3rem)', { lineHeight: '1.68', letterSpacing: '-0.005em' }],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
        38: '9.5rem',
        46: '11.5rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
        prose: '68ch',
      },
      letterSpacing: {
        widest: '0.2em',
        editorial: '0.24em',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        elegant: 'cubic-bezier(0.16, 1, 0.3, 1)',
        editorial: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        'fade-up': 'fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.7s ease forwards',
        'scale-in': 'scaleIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'page-in': 'pageIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'line-up': 'lineUp 1.1s cubic-bezier(0.22, 1, 0.36, 1) both',
        'drift': 'drift 14s cubic-bezier(0.45, 0, 0.55, 1) infinite',
        'scroll-cue': 'scrollCue 2.4s cubic-bezier(0.45, 0, 0.55, 1) infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(1.04)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pageIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        lineUp: {
          '0%': { transform: 'translateY(110%)' },
          '100%': { transform: 'translateY(0)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1.04)' },
          '50%': { transform: 'translate3d(0, -10px, 0) scale(1.07)' },
        },
        scrollCue: {
          '0%': { transform: 'translateY(-40%)', opacity: '0' },
          '35%': { opacity: '1' },
          '100%': { transform: 'translateY(120%)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
