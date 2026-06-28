/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fdf9e8',
          100: '#faf0c4',
          200: '#f5e08a',
          300: '#eecb46',
          400: '#e5b821',
          500: '#d3ac39',
          600: '#b8891a',
          700: '#966517',
          800: '#7c511b',
          900: '#6a431d',
          950: '#3d230e',
        },
        salon: {
          black: '#000000',
          dark: '#1a1a1a',
          gray: '#2d2d2d',
          light: '#f5f5f5',
        },
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
