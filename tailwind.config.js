/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spreadsheet: {
          header: '#f1f5f9',
          cell: '#ffffff',
          border: '#e2e8f0',
          selected: '#e8f0fe',
          text: '#334155',
          formula: '#64748b'
        }
      }
    },
  },
  plugins: [],
}