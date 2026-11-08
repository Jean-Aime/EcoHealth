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
          900: '#06231B',
        },
        emerald: {
          accent: '#238B45',
        },
        sage: {
          DEFAULT: '#E7EFE8',
          light: '#F1F6F2',
          dark: '#C9D8CD',
        },
        ivory: {
          DEFAULT: '#F7F7F2',
          50: '#FBFBF8',
          100: '#F7F7F2',
          200: '#EEEDE6',
        },
        charcoal: {
          DEFAULT: '#252B29',
          light: '#3A423F',
          soft: '#4A524E',
        },
        muted: {
          DEFAULT: '#737B76',
          light: '#9BA39E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      fontSize: {
        'display-xl': ['clamp(3.25rem, 7vw, 6rem)', { lineHeight: '0.98', letterSpacing: '-0.03em', fontWeight: '600' }],
        'display-lg': ['clamp(2.5rem, 5.5vw, 4.5rem)', { lineHeight: '1.02', letterSpacing: '-0.025em', fontWeight: '600' }],
        'display-md': ['clamp(2rem, 4vw, 3.25rem)', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-sm': ['clamp(1.625rem, 3vw, 2.25rem)', { lineHeight: '1.1', letterSpacing: '-0.015em', fontWeight: '600' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '38': '9.5rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
        prose: '68ch',
      },
      letterSpacing: {
        widest: '0.2em',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        elegant: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.6s ease forwards',
        'scale-in': 'scaleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
