/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx,mdx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 10px 30px -15px rgb(15 23 42 / 0.25)',
      },
      colors: {
        sidebar: {
          950: '#0f172a',
          900: '#1e293b',
        },
      },
    },
  },
  plugins: [],
}
