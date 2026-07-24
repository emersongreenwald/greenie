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
        // Mirror of colors.brand in constants/theme.ts.
        // Update both files together when changing the brand color.
        brand: {
          DEFAULT: '#16a34a',
          muted:   '#f0fdf4',
          dark:    '#15803d',
          border:  '#bbf7d0',
        },
      },
    },
  },
  plugins: [],
};
