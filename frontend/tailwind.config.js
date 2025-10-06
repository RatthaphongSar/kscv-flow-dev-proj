
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0A4DAD',
        surface: '#F5F9FF'
      },
      borderRadius: { 'xl2': '1rem' },
    }
  },
  plugins: []
};
