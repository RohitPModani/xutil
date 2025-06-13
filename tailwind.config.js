// tailwind.config.js
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      transitionProperty: {
        colors: 'background-color, border-color, color, fill, stroke',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-in-out',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
    require('@tailwindcss/typography'),
  ],
}
