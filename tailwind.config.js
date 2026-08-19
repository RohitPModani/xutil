// tailwind.config.js
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Condensed carries labels and eyebrows - engineering-lettering
        // proportions at small sizes. Sans carries prose. Mono carries every
        // value the user can copy, so data always looks like data.
        display: ['IBM Plex Sans Condensed', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['IBM Plex Sans Variable', 'IBM Plex Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        ground: 'rgb(var(--ground) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        raised: 'rgb(var(--raised) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        dim: 'rgb(var(--dim) / <alpha-value>)',
        faint: 'rgb(var(--faint) / <alpha-value>)',
        // The two accents are semantic, not decorative: source is what you
        // put in, result is what you get back.
        source: 'rgb(var(--source) / <alpha-value>)',
        result: 'rgb(var(--result) / <alpha-value>)',
        alert: 'rgb(var(--alert) / <alpha-value>)',
      },
      transitionProperty: {
        colors: 'background-color, border-color, color, fill, stroke',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
        slideIn: 'slideIn 0.3s ease-out',
        scaleIn: 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [require('tailwind-scrollbar'), require('@tailwindcss/typography')],
}
