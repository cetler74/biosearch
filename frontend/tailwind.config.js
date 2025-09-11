/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#1e3a8a',
          600: '#1e40af',
          700: '#1d4ed8',
        },
        secondary: {
          500: '#f59e0b',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      scale: {
        '110': '1.1',
      }
    },
  },
  plugins: [],
}