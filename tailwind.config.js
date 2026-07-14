/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        abasGold: '#b3925c',
        abasDark: '#1a1918',
        abasLight: '#fdfbf7',
      }
    },
  },
  plugins: [],
}