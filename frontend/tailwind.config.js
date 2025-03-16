/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}", // NEW: your app directory
    "./src/components/**/*.{js,ts,jsx,tsx}", // NEW: if you have a components folder
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
