/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        subject: {
          aptitude: '#f97316', // orange-500
          english: '#22c55e', // green-500
          webdev: '#3b82f6', // blue-500
          data: '#a855f7', // purple-500
          routine: '#64748b' // slate-500
        }
      }
    },
  },
  plugins: [],
}
