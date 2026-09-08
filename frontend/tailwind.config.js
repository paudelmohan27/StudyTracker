/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Sunlit Scholar spectrum: warm neutrals from the landing landscape,
        // forest for intent, terracotta for motion, and gold for deadlines.
        violet: {
          400: '#e29a73',
          500: '#cf7548',
          600: '#b95e36',
          700: '#91482b',
          800: '#713920',
          900: '#572d1a',
        },
        primary: {
          50: '#edf5ef',
          100: '#d8eadc',
          200: '#b4d5bd',
          300: '#88ba98',
          400: '#5c9a70',
          500: '#397b55',
          600: '#2f6848',
          700: '#28563d',
          800: '#214632',
          900: '#1c3929',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
