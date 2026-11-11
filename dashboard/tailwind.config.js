/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#080612',
          card: '#0f0c22',
          cardHover: '#161233',
          purple: '#9333ea',
          violet: '#a855f7',
          neon: '#c084fc',
          cyan: '#38bdf8',
          pink: '#f472b6'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(168, 85, 247, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(168, 85, 247, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
