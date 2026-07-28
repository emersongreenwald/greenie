/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#557A62',
          muted:   '#eaf2ee',
          dark:    '#3d5a49',
          border:  '#c5d8cc',
        },
        cream:    '#faf8f4',
        charcoal: '#1c2620',
        gold: {
          DEFAULT: '#c9a050',
          light:   '#fef6e4',
          dark:    '#9a7838',
        },
        blush: {
          DEFAULT: '#e8c5bb',
          light:   '#fdf2ee',
        },
      },
    },
  },
  plugins: [],
};
