export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        narrative: {
          lightest: '#edeff0',
          light: '#c2c9cc',
          medium: '#9ba3a8',
          dark: '#7b8285'
        }
      }
    },
  },
  plugins: [],
}