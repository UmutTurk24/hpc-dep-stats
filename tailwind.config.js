/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hpc-blue': '#1e40af',
        'hpc-green': '#059669',
        'hpc-orange': '#ea580c',
        'hpc-purple': '#7c3aed',
        'hpc-red': '#dc2626',
        'hpc-yellow': '#d97706',
      }
    },
  },
  plugins: [],
}
