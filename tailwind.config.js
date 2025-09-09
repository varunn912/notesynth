
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#4f46e5',
        'brand-secondary': '#7c3aed',
        'base-100': '#111827',
        'base-200': '#1f2937',
        'base-300': '#374151',
        'base-content': '#d1d5db',
        'base-content-secondary': '#9ca3af'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-in-up': 'slideInUp 0.4s ease-out forwards',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideInUp: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        shimmer: {
          '0%': { 'background-position': '-1000px 0' },
          '100%': { 'background-position': '1000px 0' },
        },
      }
    },
  },
  plugins: [],
}
